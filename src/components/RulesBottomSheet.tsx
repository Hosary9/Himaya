import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface RulesBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  rules: React.ReactNode;
  timerSeconds: number;
  onAccept: () => void;
}

export function RulesBottomSheet({ isOpen, onClose, title, rules, timerSeconds, onAccept }: RulesBottomSheetProps) {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    if (isOpen) setTimeLeft(timerSeconds);
  }, [isOpen, timerSeconds]);

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, timeLeft]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-[32px] z-[110] max-h-[90vh] flex flex-col border-t border-border"
          >
            <div className="p-4 flex justify-between items-center border-b border-border">
              <h2 className="font-bold text-lg text-text">{title}</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-surface text-muted hover:text-text transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-sm text-text leading-relaxed space-y-4">
              {rules}
            </div>
            <div className="p-6 border-t border-border">
              <button
                disabled={timeLeft > 0}
                onClick={() => { onAccept(); onClose(); }}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-surface transition-all",
                  timeLeft > 0 ? "bg-muted cursor-not-allowed" : "bg-primary hover:bg-primary/90"
                )}
              >
                {timeLeft > 0 ? `اقراها لو سمحت — إحنا عاملينها عليك 💙 (${timeLeft}s)` : "قرأت وموافق ✅"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
