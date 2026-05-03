'use client';

import { motion } from 'framer-motion';
import { Plus, History, MessageSquare, User } from 'lucide-react';
import { Conversation, UserProfile } from '@/types/user';

interface ChatSidebarProps {
  user: UserProfile | null;
  history: Conversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onLoadConversation: (conv: Conversation) => void;
}

export default function ChatSidebar({ 
  user, 
  history, 
  currentConversationId, 
  onNewChat, 
  onLoadConversation 
}: ChatSidebarProps) {
  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="fixed md:relative z-40 w-72 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-3xl overflow-hidden flex flex-col shadow-xl"
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <button 
          onClick={onNewChat}
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
            onClick={() => onLoadConversation(conv)}
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
  );
}
