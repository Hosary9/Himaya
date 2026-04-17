import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  UserCircle,
  Bell,
  Menu,
  Settings,
  ChevronLeft
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import AnimatedLogo from '../components/AnimatedLogo';
import LawyerVerification from '../components/LawyerVerification';
import NotificationsPanel from '../components/NotificationsPanel';

export default function LawyerHomeScreen() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Use onSnapshot to get real-time updates for verification status
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.name || auth.currentUser?.displayName || 'محامي');
        const status = data.verificationStatus || 'unverified';
        setVerificationStatus(status);
        if (status === 'rejected') {
          setRejectionReason(data.rejectionReason || 'لم يتم استيفاء المستندات بشكل صحيح.');
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching lawyer data:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const StatusBanner = () => {
    if (verificationStatus === 'verified') {
      return (
        <div className="bg-success/5 border border-success/20 p-5 rounded-2xl flex items-start gap-4 mb-6 relative overflow-hidden shadow-sm transition-all hover:shadow-md">
          <div className="p-2.5 bg-success text-surface rounded-xl shadow-lg shadow-success/20 shrink-0 relative z-10">
            <ShieldCheck size={28} />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-success text-xl tracking-tight">حسابك موثق بنجاح</h3>
            <p className="text-muted text-sm mt-1 font-medium leading-relaxed opacity-90">يمكنك الآن استقبال الطلبات والاستشارات من العملاء بكامل الصلاحيات المهنية.</p>
          </div>
          <ShieldCheck size={140} className="absolute -left-6 -top-6 text-success opacity-5 rotate-12" />
        </div>
      );
    }
    
    if (verificationStatus === 'pending') {
      return (
        <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex items-start gap-4 mb-6 relative overflow-hidden shadow-sm">
          <div className="p-2.5 bg-primary text-surface rounded-xl shadow-lg shadow-primary/20 shrink-0 relative z-10">
            <Clock size={28} />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-primary text-xl tracking-tight">قيد المراجعة الفنية</h3>
            <p className="text-muted text-sm mt-1 font-medium leading-relaxed opacity-90">جاري مراجعة مستنداتك من قبل الإدارة الفنية. المتوقع إرسال الرد خلال 24 - 48 ساعة عمل.</p>
          </div>
          <Clock size={140} className="absolute -left-6 -top-6 text-primary opacity-5 -rotate-12" />
        </div>
      );
    }
    
    if (verificationStatus === 'rejected') {
      return (
        <div className="bg-emergency/5 border border-emergency/20 p-5 rounded-2xl flex items-start gap-4 mb-6 relative overflow-hidden shadow-sm group">
          <div className="p-2.5 bg-emergency text-surface rounded-xl shadow-lg shadow-emergency/20 shrink-0 relative z-10 group-hover:scale-110 transition-transform">
            <XCircle size={28} />
          </div>
          <div className="relative z-10 w-full">
            <h3 className="font-bold text-emergency text-xl tracking-tight">تم رفض طلب التوثيق</h3>
            <p className="text-muted text-sm mt-1 mb-4 font-medium opacity-90">السبب: {rejectionReason}</p>
            <button 
              onClick={() => setShowVerification(true)}
              className="bg-emergency hover:bg-emergency/80 text-surface px-6 py-2.5 rounded-xl text-sm font-bold transition-all w-fit shadow-lg shadow-emergency/20 active:scale-95"
            >
              إعادة رفع المستندات المطلوبة
            </button>
          </div>
          <XCircle size={140} className="absolute -left-6 -top-6 text-emergency opacity-5 rotate-12" />
        </div>
      );
    }

    return (
      <div className="bg-secondary/5 border border-secondary/20 p-5 rounded-2xl flex items-start gap-4 mb-6 relative overflow-hidden shadow-sm group">
        <div className="p-2.5 bg-secondary text-primary rounded-xl shadow-lg shadow-secondary/20 shrink-0 relative z-10 group-hover:scale-110 transition-transform">
          <ShieldAlert size={28} />
        </div>
        <div className="relative z-10 w-full">
          <h3 className="font-bold text-secondary text-xl tracking-tight">حساب غير موثق بعد</h3>
          <p className="text-muted text-sm mt-1 mb-4 font-medium opacity-90">لن تتمكن من استقبال أي قضايا أو طلبات قبل توثيق هويتك المهنية كمحامٍ مسجل.</p>
          <button 
            onClick={() => setShowVerification(true)}
            className="bg-secondary hover:bg-secondary/80 text-primary px-6 py-2.5 rounded-xl text-sm font-bold transition-all w-fit shadow-lg shadow-secondary/20 active:scale-95"
          >
            بدء عملية التوثيق الآن
          </button>
        </div>
        <ShieldAlert size={140} className="absolute -left-6 -top-6 text-secondary opacity-5 rotate-12" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showVerification && (verificationStatus === 'unverified' || verificationStatus === 'rejected')) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => setShowVerification(false)}
            className="flex items-center gap-2 text-muted hover:text-primary mb-6 transition-colors"
          >
            <ChevronLeft size={20} className="rotate-180" />
            <span>العودة للوحة التحكم</span>
          </button>
          <LawyerVerification onComplete={() => setShowVerification(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      {/* Header */}
      <header className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
            <Menu size={20} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-1">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl bg-background/50 relative text-muted hover:text-text transition-colors border border-border" 
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-emergency rounded-full border-2 border-surface"></span>
              </button>
              {isNotificationsOpen && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/app/settings')}
              className="p-2 rounded-xl bg-background/50 text-muted hover:text-text transition-colors border border-border" 
            >
              <Settings size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-primary tracking-tight">محامينا</h1>
            <AnimatedLogo size={36} />
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 text-text">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">أهلاً بك يا أستاذ/ {userName}</h1>
            <p className="text-muted text-sm mt-1 font-medium">مرحباً بك في لوحة تحكم المحامين المتقدمة</p>
          </div>
        </div>

        <StatusBanner />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">الطلبات الجديدة</p>
              <h2 className="text-3xl font-black text-text mt-1">0</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <FileText size={24} />
            </div>
          </div>
          
          <div className="bg-surface p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">الرسائل النشطة</p>
              <h2 className="text-3xl font-black text-text mt-1">0</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center border border-success/20">
              <MessageSquare size={24} />
            </div>
          </div>
          
          <div className="bg-surface p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">القضايا النشطة</p>
              <h2 className="text-3xl font-black text-text mt-1">0</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20">
              <Briefcase size={24} />
            </div>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">اكتمال الملف</p>
              <h2 className="text-3xl font-black text-text mt-1">45%</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20">
              <UserCircle size={24} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-bold text-text mb-4 tracking-tight uppercase">إجراءات سريعة للمحامي</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/app/lawyer-profile')}
            className="bg-surface p-4 rounded-2xl border border-border flex flex-col items-center justify-center gap-3 group transition-all hover:border-primary hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-background flex items-center justify-center rounded-xl text-muted group-hover:bg-primary group-hover:text-surface transition-all">
              <UserCircle size={24} />
            </div>
            <span className="font-bold text-xs text-text">تعديل الملف</span>
          </button>
          
          <button 
            className="bg-surface p-4 rounded-2xl border border-border flex flex-col items-center justify-center gap-3 group transition-all hover:border-primary hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={verificationStatus !== 'verified'}
          >
            <div className="w-12 h-12 bg-background flex items-center justify-center rounded-xl text-muted group-hover:bg-primary group-hover:text-surface transition-all">
              <Briefcase size={24} />
            </div>
            <span className="font-bold text-xs text-text">قضاياي</span>
          </button>
          
          <button 
            className="bg-surface p-4 rounded-2xl border border-border flex flex-col items-center justify-center gap-3 group transition-all hover:border-primary hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={verificationStatus !== 'verified'}
          >
            <div className="w-12 h-12 bg-background flex items-center justify-center rounded-xl text-muted group-hover:bg-primary group-hover:text-surface transition-all">
              <MessageSquare size={24} />
            </div>
            <span className="font-bold text-xs text-text">الرسائل</span>
          </button>

          <button 
            onClick={() => navigate('/app/settings')}
            className="bg-surface p-4 rounded-2xl border border-border flex flex-col items-center justify-center gap-3 group transition-all hover:border-primary hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-background flex items-center justify-center rounded-xl text-muted group-hover:bg-primary group-hover:text-surface transition-all">
              <Settings size={24} />
            </div>
            <span className="font-bold text-xs text-text">الإعدادات</span>
          </button>
        </div>
      </div>
    </div>
  );
}
