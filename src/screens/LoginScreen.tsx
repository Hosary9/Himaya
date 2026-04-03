import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import ForgotPasswordSheet from './auth/ForgotPasswordSheet';
import AnimatedLogo from '../components/AnimatedLogo';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isForgotSheetOpen, setIsForgotSheetOpen] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [shakeKey, setShakeKey] = useState(0); // Used to trigger shake animation

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      setShakeKey(prev => prev + 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      setShakeKey(prev => prev + 1);
      let message = "حصل خطأ، حاول تاني";
      if (err.code === 'auth/user-not-found') {
        message = "البريد الإلكتروني غير مسجل";
      } else if (err.code === 'auth/wrong-password') {
        message = "كلمة المرور غير صحيحة";
      } else if (err.code === 'auth/invalid-credential') {
        message = "البريد أو كلمة المرور غلط";
      } else if (err.code === 'auth/too-many-requests') {
        message = "حاولت كتير، انتظر شوية ☕";
      } else if (err.code === 'auth/network-request-failed') {
        message = "تأكد من الإنترنت 📶";
      }
      setError(message);
    }
  };

  return (
    <motion.div 
      animate={{ 
        background: [
          'linear-gradient(to bottom, #1A3A5C, #0F2540)',
          'linear-gradient(to bottom, #0F2540, #1A3A5C)',
          'linear-gradient(to bottom, #1A3A5C, #0F2540)'
        ] 
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      dir="rtl"
    >
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-white z-50" 
          />
        )}
      </AnimatePresence>

      <div className="max-w-md w-full z-10">
        {/* Top Section */}
        <div className="text-center mb-10 flex flex-col items-center">
          <motion.div
            layoutId="hero-shield"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
            className="mb-6"
          >
            <AnimatedLogo size={80} />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold mb-3 text-white tracking-tight"
          >
            محامينا
          </motion.h1>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="h-1 bg-[#C9A84C] rounded-full mb-3"
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-lg text-[#E8E0D0]/80"
          >
            مساعدك القانوني الذكي
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6, type: "spring", bounce: 0.2 }}
          className="bg-white/95 backdrop-blur-xl p-8 rounded-[24px] shadow-[0_8px_32px_rgba(26,58,92,0.2)] border border-white/20"
        >
          <div className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#B03A2E]/15 border border-[#B03A2E] text-[#B03A2E] p-3 rounded-xl flex items-center gap-2 text-sm font-bold overflow-hidden"
                >
                  <span>⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={error ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              key={`email-${shakeKey}`}
            >
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 right-4 text-[#6B7C8D]" size={20} />
                <motion.input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="البريد الإلكتروني"
                  animate={{ 
                    borderColor: focusedField === 'email' ? '#C9A84C' : '#E8E0D0',
                    boxShadow: focusedField === 'email' ? '0 0 0 2px rgba(201,168,76,0.2)' : 'none'
                  }}
                  className="w-full bg-transparent border-2 rounded-xl py-4 pr-12 pl-4 outline-none text-left dir-ltr text-[#1C2B3A] transition-colors"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={error ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              key={`pass-${shakeKey}`}
            >
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 right-4 text-[#6B7C8D]" size={20} />
                <motion.input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="كلمة المرور"
                  animate={{ 
                    borderColor: focusedField === 'password' ? '#C9A84C' : '#E8E0D0',
                    boxShadow: focusedField === 'password' ? '0 0 0 2px rgba(201,168,76,0.2)' : 'none'
                  }}
                  className="w-full bg-transparent border-2 rounded-xl py-4 pr-12 pl-12 outline-none text-left dir-ltr text-[#1C2B3A] transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 left-4 text-[#6B7C8D] hover:text-[#1A3A5C] transition-colors"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={showPassword ? "eye" : "eyeOff"}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex justify-end"
            >
              <button 
                onClick={() => setIsForgotSheetOpen(true)}
                className="text-sm font-bold text-[#C9A84C] hover:text-[#1A3A5C] transition-colors"
              >
                نسيت كلمة المرور؟
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                disabled={loading || isSuccess}
                animate={{ 
                  backgroundColor: isSuccess ? '#2D6A4F' : '#1A3A5C',
                  scale: isSuccess ? [1, 0.95, 1.05, 1] : 1
                }}
                className="w-full text-white font-bold h-14 rounded-[14px] shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-80 relative overflow-hidden"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                  >
                    <CheckCircle2 size={24} />
                  </motion.div>
                ) : (
                  "تسجيل الدخول"
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-white/80">
            مش عندك حساب؟{' '}
            <button onClick={() => navigate('/register')} className="font-bold text-[#C9A84C] hover:text-white transition-colors">
              سجّل دلوقتي
            </button>
          </p>
        </motion.div>
      </div>

      <ForgotPasswordSheet 
        isOpen={isForgotSheetOpen} 
        onClose={() => setIsForgotSheetOpen(false)} 
      />
    </motion.div>
  );
}
