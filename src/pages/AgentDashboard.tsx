import React, { useEffect, useState } from 'react';
import { useAgentAuth } from '../contexts/AgentAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  ArrowUpRight,
  Building2,
  Calendar
} from 'lucide-react';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  inProgressLeads: number;
  convertedLeads: number;
  myLeads: number;
  recentLeads: any[];
}

interface AgentDashboardProps {
  onLeadClick: (leadId: string) => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ onLeadClick }) => {
  const { agent, isAdmin } = useAgentAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    inProgressLeads: 0,
    convertedLeads: 0,
    myLeads: 0,
    recentLeads: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [agent]);

  const fetchStats = async () => {
    if (!agent) return;

    try {
      // Fetch all leads
      let query = supabase.from('leads').select('*');

      // If not admin, only show assigned leads
      if (!isAdmin()) {
        query = query.eq('assigned_to', agent.id);
      }

      const { data: leads, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        return;
      }

      const allLeads = leads || [];

      // Calculate stats
      const newLeads = allLeads.filter(l => l.status === 'new').length;
      const inProgressLeads = allLeads.filter(l => l.status === 'in_progress' || l.status === 'contacted').length;
      const convertedLeads = allLeads.filter(l => l.status === 'converted' || l.status === 'paid').length;
      const myLeads = allLeads.filter(l => l.assigned_to === agent.id).length;

      setStats({
        totalLeads: allLeads.length,
        newLeads,
        inProgressLeads,
        convertedLeads,
        myLeads,
        recentLeads: allLeads.slice(0, 5)
      });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Totaal Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      label: 'Nieuwe Leads',
      value: stats.newLeads,
      icon: Clock,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'In Behandeling',
      value: stats.inProgressLeads,
      icon: TrendingUp,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      label: 'Geconverteerd',
      value: stats.convertedLeads,
      icon: CheckCircle,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-500'
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Welkom terug, {agent?.naam}!
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          {isAdmin() ? 'Hier is een overzicht van alle sales activiteiten.' : `Je hebt ${stats.myLeads} leads toegewezen.`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <ArrowUpRight className={isDark ? 'text-gray-600' : 'text-gray-400'} />
            </div>
            <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
            </p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Commission Card (for sales agents) */}
      {!isAdmin() && agent && (
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-800' : 'bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200'}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className={isDark ? 'text-violet-300' : 'text-violet-700'}>Je Commissie Percentage</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-violet-900'}`}>
                {agent.commission_percentage}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Leads */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recente Leads
          </h2>
          <button
            onClick={() => onLeadClick('')}
            className={`text-sm font-medium ${isDark ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'}`}
          >
            Bekijk alle →
          </button>
        </div>

        {stats.recentLeads.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nog geen leads gevonden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => onLeadClick(lead.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                  isDark
                    ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-violet-500/20' : 'bg-violet-100'
                }`}>
                  <Building2 className={isDark ? 'h-6 w-6 text-violet-400' : 'h-6 w-6 text-violet-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {lead.company_name}
                  </p>
                  <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {lead.contact_email}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(lead.status)}
                  <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Calendar className="h-3 w-3" />
                    {new Date(lead.created_at).toLocaleDateString('nl-NL')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
