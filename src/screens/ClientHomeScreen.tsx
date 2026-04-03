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
  ChevronRight
} from 'lucide-react';
import COLORS from '../theme/colors';
import { useLanguage } from '../lib/i18n';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import AnimatedLogo from '../components/AnimatedLogo';

export default function ClientHomeScreen() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        if (auth.currentUser.displayName) {
          setUserName(auth.currentUser.displayName);
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists() && userDoc.data().name) {
              setUserName(userDoc.data().name);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
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
        <div className="flex items-center gap-3">
          <AnimatedLogo size={40} />
          <h1 className="text-xl font-bold" style={{ color: COLORS.primary }}>محامينا</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-gray-50 relative" style={{ color: COLORS.muted }}>
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-warning rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 rounded-full bg-gray-50" style={{ color: COLORS.muted }}>
            <Menu size={24} />
          </button>
        </div>
      </header>

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
