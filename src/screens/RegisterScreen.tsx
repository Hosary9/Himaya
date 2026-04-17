import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, User, Phone, CheckCircle2, ChevronRight, Briefcase, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AuthContext } from '../App';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setGuest } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const googleData = location.state as { googleUser?: boolean, uid?: string, email?: string, name?: string } | null;

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

  // Terms State
  const [termsRead, setTermsRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [timer, setTimer] = useState(10);
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setLoading(true);
          const user = result.user;
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid: user.uid,
              name: user.displayName || '',
              phone: '',
              email: user.email || '',
              role: 'client',
              acceptedTerms: true,
              isNewUser: true,
              createdAt: new Date().toISOString()
            });
          }
          
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
        }
      } catch (err: any) {
        console.error("Redirect Result Error:", err);
        setErrors({ form: "حدث خطأ أثناء التسجيل بـ Google" });
        setLoading(false);
      }
    };
    checkRedirect();
  }, [navigate]);

  useEffect(() => {
    if (googleData?.googleUser) {
      setStep(2);
      setName(googleData.name || '');
      setEmail(googleData.email || '');
    }
  }, [googleData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showTermsModal && !timerDone) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerDone(true);
            setTermsRead(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showTermsModal, timerDone]);

  const openTerms = () => {
    setShowTermsModal(true);
    if (!termsRead) {
      setTimerDone(false);
      setTimer(10);
    } else {
      setTimerDone(true);
    }
  };

  const acceptTerms = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const onCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!termsRead) {
      alert('اقرأ القواعد الأول من اللينك 👆');
      return;
    }
    setTermsAccepted(!termsAccepted);
  };

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
    if (!googleData?.googleUser) {
      if (password.length < 6) newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      if (password !== confirmPassword) newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }
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
      let user;
      if (googleData?.googleUser) {
        user = auth.currentUser;
        if (!user) throw new Error("User not found");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        await updateProfile(user, { displayName: name });
      }
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        phone: googleData?.googleUser ? '' : phone,
        email,
        role,
        acceptedTerms: true,
        isNewUser: true,
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

  const handleGoogleRegister = async () => {
    setLoading(true);
    setErrors({});
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error("Google Register Error:", err);
      setLoading(false);
      setShakeKey(prev => prev + 1);
      setErrors({ form: "حدث خطأ أثناء التسجيل بـ Google" });
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
            className="absolute inset-0 bg-background z-50 flex flex-col items-center justify-center" 
          >
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CheckCircle2 size={50} className="text-surface" />
              </div>
              <h2 className="text-3xl font-bold text-text">مرحباً بك في محامينا! 🎉</h2>
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
                backgroundColor: step === 2 ? '#C9A84C' : 'rgba(0, 0, 0, 0)',
                borderColor: step === 2 ? '#C9A84C' : '#E8E0D0'
              }}
              className="w-3.5 h-3.5 rounded-full border-2 z-10 transition-colors duration-300"
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-surface/95 backdrop-blur-xl p-6 rounded-[24px] shadow-[0_8px_32px_rgba(26,58,92,0.2)] border border-border/20 flex flex-col max-h-[70vh]">
          
          <AnimatePresence mode="wait">
            {errors.form && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emergency/15 border border-emergency text-emergency p-3 rounded-xl flex items-center gap-2 text-sm font-bold mb-4 shrink-0"
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
                  {!googleData?.googleUser && (
                    <div className="flex items-center mb-1">
                      <button onClick={() => setStep(1)} className="text-muted hover:text-primary flex items-center text-sm font-bold">
                        <ChevronRight size={18} /> رجوع
                      </button>
                    </div>
                  )}

                  {googleData?.googleUser && (
                    <div className="text-center mb-2">
                      <h2 className="text-lg font-bold text-text">أهلاً بك، {googleData.name?.split(' ')[0] || 'ضيفنا'} 👋</h2>
                      <p className="text-sm text-muted">أكمل إعداد حسابك لاختيار دورك في المنصة</p>
                    </div>
                  )}

                  {!googleData?.googleUser && (
                    <>
                      <div className="relative">
                        <InputField 
                          icon={<Lock />} placeholder="كلمة المرور" value={password} onChange={setPassword}
                          error={errors.password} shakeKey={shakeKey} delay={0.1} type="password"
                          focused={focusedField === 'password'} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                        />
                        <div className="mt-2 flex items-center gap-2 px-1">
                          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
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
                    </>
                  )}

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="mt-1"
                  >
                    <p className="text-sm font-bold text-text mb-2">نوع الحساب:</p>
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
                    {errors.role && <p className="text-emergency text-xs font-bold mt-2">{errors.role}</p>}
                  </motion.div>

                  {/* TERMS CHECKBOX ROW */}
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 mt-2 mb-1" dir="rtl"
                  >
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => {
                        if (!termsRead) {
                          openTerms();
                          return;
                        }
                        setTermsAccepted(e.target.checked);
                      }}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-sm text-text">
                      أوافق على
                      <button
                        type="button"
                        onClick={openTerms}
                        className="text-secondary underline font-bold mr-1"
                      >
                        قواعد المنصة وشروط الاستخدام
                      </button>
                    </label>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 shrink-0 space-y-3">
            {step === 1 ? (
              <>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="w-full text-surface font-bold h-14 rounded-[14px] shadow-lg transition-colors flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                >
                  التالي
                  <ChevronRight size={20} className="rotate-180" />
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleRegister}
                  disabled={loading || isSuccess}
                  className="w-full bg-surface border-2 border-border text-text font-bold h-14 rounded-[14px] shadow-sm transition-all flex items-center justify-center gap-3 hover:bg-background opacity-90 disabled:opacity-80"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  التسجيل باستخدام Google
                </motion.button>
              </>
            ) : (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleRegister}
                disabled={loading || !termsAccepted}
                className={`w-full font-bold h-14 rounded-[14px] shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-80 opacity-90 ${termsAccepted ? 'bg-primary hover:bg-primary/90 text-surface' : 'bg-muted cursor-not-allowed text-surface'}`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-surface border-t-transparent rounded-full animate-spin" />
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
          <p className="text-sm text-surface/80">
            لديك حساب بالفعل؟{' '}
            <button onClick={() => navigate('/login')} className="font-bold text-secondary hover:text-surface transition-colors">
              سجل الدخول
            </button>
          </p>

          <button
            onClick={handleGuestMode}
            className="w-full bg-surface/10 backdrop-blur-md border border-surface/20 text-surface font-bold h-12 rounded-[14px] transition-all flex items-center justify-center gap-2 hover:bg-surface/20 opacity-90"
          >
            <UserCircle size={18} />
            دخول كضيف
          </button>
        </motion.div>
      </div>

      {/* TERMS MODAL */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-surface w-full max-w-md rounded-t-[24px] p-6 flex flex-col border-t border-border"
              style={{ maxHeight: '80vh' }}
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
                <h2 className="text-lg font-bold text-text">
                  قواعد المنصة ⚖️
                </h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-muted text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-background rounded-full transition-colors hover:text-text"
                >✕</button>
              </div>

              {/* Rules Text */}
              <div className="overflow-y-auto flex-1 text-sm text-text leading-relaxed mb-4 custom-scrollbar pr-2">
                <p className="text-center font-bold text-secondary mb-3 text-base">
                  ﴿ لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ
                  إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ ﴾
                </p>
                <p className="text-xs text-center text-muted mb-4">
                  سورة النساء: ٢٩
                </p>
                <p className="mb-2">• الدفع المسبق شرط لبدء أي خدمة</p>
                <p className="mb-2">• قدم معلومات صحيحة عن قضيتك</p>
                <p className="mb-2">• احترم المحامي في كل التواصل</p>
                <p className="mb-2">• لو هتتأخر عن موعد إشعر المحامي مسبقاً</p>
                <p className="mb-2">• التقييم حقك لكن لازم يكون صادق</p>
                <p className="mb-2">• ممنوع شكاوى كيدية للإضرار بالمحامي</p>
                <p className="mb-2">• ممنوع فتح نزاع بعد استلام الخدمة كاملة</p>
                <p className="mb-2">• ممنوع مشاركة بيانات المحامي خارج المنصة</p>
              </div>

              {/* Timer */}
              {!timerDone && (
                <div className="text-center py-3 font-bold text-muted">
                  ⏳ هتقدر توافق بعد {timer} ثواني
                </div>
              )}

              {/* Accept Button */}
              {timerDone && (
                <button
                  onClick={acceptTerms}
                  className="w-full font-bold py-4 rounded-xl text-surface transition-all bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  قرأت وموافق ✅
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
        <div className="absolute top-1/2 -translate-y-1/2 right-4 text-muted">
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
            borderColor: error ? 'var(--color-emergency)' : focused ? 'var(--color-secondary)' : 'var(--color-border)',
            boxShadow: focused && !error ? '0 0 0 2px rgba(201,168,76,0.2)' : error ? '0 0 0 2px rgba(176,58,46,0.2)' : 'none'
          }}
          className="w-full bg-transparent border border-border rounded-xl py-4 pr-12 pl-4 outline-none text-right text-text transition-colors"
        />
      </div>
      {error && <p className="text-emergency text-xs font-bold mt-1 px-1">{error}</p>}
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
        backgroundColor: selected ? 'var(--color-primary)' : 'var(--color-surface)',
        borderColor: selected ? 'var(--color-secondary)' : 'var(--color-border)',
        color: selected ? 'var(--color-surface)' : 'var(--color-text)'
      }}
      className="flex flex-col items-center justify-center p-4 rounded-xl border border-border transition-colors relative overflow-hidden"
    >
      {selected && (
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          className="absolute top-2 right-2 text-secondary"
        >
          <CheckCircle2 size={16} />
        </motion.div>
      )}
      <div className="mb-2">{icon}</div>
      <span className="font-bold text-sm">{title}</span>
    </motion.button>
  );
}
