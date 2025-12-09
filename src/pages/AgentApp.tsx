import React, { useState } from 'react';
import { useAgentAuth } from '../contexts/AgentAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
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
  Wallet,
  Settings,
  Key,
  User,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  sales: { label: 'Sales Agent', color: 'green' },
  manager: { label: 'Manager', color: 'blue' },
  admin: { label: 'Admin', color: 'orange' },
  superuser: { label: 'Superuser', color: 'red' },
  sales_admin: { label: 'Administrator', color: 'purple' },
};

const AgentApp: React.FC = () => {
  const { agent, logout, isAdmin, refreshAgent } = useAgentAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile popup state
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profileTab, setProfileTab] = useState<'profile' | 'password'>('profile');
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!agent) {
    return <AgentLogin />;
  }

  const getRoleInfo = () => {
    return ROLE_LABELS[agent.role] || { label: 'Onbekend', color: 'gray' };
  };

  const handleOpenProfile = () => {
    setNewName(agent.naam);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage(null);
    setProfileTab('profile');
    setShowProfilePopup(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setMessage({ type: 'error', text: 'Naam mag niet leeg zijn' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('sales_agents')
        .update({ naam: newName.trim() })
        .eq('id', agent.id);

      if (error) throw error;

      // Refresh agent data
      if (refreshAgent) {
        await refreshAgent();
      }

      setMessage({ type: 'success', text: 'Naam succesvol bijgewerkt!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Kon naam niet bijwerken' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vul alle velden in' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Wachtwoord moet minimaal 6 tekens zijn' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Wachtwoord succesvol gewijzigd!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Kon wachtwoord niet wijzigen' });
    } finally {
      setSaving(false);
    }
  };

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
              <button
                onClick={handleOpenProfile}
                className={`w-full flex items-center gap-3 mb-3 p-2 -m-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {agent.naam.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {agent.naam}
                  </p>
                  <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                    getRoleInfo().color === 'green' ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700') :
                    getRoleInfo().color === 'blue' ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700') :
                    getRoleInfo().color === 'orange' ? (isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700') :
                    getRoleInfo().color === 'red' ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700') :
                    getRoleInfo().color === 'purple' ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700') :
                    (isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700')
                  }`}>
                    {getRoleInfo().label}
                  </span>
                </div>
                <Settings className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
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

      {/* Profile Popup Modal */}
      {showProfilePopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-xl ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Profielinstellingen
              </h2>
              <button
                onClick={() => setShowProfilePopup(false)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className={`flex border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <button
                onClick={() => { setProfileTab('profile'); setMessage(null); }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  profileTab === 'profile'
                    ? isDark
                      ? 'text-red-400 border-b-2 border-red-400'
                      : 'text-red-600 border-b-2 border-red-600'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="h-4 w-4" />
                Profiel
              </button>
              <button
                onClick={() => { setProfileTab('password'); setMessage(null); }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  profileTab === 'password'
                    ? isDark
                      ? 'text-red-400 border-b-2 border-red-400'
                      : 'text-red-600 border-b-2 border-red-600'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Key className="h-4 w-4" />
                Wachtwoord
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Message */}
              {message && (
                <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                  message.type === 'success'
                    ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                    : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              )}

              {profileTab === 'profile' ? (
                <div className="space-y-4">
                  {/* Current Info */}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {agent.naam.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {agent.naam}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {agent.email}
                        </p>
                        <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full mt-1 ${
                          getRoleInfo().color === 'green' ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700') :
                          getRoleInfo().color === 'blue' ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700') :
                          getRoleInfo().color === 'orange' ? (isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700') :
                          getRoleInfo().color === 'red' ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700') :
                          getRoleInfo().color === 'purple' ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700') :
                          (isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700')
                        }`}>
                          {getRoleInfo().label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Naam wijzigen
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                      } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                      placeholder="Voer je naam in"
                    />
                  </div>

                  <button
                    onClick={handleSaveName}
                    disabled={saving || newName === agent.naam}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors ${
                      saving || newName === agent.naam
                        ? isDark
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                    }`}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Opslaan...' : 'Naam opslaan'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nieuw wachtwoord
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                      } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                      placeholder="Minimaal 6 tekens"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Bevestig wachtwoord
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                      } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                      placeholder="Herhaal wachtwoord"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !newPassword || !confirmPassword}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors ${
                      saving || !newPassword || !confirmPassword
                        ? isDark
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                    }`}
                  >
                    <Key className="h-4 w-4" />
                    {saving ? 'Wijzigen...' : 'Wachtwoord wijzigen'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentApp;
