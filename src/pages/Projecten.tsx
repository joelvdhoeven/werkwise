import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Calendar, Users, Clock, BarChart3, Eye, Search, Archive, FileText, Download, Layers, ChevronDown, ChevronUp, MapPin, Pencil, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { nl } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';
import { useSupabaseQuery, useSupabaseMutation } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Project, UrenRegistratie } from '../types';
import { formatDate } from '../utils/dateUtils';
import Modal from '../components/Modal';
import SupabaseErrorHelper from '../components/SupabaseErrorHelper';
import ProtectedRoute from '../components/ProtectedRoute';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import { useTheme } from '../contexts/ThemeContext';

const Projecten: React.FC = () => {
  const { t } = useLanguage();
  const { user, hasPermission } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { data: allProjecten, loading, refetch } = useSupabaseQuery<any>('projects');
  const { data: urenRegistraties = [] } = useSupabaseQuery<any>('time_registrations', 'id, user_id, project_id, datum, aantal_uren, werktype, werkomschrijving, locatie, status, project_naam, progress_percentage, created_at, updated_at, driven_kilometers');
  const { data: gebruikers = [] } = useSupabaseQuery<any>('profiles', 'id, naam');
  const { data: systemSettings = [] } = useSupabaseQuery<any>('system_settings');

  // Filter projects based on user role and status
  const filteredByRole = hasPermission('view_reports')
    ? (allProjecten || [])
    : (allProjecten || []).filter((project: any) =>
        urenRegistraties.some((reg: any) => reg.project_id === project.id && reg.user_id === user?.id)
      );

  // Filter active vs archived projects
  const projecten = filteredByRole.filter((project: any) => project.status === 'actief');
  const archivedProjecten = filteredByRole.filter((project: any) =>
    project.status === 'gepauzeerd' || project.status === 'voltooid'
  );

  // Debug logging
  useEffect(() => {
    console.log('All projecten:', allProjecten);
    console.log('Active projecten:', projecten);
    console.log('Archived projecten:', archivedProjecten);
  }, [allProjecten, projecten, archivedProjecten]);
  const { insert: insertProject, update: updateProject, remove: deleteProject, loading: mutationLoading } = useSupabaseMutation('projects');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastError, setLastError] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<string | null>(null);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [archiveSearchTerm, setArchiveSearchTerm] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const [formData, setFormData] = useState({
    naam: '',
    beschrijving: '',
    locatie: '',
    startDatum: '',
    status: 'actief' as const,
    progressPercentage: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.naam || !formData.beschrijving || !formData.startDatum || !formData.locatie) {
      alert(t('vulVerplichtVelden'));
      return;
    }

    // Ensure user is authenticated with a valid ID
    if (!user?.id) {
      alert('Je bent niet ingelogd. Log opnieuw in en probeer het nog een keer.');
      return;
    }

    // Only include columns that exist in the database schema
    const baseProjectData = {
      naam: formData.naam,
      beschrijving: formData.beschrijving,
      locatie: formData.locatie,
      start_datum: formData.startDatum,
      status: formData.status,
      progress_percentage: formData.progressPercentage ? parseInt(formData.progressPercentage) : (editingProject ? editingProject.progress_percentage || 0 : 0),
    };

    // Only include created_by for new projects (INSERT), not for updates
    const projectData = editingProject
      ? baseProjectData
      : { ...baseProjectData, created_by: user?.id };

    const action = editingProject
      ? updateProject(editingProject.id, projectData)
      : insertProject(projectData);
    
    action
      .then(() => {
        setLastError(null);
        setEditingProject(null);
        setFormData({
          naam: '',
          beschrijving: '',
          locatie: '',
          startDatum: '',
          status: 'actief',
          progressPercentage: '',
        });

        setShowModal(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        refetch();

        // Trigger a custom event to notify other components that projects were updated
        window.dispatchEvent(new CustomEvent('projectsUpdated'));
      })
      .catch((error) => {
        console.error('Error creating project:', error);
        setLastError(error);
        alert('Er is een fout opgetreden bij het opslaan van het project.');
      });
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setFormData({
      naam: '',
      beschrijving: '',
      locatie: '',
      startDatum: new Date().toISOString().split('T')[0],
      status: 'actief',
      progressPercentage: '',
    });
    setShowModal(true);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setFormData({
      naam: project.naam,
      beschrijving: project.beschrijving,
      locatie: project.locatie || '',
      startDatum: project.start_datum,
      status: project.status,
      progressPercentage: project.progress_percentage?.toString() || '',
    });
    setShowModal(true);
  };

  // Calculate total logged hours for a project
  const getTotalLoggedHours = (projectId: string): number => {
    return urenRegistraties
      .filter(reg => reg.project_id === projectId)
      .reduce((total, reg) => {
        // Convert aantal_uren to number (it comes as string from DB)
        const uren = parseFloat(reg.aantal_uren) || 0;
        return total + uren;
      }, 0);
  };

  // Get registrations for a specific project
  const getProjectRegistrations = (projectId: string) => {
    const allRegs = urenRegistraties.filter((reg: any) => reg.project_id === projectId);
    // Filter for current user if not admin/kantoorpersoneel
    if (!hasPermission('view_reports')) {
      return allRegs.filter((reg: any) => reg.user_id === user?.id);
    }
    return allRegs;
  };

  // Get unique users who worked on a project
  const getProjectUsers = (projectId: string) => {
    const registrations = getProjectRegistrations(projectId);
    const userIds = new Set(registrations.map((reg: any) => reg.user_id));
    return Array.from(userIds).map(userId => {
      const gebruiker = gebruikers.find((g: any) => g.id === userId);
      const userRegistrations = registrations.filter((reg: any) => reg.user_id === userId);
      const totalHours = userRegistrations.reduce((sum: number, reg: any) => {
        const uren = parseFloat(reg.aantal_uren) || 0;
        return sum + uren;
      }, 0);
      return {
        userId,
        naam: gebruiker?.naam || 'Onbekende gebruiker',
        totalHours,
        registrations: userRegistrations
      };
    });
  };

  // Get total kilometers for a project
  const getTotalKilometers = (projectId: string) => {
    const registrations = getProjectRegistrations(projectId);
    return registrations.reduce((sum: number, reg: any) => {
      const km = parseFloat(reg.driven_kilometers) || 0;
      return sum + km;
    }, 0);
  };

  // Get all materials used in a project
  const getProjectMaterials = (projectId: string) => {
    const registrations = getProjectRegistrations(projectId);
    const materialsMap = new Map();

    registrations.forEach((reg: any) => {
      if (reg.materials && Array.isArray(reg.materials)) {
        reg.materials.forEach((material: any) => {
          const key = material.product_id;
          if (materialsMap.has(key)) {
            const existing = materialsMap.get(key);
            existing.quantity += parseFloat(material.quantity) || 0;
          } else {
            materialsMap.set(key, {
              product_id: material.product_id,
              product_name: material.product_name,
              quantity: parseFloat(material.quantity) || 0,
              unit: material.unit
            });
          }
        });
      }
    });

    return Array.from(materialsMap.values());
  };

  // Check if project is incomplete (created by employees/ZZPers, awaiting admin completion)
  const isProjectIncomplete = (project: any) => {
    return project.beschrijving === 'Aangemaakt door medewerker - nog in te vullen';
  };

  const getMissingFields = (project: any): string[] => {
    const missing: string[] = [];

    if (project.beschrijving === 'Aangemaakt door medewerker - nog in te vullen') {
      missing.push('Beschrijving');
    }

    return missing;
  };

  // Filter projects based on search term
  const filteredProjecten = projecten.filter((project: any) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      project.naam?.toLowerCase().includes(searchLower) ||
      project.beschrijving?.toLowerCase().includes(searchLower)
    );
  });

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    try {
      // First delete all time registrations associated with this project
      const { error: timeRegError } = await supabase
        .from('time_registrations')
        .delete()
        .eq('project_id', projectId);

      if (timeRegError) {
        console.error('Error deleting time registrations:', timeRegError);
        throw timeRegError;
      }

      // Then delete the project
      await deleteProject(projectId);
      setDeleteConfirmProject(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      refetch();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Er is een fout opgetreden bij het verwijderen van het project.');
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    try {
      const result = await updateProject(projectId, { status: 'voltooid' });
      console.log('Archive result:', result);

      setShowModal(false);
      setEditingProject(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // Force refetch to update the lists
      await refetch();
    } catch (error) {
      console.error('Error archiving project:', error);
      alert('Er is een fout opgetreden bij het archiveren van het project.');
    }
  };

  const handleUnarchiveProject = async (projectId: string) => {
    try {
      const result = await updateProject(projectId, { status: 'actief' });
      console.log('Unarchive result:', result);

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // Force refetch to update the lists
      await refetch();
    } catch (error) {
      console.error('Error unarchiving project:', error);
      alert('Er is een fout opgetreden bij het herstellen van het project.');
    }
  };

  const handleExportInvoice = async (project: any) => {
    try {
      // Get invoice settings
      const { data: invoiceSettings } = await supabase
        .from('invoice_settings')
        .select('*')
        .maybeSingle();

      if (!invoiceSettings) {
        alert('Configureer eerst je factuurinstellingen voordat je facturen kunt exporteren.');
        return;
      }

      // Get time registrations for this project
      const projectRegistrations = urenRegistraties.filter(
        (reg: any) => reg.project_id === project.id
      );

      const totalHours = projectRegistrations.reduce(
        (sum: number, reg: any) => sum + parseFloat(reg.aantal_uren || 0), 0
      );

      // Create invoice data
      const invoiceNumber = `${invoiceSettings.invoice_prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const today = new Date().toLocaleDateString('nl-NL');
      const dueDate = new Date(Date.now() + invoiceSettings.payment_terms_days * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL');

      // Generate HTML for the invoice
      const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Factuur ${invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { max-height: 60px; }
    .company-info { text-align: right; }
    .invoice-title { font-size: 28px; font-weight: bold; color: #DC2626; margin-bottom: 20px; }
    .invoice-details { margin-bottom: 30px; }
    .project-info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .table th { background: #f5f5f5; font-weight: bold; }
    .totals { text-align: right; margin-top: 20px; }
    .total-row { font-size: 18px; font-weight: bold; color: #DC2626; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    .bank-info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${invoiceSettings.logo_url ? `<img src="${invoiceSettings.logo_url}" alt="Logo" class="logo" />` : ''}
      <h1 style="margin: 0;">${invoiceSettings.company_name}</h1>
      <p style="margin: 5px 0; font-size: 12px;">
        ${invoiceSettings.address_street}<br>
        ${invoiceSettings.address_zip} ${invoiceSettings.address_city}<br>
        ${invoiceSettings.phone}<br>
        ${invoiceSettings.email}
      </p>
    </div>
    <div class="company-info">
      <div class="invoice-title">FACTUUR</div>
      <p>
        <strong>Factuurnummer:</strong> ${invoiceNumber}<br>
        <strong>Factuurdatum:</strong> ${today}<br>
        <strong>Vervaldatum:</strong> ${dueDate}
      </p>
    </div>
  </div>

  <div class="project-info">
    <h3 style="margin-top: 0;">Projectgegevens</h3>
    <p>
      <strong>Project:</strong> ${project.naam}<br>
      <strong>Locatie:</strong> ${project.locatie || 'N.v.t.'}<br>
      <strong>Omschrijving:</strong> ${project.beschrijving || 'Geen omschrijving'}
    </p>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Omschrijving</th>
        <th>Aantal</th>
        <th>Eenheid</th>
        <th style="text-align: right;">Bedrag</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Gewerkte uren - ${project.naam}</td>
        <td>${totalHours.toFixed(2)}</td>
        <td>uur</td>
        <td style="text-align: right;">Op aanvraag</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <p><strong>Subtotaal:</strong> Op aanvraag</p>
    <p><strong>BTW (21%):</strong> Op aanvraag</p>
    <p class="total-row"><strong>Totaal:</strong> Op aanvraag</p>
  </div>

  <div class="bank-info">
    <strong>Betalingsgegevens</strong><br>
    IBAN: ${invoiceSettings.iban}<br>
    KVK: ${invoiceSettings.kvk_number}<br>
    BTW: ${invoiceSettings.btw_number}
  </div>

  <div class="footer">
    ${invoiceSettings.invoice_footer}
  </div>
</body>
</html>
      `;

      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error exporting invoice:', error);
      alert('Er is een fout opgetreden bij het exporteren van de factuur.');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Quick action definitions
  const quickActions = [
    {
      id: 'new-project',
      title: 'Nieuw Project',
      description: 'Maak een nieuw project aan',
      icon: <Plus className="h-6 w-6" />,
      color: 'from-red-500 to-rose-600',
      onClick: handleNewProject
    },
    {
      id: 'search',
      title: 'Project Zoeken',
      description: 'Zoek in je projecten',
      icon: <Search className="h-6 w-6" />,
      color: 'from-blue-500 to-indigo-600',
      onClick: () => document.getElementById('project-search')?.focus()
    },
    {
      id: 'active',
      title: 'Actieve Projecten',
      description: `${projecten.filter((p: any) => p.status === 'actief').length} projecten`,
      icon: <Layers className="h-6 w-6" />,
      color: 'from-emerald-500 to-teal-600',
      onClick: () => setSearchTerm('')
    },
    {
      id: 'archive',
      title: 'Archief',
      description: `${archivedProjecten.length} gearchiveerd`,
      icon: <Archive className="h-6 w-6" />,
      color: 'from-gray-500 to-slate-600',
      onClick: () => setShowArchive(true)
    }
  ];

  return (
    <div className="space-y-6">
      {showSuccessMessage && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {t('projectOpgeslagen')}
        </div>
      )}

      <SupabaseErrorHelper
        error={lastError}
        table="projects"
        operation="INSERT"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2 sm:gap-3`}>
            <FolderOpen className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
            {t('projecten')}
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Beheer al je projecten op één plek</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all hover:scale-105 hover:shadow-xl ${
              isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
            } shadow-md border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
              {action.icon}
            </div>
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{action.title}</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{action.description}</p>
          </button>
        ))}
      </div>

      {/* Projecten Overview */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('projectOverzicht')}</h2>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('beheerProjecten')}</p>
        </div>

        {/* Search Bar (Only for Admins and Kantoor) */}
        {hasPermission('view_reports') && projecten.length > 0 && (
          <div className="px-6 pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                id="project-search"
                type="text"
                placeholder="Zoek project op naam of beschrijving..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            {searchTerm && (
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {filteredProjecten.length} {filteredProjecten.length === 1 ? 'project gevonden' : 'projecten gevonden'}
              </p>
            )}
          </div>
        )}

        <div className="p-6">
          {projecten.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">{t('geenProjecten')}</p>
              <p className="text-gray-400 text-sm mt-2">
                {t('voegProjectToe')}
              </p>
              <button
                onClick={handleNewProject}
                className="mt-4 flex items-center space-x-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Plus size={16} />
                <span>{t('nieuwProject')}</span>
              </button>
            </div>
          ) : filteredProjecten.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Geen projecten gevonden</p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Probeer een andere zoekterm
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjecten.map((project) => {
                const projectUsers = getProjectUsers(project.id);
                const totalHours = getTotalLoggedHours(project.id);
                const totalKm = getTotalKilometers(project.id);
                const incomplete = isProjectIncomplete(project);
                const isExpanded = expandedProjects.has(project.id);

                return (
                  <div
                    key={project.id}
                    className={`rounded-xl overflow-hidden transition-all duration-200 ${
                      incomplete
                        ? (isDark ? 'bg-red-900/20 border border-red-500/50' : 'bg-red-50 border border-red-200')
                        : (isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100')
                    }`}
                  >
                    {/* Main Row - Always Visible */}
                    <button
                      onClick={() => toggleProjectExpanded(project.id)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Status Indicator */}
                        <div className={`w-2 h-10 rounded-full flex-shrink-0 ${
                          project.status === 'actief' ? 'bg-green-500' :
                          project.status === 'voltooid' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`} />

                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>{project.naam}</h3>
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                              project.status === 'actief' ? 'bg-green-100 text-green-700' :
                              project.status === 'voltooid' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {t(project.status)}
                            </span>
                            {incomplete && (
                              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                ⚠️ Incompleet
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm flex-wrap">
                            {project.locatie && (
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <MapPin size={12} />
                                {project.locatie}
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Clock size={12} />
                              {totalHours.toFixed(1)}h
                            </span>
                            <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Calendar size={12} />
                              {formatDate(project.start_datum)}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar - Desktop */}
                        {project.progress_percentage > 0 && (
                          <div className="hidden sm:flex items-center gap-2 w-32 flex-shrink-0">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress_percentage}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium w-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{project.progress_percentage}%</span>
                          </div>
                        )}
                      </div>

                      {/* Expand Icon */}
                      <div className={`ml-4 p-2 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                        {isExpanded ? (
                          <ChevronUp className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        ) : (
                          <ChevronDown className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className={`px-5 pb-5 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column - Details */}
                          <div className="space-y-4">
                            <div>
                              <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Beschrijving</h4>
                              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{project.beschrijving || 'Geen beschrijving'}</p>
                            </div>

                            {/* Progress Bar - Mobile */}
                            {project.progress_percentage > 0 && (
                              <div className="sm:hidden">
                                <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Voortgang</h4>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${project.progress_percentage}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{project.progress_percentage}%</span>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Totaal Uren</div>
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalHours.toFixed(1)}h</div>
                              </div>
                              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Kilometers</div>
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalKm.toFixed(0)} km</div>
                              </div>
                            </div>

                            <ProtectedRoute permission="view_reports">
                              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Medewerkers ({projectUsers.length})</div>
                                {projectUsers.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {projectUsers.slice(0, 5).map((userInfo, idx) => (
                                      <span key={idx} className={`inline-flex px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                        {userInfo.naam}
                                      </span>
                                    ))}
                                    {projectUsers.length > 5 && (
                                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                        +{projectUsers.length - 5} meer
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Geen medewerkers</span>
                                )}
                              </div>
                            </ProtectedRoute>
                          </div>

                          {/* Right Column - Actions */}
                          <div className="space-y-3">
                            <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Acties</h4>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProjectForDetails(project);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'
                              } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                            >
                              <Eye size={18} className="text-red-500" />
                              <span className="font-medium">Bekijk volledige details</span>
                            </button>

                            <ProtectedRoute permission="manage_settings">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportInvoice(project);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                  isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'
                                } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                              >
                                <FileText size={18} className="text-violet-500" />
                                <span className="font-medium">Factuur exporteren</span>
                              </button>
                            </ProtectedRoute>

                            <ProtectedRoute permission="manage_projects">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProject(project);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                  isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'
                                } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                              >
                                <Pencil size={18} className="text-blue-500" />
                                <span className="font-medium">Project bewerken</span>
                              </button>
                            </ProtectedRoute>

                            <ProtectedRoute permission="manage_projects">
                              {project.status === 'actief' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Weet je zeker dat je dit project wilt archiveren?')) {
                                      handleArchiveProject(project.id);
                                    }
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'
                                  } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                                >
                                  <Archive size={18} className="text-green-500" />
                                  <span className="font-medium">Archiveren</span>
                                </button>
                              )}
                            </ProtectedRoute>

                            <ProtectedRoute permission="manage_projects">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Weet je zeker dat je dit project wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
                                    handleDeleteProject(project.id);
                                  }
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-500 ${
                                  isDark ? 'bg-gray-800 hover:bg-red-900/30' : 'bg-white hover:bg-red-50'
                                } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                              >
                                <Trash2 size={18} />
                                <span className="font-medium">Verwijderen</span>
                              </button>
                            </ProtectedRoute>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* New Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProject ? t('editProject') : t('nieuwProject')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('projectNaam')} *</label>
            <input
              type="text"
              name="naam"
              value={formData.naam}
              onChange={handleInputChange}
              required
              placeholder="Bijv. Renovatie kantoorpand"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('locatie')} *</label>
              <input
                type="text"
                name="locatie"
                value={formData.locatie}
                onChange={handleInputChange}
                required
                placeholder="Bijv. Amsterdam, Noord-Holland"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('startDatum')} *</label>
              <div className="relative">
                <input
                  type="date"
                  name="startDatum"
                  value={formData.startDatum}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('projectStatus')} *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="actief">{t('actief')}</option>
              <option value="gepauzeerd">{t('gepauzeerd')}</option>
              <option value="voltooid">{t('voltooid')}</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Voortgang (%)</label>
            <input
              type="number"
              name="progressPercentage"
              value={formData.progressPercentage}
              onChange={handleInputChange}
              min="0"
              max="100"
              placeholder="0-100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{t('optioneelGeefAanHoeveelProcent')}</p>
          </div>


          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('projectBeschrijving')} *</label>
            <textarea
              name="beschrijving"
              value={formData.beschrijving}
              onChange={handleInputChange}
              rows={4}
              required
              placeholder={t('beschrijfProject')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            {editingProject && editingProject.status === 'actief' && hasPermission('manage_projects') && (
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Weet je zeker dat je dit project wilt voltooien en archiveren? Het project komt niet meer voor bij urenregistratie.')) {
                    await handleArchiveProject(editingProject.id);
                  }
                }}
                className="w-full px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Archive size={18} />
                <span>Voltooien en Archiveren</span>
              </button>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('annuleren')}
              </button>
              <button
                type="submit"
                disabled={mutationLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {mutationLoading ? 'Opslaan...' : t('opslaan')}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmProject && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmProject(null)}
          title="Project Verwijderen"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Weet je zeker dat je dit project wilt verwijderen?
              </p>
              <p className={`${isDark ? 'text-red-400' : 'text-red-600'} font-medium text-sm`}>
                Let op: Alle urenregistraties die aan dit project gekoppeld zijn worden ook permanent verwijderd. Deze actie kan niet ongedaan worden gemaakt.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmProject(null)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirmProject)}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Project Details Modal */}
      {selectedProjectForDetails && (
        <ProjectDetailsModal
          isOpen={true}
          onClose={() => setSelectedProjectForDetails(null)}
          project={selectedProjectForDetails}
          totalHours={getTotalLoggedHours(selectedProjectForDetails.id)}
          projectUsers={getProjectUsers(selectedProjectForDetails.id)}
          projectRegistrations={getProjectRegistrations(selectedProjectForDetails.id)}
          onEdit={() => {
            handleEditProject(selectedProjectForDetails);
            setSelectedProjectForDetails(null);
          }}
          onDelete={() => {
            setDeleteConfirmProject(selectedProjectForDetails.id);
            setSelectedProjectForDetails(null);
          }}
          gebruikers={gebruikers}
          hasEditPermission={hasPermission('manage_projects')}
        />
      )}

      {/* Archive Modal */}
      <Modal
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        title="Projecten Archief"
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek in gearchiveerde projecten..."
              value={archiveSearchTerm}
              onChange={(e) => setArchiveSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {archivedProjecten.filter((project: any) => {
            if (!archiveSearchTerm.trim()) return true;
            const searchLower = archiveSearchTerm.toLowerCase();
            return (
              project.naam?.toLowerCase().includes(searchLower) ||
              project.beschrijving?.toLowerCase().includes(searchLower)
            );
          }).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {archiveSearchTerm ? 'Geen gearchiveerde projecten gevonden met deze zoekopdracht' : 'Geen gearchiveerde projecten gevonden'}
            </p>
          ) : (
            <div className="max-h-[600px] overflow-y-auto space-y-4">
              {archivedProjecten.filter((project: any) => {
                if (!archiveSearchTerm.trim()) return true;
                const searchLower = archiveSearchTerm.toLowerCase();
                return (
                  project.naam?.toLowerCase().includes(searchLower) ||
                  project.beschrijving?.toLowerCase().includes(searchLower)
                );
              }).map((project: any) => {
                const totalHours = getTotalLoggedHours(project.id);
                const totalKm = getTotalKilometers(project.id);
                const projectUsers = getProjectUsers(project.id);
                const materials = getProjectMaterials(project.id);
                const inventoryEnabled = systemSettings.find((s: any) => s.module_name === 'voorraad')?.is_enabled;

                return (
                  <div
                    key={project.id}
                    className={`border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition-shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} text-lg`}>{project.naam}</h3>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          project.status === 'voltooid'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {project.status === 'voltooid' ? t('voltooid') : t('gepauzeerd')}
                      </span>
                    </div>

                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>{project.beschrijving}</p>

                    {/* Project Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Start datum</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(project.start_datum)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Totaal uren</p>
                          <p className="text-sm font-medium text-gray-900">{totalHours.toFixed(1)}h</p>
                        </div>
                      </div>
                      {totalKm > 0 && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">Kilometers</p>
                            <p className="text-sm font-medium text-gray-900">{totalKm.toFixed(1)} km</p>
                          </div>
                        </div>
                      )}
                      <ProtectedRoute permission="view_reports">
                        <div className="flex items-center space-x-2">
                          <Users size={16} className="text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Medewerkers</p>
                            <p className="text-sm font-medium text-gray-900">{projectUsers.length}</p>
                          </div>
                        </div>
                      </ProtectedRoute>
                    </div>

                    {/* Materials Used */}
                    {inventoryEnabled && materials.length > 0 && (
                      <div className="mb-4 border-t pt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Gebruikte materialen:</h4>
                        <div className="space-y-1">
                          {materials.slice(0, 3).map((material: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-gray-600">{material.product_name}</span>
                              <span className="text-gray-900 font-medium">{material.quantity} {material.unit}</span>
                            </div>
                          ))}
                          {materials.length > 3 && (
                            <p className="text-xs text-gray-500 italic">+ {materials.length - 3} meer...</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => {
                          setSelectedProjectForDetails(project);
                          setShowArchive(false);
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center justify-center space-x-1"
                      >
                        <Eye size={16} />
                        <span>Details</span>
                      </button>
                      <ProtectedRoute permission="manage_projects">
                        <button
                          onClick={() => {
                            if (window.confirm('Weet je zeker dat je dit project wilt terugzetten naar actief?')) {
                              handleUnarchiveProject(project.id);
                            }
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                        >
                          <Archive size={16} />
                          <span>Heractiveren</span>
                        </button>
                      </ProtectedRoute>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Projecten;