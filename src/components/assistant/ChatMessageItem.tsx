'use client';

import { motion } from 'framer-motion';
import { Bot, User, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, UserProfile } from '@/types/user';

interface ChatMessageItemProps {
  message: ChatMessage;
  user: UserProfile | null;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
}

export default function ChatMessageItem({ 
  message, 
  user, 
  isSpeaking, 
  onSpeak 
}: ChatMessageItemProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-3 ${!isAssistant ? 'justify-end' : 'justify-start'}`}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 mt-auto mb-1">
          <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      )}
      
      <div className={`group relative max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${
        !isAssistant 
          ? 'bg-indigo-600 text-white rounded-br-none' 
          : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700/50'
      }`}>
        <div className="prose dark:prose-invert max-w-none text-sm sm:text-[15px] leading-relaxed">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        {isAssistant && message.id !== 'greeting' && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onSpeak(message.content)}
              className="p-1.5 rounded-md hover:bg-white dark:hover:hover:bg-gray-700 text-gray-400 hover:text-indigo-500 transition-all"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-auto mb-1 border border-gray-200 dark:border-gray-700">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full rounded-lg object-cover" />
          ) : (
            <User className="w-5 h-5 text-gray-500" />
          )}
        </div>
      )}
    </motion.div>
  );
}
