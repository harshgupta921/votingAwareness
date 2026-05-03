'use client';

import { Send, Mic, MicOff } from 'lucide-react';

interface ChatInputAreaProps {
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleListen: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  showSuggestions: boolean;
  placeholder: string;
  listeningPlaceholder: string;
}

export default function ChatInputArea({
  input,
  setInput,
  isLoading,
  isListening,
  onToggleListen,
  onSubmit,
  suggestions,
  onSuggestionClick,
  showSuggestions,
  placeholder,
  listeningPlaceholder
}: ChatInputAreaProps) {
  return (
    <div className="p-4 sm:p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800">
      {showSuggestions && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 rounded-xl text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex gap-2 relative max-w-4xl mx-auto">
        <button
          type="button"
          onClick={onToggleListen}
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
            placeholder={isListening ? listeningPlaceholder : placeholder}
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
  );
}
