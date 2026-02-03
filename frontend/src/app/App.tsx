import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Toaster } from '@/app/components/ui/sonner';
import { LoginPage } from '@/app/pages/login';
import { ProjectsPage } from '@/app/pages/projects';
import { ClientsPage } from '@/app/pages/clients';
import { BoardPage } from '@/app/pages/board';
import { TimesheetPage } from '@/app/pages/timesheet';
import { ReportsPage } from '@/app/pages/reports';
import { SettingsPage } from '@/app/pages/settings';
import { AIPage } from '@/app/pages/ai';
import { AppShell } from '@/app/components/app-shell';

import { RegisterPage } from '@/app/pages/register';

export default function App() {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  const [currentPage, setCurrentPage] = useState<string>('projects');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Check auth on mount
  const checkAuth = useAppStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
    document.documentElement.classList.add('dark');
  }, [checkAuth]);

  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )}
        <Toaster />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'projects':
        return <ProjectsPage onNavigate={setCurrentPage} />;
      case 'clients':
        return <ClientsPage />;
      case 'board':
        return <BoardPage onNavigate={setCurrentPage} />;
      case 'timesheet':
        return <TimesheetPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'ai':
        return <AIPage />;
      default:
        return <ProjectsPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppShell>
      <Toaster />
    </>
  );
}