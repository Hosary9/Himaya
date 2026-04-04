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

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SettingsItem({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <span className="font-medium text-gray-800">{label}</span>
      <ChevronLeft size={20} className="text-gray-400" />
    </button>
  );
}

export default function ClientHomeScreen() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    { id: 'contracts', title: t('contracts'), icon: <FileText size={24} />, path: '/app/contracts' },
    { id: 'cases', title: t('my_cases'), icon: <Briefcase size={24} />, path: '/app/cases' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm border-b" style={{ borderColor: COLORS.border }}>
        {/* Left Side: Menu icon only */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-gray-50" style={{ color: COLORS.muted }}>
            <Menu size={24} />
          </button>
        </div>

        {/* Right Side: Notification icon, Settings icon, Logo */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-gray-50 relative" style={{ color: COLORS.muted }}>
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-warning rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full bg-gray-50" 
            style={{ color: COLORS.muted }}
          >
            <Settings size={24} />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: COLORS.primary }}>محامينا</h1>
            <AnimatedLogo size={40} />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white shadow-2xl p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Settings</h2>
              <button onClick={() => setIsSettingsOpen(false)}><X size={24} /></button>
            </div>
            
            <div className="space-y-8">
              <SettingsSection title="Account Settings">
                <SettingsItem label="Edit profile" />
                <SettingsItem label="Change password" />
                <SettingsItem label="Update phone" />
              </SettingsSection>
              
              <SettingsSection title="App Settings">
                <SettingsItem label="Language switch (Arabic / English)" />
                <SettingsItem label="Dark mode toggle" />
              </SettingsSection>

              <SettingsSection title="Notifications">
                <SettingsItem label="Enable/Disable notifications" />
                <SettingsItem label="Case updates" />
                <SettingsItem label="Lawyer messages" />
              </SettingsSection>

              <SettingsSection title="Support">
                <SettingsItem label="Help center" />
                <SettingsItem label="Contact support" />
                <SettingsItem label="Report issue" />
              </SettingsSection>

              <SettingsSection title="Security">
                <SettingsItem label="Logout" />
                <SettingsItem label="Delete account" />
              </SettingsSection>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-6 space-y-8 max-w-4xl mx-auto w-full">
        {/* Welcome Section */}
        <section>
          <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>{t('welcome')}{userName ? `، ${userName}` : ''}</h2>
          <p className="text-sm" style={{ color: COLORS.muted }}>{t('how_can_help')}</p>
        </section>

        {/* Main Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mainActions.map(action => (
            <button 
              key={action.id}
              onClick={() => navigate(action.path)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-primary transition-all text-right flex flex-col items-start gap-4 group"
              style={{ borderColor: COLORS.border }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${action.color}10`, color: action.color }}>
                {action.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: COLORS.text }}>{action.title}</h3>
                <p className="text-sm" style={{ color: COLORS.muted }}>{action.desc}</p>
              </div>
            </button>
          ))}
        </section>

        {/* Secondary Actions Grid */}
        <section>
          <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text }}>{t('extra_services')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {secondaryActions.map(action => (
              <button 
                key={action.id}
                onClick={() => navigate(action.path)}
                className="bg-white p-4 rounded-2xl shadow-sm border flex flex-col items-center gap-3 hover:bg-gray-50 transition-colors"
                style={{ borderColor: COLORS.border }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}05`, color: COLORS.primary }}>
                  {action.icon}
                </div>
                <span className="text-xs font-bold text-center" style={{ color: COLORS.text }}>{action.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Lawyer Verification Section */}
        {userRole === 'lawyer' && (
          <section className="bg-white p-6 rounded-3xl shadow-sm border" style={{ borderColor: COLORS.border }}>
            <LawyerVerification />
          </section>
        )}

        {/* Emergency Section */}
        <section className="bg-white p-6 rounded-3xl border-2 border-dashed flex items-center justify-between" style={{ borderColor: COLORS.emergency }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: `${COLORS.emergency}10`, color: COLORS.emergency }}>
              <Shield size={28} />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: COLORS.emergency }}>{t('emergency_title')}</h3>
              <p className="text-xs" style={{ color: COLORS.muted }}>{t('emergency_desc')}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/app/lawyers')}
            className="px-6 py-2 rounded-xl text-white font-bold text-sm" 
            style={{ backgroundColor: COLORS.emergency }}
          >
            {t('emergency_call')}
          </button>
        </section>
      </main>
    </div>
  );
}
