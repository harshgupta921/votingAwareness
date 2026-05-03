'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { firestoreService } from '@/services/FirestoreService';
import { ChatMessage, Conversation } from '@/types/user';

// Sub-components
import ChatSidebar from '@/components/assistant/ChatSidebar';
import ChatHeader from '@/components/assistant/ChatHeader';
import ChatMessageItem from '@/components/assistant/ChatMessageItem';
import ChatInputArea from '@/components/assistant/ChatInputArea';

/**
 * AssistantPage component provides a comprehensive AI-powered chat interface.
 * Features:
 * - Multilingual support via LanguageContext
 * - Persistent chat history with Firestore
 * - Speech-to-text (STT) and Text-to-speech (TTS)
 * - Context-aware AI responses based on user profile
 */
export default function AssistantPage() {
  const { user, userData } = useAuth();
  const { language, t } = useLanguage();
  
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Refs for Web APIs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const suggestions = [
    t('assistant.suggestions.1'),
    t('assistant.suggestions.2'),
    t('assistant.suggestions.3'),
    t('assistant.suggestions.4')
  ];

  // Default greeting if no messages exist
  const displayMessages = messages.length === 0 
    ? [{ id: 'greeting', role: 'assistant' as const, content: t('assistant.greeting'), timestamp: Date.now() }] 
    : messages;

  /**
   * Loads user conversation history from Firestore
   */
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /**
   * Initializes Speech Recognition and Synthesis Web APIs
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - Webkit prefix support
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
    } else if (recognitionRef.current) {
      recognitionRef.current.lang = getSpeechLangCode(language);
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      alert("Speech recognition is not supported in your browser.");
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

  /**
   * Handles message submission to AI backend
   */
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
      // Build user context for more personalized AI responses
      const context = userData ? `
        User context:
        - Readiness score: ${userData.readinessScore?.score || 0}/100
        - Checklist progress: ${userData.checklistProgress?.filter(i => i.completed).length || 0} items completed
        - Saved locations: ${userData.savedLocations?.map(l => `${l.label}: ${l.address}`).join('; ') || 'None'}
      ` : '';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language, context }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      
      const assistantMsgId = 'assistant-' + Date.now();
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', timestamp: Date.now() }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: assistantContent } : m));
        }
      }

      // Persist to database
      if (user) {
        const title = currentConversationId ? undefined : textToSend.substring(0, 30);
        const assistantMsg: ChatMessage = { id: assistantMsgId, role: 'assistant', content: assistantContent, timestamp: Date.now() };
        const newId = await firestoreService.saveConversation(user.uid, currentConversationId, [...newMessages, assistantMsg], title || 'New Conversation');
        if (!currentConversationId) {
          setCurrentConversationId(newId);
          loadHistory();
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        id: 'error-' + Date.now(), 
        role: 'assistant', 
        content: `Error: ${error.message || 'I encountered an issue.'}`, 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportChat = () => {
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voteindia-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] max-w-7xl mx-auto w-full p-0 sm:p-4 gap-4 overflow-hidden">
      <ChatSidebar 
        user={user}
        history={history}
        currentConversationId={currentConversationId}
        onNewChat={startNewChat}
        onLoadConversation={loadConversation}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
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
          <ChatHeader 
            title={t('assistant.title')}
            language={language}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onExport={exportChat}
          />

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            <AnimatePresence initial={false}>
              {displayMessages.map((msg) => (
                <ChatMessageItem 
                  key={msg.id}
                  message={msg}
                  user={user}
                  isSpeaking={isSpeaking}
                  onSpeak={speakText}
                />
              ))}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
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

          <ChatInputArea 
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            isListening={isListening}
            onToggleListen={toggleListen}
            onSubmit={handleSubmit}
            suggestions={suggestions}
            onSuggestionClick={(s) => handleSubmit(undefined, s)}
            showSuggestions={messages.length === 0 && !isLoading}
            placeholder={t('assistant.placeholder')}
            listeningPlaceholder={t('assistant.listening')}
          />
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
