import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Search, Bot, BookOpen, AlertTriangle, Globe, FileSignature, Briefcase, LogIn, X, AlertCircle, Settings } from "lucide-react";
import { cn } from "../lib/utils";
import { ReactNode, useEffect, useState, useContext } from "react";
import { useLanguage } from "../lib/i18n";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import AnimatedLogo from "./AnimatedLogo";
import { AuthContext } from "../App";
import COLORS from "../theme/colors";
import SmartAlertsCenter from "./SmartAlertsCenter";

export default function Layout() {
  const { t, toggleLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const { isGuest, user, setGuest } = useContext(AuthContext);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(3); // Mock count

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser && !isGuest) {
        navigate('/login', { replace: true });
      } else {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, [navigate, isGuest]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    if (isGuest) {
      setGuest(false);
      navigate('/login', { replace: true });
    } else {
      auth.signOut();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-0 md:flex-row">
      {/* Mobile Header */}
      <header className="bg-primary text-surface p-4 flex items-center justify-between sticky top-0 z-10 md:hidden shadow-md">
        <div className="flex items-center gap-2">
          <AnimatedLogo size={32} />
          <h1 className="font-bold text-xl tracking-tight">{t('app.title')}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="flex items-center gap-1 text-sm bg-surface/20 px-2 py-1 rounded-lg hover:bg-surface/30 transition-colors">
            <Globe size={16} />
            <span>{language === 'ar' ? 'EN' : 'AR'}</span>
          </button>
          {isGuest && (
            <button 
              onClick={() => navigate('/login')}
              className="bg-gold text-primary px-3 py-1 rounded-lg text-xs font-bold shadow-sm"
            >
              سجل دخول
            </button>
          )}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-l border-border h-screen sticky top-0 p-4">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <AnimatedLogo size={40} />
            <h1 className="font-bold text-2xl text-primary tracking-tight">{t('app.title')}</h1>
          </div>
          <button onClick={toggleLanguage} className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors bg-gray-50 px-2 py-1 rounded-lg">
            <Globe size={16} />
            <span>{language === 'ar' ? 'EN' : 'AR'}</span>
          </button>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <NavItem to="/app" end icon={<Home size={20} />} label={t('nav.home')} />
          <NavItem to="/app/lawyers" icon={<Search size={20} />} label={t('nav.lawyers')} />
          <NavItem to="/app/ai-assistant" icon={<Bot size={20} />} label={t('nav.assistant')} />
          <NavItem to="/app/simulator" icon={<AlertTriangle size={20} />} label={t('nav.simulator')} />
          <NavItem to="/app/contracts" icon={<FileSignature size={20} />} label={t('nav.contracts')} />
          <NavItem to="/app/rights" icon={<BookOpen size={20} />} label={t('nav.rights')} />
          <NavItem to="/app/cases" icon={<Briefcase size={20} />} label={t('nav.cases')} />
          <NavItem to="/app/settings" icon={<Settings size={20} />} label={t('nav.settings')} />
        </nav>

        <div className="mt-auto pt-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogIn size={20} className={isGuest ? "" : "rotate-180"} />
            <span>{isGuest ? "تسجيل دخول" : "تسجيل خروج"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {isGuest && (
          <div className="mb-6 p-4 bg-gold/10 border border-gold rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-gold shrink-0" size={20} />
              <p className="text-sm font-bold text-primary">أنت تتصفح كضيف. سجل حسابك الآن للوصول لكافة المميزات.</p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              إنشاء حساب 🎉
            </button>
          </div>
        )}
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around items-end p-2 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <MobileNavItem to="/app" end icon={<Home size={24} />} label={t('nav.home')} />
        <MobileNavItem to="/app/lawyers" icon={<Search size={24} />} label={t('nav.lawyers')} />
        
        {/* Persistent AI Assistant Button */}
        <div className="relative -top-4 px-2">
          <NavLink
            to="/app/ai-assistant"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 border-4 border-surface",
                isActive ? "bg-gold text-surface" : "bg-primary text-surface"
              )
            }
          >
            <Bot size={28} />
          </NavLink>
        </div>

        <MobileNavItem to="/app/simulator" icon={<AlertTriangle size={24} />} label={t('nav.simulator')} />
        <MobileNavItem to="/app/cases" icon={<Briefcase size={24} />} label={t('nav.cases')} />
      </nav>

      {/* Smart Alerts Center */}
      <SmartAlertsCenter 
        isOpen={isAlertsOpen} 
        onClose={() => setIsAlertsOpen(false)} 
        onAlertClick={() => setAlertCount(prev => Math.max(0, prev - 1))} 
      />

      {/* Persistent Smart Alerts Button */}
      <button 
        onClick={() => setIsAlertsOpen(true)}
        className={cn(
          "fixed bottom-8 left-8 z-[9999] bg-emergency text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-all animate-pulse"
        )}
      >
        <AlertTriangle size={28} />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
            {alertCount}
          </span>
        )}
      </button>
    </div>
  );
}

function NavItem({ to, icon, label, end }: { to: string; icon: ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted hover:bg-gray-50 hover:text-text"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function MobileNavItem({ to, icon, label, end }: { to: string; icon: ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 p-2 min-w-[56px]",
          isActive ? "text-primary" : "text-muted"
        )
      }
    >
      {icon}
      <span className="text-[10px] font-medium whitespace-nowrap">{label}</span>
    </NavLink>
  );
}
