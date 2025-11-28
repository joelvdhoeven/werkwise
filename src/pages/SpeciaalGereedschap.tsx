import React, { useState, useEffect } from 'react';
import { Search, Plus, Wrench, CreditCard as Edit, Trash2, Calendar, MapPin, Camera, Loader2, CheckCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { nl } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDate } from '../utils/dateUtils';
import Modal from '../components/Modal';

interface SpecialTool {
  id: string;
  naam: string;
  beschrijving: string;
  status: 'beschikbaar' | 'in-gebruik' | 'onderhoud';
  locatie: string;
  laatste_onderhoud: string | null;
  volgende_onderhoud: string | null;
  project_id: string | null;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  naam: string;
  status: string;
}

const SpeciaalGereedschapPage: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user, hasPermission } = useAuth();
  const isDark = theme === 'dark';

  // Check if user is admin (can create/edit/delete)
  const isAdmin = hasPermission('manage_settings') || user?.role === 'admin' || user?.role === 'kantoorpersoneel';

  const [gereedschappen, setGereedschappen] = useState<SpecialTool[]>([]);
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingItem, setEditingItem] = useState<SpecialTool | null>(null);
  const [statusChangeItem, setStatusChangeItem] = useState<SpecialTool | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    naam: '',
    beschrijving: '',
    status: 'beschikbaar' as const,
    locatie: '',
    laatste_onderhoud: '',
    volgende_onderhoud: '',
    project_id: '',
    foto_url: '',
  });

  const [statusFormData, setStatusFormData] = useState({
    status: 'beschikbaar' as 'beschikbaar' | 'in-gebruik' | 'onderhoud',
    project_id: '',
  });

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load special tools
      const { data: toolsData, error: toolsError } = await supabase
        .from('special_tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (toolsError) throw toolsError;
      setGereedschappen(toolsData || []);

      // Load projects for dropdown
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, naam, status')
        .eq('status', 'actief');

      if (projectsError) throw projectsError;
      setProjecten(projectsData || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Fout bij laden van gegevens');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.naam || !formData.beschrijving || !formData.locatie) {
      alert(t('vulVerplichtVelden'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const toolData = {
        naam: formData.naam,
        beschrijving: formData.beschrijving,
        status: formData.status,
        locatie: formData.locatie,
        laatste_onderhoud: formData.laatste_onderhoud || null,
        volgende_onderhoud: formData.volgende_onderhoud || null,
        project_id: formData.project_id || null,
        foto_url: formData.foto_url || null,
      };

      if (editingItem) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('special_tools')
          .update({ ...toolData, updated_at: new Date().toISOString() })
          .eq('id', editingItem.id);

        if (updateError) throw updateError;
        showSuccess('Gereedschap bijgewerkt!');
      } else {
        // Create new item
        const { error: insertError } = await supabase
          .from('special_tools')
          .insert(toolData);

        if (insertError) throw insertError;
        showSuccess('Gereedschap toegevoegd!');
      }

      await loadData();
      resetForm();
      setShowModal(false);
    } catch (err: any) {
      console.error('Error saving tool:', err);
      setError(err.message || 'Fout bij opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!statusChangeItem) return;

    // If status is 'in-gebruik', require a project
    if (statusFormData.status === 'in-gebruik' && !statusFormData.project_id) {
      alert('Selecteer een project om het gereedschap op te boeken');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updateData: any = {
        status: statusFormData.status,
        updated_at: new Date().toISOString(),
      };

      // Set project_id based on status
      if (statusFormData.status === 'in-gebruik') {
        updateData.project_id = statusFormData.project_id;
        // Update location to project name
        const project = projecten.find(p => p.id === statusFormData.project_id);
        if (project) {
          updateData.locatie = `Project: ${project.naam}`;
        }
      } else if (statusFormData.status === 'beschikbaar') {
        updateData.project_id = null;
        updateData.locatie = 'Depot';
      }

      const { error: updateError } = await supabase
        .from('special_tools')
        .update(updateData)
        .eq('id', statusChangeItem.id);

      if (updateError) throw updateError;

      await loadData();
      setShowStatusModal(false);
      setStatusChangeItem(null);
      showSuccess('Status bijgewerkt!');
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Fout bij status update');
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const resetForm = () => {
    setFormData({
      naam: '',
      beschrijving: '',
      status: 'beschikbaar',
      locatie: '',
      laatste_onderhoud: '',
      volgende_onderhoud: '',
      project_id: '',
      foto_url: '',
    });
    setEditingItem(null);
  };

  const handleEditItem = (item: SpecialTool) => {
    if (!isAdmin) return;
    setFormData({
      naam: item.naam,
      beschrijving: item.beschrijving,
      status: item.status,
      locatie: item.locatie,
      laatste_onderhoud: item.laatste_onderhoud || '',
      volgende_onderhoud: item.volgende_onderhoud || '',
      project_id: item.project_id || '',
      foto_url: item.foto_url || '',
    });
    setEditingItem(item);
    setShowModal(true);
  };

  const handleStatusChangeClick = (item: SpecialTool) => {
    setStatusChangeItem(item);
    setStatusFormData({
      status: item.status,
      project_id: item.project_id || '',
    });
    setShowStatusModal(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm(t('weetJeZeker'))) {
      try {
        const { error: deleteError } = await supabase
          .from('special_tools')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        await loadData();
        showSuccess('Gereedschap verwijderd!');
      } catch (err: any) {
        console.error('Error deleting tool:', err);
        setError(err.message || 'Fout bij verwijderen');
      }
    }
  };

  const handleNewItem = () => {
    if (!isAdmin) return;
    resetForm();
    setShowModal(true);
  };

  const filteredItems = gereedschappen.filter(item =>
    item.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.beschrijving.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.locatie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'beschikbaar':
        return 'bg-green-100 text-green-800';
      case 'in-gebruik':
        return 'bg-red-100 text-red-800';
      case 'onderhoud':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isMaintenanceDue = (nextMaintenance?: string | null) => {
    if (!nextMaintenance) return false;
    const today = new Date();
    const maintenanceDate = new Date(nextMaintenance);
    const diffTime = maintenanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-red-600" />
      </div>
    );
  }

  return (
    <div>
      {showSuccessMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center gap-2">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold flex items-center space-x-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <Wrench className="text-red-600" />
          <span>{t('specialGereedschap')}</span>
        </h1>
        {isAdmin && (
          <button
            onClick={handleNewItem}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md hover:from-red-700 hover:to-rose-700 transition-colors shadow-lg shadow-red-500/25"
          >
            <Plus size={16} />
            <span>{t('nieuwGereedschap')}</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className={`rounded-lg shadow mb-6 p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('zoekGereedschap')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
      </div>

      {/* Tools Overview */}
      <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('specialGereedschapOverzicht')}</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isAdmin ? t('beheerSpecialGereedschap') : 'Bekijk beschikbaar gereedschap en wijzig status'}
          </p>
        </div>
        <div className="p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className={`mx-auto h-12 w-12 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('geenSpecialGereedschap')}</p>
              {isAdmin && (
                <>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('nieuwGereedschap')}
                  </p>
                  <button
                    onClick={handleNewItem}
                    className="mt-4 flex items-center space-x-2 mx-auto px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md hover:from-red-700 hover:to-rose-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span>{t('nieuwGereedschap')}</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Naam</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Beschrijving</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Locatie</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Project</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Onderhoud</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{t('acties')}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={isDark ? 'bg-gray-800' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.foto_url && (
                            <img
                              src={item.foto_url}
                              alt={item.naam}
                              className="h-10 w-10 rounded-full object-cover mr-3"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.naam}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm max-w-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="break-words">{item.beschrijving}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusChangeClick(item)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(item.status)}`}
                          title="Klik om status te wijzigen"
                        >
                          {item.status === 'beschikbaar' ? t('beschikbaar') :
                           item.status === 'in-gebruik' ? t('inGebruik') :
                           item.status === 'onderhoud' ? t('onderhoud') : item.status}
                        </button>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          {item.locatie}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {item.project_id ?
                          projecten.find(p => p.id === item.project_id)?.naam || 'Onbekend project' :
                          '-'
                        }
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {item.volgende_onderhoud ? (
                          <div className={`flex items-center ${isMaintenanceDue(item.volgende_onderhoud) ? 'text-red-600' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Calendar size={14} className="mr-1" />
                            {formatDate(item.volgende_onderhoud)}
                            {isMaintenanceDue(item.volgende_onderhoud) && (
                              <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 rounded">!</span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Everyone can change status */}
                          <button
                            onClick={() => handleStatusChangeClick(item)}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          >
                            <Edit size={16} />
                            <span>Status</span>
                          </button>
                          {/* Only admins can edit/delete */}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              >
                                <Edit size={16} />
                                <span>{t('bewerken')}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                              >
                                <Trash2 size={16} />
                                <span>{t('verwijderen')}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal (for all users) */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Status Wijzigen"
      >
        <form onSubmit={handleStatusChange} className="space-y-4">
          {statusChangeItem && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{statusChangeItem.naam}</p>
              <p className="text-sm text-gray-600">{statusChangeItem.beschrijving}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nieuwe Status *</label>
            <select
              value={statusFormData.status}
              onChange={(e) => setStatusFormData(prev => ({
                ...prev,
                status: e.target.value as 'beschikbaar' | 'in-gebruik' | 'onderhoud',
                project_id: e.target.value !== 'in-gebruik' ? '' : prev.project_id
              }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="beschikbaar">{t('beschikbaar')} - Terug naar depot</option>
              <option value="in-gebruik">{t('inGebruik')} - Op project boeken</option>
              <option value="onderhoud">{t('onderhoud')} - Onderhoud nodig</option>
            </select>
          </div>

          {statusFormData.status === 'in-gebruik' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project (Klus) *</label>
              <select
                value={statusFormData.project_id}
                onChange={(e) => setStatusFormData(prev => ({ ...prev, project_id: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Selecteer een project...</option>
                {projecten.map(project => (
                  <option key={project.id} value={project.id}>{project.naam}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Selecteer het project waar je dit gereedschap gaat gebruiken
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowStatusModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              {t('annuleren')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md hover:from-red-700 hover:to-rose-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              <span>Status Opslaan</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* New/Edit Tool Modal (admin only) */}
      {isAdmin && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? t('bewerken') + ' Gereedschap' : t('nieuwGereedschap')}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('gereedschapNaam')} *</label>
                <input
                  type="text"
                  name="naam"
                  value={formData.naam}
                  onChange={handleInputChange}
                  required
                  placeholder="Bijv. Hijskraan 50 ton"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('gereedschapStatus')} *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="beschikbaar">{t('beschikbaar')}</option>
                  <option value="in-gebruik">{t('inGebruik')}</option>
                  <option value="onderhoud">{t('onderhoud')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('gereedschapBeschrijving')} *</label>
              <textarea
                name="beschrijving"
                value={formData.beschrijving}
                onChange={handleInputChange}
                rows={3}
                required
                placeholder="Beschrijf het gereedschap en zijn gebruik..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('gereedschapLocatie')} *</label>
                <input
                  type="text"
                  name="locatie"
                  value={formData.locatie}
                  onChange={handleInputChange}
                  required
                  placeholder="Bijv. Hoofddepot, Werkplaats"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('gekoppeldProject')}</label>
                <select
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">{t('selecteerProject')}</option>
                  {projecten.map(project => (
                    <option key={project.id} value={project.id}>{project.naam}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('laatsteOnderhoud')}</label>
                <DatePicker
                  selected={formData.laatste_onderhoud ? new Date(formData.laatste_onderhoud) : null}
                  onChange={(date) => {
                    const dateString = date ? date.toISOString().split('T')[0] : '';
                    setFormData(prev => ({ ...prev, laatste_onderhoud: dateString }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale={nl}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  wrapperClassName="w-full"
                  portalId="root-portal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('volgendeOnderhoud')}</label>
                <DatePicker
                  selected={formData.volgende_onderhoud ? new Date(formData.volgende_onderhoud) : null}
                  onChange={(date) => {
                    const dateString = date ? date.toISOString().split('T')[0] : '';
                    setFormData(prev => ({ ...prev, volgende_onderhoud: dateString }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale={nl}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  wrapperClassName="w-full"
                  portalId="root-portal"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fotoUrl')}</label>
              <div className="flex">
                <input
                  type="url"
                  name="foto_url"
                  value={formData.foto_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/foto.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <div className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md flex items-center">
                  <Camera size={16} className="text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('annuleren')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md hover:from-red-700 hover:to-rose-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                <span>{editingItem ? t('opslaan') : t('nieuwGereedschap')}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SpeciaalGereedschapPage;
