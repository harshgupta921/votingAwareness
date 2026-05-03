'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, RefreshCcw, Check, X, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateVoterReadiness } from '@/lib/db';

const Confetti = () => {
  const pieces = Array.from({ length: 50 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: '50vw', y: '50vh', opacity: 1, scale: Math.random() * 1.5 + 0.5 }}
          animate={{ x: `${Math.random() * 100}vw`, y: `${Math.random() * 100}vh`, opacity: 0, rotate: Math.random() * 360 }}
          transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }}
          className={`absolute w-3 h-3 rounded-sm ${['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][i % 5]}`}
        />
      ))}
    </div>
  );
};

export default function QuizPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const questions = useMemo(() => [
    { question: t('quiz.q1.question'), options: t('quiz.q1.options').split(', '), answer: 1, explanation: t('quiz.q1.explanation') },
    { question: t('quiz.q2.question'), options: t('quiz.q2.options').split(', '), answer: 0, explanation: t('quiz.q2.explanation') },
    { question: t('quiz.q3.question'), options: t('quiz.q3.options').split(', '), answer: 2, explanation: t('quiz.q3.explanation') },
    { question: t('quiz.q4.question'), options: t('quiz.q4.options').split(', '), answer: 2, explanation: t('quiz.q4.explanation') },
    { question: t('quiz.q5.question'), options: t('quiz.q5.options').split(', '), answer: 0, explanation: t('quiz.q5.explanation') }
  ], [language, t]);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (user) {
        setIsSaving(true);
        const finalScore = Math.round((score / questions.length) * 100);
        await updateVoterReadiness(user.uid, finalScore);
        setIsSaving(false);
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1 flex flex-col justify-center relative z-10">
      {showResult && score === questions.length && <Confetti />}
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-6">
          <Zap className="w-4 h-4" /> Challenge Your Knowledge
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight mb-4">
          {t('quiz.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
          {t('quiz.subtitle')}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key={`question-${currentQuestion}`}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/80 dark:border-gray-800/80 overflow-hidden"
          >
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="p-8 sm:p-12">
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-bold text-indigo-500 uppercase tracking-widest">
                  {t('checklist.step')} {currentQuestion + 1} / {questions.length}
                </span>
                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 py-1.5 px-4 rounded-xl text-sm font-bold">
                  Score: {score}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
                {questions[currentQuestion].question}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {questions[currentQuestion].options.map((option, index) => {
                  const isCorrect = index === questions[currentQuestion].answer;
                  const isSelected = index === selectedOption;
                  let buttonClass = "w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex justify-between items-center text-lg font-medium group ";
                  if (!isAnswered) {
                    buttonClass += "border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-700 dark:text-gray-200";
                  } else {
                    if (isCorrect) buttonClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
                    else if (isSelected) buttonClass += "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300";
                    else buttonClass += "border-gray-200 dark:border-gray-700 opacity-40 text-gray-500";
                  }

                  return (
                    <button key={index} onClick={() => handleOptionClick(index)} disabled={isAnswered} className={buttonClass}>
                      <span>{option}</span>
                      {isAnswered && isCorrect && <Check className="w-6 h-6 text-emerald-500" />}
                      {isAnswered && isSelected && !isCorrect && <X className="w-6 h-6 text-rose-500" />}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 mb-8 text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    <p className="font-bold mb-2 flex items-center gap-2 text-indigo-800 dark:text-indigo-300">
                      <Award className="w-5 h-5" /> {t('quiz.explanation')}
                    </p>
                    {questions[currentQuestion].explanation}
                  </div>
                  <button onClick={handleNext} className="w-full flex items-center justify-center px-8 py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg">
                    {currentQuestion < questions.length - 1 ? t('quiz.next') : t('quiz.results')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/80 dark:border-gray-800/80 p-12 text-center">
            <div className="relative w-32 h-32 mx-auto mb-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl">
              <Award className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{t('quiz.result.completed')}</h2>
            <div className="text-2xl font-medium text-gray-600 dark:text-gray-400 mb-8">
              {t('quiz.result.score')} <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mx-2">{score}</span> / {questions.length}
            </div>
            {isSaving && <div className="flex items-center justify-center gap-2 text-sm text-indigo-500 mb-4"><Loader2 className="w-4 h-4 animate-spin" /> Saving progress...</div>}
            <div className="flex gap-4 justify-center">
              <button onClick={restartQuiz} className="inline-flex items-center px-8 py-4 border-2 border-indigo-200 dark:border-indigo-800/50 text-lg font-bold rounded-2xl text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 transition-all">
                <RefreshCcw className="mr-2 w-5 h-5" /> {t('quiz.result.retry')}
              </button>
              <button onClick={() => window.location.href='/dashboard'} className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg">
                View Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
