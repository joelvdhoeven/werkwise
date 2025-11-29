import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Eye, EyeOff, Calendar, Plus, X, Check, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface VacationRequest {
  id: string;
  user_id: string;
  type: 'vakantie' | 'ziekte' | 'verlof' | 'anders';
  start_date: string;
  end_date: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
  profiles?: { naam: string };
  reviewer?: { naam: string };
}

const Instellingen: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('profiel');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [profileData, setProfileData] = useState({
    naam: user?.naam || '',
    email: user?.email || '',
  });

  // Vacation request state
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [showVacationForm, setShowVacationForm] = useState(false);
  const [vacationFormData, setVacationFormData] = useState({
    type: 'vakantie' as 'vakantie' | 'ziekte' | 'verlof' | 'anders',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [loadingVacation, setLoadingVacation] = useState(false);
  const [vacationHoursTotal, setVacationHoursTotal] = useState(0);
  const [vacationHoursUsed, setVacationHoursUsed] = useState(0);

  // Calculate work days (excluding weekends)
  const calculateWorkDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    let workDays = 0;

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workDays;
  };

  // Calculate requested hours (8 hours per work day)
  const requestedHours = calculateWorkDays(vacationFormData.start_date, vacationFormData.end_date) * 8;
  const remainingHours = vacationHoursTotal - vacationHoursUsed;

  // Update profile data when user loads
  React.useEffect(() => {
    if (user) {
      setProfileData({
        naam: user.naam || '',
        email: user.email || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (activeTab === 'afwezigheid') {
      loadVacationRequests();
      loadVacationHours();
    }
  }, [activeTab]);

  const loadVacationHours = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('vacation_hours_total, vacation_hours_used')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setVacationHoursTotal(data?.vacation_hours_total || 0);
      setVacationHoursUsed(data?.vacation_hours_used || 0);
    } catch (error) {
      console.error('Error loading vacation hours:', error);
    }
  };

  const loadVacationRequests = async () => {
    if (!user) return;
    setLoadingVacation(true);
    try {
      const { data, error } = await supabase
        .from('vacation_requests')
        .select(`
          *,
          profiles:user_id(naam),
          reviewer:reviewed_by(naam)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVacationRequests(data || []);
    } catch (error) {
      console.error('Error loading vacation requests:', error);
    } finally {
      setLoadingVacation(false);
    }
  };

  const handleCreateVacationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!vacationFormData.start_date || !vacationFormData.end_date) {
      setErrorMessage('Vul een begin- en einddatum in');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (new Date(vacationFormData.end_date) < new Date(vacationFormData.start_date)) {
      setErrorMessage('Einddatum moet na begindatum liggen');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from('vacation_requests')
        .insert({
          user_id: user.id,
          type: vacationFormData.type,
          start_date: vacationFormData.start_date,
          end_date: vacationFormData.end_date,
          reason: vacationFormData.reason || null,
        });

      if (error) throw error;

      setSuccessMessage('Afwezigheidsaanvraag ingediend');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowVacationForm(false);
      setVacationFormData({
        type: 'vakantie',
        start_date: '',
        end_date: '',
        reason: '',
      });
      loadVacationRequests();
    } catch (error) {
      console.error('Error creating vacation request:', error);
      setErrorMessage('Fout bij het indienen van aanvraag');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDeleteVacationRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vacation_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccessMessage('Aanvraag verwijderd');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadVacationRequests();
    } catch (error) {
      console.error('Error deleting vacation request:', error);
      setErrorMessage('Fout bij het verwijderen van aanvraag');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleReviewVacationRequest = async (id: string, status: 'approved' | 'rejected', note?: string) => {
    if (!user) return;
    try {
      // Get the vacation request details first
      const { data: request, error: fetchError } = await supabase
        .from('vacation_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update the vacation request status
      const { error } = await supabase
        .from('vacation_requests')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_note: note || null,
        })
        .eq('id', id);

      if (error) throw error;

      // If approved and type is 'vakantie', update the user's vacation_hours_used
      if (status === 'approved' && request.type === 'vakantie') {
        const workDays = calculateWorkDays(request.start_date, request.end_date);
        const hoursToAdd = workDays * 8;

        // Get current vacation hours used
        const { data: profileData, error: profileFetchError } = await supabase
          .from('profiles')
          .select('vacation_hours_used')
          .eq('id', request.user_id)
          .single();

        if (profileFetchError) throw profileFetchError;

        // Update vacation hours used
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            vacation_hours_used: (profileData?.vacation_hours_used || 0) + hoursToAdd,
          })
          .eq('id', request.user_id);

        if (updateError) throw updateError;
      }

      setSuccessMessage(status === 'approved' ? 'Aanvraag goedgekeurd' : 'Aanvraag afgewezen');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadVacationRequests();
      loadVacationHours();
    } catch (error) {
      console.error('Error reviewing vacation request:', error);
      setErrorMessage('Fout bij het verwerken van aanvraag');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vakantie': return 'Vakantie';
      case 'ziekte': return 'Ziekte';
      case 'verlof': return 'Verlof';
      case 'anders': return 'Anders';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'In afwachting', className: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { label: 'Goedgekeurd', className: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800' };
      case 'rejected':
        return { label: 'Afgewezen', className: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800' };
      default:
        return { label: status, className: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ naam: profileData.naam })
        .eq('id', user?.id);

      if (error) throw error;

      setSuccessMessage(t('profielBijgewerkt'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(t('foutOpgetreden'));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage(t('wachtwoordenKomenNietOvereen'));
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage(t('wachtwoordMinimaal6'));
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setSuccessMessage(t('wachtwoordGewijzigd'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage(t('foutOpgetreden'));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className={`px-4 py-3 rounded ${isDark ? 'bg-green-900/50 border border-green-700 text-green-300' : 'bg-green-100 border border-green-400 text-green-700'}`}>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className={`px-4 py-3 rounded ${isDark ? 'bg-red-900/50 border border-red-700 text-red-300' : 'bg-red-100 border border-red-400 text-red-700'}`}>
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('instellingen')}</h1>
      </div>

      {/* Tabs */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
          <button
            onClick={() => setActiveTab('profiel')}
            className={`${
              activeTab === 'profiel'
                ? 'border-red-600 text-red-600'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <User size={18} />
            <span>{t('profiel')}</span>
          </button>
          <button
            onClick={() => setActiveTab('beveiliging')}
            className={`${
              activeTab === 'beveiliging'
                ? 'border-red-600 text-red-600'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <Lock size={18} />
            <span>{t('beveiliging')}</span>
          </button>
          <button
            onClick={() => setActiveTab('afwezigheid')}
            className={`${
              activeTab === 'afwezigheid'
                ? 'border-red-600 text-red-600'
                : isDark ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <Calendar size={18} />
            <span>Afwezigheid</span>
          </button>
          </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profiel' && (
        <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('profielInformatie')}</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('naam')}</label>
              <input
                type="text"
                value={profileData.naam}
                onChange={(e) => setProfileData({ ...profileData, naam: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className={`w-full px-3 py-2 border rounded-md cursor-not-allowed ${isDark ? 'bg-gray-600 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
              />
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('emailKanNietWordenGewijzigd')}</p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md hover:from-red-700 hover:to-rose-700 transition-colors"
              >
                <Save size={16} />
                <span>{t('opslaan')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'beveiliging' && (
        <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('wachtwoordWijzigen')}</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('huidigWachtwoord')}</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('nieuwWachtwoord')}</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('bevestigNieuwWachtwoord')}</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md hover:from-red-700 hover:to-rose-700 transition-colors"
              >
                <Save size={16} />
                <span>{t('wachtwoordWijzigen')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vacation/Absence Tab */}
      {activeTab === 'afwezigheid' && (
        <div className="space-y-6">
          {/* Vacation Hours Overview */}
          {vacationHoursTotal > 0 && (
            <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={20} className="text-blue-500" />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Jouw Vakantie-uren</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Totaal</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{vacationHoursTotal}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>uur/jaar</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gebruikt</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{vacationHoursUsed}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>uur</p>
                </div>
                <div className={`p-3 rounded-lg ${remainingHours < 0 ? (isDark ? 'bg-red-900/30' : 'bg-red-100') : (isDark ? 'bg-green-900/30' : 'bg-green-100')}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Resterend</p>
                  <p className={`text-xl font-bold ${remainingHours < 0 ? 'text-red-500' : (isDark ? 'text-green-400' : 'text-green-600')}`}>{remainingHours}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>uur</p>
                </div>
              </div>
            </div>
          )}

          {/* Request Form */}
          <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-red-600" />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Afwezigheid Aanvragen</h2>
              </div>
              {!showVacationForm && (
                <button
                  onClick={() => setShowVacationForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md hover:from-red-700 hover:to-rose-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>Nieuwe Aanvraag</span>
                </button>
              )}
            </div>

            {showVacationForm && (
              <form onSubmit={handleCreateVacationRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
                    <select
                      value={vacationFormData.type}
                      onChange={(e) => setVacationFormData({ ...vacationFormData, type: e.target.value as any })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="vakantie">Vakantie</option>
                      <option value="ziekte">Ziekte</option>
                      <option value="verlof">Verlof</option>
                      <option value="anders">Anders</option>
                    </select>
                  </div>
                  <div></div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Begindatum</label>
                    <input
                      type="date"
                      value={vacationFormData.start_date}
                      onChange={(e) => setVacationFormData({ ...vacationFormData, start_date: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Einddatum</label>
                    <input
                      type="date"
                      value={vacationFormData.end_date}
                      onChange={(e) => setVacationFormData({ ...vacationFormData, end_date: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reden (optioneel)</label>
                  <textarea
                    value={vacationFormData.reason}
                    onChange={(e) => setVacationFormData({ ...vacationFormData, reason: e.target.value })}
                    rows={3}
                    placeholder="Voeg een toelichting toe..."
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>

                {/* Show hours calculation for vacation type */}
                {vacationFormData.type === 'vakantie' && vacationFormData.start_date && vacationFormData.end_date && vacationHoursTotal > 0 && (
                  <div className={`p-3 rounded-lg ${requestedHours > remainingHours ? (isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200') : (isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200')}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {calculateWorkDays(vacationFormData.start_date, vacationFormData.end_date)} werkdagen = <span className="font-bold">{requestedHours} uur</span>
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          (weekenden worden niet meegerekend)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Na goedkeuring:</p>
                        <p className={`text-lg font-bold ${(remainingHours - requestedHours) < 0 ? 'text-red-500' : (isDark ? 'text-green-400' : 'text-green-600')}`}>
                          {remainingHours - requestedHours} uur over
                        </p>
                      </div>
                    </div>
                    {requestedHours > remainingHours && (
                      <p className={`mt-2 text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                        Let op: Je hebt niet genoeg vakantie-uren. Neem contact op met je leidinggevende.
                      </p>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVacationForm(false);
                      setVacationFormData({ type: 'vakantie', start_date: '', end_date: '', reason: '' });
                    }}
                    className={`px-4 py-2 rounded-md transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md hover:from-red-700 hover:to-rose-700 transition-colors"
                  >
                    <Save size={16} />
                    <span>Indienen</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* My Requests */}
          <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Mijn Aanvragen</h2>

            {loadingVacation ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : vacationRequests.filter(r => r.user_id === user?.id).length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Je hebt nog geen afwezigheidsaanvragen ingediend.
              </p>
            ) : (
              <div className="space-y-3">
                {vacationRequests.filter(r => r.user_id === user?.id).map((request) => {
                  const statusBadge = getStatusBadge(request.status);
                  return (
                    <div
                      key={request.id}
                      className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {getTypeLabel(request.type)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(request.start_date)} - {formatDate(request.end_date)}
                          </p>
                          {request.reason && (
                            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {request.reason}
                            </p>
                          )}
                          {request.review_note && (
                            <p className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              Opmerking: {request.review_note}
                            </p>
                          )}
                        </div>
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleDeleteVacationRequest(request.id)}
                            className={`p-2 rounded-md transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                            title="Aanvraag verwijderen"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Section - All Requests */}
          {hasPermission('manage_settings') && (
            <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} className="text-red-600" />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Alle Aanvragen (Admin)</h2>
              </div>

              {loadingVacation ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : vacationRequests.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Er zijn geen afwezigheidsaanvragen.
                </p>
              ) : (
                <div className="space-y-3">
                  {vacationRequests.map((request) => {
                    const statusBadge = getStatusBadge(request.status);
                    return (
                      <div
                        key={request.id}
                        className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                {request.profiles?.naam || 'Onbekend'}
                              </span>
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                - {getTypeLabel(request.type)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                                {statusBadge.label}
                              </span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(request.start_date)} - {formatDate(request.end_date)}
                            </p>
                            {request.reason && (
                              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {request.reason}
                              </p>
                            )}
                            {request.reviewer?.naam && (
                              <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                Beoordeeld door: {request.reviewer.naam}
                              </p>
                            )}
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReviewVacationRequest(request.id, 'approved')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                              >
                                <Check size={14} />
                                <span>Goedkeuren</span>
                              </button>
                              <button
                                onClick={() => handleReviewVacationRequest(request.id, 'rejected')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                              >
                                <X size={14} />
                                <span>Afwijzen</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Instellingen;
