import React, { useEffect, useState } from 'react';
import { useAgentAuth } from '../contexts/AgentAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  Trophy,
  Medal,
  TrendingUp,
  Users,
  Crown,
  Star,
  Flame
} from 'lucide-react';

interface AgentStats {
  id: string;
  naam: string;
  totalLeads: number;
  monthlyLeads: number;
  commissionLevel: number;
}

// Commission levels based on total paid leads
export const getCommissionLevel = (paidLeads: number): { level: number; percentage: number; name: string; nextAt: number } => {
  if (paidLeads >= 50) {
    return { level: 5, percentage: 40, name: 'Diamond', nextAt: 0 };
  } else if (paidLeads >= 10) {
    return { level: 4, percentage: 30, name: 'Gold', nextAt: 50 };
  } else if (paidLeads >= 5) {
    return { level: 3, percentage: 20, name: 'Silver', nextAt: 10 };
  } else if (paidLeads >= 1) {
    return { level: 2, percentage: 10, name: 'Bronze', nextAt: 5 };
  } else {
    return { level: 1, percentage: 10, name: 'Starter', nextAt: 1 };
  }
};

const AgentRanking: React.FC = () => {
  const { agent } = useAgentAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [rankings, setRankings] = useState<AgentStats[]>([]);
  const [monthlyTop3, setMonthlyTop3] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      // Fetch all sales agents
      const { data: agents, error: agentsError } = await supabase
        .from('sales_agents')
        .select('*')
        .eq('is_active', true);

      if (agentsError) {
        console.error('Error fetching agents:', agentsError);
        return;
      }

      // Fetch all leads (not just paid)
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*');

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        return;
      }

      // Get current month start
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate stats for each agent
      const agentStats: AgentStats[] = (agents || []).map(ag => {
        const agentLeads = (leads || []).filter(l => l.assigned_to === ag.id);
        const monthlyLeads = agentLeads.filter(l => new Date(l.created_at) >= monthStart);
        const level = getCommissionLevel(agentLeads.length);

        return {
          id: ag.id,
          naam: ag.naam,
          totalLeads: agentLeads.length,
          monthlyLeads: monthlyLeads.length,
          commissionLevel: level.level
        };
      });

      // Sort by total leads
      const sortedByTotal = [...agentStats].sort((a, b) => b.totalLeads - a.totalLeads);
      setRankings(sortedByTotal);

      // Top 3 this month
      const sortedByMonth = [...agentStats]
        .filter(a => a.monthlyLeads > 0)
        .sort((a, b) => b.monthlyLeads - a.monthlyLeads)
        .slice(0, 3);
      setMonthlyTop3(sortedByMonth);

    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level: number) => {
    const badges: Record<number, { icon: typeof Trophy; color: string; bg: string }> = {
      1: { icon: Star, color: 'text-gray-400', bg: isDark ? 'bg-gray-700' : 'bg-gray-200' },
      2: { icon: Medal, color: 'text-amber-600', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-100' },
      3: { icon: Medal, color: 'text-gray-300', bg: isDark ? 'bg-gray-600' : 'bg-gray-300' },
      4: { icon: Trophy, color: 'text-yellow-500', bg: isDark ? 'bg-yellow-900/30' : 'bg-yellow-100' },
      5: { icon: Crown, color: 'text-cyan-400', bg: isDark ? 'bg-cyan-900/30' : 'bg-cyan-100' }
    };
    const badge = badges[level] || badges[1];
    const Icon = badge.icon;
    return (
      <div className={`w-10 h-10 rounded-xl ${badge.bg} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${badge.color}`} />
      </div>
    );
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className={`text-lg font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{rank}</span>;
  };

  const getLevelName = (level: number) => {
    const names: Record<number, string> = {
      1: 'Starter',
      2: 'Bronze',
      3: 'Silver',
      4: 'Gold',
      5: 'Diamond'
    };
    return names[level] || 'Starter';
  };

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
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/25">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ranglijst
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Bekijk de prestaties van het sales team
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 This Month */}
      {monthlyTop3.length > 0 && (
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gradient-to-br from-red-900/30 to-rose-900/30 border border-red-800/50' : 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Flame className={isDark ? 'h-6 w-6 text-red-400' : 'h-6 w-6 text-red-500'} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Top 3 Deze Maand
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {monthlyTop3.map((ag, index) => (
              <div
                key={ag.id}
                className={`p-6 rounded-xl text-center relative overflow-hidden ${
                  index === 0
                    ? isDark ? 'bg-yellow-900/30 border border-yellow-700/50' : 'bg-yellow-50 border border-yellow-200'
                    : isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
                }`}
              >
                {index === 0 && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                )}
                <div className="relative z-10">
                  <div className="flex justify-center mb-3">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                    'bg-gradient-to-br from-amber-600 to-amber-700'
                  }`}>
                    {ag.naam.charAt(0).toUpperCase()}
                  </div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ag.naam}</p>
                  <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {ag.monthlyLeads} leads
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Ranking */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <Users className={isDark ? 'h-6 w-6 text-gray-400' : 'h-6 w-6 text-gray-500'} />
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Alle Verkopers
          </h2>
        </div>

        {rankings.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nog geen verkopers gevonden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rankings.map((ag, index) => {
              const isCurrentUser = ag.id === agent?.id;
              return (
                <div
                  key={ag.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isCurrentUser
                      ? isDark ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'
                      : isDark ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                    'bg-gradient-to-br from-red-500 to-rose-500'
                  }`}>
                    {ag.naam.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {ag.naam}
                      {isCurrentUser && (
                        <span className={`ml-2 text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>(jij)</span>
                      )}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getLevelName(ag.commissionLevel)}
                    </p>
                  </div>

                  {/* Level Badge */}
                  {getLevelBadge(ag.commissionLevel)}

                  {/* Stats */}
                  <div className="text-right">
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {ag.totalLeads}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      leads
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentRanking;
