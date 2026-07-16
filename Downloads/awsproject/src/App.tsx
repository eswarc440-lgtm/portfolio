/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Disasters } from './pages/Disasters';
import { Shelters } from './pages/Shelters';
import { Resources } from './pages/Resources';
import { Requests } from './pages/Requests';
import { Ngos } from './pages/Ngos';
import { Volunteers } from './pages/Volunteers';
import { Deliveries } from './pages/Deliveries';
import { Settings } from './pages/Settings';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VoiceAssistant } from './components/VoiceAssistant';

const AppContent: React.FC = () => {
  const { path, currentUser } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // 1. Render Public Landing Page
  if (path === 'landing' || path === '/') {
    return <LandingPage />;
  }

  // 2. Render Auth Panel / Login / Register / Forgot Password
  const publicPaths = ['landing', '/', '/login', '/register', '/forgot-password', 'auth'];
  if (publicPaths.includes(path)) {
    return <AuthPage />;
  }

  // 3. Fallback and Route Protection: Redirect unauthenticated users automatically to /login
  if (!currentUser) {
    return <AuthPage />;
  }

  // 4. Render Authorized Operational Console Layout
  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen font-sans overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Console view stage */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Control Header */}
        <Header />

        {/* Scrollable Work area */}
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto">
          {(path === 'dashboard' || 
            path === '/admin/dashboard' || 
            path === '/authority/dashboard' || 
            path === '/ngo/dashboard' || 
            path === '/shelter/dashboard' || 
            path === '/volunteer/dashboard'
          ) && <Dashboard />}
          {path === 'disasters' && <Disasters />}
          {path === 'shelters' && <Shelters />}
          {path === 'resources' && <Resources />}
          {path === 'requests' && <Requests />}
          {path === 'ngos' && <Ngos />}
          {path === 'volunteers' && <Volunteers />}
          {path === 'deliveries' && <Deliveries />}
          {path === 'settings' && <Settings />}
        </main>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
