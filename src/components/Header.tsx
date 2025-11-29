import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Bell, Menu, Rocket, Package, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ui/theme-toggle';
import { Language, Notification } from '../types';
import { useSupabaseQuery } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onNotificationClick: () => void;
  onMenuClick: () => void;
}

interface LowStockItem {
  product_name: string;
  location_name: string;
  current_stock: number;
  minimum_stock: number;
}

interface VacationRequest {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  profiles?: { naam: string };
}

const Header: React.FC<HeaderProps> = ({ onNotificationClick, onMenuClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, hasPermission } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [pendingVacations, setPendingVacations] = useState<VacationRequest[]>([]);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  ];

  // Fetch unread notifications count
  const { data: unreadNotifications = [] } = useSupabaseQuery<Notification>(
    'notifications',
    'id', // Only fetch ID for count
    { recipient_id: user?.id, status: 'unread' }
  );

  // Fetch low stock alerts (for admins)
  useEffect(() => {
    const fetchLowStock = async () => {
      if (!hasPermission('manage_settings')) return;

      try {
        const { data: stockData, error } = await supabase
          .from('stock')
          .select(`
            quantity,
            product:product_id(name, minimum_stock),
            location:location_id(name)
          `);

        if (error) throw error;

        const lowStock: LowStockItem[] = [];
        for (const item of stockData || []) {
          const product = item.product as any;
          const location = item.location as any;
          if (product && item.quantity < product.minimum_stock) {
            lowStock.push({
              product_name: product.name,
              location_name: location?.name || 'Onbekend',
              current_stock: item.quantity,
              minimum_stock: product.minimum_stock
            });
          }
        }
        setLowStockItems(lowStock);
      } catch (error) {
        console.error('Error fetching low stock:', error);
      }
    };

    fetchLowStock();
    const interval = setInterval(fetchLowStock, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [hasPermission]);

  // Fetch pending vacation requests (for admins)
  useEffect(() => {
    const fetchPendingVacations = async () => {
      if (!hasPermission('manage_settings')) return;

      try {
        const { data, error } = await supabase
          .from('vacation_requests')
          .select(`
            id,
            type,
            start_date,
            end_date,
            profiles:user_id(naam)
          `)
          .eq('status', 'pending');

        if (error) throw error;
        setPendingVacations(data || []);
      } catch (error) {
        console.error('Error fetching vacation requests:', error);
      }
    };

    fetchPendingVacations();
    const interval = setInterval(fetchPendingVacations, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [hasPermission]);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return t('administrator');
      case 'kantoorpersoneel':
        return t('officeStaff');
      case 'medewerker':
        return t('employee');
      case 'zzper':
        return t('contractor');
      default:
        return role;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`px-4 md:px-6 py-4 border-b transition-colors ${
      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    }`}>
      <div className="flex justify-between items-center">
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-xl transition-colors ${
            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
          aria-label="Open menu"
        >
          <Menu size={24} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
        </button>
        <div className="flex-1 lg:flex-none"></div>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* CTA Button */}
          <Link
            to="/onboarding"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all group"
          >
            <Rocket className="h-4 w-4 group-hover:animate-bounce" />
            <span className="hidden lg:inline">Probeer 31 dagen gratis!</span>
            <span className="lg:hidden">Gratis proberen</span>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Selector */}
          <div className="relative group">
            <button className={`flex items-center space-x-1 md:space-x-2 text-sm transition-colors px-3 py-2 rounded-xl ${
              isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}>
              <span className="text-base">{currentLanguage.flag}</span>
              <span className="hidden md:inline font-medium">{currentLanguage.name}</span>
              <ChevronDown size={16} className={`hidden md:inline ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </button>
            <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 overflow-hidden ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
            }`}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-colors ${
                    language === lang.code
                      ? isDark
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-red-50 text-red-600'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Admin Alerts (Low Stock + Vacation Requests) */}
          {hasPermission('manage_settings') && (lowStockItems.length > 0 || pendingVacations.length > 0) && (
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className={`relative p-2 rounded-xl transition-colors ${
                  isDark
                    ? 'text-orange-400 hover:text-orange-300 hover:bg-gray-800'
                    : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                }`}
              >
                <Package size={20} />
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full min-w-[18px]">
                  {lowStockItems.length + pendingVacations.length}
                </span>
              </button>

              {showAlertsDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowAlertsDropdown(false)}
                  />
                  <div className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl shadow-lg z-50 ${
                    isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
                  }`}>
                    {/* Low Stock Section */}
                    {lowStockItems.length > 0 && (
                      <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Package size={16} className="text-orange-500" />
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Lage Voorraad ({lowStockItems.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {lowStockItems.slice(0, 5).map((item, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded-lg text-xs ${
                                isDark ? 'bg-orange-900/30 text-orange-200' : 'bg-orange-50 text-orange-800'
                              }`}
                            >
                              <div className="font-medium">{item.product_name}</div>
                              <div className={isDark ? 'text-orange-300/70' : 'text-orange-600'}>
                                {item.location_name}: {item.current_stock} / {item.minimum_stock} min
                              </div>
                            </div>
                          ))}
                          {lowStockItems.length > 5 && (
                            <div className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              +{lowStockItems.length - 5} meer...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Vacation Requests Section */}
                    {pendingVacations.length > 0 && (
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={16} className="text-blue-500" />
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Verlofaanvragen ({pendingVacations.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {pendingVacations.slice(0, 5).map((request) => (
                            <div
                              key={request.id}
                              className={`p-2 rounded-lg text-xs ${
                                isDark ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-50 text-blue-800'
                              }`}
                            >
                              <div className="font-medium">{request.profiles?.naam || 'Onbekend'}</div>
                              <div className={isDark ? 'text-blue-300/70' : 'text-blue-600'}>
                                {request.type}: {new Date(request.start_date).toLocaleDateString('nl-NL')} - {new Date(request.end_date).toLocaleDateString('nl-NL')}
                              </div>
                            </div>
                          ))}
                          {pendingVacations.length > 5 && (
                            <div className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              +{pendingVacations.length - 5} meer...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notification Bell */}
          <button
            onClick={onNotificationClick}
            className={`relative p-2 rounded-xl transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Bell size={20} />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-full min-w-[20px]">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* User Info */}
          <div className={`hidden md:flex items-center space-x-3 pl-3 border-l ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.naam}
                className="w-9 h-9 rounded-xl object-cover"
              />
            ) : (
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <span className={`font-semibold text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {user?.naam?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{user?.naam}</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{user ? getRoleDisplayName(user.role) : ''}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-2 text-sm px-3 py-2 rounded-xl transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <LogOut size={18} />
            <span className="hidden md:inline font-medium">{t('uitloggen')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
