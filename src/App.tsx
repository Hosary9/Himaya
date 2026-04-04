/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { AnimatePresence } from "motion/react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import LawyerSearch from "./components/LawyerSearch";
import AIAssistant from "./components/AIAssistant";
import OutcomeSimulator from "./components/OutcomeSimulator";
import KnowYourRights from "./components/KnowYourRights";
import ContractDrafting from "./components/ContractDrafting";
import MyCases from "./components/MyCases";
import SettingsScreen from "./screens/SettingsScreen";
import { LanguageProvider } from "./lib/i18n";
import AdminPortal from "./components/AdminPortal";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ClientHomeScreen from "./screens/ClientHomeScreen";
import GuestHomeScreen from "./screens/GuestHomeScreen";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";

import ContractTypeScreen from "./screens/contracts/ContractTypeScreen";
import ContractFormScreen from "./screens/contracts/ContractFormScreen";
import ContractLoadingScreen from "./screens/contracts/ContractLoadingScreen";
import ContractResultScreen from "./screens/contracts/ContractResultScreen";

// Add AuthContext
export const AuthContext = React.createContext<{ 
  user: User | null; 
  loading: boolean;
  isGuest: boolean;
  setGuest: (val: boolean) => void;
}>({ 
  user: null, 
  loading: true, 
  isGuest: false, 
  setGuest: () => {} 
});

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('isGuest') === 'true');

  const setGuest = (val: boolean) => {
    setIsGuest(val);
    if (val) {
      localStorage.setItem('isGuest', 'true');
    } else {
      localStorage.removeItem('isGuest');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setGuest(false); // Clear guest mode if user logs in
      }
      setLoading(false);
    });

    // Initialize dark mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => unsubscribe();
  }, []);

  if (loading || !splashFinished) {
    return <SplashScreen onComplete={() => setSplashFinished(true)} />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, setGuest }}>
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
  const { isGuest } = React.useContext(AuthContext);
  return isGuest ? <GuestHomeScreen /> : <ClientHomeScreen />;
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
        
        {/* Contract Flow Routes */}
        <Route path="/contracts/type" element={<ContractTypeScreen />} />
        <Route path="/contracts/form" element={<ContractFormScreen />} />
        <Route path="/contracts/loading" element={<ContractLoadingScreen />} />
        <Route path="/contracts/result" element={<ContractResultScreen />} />

        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<HomeSwitcher />} />
          <Route path="lawyers" element={<LawyerSearch />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="simulator" element={<OutcomeSimulator />} />
          <Route path="rights" element={<KnowYourRights />} />
          <Route path="contracts" element={<ContractDrafting />} />
          <Route path="cases" element={<MyCases />} />
          <Route path="settings" element={<SettingsScreen />} />
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
