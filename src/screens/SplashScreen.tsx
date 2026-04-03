import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import COLORS from '../theme/colors';
import AnimatedLogo from '../components/AnimatedLogo';

export default function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [dots, setDots] = useState([false, false, false]);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animation sequence
    const dotTimers = [
      setTimeout(() => setDots([true, false, false]), 1800),
      setTimeout(() => setDots([true, true, false]), 2000),
      setTimeout(() => setDots([true, true, true]), 2200),
    ];

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 400);
    }, 3200);

    return () => {
      dotTimers.forEach(clearTimeout);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        >
          {/* Background: two layered Views to simulate gradient */}
          <div className="flex-1" style={{ backgroundColor: COLORS.primary }} />
          <div className="flex-1" style={{ backgroundColor: COLORS.dark }} />

          {/* Centered Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            
            {/* Step 2: Golden line animates width from 0 → 60 */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 60, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              style={{ height: 2, backgroundColor: COLORS.gold }}
              className="mb-8"
            />

            {/* Step 3: AnimatedLogo scales from 0.2 → 1 using spring */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-4"
            >
              <AnimatedLogo size={100} />
            </motion.div>

            {/* EGYPTIAN SUBTLE TOUCH: Fades in with the icon at step 3 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="flex w-[120px] h-[2px] my-4"
            >
              <div className="flex-1" style={{ backgroundColor: COLORS.gold }} />
              <div className="flex-1 opacity-50" style={{ backgroundColor: COLORS.primary }} />
            </motion.div>

            {/* Step 4: "محامينا" slides up 30px + fades in */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              style={{ color: '#FFFFFF', letterSpacing: 3 }}
              className="text-[44px] font-bold text-center mb-2"
            >
              محامينا
            </motion.h1>

            {/* Step 5: subtitle "حقوقك في أمان" fades in */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
              style={{ color: 'rgba(201,168,76,0.9)' }}
              className="text-[16px] text-center mb-8"
            >
              حقوقك في أمان
            </motion.p>

            {/* Step 6: 3 dots appear one by one with 200ms delay each */}
            <div className="flex gap-[10px]">
              {dots.map((active, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: active ? 1 : 0 }}
                  className="w-[6px] h-[6px] rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
