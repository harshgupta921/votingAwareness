'use client';

import { Bot, History, Download, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  language: string;
  onToggleSidebar: () => void;
  onExport: () => void;
}

export default function ChatHeader({ 
  title, 
  language, 
  onToggleSidebar, 
  onExport 
}: ChatHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md flex justify-between items-center z-20">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <button onClick={onToggleSidebar} className="p-2 text-gray-500">
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
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[10px] font-medium text-gray-500">AI Active • {language.toUpperCase()}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onExport}
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
  );
}
