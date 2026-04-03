import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Phone, CheckCircle2, ChevronRight, Briefcase, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { AuthContext } from '../App';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { setGuest } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'lawyer' | null>(null);
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeKey, setShakeKey] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (name.length < 3) newErrors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    if (!/^01[0-2,5]{1}[0-9]{8}$/.test(phone)) newErrors.phone = 'رقم الموبايل غير صحيح (مثال: 01xxxxxxxxx)';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'البريد الإلكتروني غير صحيح';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setShakeKey(prev => prev + 1);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (password.length < 6) newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (password !== confirmPassword) newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    if (!role) newErrors.role = 'يرجى اختيار نوع الحساب';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setShakeKey(prev => prev + 1);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        phone,
        email,
        role,
        createdAt: new Date().toISOString()
      });

      setIsSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C9A84C', '#1A3A5C', '#2D6A4F']
      });

      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 2000);

    } catch (err: any) {
      setShakeKey(prev => prev + 1);
      let message = "حصل خطأ، حاول تاني";
      if (err.code === 'auth/email-already-in-use') message = "البريد الإلكتروني مسجل مسبقاً";
      if (err.code === 'auth/network-request-failed') message = "تأكد من الإنترنت 📶";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setGuest(true);
    navigate('/app', { replace: true });
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { width: '0%', color: '#E8E0D0', text: '' };
    if (password.length <= 3) return { width: '33%', color: '#B03A2E', text: 'ضعيفة' };
    if (password.length <= 5) return { width: '66%', color: '#F39C12', text: 'متوسطة' };
    return { width: '100%', color: '#2D6A4F', text: 'قوية ✓' };
  };

  const strength = getPasswordStrength();

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
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      dir="rtl"
    >
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center" 
          >
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-[#2D6A4F] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CheckCircle2 size={50} color="white" />
              </div>
              <h2 className="text-3xl font-bold text-[#1C2B3A]">مرحباً بك في محامينا! 🎉</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md w-full z-10 flex flex-col max-h-screen">
        {/* Header */}
        <div className="text-center mb-6 shrink-0">
          <motion.div
            layoutId="hero-shield"
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl bg-[#1A3A5C] border-2 border-[#C9A84C]/30"
          >
            <Shield size={28} color="#C9A84C" />
          </motion.div>
          <h1 className="text-xl font-bold text-white mb-1">إنشاء حساب جديد</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6 px-8 shrink-0">
          <div className="flex items-center relative w-full max-w-[180px]">
            <motion.div 
              animate={{ backgroundColor: step >= 1 ? '#C9A84C' : '#E8E0D0' }}
              className="w-3.5 h-3.5 rounded-full z-10"
            />
            <div className="flex-1 h-1 bg-[#E8E0D0]/30 mx-2 relative overflow-hidden rounded-full">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: step === 2 ? '0%' : '-100%' }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 bg-[#C9A84C]"
              />
            </div>
            <motion.div 
              animate={{ 
                backgroundColor: step === 2 ? '#C9A84C' : 'transparent',
                borderColor: step === 2 ? '#C9A84C' : '#E8E0D0'
              }}
              className="w-3.5 h-3.5 rounded-full border-2 z-10 transition-colors duration-300"
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[24px] shadow-[0_8px_32px_rgba(26,58,92,0.2)] border border-white/20 flex flex-col max-h-[70vh]">
          
          <AnimatePresence mode="wait">
            {errors.form && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#B03A2E]/15 border border-[#B03A2E] text-[#B03A2E] p-3 rounded-xl flex items-center gap-2 text-sm font-bold mb-4 shrink-0"
              >
                <span>⚠️</span>
                <span>{errors.form}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
            <AnimatePresence initial={false} custom={step} mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex flex-col gap-4 pb-4"
                >
                  <InputField 
                    icon={<User />} placeholder="الاسم الكامل" value={name} onChange={setName}
                    error={errors.name} shakeKey={shakeKey} delay={0.1}
                    focused={focusedField === 'name'} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                  />
                  <InputField 
                    icon={<Phone />} placeholder="رقم الموبايل (01xxxxxxxxx)" value={phone} onChange={setPhone}
                    error={errors.phone} shakeKey={shakeKey} delay={0.2} type="tel"
                    focused={focusedField === 'phone'} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                  />
                  <InputField 
                    icon={<Mail />} placeholder="البريد الإلكتروني" value={email} onChange={setEmail}
                    error={errors.email} shakeKey={shakeKey} delay={0.3} type="email"
                    focused={focusedField === 'email'} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex flex-col gap-4 pb-4"
                >
                  <div className="flex items-center mb-1">
                    <button onClick={() => setStep(1)} className="text-[#6B7C8D] hover:text-[#1A3A5C] flex items-center text-sm font-bold">
                      <ChevronRight size={18} /> رجوع
                    </button>
                  </div>

                  <div className="relative">
                    <InputField 
                      icon={<Lock />} placeholder="كلمة المرور" value={password} onChange={setPassword}
                      error={errors.password} shakeKey={shakeKey} delay={0.1} type="password"
                      focused={focusedField === 'password'} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    />
                    <div className="mt-2 flex items-center gap-2 px-1">
                      <div className="flex-1 h-1.5 bg-[#E8E0D0] rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: strength.width, backgroundColor: strength.color }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        />
                      </div>
                      <span className="text-xs font-bold w-12 text-left" style={{ color: strength.color }}>{strength.text}</span>
                    </div>
                  </div>

                  <InputField 
                    icon={<Lock />} placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={setConfirmPassword}
                    error={errors.confirmPassword} shakeKey={shakeKey} delay={0.2} type="password"
                    focused={focusedField === 'confirmPassword'} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                  />

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="mt-1"
                  >
                    <p className="text-sm font-bold text-[#1C2B3A] mb-2">نوع الحساب:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <RoleCard 
                        icon={<UserCircle size={22} />} title="عميل" selected={role === 'client'} 
                        onClick={() => { setRole('client'); setErrors(prev => ({...prev, role: ''})); }} 
                      />
                      <RoleCard 
                        icon={<Briefcase size={22} />} title="محامي" selected={role === 'lawyer'} 
                        onClick={() => { setRole('lawyer'); setErrors(prev => ({...prev, role: ''})); }} 
                      />
                    </div>
                    {errors.role && <p className="text-[#B03A2E] text-xs font-bold mt-2">{errors.role}</p>}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 shrink-0">
            {step === 1 ? (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="w-full text-white font-bold h-14 rounded-[14px] shadow-lg transition-colors flex items-center justify-center gap-2 bg-[#1A3A5C] hover:bg-[#0F2540]"
              >
                التالي
                <ChevronRight size={20} className="rotate-180" />
              </motion.button>
            ) : (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleRegister}
                disabled={loading}
                className="w-full text-white font-bold h-14 rounded-[14px] shadow-lg transition-colors flex items-center justify-center gap-2 bg-[#1A3A5C] hover:bg-[#0F2540] disabled:opacity-80 opacity-90"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "إنشاء الحساب 🎉"
                )}
              </motion.button>
            )}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 text-center shrink-0 space-y-3"
        >
          <p className="text-sm text-white/80">
            لديك حساب بالفعل؟{' '}
            <button onClick={() => navigate('/login')} className="font-bold text-[#C9A84C] hover:text-white transition-colors">
              سجل الدخول
            </button>
          </p>

          <button
            onClick={handleGuestMode}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold h-12 rounded-[14px] transition-all flex items-center justify-center gap-2 hover:bg-white/20 opacity-90"
          >
            <UserCircle size={18} />
            دخول كضيف
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function InputField({ icon, placeholder, value, onChange, error, shakeKey, delay, type = "text", focused, onFocus, onBlur }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={error ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, x: 0 }}
      transition={{ delay }}
      key={`${placeholder}-${shakeKey}`}
    >
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[#6B7C8D]">
          {icon}
        </div>
        <motion.input 
          type={type} 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          animate={{ 
            borderColor: error ? '#B03A2E' : focused ? '#C9A84C' : '#E8E0D0',
            boxShadow: focused && !error ? '0 0 0 2px rgba(201,168,76,0.2)' : error ? '0 0 0 2px rgba(176,58,46,0.2)' : 'none'
          }}
          className="w-full bg-transparent border-2 rounded-xl py-4 pr-12 pl-4 outline-none text-left dir-ltr text-[#1C2B3A] transition-colors"
        />
      </div>
      {error && <p className="text-[#B03A2E] text-xs font-bold mt-1 px-1">{error}</p>}
    </motion.div>
  );
}

function RoleCard({ icon, title, selected, onClick }: any) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={{
        scale: selected ? 1.05 : 1,
        backgroundColor: selected ? '#1A3A5C' : '#FFFFFF',
        borderColor: selected ? '#C9A84C' : '#E8E0D0',
        color: selected ? '#FFFFFF' : '#1C2B3A'
      }}
      className="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors relative overflow-hidden"
    >
      {selected && (
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          className="absolute top-2 right-2 text-[#C9A84C]"
        >
          <CheckCircle2 size={16} />
        </motion.div>
      )}
      <div className="mb-2">{icon}</div>
      <span className="font-bold text-sm">{title}</span>
    </motion.button>
  );
}
