import React, { useEffect, useState } from 'react';
import {
  Home,
  Clock,
  Wrench,
  FolderOpen,
  AlertTriangle,
  Users,
  Settings,
  X,
  Package,
  FileText,
  TrendingUp,
  Ticket,
  ChevronDown,
  LayoutDashboard,
  Briefcase,
  BoxesIcon,
  MessageSquare,
  Shield,
  Sliders
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  permission: string;
  module: string | null;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: any;
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, isOpen, onClose }) => {
  const { t } = useLanguage();
  const { hasPermission, profile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [moduleSettings, setModuleSettings] = useState<any>(null);

  // Check if user is a simple user (medewerker/zzper) - they get flat menu without dropdowns
  const isSimpleUser = profile?.role === 'medewerker' || profile?.role === 'zzper';

  // Load expanded groups from localStorage, default to overzicht and werk
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem('sidebar_expanded_groups');
    return saved ? JSON.parse(saved) : ['overzicht', 'werk'];
  });

  // Save expanded groups to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sidebar_expanded_groups', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  useEffect(() => {
    loadModuleSettings();

    // Subscribe to changes
    const subscription = supabase
      .channel('system_settings_sidebar')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_settings'
      }, () => {
        loadModuleSettings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadModuleSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('*')
        .maybeSingle();

      setModuleSettings(data || {
        module_invoicing: true,
        module_hourly_rates: true,
        module_damage_reports: true,
        module_inventory: true,
        module_notifications: true,
        module_email_notifications: true,
        module_time_registration: true,
        module_special_tools: true,
        module_financial_dashboard: true,
      });
    } catch (error) {
      console.error('Error loading module settings:', error);
    }
  };

  // Define menu groups with their items
  const menuGroups: MenuGroup[] = [
    {
      id: 'overzicht',
      label: 'Overzicht',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: Home, permission: 'view_dashboard', module: null },
        { id: 'financieel-dashboard', label: 'Financieel Dashboard', icon: TrendingUp, permission: 'manage_settings', module: 'module_financial_dashboard' },
      ]
    },
    {
      id: 'werk',
      label: 'Werk',
      icon: Briefcase,
      items: [
        { id: 'projecten', label: t('projecten'), icon: FolderOpen, permission: 'view_projects', module: null },
        { id: 'urenregistratie', label: t('urenregistratie'), icon: Clock, permission: 'register_hours', module: 'module_time_registration' },
      ]
    },
    {
      id: 'voorraad',
      label: 'Voorraad & Gereedschap',
      icon: BoxesIcon,
      items: [
        { id: 'voorraad-afboeken', label: 'Voorraad Afboeken', icon: Package, permission: 'view_dashboard', module: 'module_inventory' },
        { id: 'voorraadbeheer', label: 'Voorraadbeheer', icon: Package, permission: 'manage_settings', module: 'module_inventory' },
        { id: 'speciaal-gereedschap', label: t('specialGereedschap'), icon: Wrench, permission: 'view_tools', module: 'module_special_tools' },
      ]
    },
    {
      id: 'meldingen',
      label: 'Meldingen & Support',
      icon: MessageSquare,
      items: [
        { id: 'schademeldingen', label: t('schademeldingen'), icon: AlertTriangle, permission: 'view_damage_reports', module: 'module_damage_reports' },
        { id: 'ticket-omgeving', label: 'Ticket Omgeving', icon: Ticket, permission: 'create_tickets', module: null },
        { id: 'tickets-overzicht', label: 'Tickets Overzicht', icon: Ticket, permission: 'view_all_tickets', module: null },
      ]
    },
    {
      id: 'beheer',
      label: 'Beheer',
      icon: Shield,
      items: [
        { id: 'gebruikers', label: t('gebruikers'), icon: Users, permission: 'manage_users', module: null },
        { id: 'factuur-instellingen', label: 'Factuur Instellingen', icon: FileText, permission: 'manage_settings', module: 'module_invoicing' },
        { id: 'module-beheer', label: 'Module Beheer', icon: Sliders, permission: 'manage_settings', module: null },
        { id: 'instellingen', label: t('instellingen'), icon: Settings, permission: 'view_dashboard', module: null },
      ]
    }
  ];

  // Filter items based on permissions and module settings
  const isItemVisible = (item: MenuItem) => {
    const hasPerms = hasPermission(item.permission);
    const moduleEnabled = !item.module || !moduleSettings || moduleSettings[item.module] !== false;
    return hasPerms && moduleEnabled;
  };

  // Filter groups to only show those with visible items
  const visibleGroups = menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(isItemVisible)
    }))
    .filter(group => group.items.length > 0);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Check if any item in a group is active
  const isGroupActive = (group: MenuGroup) => {
    return group.items.some(item => item.id === activeSection);
  };

  // Auto-expand group when an item in it becomes active
  useEffect(() => {
    const activeGroup = visibleGroups.find(group =>
      group.items.some(item => item.id === activeSection)
    );
    if (activeGroup && !expandedGroups.includes(activeGroup.id)) {
      setExpandedGroups(prev => [...prev, activeGroup.id]);
    }
  }, [activeSection]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 h-screen flex flex-col
        transform transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isDark ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-100'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                <span className="text-white font-bold">W</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
                  WerkWise
                </h1>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Workforce Management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`lg:hidden p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              aria-label="Close menu"
            >
              <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {isSimpleUser ? (
            /* Simple flat menu for medewerker/zzper */
            <ul className="space-y-1">
              {visibleGroups.flatMap(group => group.items).map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveSection(item.id);
                        onClose();
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25'
                          : isDark
                            ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={item.id === 'schademeldingen' && !isActive ? 'text-amber-500' : ''}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* Grouped dropdown menu for admin/kantoorpersoneel */
            <div className="space-y-2">
              {visibleGroups.map((group) => {
                const GroupIcon = group.icon;
                const isExpanded = expandedGroups.includes(group.id);
                const groupActive = isGroupActive(group);

                return (
                  <div key={group.id} className="space-y-1">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                        groupActive
                          ? isDark
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-red-50 text-red-700'
                          : isDark
                            ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <GroupIcon size={18} />
                        <span className="text-sm font-semibold">{group.label}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Group Items */}
                    <div
                      className={`overflow-hidden transition-all duration-200 ease-in-out ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <ul className="pl-4 space-y-1 pt-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeSection === item.id;
                          return (
                            <li key={item.id}>
                              <button
                                onClick={() => {
                                  setActiveSection(item.id);
                                  onClose();
                                }}
                                className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center space-x-3 transition-all ${
                                  isActive
                                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25'
                                    : isDark
                                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                              >
                                <Icon
                                  size={18}
                                  className={item.id === 'schademeldingen' && !isActive ? 'text-amber-500' : ''}
                                />
                                <span className="text-sm font-medium">{item.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className={`text-xs text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            © 2025 WerkWise
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
