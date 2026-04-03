import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Search, Bot, BookOpen, AlertTriangle, Globe, FileSignature, Briefcase } from "lucide-react";
import { cn } from "../lib/utils";
import { ReactNode, useEffect, useState } from "react";
import { useLanguage } from "../lib/i18n";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import AnimatedLogo from "./AnimatedLogo";

export default function Layout() {
  const { t, toggleLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login', { replace: true });
      } else {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <div className="text-sm opacity-80">{t('app.subtitle')}</div>
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
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
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

      {/* Persistent Emergency Button */}
      <button className="fixed bottom-20 md:bottom-8 left-4 md:left-8 bg-emergency text-surface w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-30 hover:scale-105 transition-transform animate-pulse">
        <AlertTriangle size={28} />
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
