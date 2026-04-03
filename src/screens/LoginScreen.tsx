import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import COLORS from '../theme/colors';
import { useLanguage } from '../lib/i18n';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setLoading(false);
      let message = "حصل خطأ، حاول تاني";
      if (err.code === 'auth/user-not-found') {
        message = "الإيميل غير مسجل";
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = "كلمة المرور غير صحيحة";
      } else if (err.code === 'auth/invalid-email') {
        message = "الإيميل غير صحيح";
      } else if (err.code === 'auth/network-request-failed') {
        message = "تأكد من اتصالك بالإنترنت";
      }
      setError(message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني أولاً' : 'Please enter your email first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
      setIsForgotPassword(false);
    } catch (err: any) {
      let message = "حصل خطأ، حاول تاني";
      if (err.code === 'auth/user-not-found') {
        message = "الإيميل غير مسجل";
      } else if (err.code === 'auth/invalid-email') {
        message = "الإيميل غير صحيح";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: COLORS.background }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ backgroundColor: COLORS.primary }}>
            <Shield size={40} color="#FFFFFF" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>محامينا</h1>
          <p className="text-lg" style={{ color: COLORS.muted }}>مساعدك القانوني الذكي</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border" style={{ borderColor: COLORS.border }}>
          <div className="space-y-6">
            {error && (
              <div className="bg-emergency/10 p-3 rounded-xl flex items-center gap-2 text-emergency text-sm font-bold">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="bg-success/10 p-3 rounded-xl flex items-center gap-2 text-success text-sm font-bold" style={{ color: COLORS.success, backgroundColor: `${COLORS.success}1A` }}>
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.text }}>{t('login.email')}</label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 right-4" size={20} style={{ color: COLORS.muted }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.email.placeholder')}
                  className="w-full bg-transparent border rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 text-left dir-ltr"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                />
              </div>
            </div>
            
            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.text }}>{t('login.password')}</label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 right-4" size={20} style={{ color: COLORS.muted }} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.password.placeholder')}
                    className="w-full bg-transparent border rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 text-left dir-ltr"
                    style={{ borderColor: COLORS.border, color: COLORS.text }}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-sm font-bold transition-opacity hover:opacity-80"
                    style={{ color: COLORS.primary }}
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              </div>
            )}
            
            {isForgotPassword ? (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "إرسال رابط إعادة التعيين"
                  )}
                </button>
                <button 
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full font-bold py-4 rounded-xl transition-all hover:bg-gray-50 flex items-center justify-center"
                  style={{ color: COLORS.muted }}
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: COLORS.primary }}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t('login.verify')}
                    {language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                  </>
                )}
              </button>
            )}

            {!isForgotPassword && (
              <>
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-[1px] bg-border" style={{ backgroundColor: COLORS.border }} />
                  <span className="text-sm text-muted" style={{ color: COLORS.muted }}>أو</span>
                  <div className="flex-1 h-[1px] bg-border" style={{ backgroundColor: COLORS.border }} />
                </div>

                <button 
                  onClick={() => navigate('/guest-home', { replace: true })}
                  className="w-full font-bold py-4 rounded-[14px] border transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: 'transparent', 
                    borderColor: COLORS.border, 
                    color: COLORS.muted,
                    height: '52px'
                  }}
                >
                  <span>👁️ تصفح كضيف بدون تسجيل</span>
                </button>
              </>
            )}
          </div>

          {!isForgotPassword && (
            <div className="mt-8 text-center">
              <p className="text-sm" style={{ color: COLORS.muted }}>
                ليس لديك حساب؟{' '}
                <button onClick={() => navigate('/register')} className="font-bold" style={{ color: COLORS.primary }}>
                  سجل الآن
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
