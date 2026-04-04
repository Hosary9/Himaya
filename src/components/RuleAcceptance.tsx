import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

interface RuleAcceptanceProps {
  header: string;
  subtext: string;
  rules: React.ReactNode;
  timerSeconds: number;
  onAccept: () => void;
  buttonTextDisabled: string;
  buttonTextEnabled: string;
  disabledSubtext: string;
}

export function RuleAcceptance({
  header,
  subtext,
  rules,
  timerSeconds,
  onAccept,
  buttonTextDisabled,
  buttonTextEnabled,
  disabledSubtext,
}: RuleAcceptanceProps) {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const progress = ((timerSeconds - timeLeft) / timerSeconds) * 100;

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center animate-in fade-in duration-500" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-lg w-full space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center">{header}</h1>
        <p className="text-gray-600 text-center">{subtext}</p>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 h-96 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-4">
          {rules}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="36" className="stroke-gray-200" strokeWidth="4" fill="none" />
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                className="stroke-primary"
                strokeWidth="4"
                fill="none"
                strokeDasharray="226.2"
                strokeDashoffset={226.2 - (226.2 * progress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-lg font-bold text-primary">{timeLeft > 0 ? timeLeft : '✓'}</span>
          </div>

          <button
            disabled={timeLeft > 0}
            onClick={() => { setIsAccepted(true); onAccept(); }}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2",
              timeLeft > 0 
                ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
            )}
          >
            {timeLeft > 0 ? buttonTextDisabled : buttonTextEnabled}
            {timeLeft === 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✅</motion.span>
            )}
          </button>
          
          {timeLeft > 0 && <p className="text-sm text-gray-500 text-center">{disabledSubtext}</p>}
        </div>
      </div>
    </div>
  );
}
