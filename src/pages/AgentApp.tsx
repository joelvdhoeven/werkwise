import React, { useState } from 'react';
import { useAgentAuth } from '../contexts/AgentAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AgentLogin from './AgentLogin';
import AgentDashboard from './AgentDashboard';
import AgentLeads from './AgentLeads';
import AgentLeadDetail from './AgentLeadDetail';
import AgentSalesUsers from './AgentSalesUsers';
import AgentRanking from './AgentRanking';
import AgentFinance from './AgentFinance';
import {
  LayoutDashboard,
  Users,
  UserCog,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Trophy,
  Wallet
} from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';

const AgentApp: React.FC = () => {
  const { agent, logout, isAdmin } = useAgentAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!agent) {
    return <AgentLogin />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'ranking', label: 'Ranglijst', icon: Trophy },
    { id: 'finance', label: 'Financieel', icon: Wallet },
    ...(isAdmin() ? [{ id: 'sales-users', label: 'Medewerkers', icon: UserCog }] : [])
  ];

  const handleLeadSelect = (leadId: string) => {
    setSelectedLeadId(leadId);
    setActiveSection('lead-detail');
  };

  const handleBackToLeads = () => {
    setSelectedLeadId(null);
    setActiveSection('leads');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AgentDashboard onLeadClick={handleLeadSelect} />;
      case 'leads':
        return <AgentLeads onLeadSelect={handleLeadSelect} />;
      case 'lead-detail':
        return selectedLeadId ? (
          <AgentLeadDetail leadId={selectedLeadId} onBack={handleBackToLeads} />
        ) : (
          <AgentLeads onLeadSelect={handleLeadSelect} />
        );
      case 'ranking':
        return <AgentRanking />;
      case 'finance':
        return <AgentFinance />;
      case 'sales-users':
        return isAdmin() ? <AgentSalesUsers /> : <AgentDashboard onLeadClick={handleLeadSelect} />;
      default:
        return <AgentDashboard onLeadClick={handleLeadSelect} />;
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:transform-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    Sales Portal
                  </h1>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>WerkWise</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`lg:hidden p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSelectedLeadId(null);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeSection === item.id || (activeSection === 'lead-detail' && item.id === 'leads')
                    ? isDark
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-red-50 text-red-700'
                    : isDark
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
                {(activeSection === item.id || (activeSection === 'lead-detail' && item.id === 'leads')) && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {agent.naam.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {agent.naam}
                  </p>
                  <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {agent.role === 'sales_admin' ? 'Administrator' : 'Sales'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={logout}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className={`lg:hidden flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-red-600">Sales Portal</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentApp;
