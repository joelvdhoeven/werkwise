import React, { useEffect, useState } from 'react';
import { useAgentAuth, SalesAgent } from '../contexts/AgentAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  Plus,
  Search,
  User,
  Mail,
  Percent,
  Calendar,
  Edit2,
  X,
  Save,
  Loader2,
  UserCheck,
  UserX,
  Trash2,
  Shield,
  AlertTriangle
} from 'lucide-react';

type AgentRole = 'sales' | 'manager' | 'admin' | 'superuser';

const ROLE_OPTIONS: { value: AgentRole; label: string; color: string }[] = [
  { value: 'sales', label: 'Sales Agent', color: 'green' },
  { value: 'manager', label: 'Manager', color: 'blue' },
  { value: 'admin', label: 'Admin', color: 'orange' },
  { value: 'superuser', label: 'Superuser', color: 'red' },
];

const AgentSalesUsers: React.FC = () => {
  const { isAdmin, agent: currentAgent } = useAgentAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<SalesAgent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<SalesAgent | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newAgent, setNewAgent] = useState({
    naam: '',
    email: '',
    password: '',
    role: 'sales' as AgentRole,
    commission_percentage: 10
  });
  const [editForm, setEditForm] = useState({
    naam: '',
    role: 'sales' as AgentRole,
    commission_percentage: 10
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchAgents();
    }
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_agents')
        .select('*')
        .order('naam');

      if (error) throw error;
      setAgents(data || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.naam || !newAgent.email || !newAgent.password) return;

    setCreating(true);

    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAgent.email,
        password: newAgent.password,
        options: {
          data: {
            name: newAgent.naam,
            role: newAgent.role
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Gebruiker kon niet worden aangemaakt');

      // Then create the sales agent profile
      const { error: profileError } = await supabase.from('sales_agents').insert({
        auth_user_id: authData.user.id,
        email: newAgent.email,
        naam: newAgent.naam,
        role: newAgent.role,
        commission_percentage: newAgent.commission_percentage,
        is_active: true
      });

      if (profileError) throw profileError;

      setShowCreateModal(false);
      setNewAgent({
        naam: '',
        email: '',
        password: '',
        role: 'sales',
        commission_percentage: 10
      });
      fetchAgents();
    } catch (err: any) {
      console.error('Error creating agent:', err);
      alert(err.message || 'Er is een fout opgetreden');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('sales_agents')
        .update({
          naam: editForm.naam,
          role: editForm.role,
          commission_percentage: editForm.commission_percentage
        })
        .eq('id', editingAgent.id);

      if (error) throw error;

      setEditingAgent(null);
      fetchAgents();
    } catch (err) {
      console.error('Error updating agent:', err);
      alert('Er is een fout opgetreden bij het opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!deletingAgent) return;
    setDeleting(true);

    try {
      // Delete from sales_agents table
      const { error } = await supabase
        .from('sales_agents')
        .delete()
        .eq('id', deletingAgent.id);

      if (error) throw error;

      setDeletingAgent(null);
      fetchAgents();
    } catch (err) {
      console.error('Error deleting agent:', err);
      alert('Er is een fout opgetreden bij het verwijderen');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (agentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sales_agents')
        .update({ is_active: !currentStatus })
        .eq('id', agentId);

      if (error) throw error;
      fetchAgents();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const openEditModal = (agent: SalesAgent) => {
    setEditingAgent(agent);
    setEditForm({
      naam: agent.naam,
      role: agent.role as AgentRole,
      commission_percentage: agent.commission_percentage
    });
  };

  const getRoleColor = (role: string) => {
    const roleOption = ROLE_OPTIONS.find(r => r.value === role);
    switch (roleOption?.color) {
      case 'red':
        return isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
      case 'orange':
        return isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700';
      case 'blue':
        return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'green':
      default:
        return isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
    }
  };

  const getRoleLabel = (role: string) => {
    return ROLE_OPTIONS.find(r => r.value === role)?.label || role;
  };

  const filteredAgents = agents.filter(agent =>
    agent.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin()) {
    return (
      <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <UserX className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Geen toegang</p>
        <p className="text-sm">Je hebt geen rechten om deze pagina te bekijken</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sales Medewerkers
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Beheer je sales team, rollen en commissie percentages
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
        >
          <Plus className="h-5 w-5" />
          Nieuwe Medewerker
        </button>
      </div>

      {/* Search */}
      <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek op naam of e-mail..."
            className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAgents.length === 0 ? (
          <div className={`col-span-full text-center py-16 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Geen medewerkers gevonden</p>
            <p className="text-sm">Voeg een nieuwe medewerker toe om te beginnen</p>
          </div>
        ) : (
          filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className={`rounded-2xl p-5 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    agent.is_active
                      ? isDark ? 'bg-red-500/20' : 'bg-red-100'
                      : isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <User className={`h-6 w-6 ${
                      agent.is_active
                        ? isDark ? 'text-red-400' : 'text-red-600'
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {agent.naam}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(agent.role)}`}>
                      {getRoleLabel(agent.role)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(agent)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                    title="Bewerken"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(agent.id, agent.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      agent.is_active
                        ? isDark ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50'
                        : isDark ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={agent.is_active ? 'Actief - klik om te deactiveren' : 'Inactief - klik om te activeren'}
                  >
                    {agent.is_active ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                  </button>
                  {currentAgent?.role === 'superuser' && agent.id !== currentAgent.id && (
                    <button
                      onClick={() => setDeletingAgent(agent)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Verwijderen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Mail className="h-4 w-4" />
                  {agent.email}
                </div>

                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar className="h-4 w-4" />
                  Lid sinds {new Date(agent.created_at).toLocaleDateString('nl-NL')}
                </div>

                {/* Commission */}
                <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Commissie
                    </span>
                    <span className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      {agent.commission_percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Nieuwe Medewerker
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Naam *
                </label>
                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={newAgent.naam}
                    onChange={(e) => setNewAgent({ ...newAgent, naam: e.target.value })}
                    placeholder="Volledige naam"
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  E-mailadres *
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                    placeholder="email@werkwise.nl"
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Wachtwoord *
                </label>
                <input
                  type="password"
                  value={newAgent.password}
                  onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                  placeholder="Min. 6 karakters"
                  required
                  minLength={6}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rol
                  </label>
                  <div className="relative">
                    <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <select
                      value={newAgent.role}
                      onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value as AgentRole })}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Commissie %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newAgent.commission_percentage}
                      onChange={(e) => setNewAgent({ ...newAgent, commission_percentage: Number(e.target.value) })}
                      min="0"
                      max="100"
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                    <Percent className={`absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Bezig...
                    </span>
                  ) : (
                    'Aanmaken'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Medewerker Bewerken
              </h2>
              <button
                onClick={() => setEditingAgent(null)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Naam
                </label>
                <input
                  type="text"
                  value={editForm.naam}
                  onChange={(e) => setEditForm({ ...editForm, naam: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  E-mailadres
                </label>
                <input
                  type="email"
                  value={editingAgent.email}
                  disabled
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-400'
                      : 'bg-gray-100 border-gray-200 text-gray-500'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  E-mailadres kan niet worden gewijzigd
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rol
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as AgentRole })}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Commissie %
                  </label>
                  <input
                    type="number"
                    value={editForm.commission_percentage}
                    onChange={(e) => setEditForm({ ...editForm, commission_percentage: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Annuleren
                </button>
                <button
                  onClick={handleUpdateAgent}
                  disabled={saving}
                  className="flex-1 py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Opslaan...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save className="h-5 w-5" />
                      Opslaan
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <AlertTriangle className={`h-8 w-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Medewerker Verwijderen
              </h2>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Weet je zeker dat je <strong>{deletingAgent.naam}</strong> wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingAgent(null)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Annuleren
                </button>
                <button
                  onClick={handleDeleteAgent}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verwijderen...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Trash2 className="h-5 w-5" />
                      Verwijderen
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSalesUsers;
