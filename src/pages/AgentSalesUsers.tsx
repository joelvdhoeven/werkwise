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
  Trash2
} from 'lucide-react';

const AgentSalesUsers: React.FC = () => {
  const { isAdmin } = useAgentAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCommission, setEditCommission] = useState<number>(0);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAgent, setNewAgent] = useState({
    naam: '',
    email: '',
    password: '',
    role: 'sales' as 'sales' | 'sales_admin',
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

  const handleUpdateCommission = async (agentId: string) => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('sales_agents')
        .update({ commission_percentage: editCommission })
        .eq('id', agentId);

      if (error) throw error;

      setEditingId(null);
      fetchAgents();
    } catch (err) {
      console.error('Error updating commission:', err);
    } finally {
      setSaving(false);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
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
            Beheer je sales team en commissie percentages
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
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
            className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
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
                      ? isDark ? 'bg-violet-500/20' : 'bg-violet-100'
                      : isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <User className={`h-6 w-6 ${
                      agent.is_active
                        ? isDark ? 'text-violet-400' : 'text-violet-600'
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {agent.naam}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      agent.role === 'sales_admin'
                        ? isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700'
                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {agent.role === 'sales_admin' ? 'Admin' : 'Sales'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(agent.id, agent.is_active)}
                  className={`p-2 rounded-lg transition-colors ${
                    agent.is_active
                      ? isDark ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50'
                      : isDark ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={agent.is_active ? 'Actief - klik om te deactiveren' : 'Inactief - klik om te activeren'}
                >
                  {agent.is_active ? <UserCheck className="h-5 w-5" /> : <UserX className="h-5 w-5" />}
                </button>
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
                    {editingId === agent.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editCommission}
                          onChange={(e) => setEditCommission(Number(e.target.value))}
                          min="0"
                          max="100"
                          className={`w-20 px-2 py-1 rounded-lg border text-center text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-200 text-gray-900'
                          }`}
                        />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>%</span>
                        <button
                          onClick={() => handleUpdateCommission(agent.id)}
                          disabled={saving}
                          className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className={`p-1 rounded ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                          {agent.commission_percentage}%
                        </span>
                        <button
                          onClick={() => {
                            setEditingId(agent.id);
                            setEditCommission(agent.commission_percentage);
                          }}
                          className={`p-1 rounded ${isDark ? 'text-gray-500 hover:text-violet-400 hover:bg-gray-700' : 'text-gray-400 hover:text-violet-600 hover:bg-gray-200'}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
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
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
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
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
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
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
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
                  <select
                    value={newAgent.role}
                    onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value as 'sales' | 'sales_admin' })}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="sales">Sales</option>
                    <option value="sales_admin">Admin</option>
                  </select>
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
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
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
                  className="flex-1 py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50"
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
    </div>
  );
};

export default AgentSalesUsers;
