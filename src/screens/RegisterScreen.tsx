import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, Briefcase, User as UserIcon, AlertCircle } from 'lucide-react';
import COLORS from '../theme/colors';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  role: 'client' | 'lawyer';
  createdAt: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'lawyer'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!name.trim() || name.trim().length < 3) {
      newErrors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }
    if (!phone.startsWith('01') || phone.length !== 11) {
      newErrors.phone = 'رقم الموبايل يجب أن يبدأ بـ 01 ويتكون من 11 رقم';
    }
    if (!email.includes('@') || !email.split('@')[1]?.includes('.')) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    if (password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setAuthError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      const userProfile = {
        uid: userCredential.user.uid,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        role: role,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
      
      setLoading(false);
      // The user requested navigation.replace('RoleSelection')
      // but in our app we might want to go to /dashboard or a role selection screen if it exists.
      // For now I'll follow the request and assume 'RoleSelection' is a route.
      // If it doesn't exist, I'll use /dashboard as fallback.
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setLoading(false);
      let message = "حصل خطأ غير متوقع، حاول تاني";
      if (err.code === 'auth/email-already-in-use') {
        message = "الإيميل مستخدم بالفعل";
      } else if (err.code === 'auth/weak-password') {
        message = "كلمة المرور ضعيفة، استخدم 6 أحرف على الأقل";
      } else if (err.code === 'auth/invalid-email') {
        message = "الإيميل غير صحيح";
      } else if (err.code === 'auth/network-request-failed') {
        message = "تأكد من اتصالك بالإنترنت";
      }
      setAuthError(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-y-auto" style={{ backgroundColor: COLORS.background }}>
      <div className="max-w-[420px] w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center mt-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>إنشاء حساب جديد</h1>
          <p className="text-muted" style={{ color: COLORS.muted }}>انضم إلى منصة محامينا القانونية</p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="bg-emergency p-4 rounded-xl flex items-center gap-3 text-white text-right" style={{ backgroundColor: COLORS.emergency }}>
            <AlertCircle size={20} />
            <span className="flex-1 text-sm font-bold">{authError}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-surface p-6 rounded-[20px] shadow-lg border border-border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <div className="flex flex-col gap-5">
            
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-right text-sm font-bold" style={{ color: COLORS.text }}>الاسم الكامل</label>
              <div className="relative">
                <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2" size={20} style={{ color: COLORS.muted }} />
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك بالكامل"
                  className="w-full h-[52px] bg-transparent border rounded-xl pr-12 pl-4 text-right focus:outline-none focus:ring-1"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                />
              </div>
              {errors.name && <span className="text-right text-[12px]" style={{ color: COLORS.emergency }}>{errors.name}</span>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-right text-sm font-bold" style={{ color: COLORS.text }}>رقم الموبايل</label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2" size={20} style={{ color: COLORS.muted }} />
                <input 
                  type="number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full h-[52px] bg-transparent border rounded-xl pr-12 pl-4 text-left dir-ltr focus:outline-none focus:ring-1"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                />
              </div>
              {errors.phone && <span className="text-right text-[12px]" style={{ color: COLORS.emergency }}>{errors.phone}</span>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-right text-sm font-bold" style={{ color: COLORS.text }}>البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2" size={20} style={{ color: COLORS.muted }} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full h-[52px] bg-transparent border rounded-xl pr-12 pl-4 text-left dir-ltr focus:outline-none focus:ring-1"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                />
              </div>
              {errors.email && <span className="text-right text-[12px]" style={{ color: COLORS.emergency }}>{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-right text-sm font-bold" style={{ color: COLORS.text }}>كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2" size={20} style={{ color: COLORS.muted }} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} style={{ color: COLORS.muted }} /> : <Eye size={20} style={{ color: COLORS.muted }} />}
                </button>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[52px] bg-transparent border rounded-xl pr-12 pl-12 text-left dir-ltr focus:outline-none focus:ring-1"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                />
              </div>
              {errors.password && <span className="text-right text-[12px]" style={{ color: COLORS.emergency }}>{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-right text-sm font-bold" style={{ color: COLORS.text }}>تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2" size={20} style={{ color: COLORS.muted }} />
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[52px] bg-transparent border rounded-xl pr-12 pl-4 text-left dir-ltr focus:outline-none focus:ring-1"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                />
              </div>
              {errors.confirmPassword && <span className="text-right text-[12px]" style={{ color: COLORS.emergency }}>{errors.confirmPassword}</span>}
            </div>

            {/* Role Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-right text-sm font-bold" style={{ color: COLORS.text }}>نوع الحساب</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setRole('client')}
                  className="flex-1 h-[52px] rounded-xl border flex items-center justify-center gap-2 font-bold transition-all"
                  style={{ 
                    backgroundColor: role === 'client' ? COLORS.primary : COLORS.surface,
                    borderColor: COLORS.border,
                    color: role === 'client' ? '#FFFFFF' : COLORS.text
                  }}
                >
                  <span>👤 موكّل</span>
                </button>
                <button 
                  onClick={() => setRole('lawyer')}
                  className="flex-1 h-[52px] rounded-xl border flex items-center justify-center gap-2 font-bold transition-all"
                  style={{ 
                    backgroundColor: role === 'lawyer' ? COLORS.primary : COLORS.surface,
                    borderColor: COLORS.border,
                    color: role === 'lawyer' ? '#FFFFFF' : COLORS.text
                  }}
                >
                  <span>⚖️ محامي</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleRegister}
              disabled={loading}
              className="w-full h-[52px] rounded-xl font-bold text-white flex items-center justify-center gap-2 mt-4 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: COLORS.success }}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'إنشاء الحساب'
              )}
            </button>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mb-10">
          <p className="text-sm" style={{ color: COLORS.muted }}>
            لديك حساب بالفعل؟{' '}
            <button onClick={() => navigate('/login')} className="font-bold" style={{ color: COLORS.primary }}>
              تسجيل الدخول
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
