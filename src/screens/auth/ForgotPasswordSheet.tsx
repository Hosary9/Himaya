import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import { auth } from '../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

interface ForgotPasswordSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordSheet({ isOpen, onClose }: ForgotPasswordSheetProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'input' | 'loading' | 'success'>('input');
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }

    setState('loading');
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setState('success');
    } catch (err: any) {
      setState('input');
      let message = "حصل خطأ، حاول تاني";
      if (err.code === 'auth/user-not-found') {
        message = "البريد الإلكتروني غير مسجل";
      } else if (err.code === 'auth/invalid-email') {
        message = "البريد الإلكتروني غير صحيح";
      } else if (err.code === 'auth/network-request-failed') {
        message = "تأكد من الإنترنت 📶";
      }
      setError(message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 shadow-2xl"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
            
            <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>

            <div className="min-h-[250px] flex flex-col justify-center relative">
              <AnimatePresence mode="wait">
                {state === 'input' && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="text-center mb-2">
                      <h2 className="text-2xl font-bold text-[#1C2B3A] mb-2">إعادة تعيين كلمة المرور</h2>
                      <p className="text-[#6B7C8D]">هنبعتلك لينك إعادة التعيين على بريدك</p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-[#B03A2E]/15 border border-[#B03A2E] text-[#B03A2E] p-3 rounded-xl flex items-center gap-2 text-sm font-bold overflow-hidden"
                      >
                        <span>⚠️</span>
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="البريد الإلكتروني"
                      className="w-full bg-transparent border border-[#E8E0D0] rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] text-right dir-rtl transition-all"
                    />

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:opacity-90 mt-2"
                      style={{ backgroundColor: '#1A3A5C' }}
                    >
                      إرسال رابط الاسترداد
                    </motion.button>
                  </motion.div>
                )}

                {state === 'loading' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <div className="w-12 h-12 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[#1A3A5C] font-bold text-lg">جاري الإرسال...</p>
                  </motion.div>
                )}

                {state === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="flex flex-col items-center justify-center text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
                    >
                      <CheckCircle2 size={80} className="text-[#2D6A4F] mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-[#1C2B3A] mb-2">تم الإرسال بنجاح!</h3>
                    <p className="text-[#6B7C8D] mb-2">افتح بريدك وضغط على اللينك</p>
                    <p className="text-[#C9A84C] font-bold mb-8">{email}</p>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:opacity-90"
                      style={{ backgroundColor: '#1A3A5C' }}
                    >
                      إغلاق
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
