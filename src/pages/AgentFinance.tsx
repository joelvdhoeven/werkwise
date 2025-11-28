import React, { useEffect, useState } from 'react';
import { useAgentAuth } from '../contexts/AgentAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { getCommissionLevel } from './AgentRanking';
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Banknote,
  Calendar,
  ArrowUpRight,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Target
} from 'lucide-react';

const LEAD_VALUE = 300; // €300 per lead

interface FinanceStats {
  totalPaidLeads: number;
  monthlyPaidLeads: number;
  pendingLeads: number;
  totalEarnings: number;
  monthlyEarnings: number;
  pendingEarnings: number;
  commissionPercentage: number;
  commissionLevel: string;
  nextLevelAt: number;
  leadsToNextLevel: number;
}

interface MonthlyData {
  month: string;
  paidLeads: number;
  earnings: number;
}

const AgentFinance: React.FC = () => {
  const { agent } = useAgentAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<FinanceStats>({
    totalPaidLeads: 0,
    monthlyPaidLeads: 0,
    pendingLeads: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingEarnings: 0,
    commissionPercentage: 10,
    commissionLevel: 'Starter',
    nextLevelAt: 1,
    leadsToNextLevel: 1
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agent) {
      fetchFinanceData();
    }
  }, [agent]);

  const fetchFinanceData = async () => {
    if (!agent) return;

    try {
      // Fetch leads assigned to this agent
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('assigned_to', agent.id);

      if (error) {
        console.error('Error fetching leads:', error);
        return;
      }

      const allLeads = leads || [];
      const paidLeads = allLeads.filter(l => l.status === 'paid');
      const pendingLeads = allLeads.filter(l => l.status === 'converted');

      // Get commission level
      const level = getCommissionLevel(paidLeads.length);

      // Current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyPaid = paidLeads.filter(l => new Date(l.updated_at) >= monthStart);

      // Calculate earnings
      const commission = level.percentage / 100;
      const totalEarnings = paidLeads.length * LEAD_VALUE * commission;
      const monthlyEarnings = monthlyPaid.length * LEAD_VALUE * commission;
      const pendingEarnings = pendingLeads.length * LEAD_VALUE * commission;

      setStats({
        totalPaidLeads: paidLeads.length,
        monthlyPaidLeads: monthlyPaid.length,
        pendingLeads: pendingLeads.length,
        totalEarnings,
        monthlyEarnings,
        pendingEarnings,
        commissionPercentage: level.percentage,
        commissionLevel: level.name,
        nextLevelAt: level.nextAt,
        leadsToNextLevel: Math.max(0, level.nextAt - paidLeads.length)
      });

      // Calculate last 6 months data
      const monthlyStats: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthPaid = paidLeads.filter(l => {
          const updated = new Date(l.updated_at);
          return updated >= date && updated <= monthEnd;
        });

        // Calculate commission for that period
        const monthLevel = getCommissionLevel(monthPaid.length);

        monthlyStats.push({
          month: date.toLocaleDateString('nl-NL', { month: 'short' }),
          paidLeads: monthPaid.length,
          earnings: monthPaid.length * LEAD_VALUE * (monthLevel.percentage / 100)
        });
      }
      setMonthlyData(monthlyStats);

    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCashOut = () => {
    const message = encodeURIComponent('Hi Paul, ik wil graag mijn commissie cashen!');
    const phone = '31636208780'; // Dutch format without leading 0
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const progressToNextLevel = stats.nextLevelAt > 0
    ? ((stats.nextLevelAt - stats.leadsToNextLevel) / stats.nextLevelAt) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <DollarSign className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Financieel Overzicht
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Bekijk je verdiensten en commissies
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gradient-to-br from-emerald-900/50 to-green-900/50 border border-emerald-800/50' : 'bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg`}>
              <Banknote className="h-6 w-6 text-white" />
            </div>
            <ArrowUpRight className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
          </div>
          <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(stats.totalEarnings)}
          </p>
          <p className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>
            Totaal Verdiend
          </p>
        </div>

        {/* Monthly Earnings */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg`}>
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <ArrowUpRight className={isDark ? 'text-gray-600' : 'text-gray-400'} />
          </div>
          <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(stats.monthlyEarnings)}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Deze Maand
          </p>
        </div>

        {/* Pending Earnings */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg`}>
              <Clock className="h-6 w-6 text-white" />
            </div>
            <ArrowUpRight className={isDark ? 'text-gray-600' : 'text-gray-400'} />
          </div>
          <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(stats.pendingEarnings)}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            In Afwachting
          </p>
        </div>

        {/* Paid Leads */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg`}>
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <ArrowUpRight className={isDark ? 'text-gray-600' : 'text-gray-400'} />
          </div>
          <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {stats.totalPaidLeads}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Betaalde Leads
          </p>
        </div>
      </div>

      {/* Commission Level Card */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              stats.commissionLevel === 'Diamond' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' :
              stats.commissionLevel === 'Gold' ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
              stats.commissionLevel === 'Silver' ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
              stats.commissionLevel === 'Bronze' ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
              'bg-gradient-to-br from-gray-500 to-gray-600'
            } shadow-lg`}>
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Je Niveau</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.commissionLevel}
              </p>
              <p className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {stats.commissionPercentage}% commissie
              </p>
            </div>
          </div>

          {stats.nextLevelAt > 0 && (
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Voortgang naar volgend niveau
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.leadsToNextLevel} leads te gaan
                </span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Nog {stats.leadsToNextLevel} betaalde leads voor niveau {stats.nextLevelAt} leads
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <TrendingUp className="h-5 w-5" />
          Verdiensten per Maand
        </h2>

        {monthlyData.length === 0 || monthlyData.every(m => m.paidLeads === 0) ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nog geen betaalde leads</p>
          </div>
        ) : (
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className={`w-12 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {month.month}
                </span>
                <div className="flex-1">
                  <div className={`h-8 rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-end px-3 transition-all duration-500"
                      style={{
                        width: `${Math.max(5, (month.earnings / Math.max(...monthlyData.map(m => m.earnings), 1)) * 100)}%`
                      }}
                    >
                      {month.earnings > 0 && (
                        <span className="text-xs font-medium text-white">
                          {formatCurrency(month.earnings)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`w-16 text-right text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {month.paidLeads} leads
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cash Out Button */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-800/50' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
              <Banknote className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Klaar om uit te cashen?
              </p>
              <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                Totaal beschikbaar: {formatCurrency(stats.totalEarnings)}
              </p>
            </div>
          </div>
          <button
            onClick={handleCashOut}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40"
          >
            <MessageCircle className="h-5 w-5" />
            Uitcashen via WhatsApp
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
        <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Hoe werkt commissie?
        </h3>
        <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Elke betaalde lead is €{LEAD_VALUE} waard</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Je commissie percentage stijgt met meer leads (10% - 40%)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Leads worden betaald zodra de admin ze op "Betaald" zet</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Klik op "Uitcashen" om je commissie op te vragen via WhatsApp</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AgentFinance;
