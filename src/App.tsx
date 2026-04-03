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

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading || !splashFinished) {
    return <SplashScreen onComplete={() => setSplashFinished(true)} />;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Add AuthContext
export const AuthContext = React.createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });

// Add ProtectedRoute component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
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
          <Route index element={<ClientHomeScreen />} />
          <Route path="lawyers" element={<LawyerSearch />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="simulator" element={<OutcomeSimulator />} />
          <Route path="rights" element={<KnowYourRights />} />
          <Route path="contracts" element={<ContractDrafting />} />
          <Route path="cases" element={<MyCases />} />
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
