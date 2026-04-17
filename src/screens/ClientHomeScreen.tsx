import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  MessageSquare, 
  Scale, 
  BookOpen, 
  FileText, 
  Briefcase,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  Settings,
  X
} from 'lucide-react';
import COLORS from '../theme/colors';
import { useLanguage } from '../lib/i18n';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedLogo from '../components/AnimatedLogo';
import LawyerVerification from '../components/LawyerVerification';

export default function ClientHomeScreen() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        if (auth.currentUser.displayName) {
          setUserName(auth.currentUser.displayName);
        }
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            if (userDoc.data().name && !auth.currentUser.displayName) {
              setUserName(userDoc.data().name);
            }
            if (userDoc.data().role) {
              setUserRole(userDoc.data().role);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const mainActions = [
    { 
      id: 'ai', 
      title: t('need_help'), 
      desc: t('how_can_help'), 
      icon: <MessageSquare size={32} />, 
      path: '/app/ai-assistant',
      color: COLORS.primary 
    },
    { 
      id: 'search', 
      title: t('find_lawyer'), 
      desc: t('find_lawyer'), 
      icon: <Search size={32} />, 
      path: '/app/lawyers',
      color: COLORS.gold 
    },
    { 
      id: 'simulator', 
      title: t('case_simulator'), 
      desc: t('case_simulator'), 
      icon: <Scale size={32} />, 
      path: '/app/simulator',
      color: COLORS.dark 
    },
  ];

  const secondaryActions = [
    { id: 'rights', title: t('know_rights'), icon: <BookOpen size={24} />, path: '/app/rights' },
    { id: 'cases', title: t('my_cases'), icon: <Briefcase size={24} />, path: '/app/cases' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      {/* Header */}
      <header className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        {/* Left Side: Logout icon since it's a home screen or Menu */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
            <Menu size={20} />
          </button>
        </div>

        {/* Right Side: Notification icon, Settings icon, Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-1">
            <button className="p-2 rounded-xl bg-background/50 text-muted hover:text-text transition-colors relative border border-border">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-warning rounded-full border-2 border-surface"></span>
            </button>
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

      <main className="flex-1 p-6 space-y-8 max-w-4xl mx-auto w-full">
        {/* Welcome Section */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-text">{t('welcome')}{userName ? `، ${userName}` : ''}</h2>
          <p className="text-sm text-muted">{t('how_can_help')}</p>
        </section>

        {/* Main Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mainActions.map(action => (
            <button 
              key={action.id}
              onClick={() => navigate(action.path)}
              className="bg-surface p-6 rounded-3xl shadow-sm border border-border hover:shadow-xl hover:border-primary transition-all duration-300 text-right flex flex-col items-start gap-4 group"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg bg-primary/10 text-primary border border-primary/20">
                {action.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1 text-text tracking-tight">{action.title}</h3>
                <p className="text-xs text-muted font-medium opacity-80">{action.desc}</p>
              </div>
            </button>
          ))}
        </section>

        {/* Secondary Actions Grid */}
        <section>
          <h3 className="text-lg font-bold mb-4 text-text tracking-tight uppercase">{t('extra_services')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {secondaryActions.map(action => (
              <button 
                key={action.id}
                onClick={() => navigate(action.path)}
                className="bg-surface p-4 rounded-2xl shadow-sm border border-border flex flex-col items-center gap-3 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary/10 transition-colors">
                  {action.icon}
                </div>
                <span className="text-xs font-bold text-center text-text opacity-90 group-hover:opacity-100">{action.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Lawyer Verification Section */}
        {userRole === 'lawyer' && (
          <section className="bg-surface p-6 rounded-3xl shadow-sm border border-border">
            <LawyerVerification />
          </section>
        )}

        {/* Emergency Section */}
        <section className="bg-emergency/5 p-6 rounded-3xl border border-emergency/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse bg-emergency/10 text-emergency shadow-[0_0_15px_rgba(231,111,111,0.2)]">
              <Shield size={28} />
            </div>
            <div>
              <h3 className="font-bold text-emergency tracking-tight uppercase text-sm">{t('emergency_title')}</h3>
              <p className="text-xs text-muted font-medium opacity-80">{t('emergency_desc')}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/app/lawyers')}
            className="px-6 py-3 rounded-xl text-surface font-bold text-xs bg-emergency hover:bg-emergency/80 transition-all shadow-lg active:scale-95" 
          >
            {t('emergency_call')}
          </button>
        </section>
      </main>
    </div>
  );
}
