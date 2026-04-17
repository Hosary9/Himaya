import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Phone, 
  Globe, 
  Moon,
  Sun,
  Bell, 
  HelpCircle, 
  MessageCircle, 
  AlertTriangle, 
  LogOut, 
  Trash2, 
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Upload,
  X
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import COLORS from '../theme/colors';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();

  // Feature 1: Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Feature 2: Update Phone Number
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [currentPhone, setCurrentPhone] = useState('01000000000'); // Placeholder
  const [newPhone, setNewPhone] = useState('');
  const [confirmPhone, setConfirmPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const sendOtp = async () => {
    setPhoneError('');
    if (!/^01[0-9]{9}$/.test(newPhone)) {
      setPhoneError('يرجى إدخال رقم هاتف مصري صحيح');
      return;
    }
    if (newPhone !== confirmPhone) {
      setPhoneError('الرقمان غير متطابقان');
      return;
    }

    setIsSendingCode(true);
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });

      const formattedPhone = '+2' + newPhone;
      const appVerifier = recaptchaVerifierRef.current;
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
      setIsSendingCode(false);
      showToast('تم إرسال كود التحقق', 'success');
    } catch (error: any) {
      console.error(error);
      setIsSendingCode(false);
      if (error.code === 'auth/invalid-phone-number') {
        setPhoneError('رقم الهاتف غير صحيح');
      } else if (error.code === 'auth/too-many-requests') {
        setPhoneError('تم تجاوز الحد المسموح، حاول لاحقاً');
      } else if (error.code === 'auth/captcha-check-failed') {
        setPhoneError('فشل التحقق، أعد تحميل الصفحة');
      } else {
        setPhoneError('حدث خطأ، تأكد من الاتصال وحاول مرة أخرى');
      }
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    }
  };

  const verifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) return;
    setIsVerifying(true);
    try {
      if (!confirmationResult) throw new Error("No confirmation result");
      await confirmationResult.confirm(otpCode);
      // Success!
      setCurrentPhone(newPhone);
      setShowPhoneForm(false);
      setNewPhone('');
      setConfirmPhone('');
      setOtpCode('');
      setIsOtpSent(false);
      setIsVerifying(false);
      showToast('تم تحديث رقم الهاتف بنجاح ✅', 'success');
    } catch (error: any) {
      console.error(error);
      setIsVerifying(false);
      if (error.code === 'auth/invalid-verification-code') {
        setPhoneError('الكود غير صحيح');
      } else if (error.code === 'auth/code-expired') {
        setPhoneError('انتهت صلاحية الكود، اطلب كوداً جديداً');
      } else {
        setPhoneError('حدث خطأ في التحقق');
      }
    }
  };

  const resendCode = () => {
    setIsOtpSent(false);
    setOtpCode('');
    setConfirmationResult(null);
    sendOtp();
  };

  // Feature 3: Change Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const getPasswordStrength = () => {
    if (newPassword.length === 0) return { width: '0%', color: '#E8E0D0', text: '' };
    if (newPassword.length < 8) return { width: '33%', color: '#B03A2E', text: 'ضعيفة', level: 'weak' };
    
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (hasUpper && hasLower && hasNumber) {
      return { width: '100%', color: '#2D6A4F', text: 'قوية', level: 'strong' };
    }
    return { width: '66%', color: '#F39C12', text: 'متوسطة', level: 'medium' };
  };

  const changePassword = () => {
    setPasswordError('');
    const strength = getPasswordStrength();
    
    if (strength.level === 'weak') {
      setPasswordError('كلمة المرور ضعيفة جداً');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتان');
      return;
    }

    // API Placeholder
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('تم تغيير كلمة المرور بنجاح ✅', 'success');
    
    setTimeout(() => {
      showToast('سيتم تسجيل خروجك تلقائياً...', 'success');
      setTimeout(() => auth.signOut(), 2000);
    }, 2000);
  };

  // Feature 4: Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('notifications') !== 'false');
  const [caseUpdates, setCaseUpdates] = useState(() => localStorage.getItem('caseUpdates') !== 'false');
  const [lawyerMessages, setLawyerMessages] = useState(() => localStorage.getItem('lawyerMessages') !== 'false');

  const toggleNotifications = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    localStorage.setItem('notifications', String(newVal));
    if (!newVal) {
      setCaseUpdates(false);
      setLawyerMessages(false);
      localStorage.setItem('caseUpdates', 'false');
      localStorage.setItem('lawyerMessages', 'false');
    }
  };

  const toggleCaseUpdates = () => {
    if (!notificationsEnabled) return;
    const newVal = !caseUpdates;
    setCaseUpdates(newVal);
    localStorage.setItem('caseUpdates', String(newVal));
  };

  const toggleLawyerMessages = () => {
    if (!notificationsEnabled) return;
    const newVal = !lawyerMessages;
    setLawyerMessages(newVal);
    localStorage.setItem('lawyerMessages', String(newVal));
  };

  // Profile Edit
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editName, setEditName] = useState('أحمد محمد');
  const [editEmail, setEditEmail] = useState('ahmed@example.com');
  const [editBio, setEditBio] = useState('');

  const saveProfile = () => {
    setShowProfileForm(false);
    showToast('تم حفظ التغييرات بنجاح ✅', 'success');
  };

  // Support
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState('مشكلة تقنية');
  const [reportDesc, setReportDesc] = useState('');

  const openWhatsApp = () => {
    window.open('https://wa.me/201067305303?text=مرحباً، أحتاج مساعدة في تطبيق محامينا', '_blank');
  };

  const submitReport = () => {
    if (!reportDesc.trim()) {
      showToast('يرجى كتابة وصف المشكلة', 'error');
      return;
    }
    setShowReportForm(false);
    setReportDesc('');
    showToast('تم إرسال بلاغك بنجاح، سنرد خلال 24 ساعة ✅', 'success');
  };

  // Toast Notification
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const sections = [
    {
      title: t('settings.account_settings'),
      items: [
        { label: t('settings.edit_profile'), icon: <User size={20} />, action: () => setShowProfileForm(!showProfileForm), isProfile: true },
        { label: t('settings.change_password'), icon: <Lock size={20} />, action: () => setShowPasswordForm(!showPasswordForm), isPassword: true },
        { label: t('settings.update_phone'), icon: <Phone size={20} />, action: () => setShowPhoneForm(!showPhoneForm), isPhone: true },
      ]
    },
    {
      title: t('settings.app_settings'),
      items: [
        { label: t('settings.language'), icon: <Globe size={20} />, action: toggleLanguage },
        { label: t('settings.dark_mode'), icon: isDarkMode ? <Moon size={20} /> : <Sun size={20} />, action: toggleTheme, type: 'toggle', active: isDarkMode },
      ]
    },
    {
      title: t('settings.notifications'),
      items: [
        { label: t('settings.enable_notifications'), icon: <Bell size={20} />, type: 'toggle', active: notificationsEnabled, action: toggleNotifications },
        { label: t('settings.case_updates'), icon: <Bell size={20} />, type: 'toggle', active: caseUpdates, action: toggleCaseUpdates, disabled: !notificationsEnabled },
        { label: t('settings.lawyer_messages'), icon: <MessageCircle size={20} />, type: 'toggle', active: lawyerMessages, action: toggleLawyerMessages, disabled: !notificationsEnabled },
      ]
    },
    {
      title: t('settings.support'),
      items: [
        { label: t('settings.help_center'), icon: <HelpCircle size={20} />, action: () => setShowHelpModal(true) },
        { label: t('settings.contact_support'), icon: <MessageCircle size={20} />, action: openWhatsApp },
        { label: t('settings.report_issue'), icon: <AlertTriangle size={20} />, action: () => setShowReportForm(!showReportForm), isReport: true },
      ]
    },
    {
      title: t('settings.security'),
      items: [
        { label: t('settings.logout'), icon: <LogOut size={20} />, action: () => auth.signOut(), color: 'text-red-600' },
        { label: t('settings.delete_account'), icon: <Trash2 size={20} />, action: () => console.log('Delete account'), color: 'text-red-600' },
      ]
    }
  ];

  const strength = getPasswordStrength();

  return (
    <div className="p-6 max-w-2xl mx-auto pb-24 transition-colors min-h-screen bg-background" dir="rtl">
      <h1 className="text-2xl font-bold mb-8 text-text">{t('settings.title') || 'الإعدادات'}</h1>
      
      <div className="space-y-8">
        {sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item, i) => (
                <div key={i}>
                  <button 
                    onClick={() => item.path ? navigate(item.path) : item.action?.()}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between p-4 bg-surface rounded-xl shadow-sm border border-border hover:border-gold transition-colors ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{item.icon}</div>
                      <span className={`font-medium ${item.color ? 'text-emergency' : 'text-text'}`}>{item.label}</span>
                    </div>
                    {item.type !== 'toggle' && !item.isPassword && !item.isPhone && !item.isProfile && !item.isReport && <ChevronLeft size={20} className="text-muted" />}
                    {item.type === 'toggle' && (
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${item.active ? 'bg-gold' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.active ? 'left-1' : 'left-7'}`} />
                      </div>
                    )}
                  </button>

                  {/* Profile Form */}
                  <AnimatePresence>
                    {item.isProfile && showProfileForm && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="p-4 bg-surface rounded-[16px] border border-border shadow-sm space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center text-muted border border-dashed border-border cursor-pointer hover:border-gold transition-colors">
                              <Upload size={24} />
                            </div>
                            <div className="text-sm text-muted">
                              اضغط لتغيير الصورة الشخصية
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-text mb-1">الاسم بالكامل</label>
                            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-transparent border border-border rounded-xl p-3 text-text outline-none focus:border-gold" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-text mb-1">البريد الإلكتروني</label>
                            <input type="email" value={editEmail} readOnly className="w-full bg-background border border-border rounded-xl p-3 text-muted outline-none cursor-not-allowed" dir="ltr" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-text mb-1">نبذة (اختياري)</label>
                            <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} className="w-full bg-transparent border border-border rounded-xl p-3 text-text outline-none focus:border-gold resize-none" placeholder="اكتب نبذة قصيرة عنك..."></textarea>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button onClick={saveProfile} className="flex-1 bg-primary hover:bg-opacity-90 text-surface font-bold py-3 rounded-xl transition-colors">حفظ التغييرات</button>
                            <button onClick={() => setShowProfileForm(false)} className="flex-1 bg-background hover:bg-opacity-80 text-text font-bold py-3 rounded-xl transition-colors">إلغاء</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Phone Form */}
                  <AnimatePresence>
                    {item.isPhone && showPhoneForm && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="p-4 bg-surface rounded-[16px] border border-border shadow-sm space-y-4">
                          <div id="recaptcha-container"></div>
                          {phoneError && (
                            <div className="text-emergency text-sm font-bold bg-emergency/10 p-2 rounded-lg">{phoneError}</div>
                          )}
                          
                          {!isOtpSent ? (
                            <>
                              <div>
                                <label className="block text-sm font-bold text-text mb-1">رقم الهاتف الحالي</label>
                                <input type="text" value={currentPhone} readOnly className="w-full bg-background border border-border rounded-xl p-3 text-muted outline-none" dir="ltr" />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-text mb-1">رقم الهاتف الجديد</label>
                                <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full bg-transparent border border-border rounded-xl p-3 text-text outline-none focus:border-gold" dir="ltr" />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-text mb-1">تأكيد رقم الهاتف الجديد</label>
                                <input type="tel" value={confirmPhone} onChange={e => setConfirmPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full bg-transparent border border-border rounded-xl p-3 text-text outline-none focus:border-gold" dir="ltr" />
                              </div>
                              <div className="flex gap-3 pt-2">
                                <button onClick={sendOtp} disabled={isSendingCode} className="flex-1 bg-[#1A3A5C] hover:bg-[#0F2540] disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-colors">
                                  {isSendingCode ? 'جاري الإرسال...' : 'إرسال الكود'}
                                </button>
                                <button onClick={() => { setShowPhoneForm(false); setPhoneError(''); }} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-[#1C2B3A] dark:text-white font-bold py-3 rounded-xl transition-colors">إلغاء</button>
                              </div>
                            </>
                          ) : (
                            <div dir="rtl" className="mt-4 p-4 rounded-xl border-2 border-border">
                              <p className="text-sm text-text font-bold mb-1">
                                تم إرسال كود التحقق على:
                              </p>
                              <p className="text-gold font-bold mb-3" dir="ltr" style={{ textAlign: 'right' }}>
                                +2{newPhone} 📱
                              </p>

                              <input
                                value={otpCode}
                                onChange={e => setOtpCode(e.target.value)}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="• • • • • •"
                                className="w-full border-2 border-border rounded-xl py-3 px-4 text-center tracking-widest text-xl outline-none bg-transparent text-text focus:border-gold"
                              />

                              <button
                                onClick={verifyOtp}
                                disabled={otpCode.length < 6 || isVerifying}
                                className="w-full mt-3 py-3 rounded-xl text-surface font-bold transition-colors bg-primary hover:bg-opacity-90 disabled:bg-gray-400 disabled:opacity-50"
                              >
                                {isVerifying ? 'جاري التحقق...' : 'تأكيد الكود ✅'}
                              </button>

                              <p className="text-center text-sm mt-3 text-muted">
                                لم يصلك الكود؟
                                <button onClick={resendCode} className="text-gold font-bold underline mr-1 hover:opacity-80">
                                  إعادة الإرسال
                                </button>
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password Form */}
                  <AnimatePresence>
                    {item.isPassword && showPasswordForm && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="p-4 bg-surface rounded-[16px] border border-border shadow-sm space-y-4">
                          {passwordError && (
                            <div className="text-emergency text-sm font-bold bg-emergency/10 p-2 rounded-lg">{passwordError}</div>
                          )}
                          <div>
                            <label className="block text-sm font-bold text-text mb-1">كلمة المرور الحالية</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-transparent border border-border rounded-xl p-3 text-text outline-none focus:border-gold" dir="ltr" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-text mb-1">كلمة المرور الجديدة</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-transparent border border-border rounded-xl p-3 text-text outline-none focus:border-gold" dir="ltr" />
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                                <motion.div animate={{ width: strength.width, backgroundColor: strength.color }} className="h-full transition-all" />
                              </div>
                              <span className="text-xs font-bold w-12 text-left" style={{ color: strength.color }}>{strength.text}</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-text mb-1">تأكيد كلمة المرور الجديدة</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-transparent border border-border rounded-xl p-3 text-text outline-none focus:border-gold" dir="ltr" />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button onClick={changePassword} disabled={!currentPassword || !newPassword || newPassword !== confirmPassword} className="flex-1 bg-primary hover:bg-opacity-90 disabled:opacity-50 text-surface font-bold py-3 rounded-xl transition-colors">تغيير</button>
                            <button onClick={() => setShowPasswordForm(false)} className="flex-1 bg-background hover:bg-opacity-80 text-text font-bold py-3 rounded-xl transition-colors">إلغاء</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Report Form */}
                  <AnimatePresence>
                    {item.isReport && showReportForm && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="p-4 bg-surface rounded-[16px] border border-border shadow-sm space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-text mb-1">نوع المشكلة</label>
                            <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full bg-transparent border border-border rounded-xl p-3 text-text outline-none focus:border-gold">
                              <option value="مشكلة تقنية" className="bg-surface">مشكلة تقنية</option>
                              <option value="مشكلة مع محامي" className="bg-surface">مشكلة مع محامي</option>
                              <option value="مشكلة في الدفع" className="bg-surface">مشكلة في الدفع</option>
                              <option value="أخرى" className="bg-surface">أخرى</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-text mb-1">وصف المشكلة</label>
                            <textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)} rows={4} className="w-full bg-transparent border border-border rounded-xl p-3 text-text outline-none focus:border-gold resize-none" placeholder="اشرح المشكلة بالتفصيل..."></textarea>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button onClick={submitReport} className="flex-1 bg-emergency hover:bg-opacity-90 text-surface font-bold py-3 rounded-xl transition-colors">إرسال البلاغ</button>
                            <button onClick={() => setShowReportForm(false)} className="flex-1 bg-background hover:bg-opacity-80 text-text font-bold py-3 rounded-xl transition-colors">إلغاء</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-border"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-background">
                <h3 className="font-bold text-lg text-text">مركز المساعدة</h3>
                <button onClick={() => setShowHelpModal(false)} className="text-muted hover:text-text">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-bold text-primary mb-2">س: كيف أحجز محامي؟</h4>
                  <p className="text-muted text-sm leading-relaxed">ج: ابحث عن محامي في قسم "البحث عن محامي" واضغط على زر "احجز الآن" في ملفه الشخصي.</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-2">س: كيف أتابع قضيتي؟</h4>
                  <p className="text-muted text-sm leading-relaxed">ج: يمكنك متابعة جميع قضاياك من قسم "قضاياي" في القائمة الرئيسية.</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-2">س: كيف أدفع؟</h4>
                  <p className="text-muted text-sm leading-relaxed">ج: الدفع يتم عبر المنصة فقط بشكل آمن باستخدام البطاقات الائتمانية أو المحافظ الإلكترونية.</p>
                </div>
              </div>
              <div className="p-4 border-t border-border bg-background">
                <button onClick={() => setShowHelpModal(false)} className="w-full bg-primary hover:bg-opacity-90 text-surface font-bold py-3 rounded-xl transition-colors">
                  حسناً
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50 ${toast.type === 'success' ? 'bg-success text-white' : 'bg-emergency text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
