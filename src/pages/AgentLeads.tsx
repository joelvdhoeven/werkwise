import React, { useEffect, useState } from 'react';
import { useAgentAuth } from '../contexts/AgentAuthContext';
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
  Loader2
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLead, setNewLead] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: '',
    website: ''
  });

  useEffect(() => {
    fetchLeads();
  }, [agent, statusFilter]);

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

  const filteredLeads = leads.filter(lead =>
    lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusOptions = [
    { value: 'all', label: 'Alle' },
    { value: 'new', label: 'Nieuw' },
    { value: 'contacted', label: 'Gecontacteerd' },
    { value: 'in_progress', label: 'In Behandeling' },
    { value: 'converted', label: 'Geconverteerd' },
    { value: 'paid', label: 'Betaald' },
    { value: 'lost', label: 'Verloren' }
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
    const sourceConfig: Record<string, { label: string; className: string }> = {
      onboarding: { label: 'Website', className: isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700' },
      manual: { label: 'Handmatig', className: isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700' },
      referral: { label: 'Doorverwijzing', className: isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700' }
    };
    const config = sourceConfig[source] || sourceConfig.manual;
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

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
            Leads
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Beheer je potentiële klanten
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
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
              className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              {statusOptions.map(option => (
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
            <p className="text-sm">Maak een nieuwe lead aan om te beginnen</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => onLeadSelect(lead.id)}
                className={`w-full flex items-center gap-4 p-5 transition-all text-left ${
                  isDark
                    ? 'hover:bg-gray-800/50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-violet-500/20' : 'bg-violet-100'
                }`}>
                  <Building2 className={isDark ? 'h-7 w-7 text-violet-400' : 'h-7 w-7 text-violet-600'} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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

                <div className="text-right shrink-0">
                  {lead.assigned_agent && (
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {lead.assigned_agent.naam}
                    </p>
                  )}
                  <p className={`text-xs flex items-center gap-1 justify-end ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Calendar className="h-3 w-3" />
                    {new Date(lead.created_at).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </button>
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
                    value={newLead.contact_email}
                    onChange={(e) => setNewLead({ ...newLead, contact_email: e.target.value })}
                    placeholder="info@bedrijf.nl"
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
                  Telefoonnummer
                </label>
                <div className="relative">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="tel"
                    value={newLead.contact_phone}
                    onChange={(e) => setNewLead({ ...newLead, contact_phone: e.target.value })}
                    placeholder="+31 6 12345678"
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
                  Website
                </label>
                <div className="relative">
                  <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={newLead.website}
                    onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                    placeholder="www.bedrijf.nl"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
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

export default AgentLeads;
