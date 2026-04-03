import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { generateContract } from '../../services/GeminiService';

const COLORS = {
  primary: '#1A3A5C',
  gold: '#C9A84C',
  background: '#F8F5EF',
  success: '#2D6A4F',
  text: '#1C2B3A',
  muted: '#6B7C8D',
  emergency: '#B03A2E'
};

const MESSAGES = [
  "جاري مراجعة البنود القانونية...",
  "نطبق أحكام القانون المدني المصري...",
  "نضيف بنود الحماية المناسبة...",
  "تدقيق المصطلحات القانونية...",
  "العقد شارف على الاكتمال..."
];

export default function ContractLoadingScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { contractType, formData } = location.state || {};
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Message interval
    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length);
    }, 2000);

    // Progress interval (12 seconds = 12000ms, update every 100ms -> 120 steps)
    const progInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / 120), 100));
    }, 100);

    // Call Gemini
    generateContract(contractType, formData)
      .then(result => {
        clearInterval(msgInterval);
        clearInterval(progInterval);
        navigate('/contracts/result', { state: { contractText: result, formData }, replace: true });
      })
      .catch(error => {
        clearInterval(msgInterval);
        clearInterval(progInterval);
        alert('حدث خطأ: ' + error.message);
        navigate(-1);
      });

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [contractType, formData, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: COLORS.primary }} dir="rtl">
      <motion.div
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-[80px] mb-8"
      >
        ⚖️
      </motion.div>

      <div className="h-8 mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white text-xl font-bold text-center"
          >
            {MESSAGES[messageIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md h-2 bg-white/20 rounded-full overflow-hidden mb-8">
        <div className="h-full transition-all duration-100 ease-linear" style={{ width: `${progress}%`, backgroundColor: COLORS.gold }}></div>
      </div>

      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
        المراجعة القانونية الذكية تستغرق 10-15 ثانية
      </p>
    </div>
  );
}
