/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import LawyerSearch from "./components/LawyerSearch";
import AIAssistant from "./components/AIAssistant";
import OutcomeSimulator from "./components/OutcomeSimulator";
import KnowYourRights from "./components/KnowYourRights";
import ContractDrafting from "./components/ContractDrafting";
import OnboardingFlow from "./components/OnboardingFlow";
import AdminPortal from "./components/AdminPortal";
import { LanguageProvider } from "./lib/i18n";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingFlow />} />
          <Route path="/developer-admin" element={<AdminPortal />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="lawyers" element={<LawyerSearch />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="simulator" element={<OutcomeSimulator />} />
            <Route path="rights" element={<KnowYourRights />} />
            <Route path="contracts" element={<ContractDrafting />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
