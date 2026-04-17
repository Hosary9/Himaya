/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./firebase";
import { AnimatePresence } from "motion/react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import LawyerSearch from "./components/LawyerSearch";
import AIAssistant from "./components/AIAssistant";
import OutcomeSimulator from "./components/OutcomeSimulator";
import KnowYourRights from "./components/KnowYourRights";
import MyCases from "./components/MyCases";
import SettingsScreen from "./screens/SettingsScreen";
import { LanguageProvider } from "./lib/i18n";
import AdminPortal from "./components/AdminPortal";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ClientHomeScreen from "./screens/ClientHomeScreen";
import GuestHomeScreen from "./screens/GuestHomeScreen";
import LawyerHomeScreen from "./screens/LawyerHomeScreen";
import LawyerProfileScreen from "./screens/LawyerProfileScreen";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";

// Add AuthContext
export const AuthContext = React.createContext<{ 
  user: User | null; 
  role: string | null;
  loading: boolean;
  isGuest: boolean;
  setGuest: (val: boolean) => void;
}>({ 
  user: null, 
  role: null,
  loading: true, 
  isGuest: false, 
  setGuest: () => {} 
});

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('isGuest') === 'true');

  const setGuest = (val: boolean) => {
    setIsGuest(val);
    if (val) {
      localStorage.setItem('isGuest', 'true');
      setLoading(false);
    } else {
      localStorage.removeItem('isGuest');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setGuest(false); // Clear guest mode if user logs in
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const d = await getDoc(doc(db, 'users', currentUser.uid));
          if (d.exists()) {
            setRole(d.data().role);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || !splashFinished) {
    return <SplashScreen onComplete={() => setSplashFinished(true)} />;
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, isGuest, setGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

// Add ProtectedRoute component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isGuest } = React.useContext(AuthContext);
  if (loading) return <SplashScreen />;
  if (!user && !isGuest) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function HomeSwitcher() {
  const { isGuest, role } = React.useContext(AuthContext);

  if (isGuest) return <GuestHomeScreen />;
  if (role === 'lawyer') return <LawyerHomeScreen />;
  return <ClientHomeScreen />;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore - React Router Routes component accepts key but TS complains */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/guest-home" element={<GuestHomeScreen />} />
        <Route path="/role-selection" element={<RoleSelectionScreen />} />
        <Route path="/developer-admin" element={<AdminPortal />} />
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />

        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<HomeSwitcher />} />
          <Route path="lawyers" element={<LawyerSearch />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="simulator" element={<OutcomeSimulator />} />
          <Route path="rights" element={<KnowYourRights />} />
          <Route path="cases" element={<MyCases />} />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="lawyer-profile" element={<LawyerProfileScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthWrapper>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthWrapper>
    </LanguageProvider>
  );
}
