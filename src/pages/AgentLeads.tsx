import React, { useEffect, useState } from 'react';
import { useAgentAuth, SalesAgent } from '../contexts/AgentAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  Calendar,
  Filter,
  X,
  Globe,
  Loader2,
  UserPlus,
  Sparkles,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface Lead {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  status: string;
  source: string;
  assigned_to: string | null;
  assigned_agent?: { naam: string } | null;
  created_at: string;
  notes_count?: number;
}

interface AgentLeadsProps {
  onLeadSelect: (leadId: string) => void;
}

const AgentLeads: React.FC<AgentLeadsProps> = ({ onLeadSelect }) => {
  const { agent, isAdmin } = useAgentAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allAgents, setAllAgents] = useState<SalesAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningLeadId, setAssigningLeadId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newLead, setNewLead] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: '',
    website: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLeads();
    if (isAdmin()) {
      fetchAgents();
    }
  }, [agent, statusFilter, sourceFilter]);

  const fetchAgents = async () => {
    try {
      const { data } = await supabase
        .from('sales_agents')
        .select('*')
        .eq('is_active', true)
        .order('naam');
      setAllAgents(data || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const fetchLeads = async () => {
    if (!agent) return;

    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_agent:sales_agents!leads_assigned_to_fkey(naam)
        `)
        .order('created_at', { ascending: false });

      // If not admin, only show assigned leads
      if (!isAdmin()) {
        query = query.eq('assigned_to', agent.id);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply source filter
      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        return;
      }

      setLeads(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent || !newLead.company_name || !newLead.contact_email) return;

    setCreating(true);

    try {
      const { error } = await supabase.from('leads').insert({
        company_name: newLead.company_name,
        contact_email: newLead.contact_email,
        contact_phone: newLead.contact_phone || null,
        website: newLead.website || null,
        status: 'new',
        source: 'manual',
        assigned_to: agent.id,
        created_by: agent.id
      });

      if (error) throw error;

      setShowCreateModal(false);
      setNewLead({ company_name: '', contact_email: '', contact_phone: '', website: '' });
      fetchLeads();
    } catch (err) {
      console.error('Error creating lead:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleAssignLead = async (leadId: string, agentId: string | null) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ assigned_to: agentId })
        .eq('id', leadId);

      if (error) throw error;

      setAssigningLeadId(null);
      fetchLeads();
    } catch (err) {
      console.error('Error assigning lead:', err);
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;

      setDeleteConfirm(null);
      fetchLeads();
    } catch (err) {
      console.error('Error deleting lead:', err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusOptions = [
    { value: 'all', label: 'Alle Status' },
    { value: 'new', label: 'Nieuw' },
    { value: 'contacted', label: 'Gecontacteerd' },
    { value: 'in_progress', label: 'In Behandeling' },
    { value: 'converted', label: 'Geconverteerd' },
    { value: 'paid', label: 'Betaald' },
    { value: 'lost', label: 'Verloren' }
  ];

  const sourceOptions = [
    { value: 'all', label: 'Alle Bronnen' },
    { value: 'onboarding', label: 'Website' },
    { value: 'manual', label: 'Handmatig' },
    { value: 'referral', label: 'Doorverwijzing' }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      new: { label: 'Nieuw', className: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700' },
      contacted: { label: 'Gecontacteerd', className: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700' },
      in_progress: { label: 'In Behandeling', className: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700' },
      converted: { label: 'Geconverteerd', className: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' },
      paid: { label: 'Betaald', className: isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700' },
      lost: { label: 'Verloren', className: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700' }
    };
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
      onboarding: { label: 'Website', className: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700', icon: <Sparkles className="h-3 w-3" /> },
      manual: { label: 'Handmatig', className: isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700' },
      referral: { label: 'Doorverwijzing', className: isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700' }
    };
    const config = sourceConfig[source] || sourceConfig.manual;
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Stats
  const unassignedCount = leads.filter(l => !l.assigned_to).length;
  const onboardingCount = leads.filter(l => l.source === 'onboarding').length;

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
            Leads
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {leads.length} leads • {onboardingCount} via website • {unassignedCount} niet toegewezen
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
        >
          <Plus className="h-5 w-5" />
          Nieuwe Lead
        </button>
      </div>

      {/* Search & Filters */}
      <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek op bedrijfsnaam of e-mail..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 text-sm ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className={`px-3 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 text-sm ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              {sourceOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        {filteredLeads.length === 0 ? (
          <div className={`text-center py-16 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Geen leads gevonden</p>
            <p className="text-sm">Maak een nieuwe lead aan of wacht op website registraties</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className={`flex items-center gap-4 p-5 transition-all ${
                  isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => onLeadSelect(lead.id)}
                  className="flex items-center gap-4 flex-1 text-left"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                    lead.source === 'onboarding'
                      ? isDark ? 'bg-red-500/20' : 'bg-red-100'
                      : isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Building2 className={`h-7 w-7 ${
                      lead.source === 'onboarding'
                        ? isDark ? 'text-red-400' : 'text-red-600'
                        : isDark ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {lead.company_name}
                      </p>
                      {getStatusBadge(lead.status)}
                      {getSourceBadge(lead.source)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Mail className="h-4 w-4" />
                        {lead.contact_email}
                      </span>
                      {lead.contact_phone && (
                        <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Phone className="h-4 w-4" />
                          {lead.contact_phone}
                        </span>
                      )}
                      {lead.website && (
                        <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Globe className="h-4 w-4" />
                          {lead.website}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {isAdmin() && (
                      <div className="relative">
                        {assigningLeadId === lead.id ? (
                          <select
                            value={lead.assigned_to || ''}
                            onChange={(e) => handleAssignLead(lead.id, e.target.value || null)}
                            onBlur={() => setAssigningLeadId(null)}
                            autoFocus
                            className={`text-sm px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                              isDark
                                ? 'bg-gray-800 border-gray-700 text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-900'
                            }`}
                          >
                            <option value="">Niet toegewezen</option>
                            {allAgents.map(a => (
                              <option key={a.id} value={a.id}>{a.naam}</option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssigningLeadId(lead.id);
                            }}
                            className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                              lead.assigned_agent
                                ? isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            {lead.assigned_agent?.naam || 'Toewijzen'}
                          </button>
                        )}
                      </div>
                    )}
                    {isAdmin() && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(lead);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/20'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-100'
                        }`}
                        title="Verwijderen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {!isAdmin() && lead.assigned_agent && (
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {lead.assigned_agent.naam}
                    </p>
                  )}
                  <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Calendar className="h-3 w-3" />
                    {new Date(lead.created_at).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Nieuwe Lead
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bedrijfsnaam *
                </label>
                <div className="relative">
                  <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={newLead.company_name}
                    onChange={(e) => setNewLead({ ...newLead, company_name: e.target.value })}
                    placeholder="Bijv. Bouwbedrijf De Vries"
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
                    value={newLead.contact_email}
                    onChange={(e) => setNewLead({ ...newLead, contact_email: e.target.value })}
                    placeholder="info@bedrijf.nl"
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
                  Telefoonnummer
                </label>
                <div className="relative">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="tel"
                    value={newLead.contact_phone}
                    onChange={(e) => setNewLead({ ...newLead, contact_phone: e.target.value })}
                    placeholder="+31 6 12345678"
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
                  Website
                </label>
                <div className="relative">
                  <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={newLead.website}
                    onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                    placeholder="www.bedrijf.nl"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <AlertTriangle className={`h-6 w-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Lead verwijderen
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Deze actie kan niet ongedaan worden gemaakt
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {deleteConfirm.company_name}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {deleteConfirm.contact_email}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Annuleren
              </button>
              <button
                onClick={handleDeleteLead}
                disabled={deleting}
                className="flex-1 py-3 px-4 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Bezig...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" />
                    Verwijderen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentLeads;
