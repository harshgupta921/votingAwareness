'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronRight, Loader2 } from 'lucide-react';

interface ChecklistStepItemProps {
  step: { id: number; title: string; description: string; details: string };
  isCompleted: boolean;
  isActive: boolean;
  isSaving: boolean;
  onToggle: (id: number) => void;
  onActiveChange: (id: number) => void;
  onNext: (id: number) => void;
  t: (key: string) => string;
  index: number;
}

export default function ChecklistStepItem({
  step,
  isCompleted,
  isActive,
  isSaving,
  onToggle,
  onActiveChange,
  onNext,
  t,
  index
}: ChecklistStepItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-[1.5rem] transition-all duration-300 overflow-hidden border-2 cursor-pointer ${
        isActive 
          ? 'border-indigo-400 dark:border-indigo-500 shadow-xl shadow-indigo-500/10 bg-white dark:bg-gray-900 transform scale-[1.02]' 
          : isCompleted 
            ? 'border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 opacity-70 hover:opacity-100'
            : 'border-transparent dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-lg hover:bg-white dark:hover:bg-gray-900'
      }`}
    >
      <div 
        className="p-6 flex items-start gap-5"
        onClick={() => onActiveChange(step.id)}
      >
        <button 
          disabled={isSaving}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(step.id);
          }}
          className="mt-1 flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50"
        >
          {isCompleted ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600 text-transparent'}`}>
              <Circle className="w-4 h-4 fill-current opacity-20" />
            </div>
          )}
        </button>
        
        <div className="flex-1">
          <h3 className={`text-xl font-bold tracking-tight transition-colors ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
            {step.title}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            {step.description}
          </p>
          
          <AnimatePresence>
            {isActive && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100/50 dark:border-indigo-800/30">
                    <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                      {step.details}
                    </p>
                  </div>
                  {!isCompleted && (
                    <button
                      disabled={isSaving}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNext(step.id);
                      }}
                      className="mt-5 inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white shadow-md transition-all duration-300 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : t('checklist.done')} <ChevronRight className="ml-2 w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
