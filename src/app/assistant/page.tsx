'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Sparkles, 
  History, Plus, MessageSquare, ChevronLeft, ChevronRight,
  MoreVertical, Trash2, Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { firestoreService } from '@/services/FirestoreService';
import { ChatMessage, Conversation } from '@/types/user';

export default function AssistantPage() {
  const { user, userData } = useAuth();
  const { language, t } = useLanguage();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [context, setContext] = useState<string>('voting');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const suggestions = [
    t('assistant.suggestions.1'),
    t('assistant.suggestions.2'),
    t('assistant.suggestions.3'),
    t('assistant.suggestions.4')
  ];

  const displayMessages = messages.length === 0 ? [{ id: 'greeting', role: 'assistant' as const, content: t('assistant.greeting'), timestamp: Date.now() }] : messages;

  // Load history on mount
  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const conversations = await firestoreService.getUserConversations(user.uid);
      setHistory(conversations);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [user, loadHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const getSpeechLangCode = (l: string) => {
    const map: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN' };
    return map[l] || 'en-IN';
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = getSpeechLangCode(language);
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition is not supported in your browser. Please use Chrome.");
      }
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLangCode(language);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  const loadConversation = async (conv: Conversation) => {
    setMessages(conv.messages);
    setCurrentConversationId(conv.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: textToSend,
      timestamp: Date.now() 
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message to API...', { textToSend, language });
      // Use user data for context
      const context = userData ? `
        User context:
        - Readiness score: ${userData.readinessScore?.score || 0}/100
        - Checklist progress: ${userData.checklistProgress?.filter(i => i.completed).length || 0} items completed
        - Saved locations: ${userData.savedLocations?.map(l => `${l.label} (${l.type}): ${l.name}, ${l.address} ${l.isDefault ? '[DEFAULT]' : ''}`).join('; ') || 'None'}
      ` : '';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          language,
          context
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      
      const assistantMsgId = 'assistant-' + Date.now();
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          
          setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: assistantContent } : m
          ));
        }
      }

      // Save to Firestore if logged in
      if (user) {
        try {
          const title = currentConversationId ? undefined : textToSend.substring(0, 30);
          const assistantMsg: ChatMessage = {
            id: assistantMsgId,
            role: 'assistant',
            content: assistantContent,
            timestamp: Date.now()
          };
          const newId = await firestoreService.saveConversation(user.uid, currentConversationId, [...newMessages, assistantMsg], title || 'New Conversation');
          if (!currentConversationId) {
            setCurrentConversationId(newId);
            loadHistory(); // Refresh history
          }
        } catch (saveError) {
          console.error('Error saving conversation:', saveError);
        }
      }
    } catch (error: any) {
      console.error('Chat error details:', error);
      const errorMsg: ChatMessage = { 
        id: 'error-' + Date.now(), 
        role: 'assistant', 
        content: `Error: ${error.message || 'I encountered an issue. Please try again.'}`, 
        timestamp: Date.now() 
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      console.log('Finalizing chat request, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const exportChat = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'YOU' : 'AI'}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voteindia-chat-${new Date().toLocaleDateString()}.txt`;
    a.click();
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] max-w-7xl mx-auto w-full p-0 sm:p-4 gap-4 overflow-hidden">
      {/* Sidebar - Chat History */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed md:relative z-40 w-72 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-3xl overflow-hidden flex flex-col shadow-xl"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <button 
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                Recent History
              </div>
              
              {!user && (
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-500">Log in to save your chat history</p>
                </div>
              )}

              {history.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv)}
                  className={`w-full text-left p-3 rounded-xl transition-all group relative ${
                    currentConversationId === conv.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className={`w-4 h-4 ${currentConversationId === conv.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${currentConversationId === conv.id ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'}`}>
                        {conv.title}
                      </p>
                      <p className="text-[10px] text-gray-400">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {user && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{user.displayName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-50 p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform hidden md:flex"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <motion.div 
          layout
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden flex flex-col h-full"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md flex justify-between items-center z-20">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500">
                  <History className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">{t('assistant.title')}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-[10px] font-medium text-gray-500">AI Active • {language.toUpperCase()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={exportChat}
                className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                title="Export Chat"
              >
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar"
            aria-live="polite"
            aria-atomic="false"
          >
            <AnimatePresence initial={false}>
              {displayMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 mt-auto mb-1">
                      <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                  
                  <div className={`group relative max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700/50'
                  }`}>
                    <div className="prose dark:prose-invert max-w-none text-sm sm:text-[15px] leading-relaxed">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    
                    {msg.role === 'assistant' && msg.id !== 'greeting' && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => speakText(msg.content)}
                          className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-500 transition-all"
                        >
                          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-auto mb-1 border border-gray-200 dark:border-gray-700">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 mt-auto mb-1">
                    <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-bl-none px-5 py-4 flex items-center gap-2 shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(undefined, suggestion)}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 rounded-xl text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2 relative max-w-4xl mx-auto">
              <button
                type="button"
                onClick={toggleListen}
                className={`p-3.5 rounded-xl transition-all border ${
                  isListening 
                    ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? t('assistant.listening') : t('assistant.placeholder')}
                  className="w-full h-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-[15px]"
                  disabled={isLoading || isListening}
                />
              </div>
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-[10px] text-center text-gray-400 mt-3">
              VoteIndia AI may provide incorrect information. Verify facts on voters.eci.gov.in
            </p>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.2); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(99, 102, 241, 0.4); }
      `}} />
    </div>
  );
}
