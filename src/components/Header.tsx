import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Bell, Menu, Rocket } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ui/theme-toggle';
import { Language } from '../types';
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
  user_id: string;
  type: string;
  start_date: string;
  end_date: string;
  user_naam?: string;
}

const Header: React.FC<HeaderProps> = ({ onNotificationClick, onMenuClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, hasPermission } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [pendingVacations, setPendingVacations] = useState<VacationRequest[]>([]);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  ];

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
        // First get vacation requests
        const { data: vacationData, error: vacationError } = await supabase
          .from('vacation_requests')
          .select('id, user_id, type, start_date, end_date')
          .eq('status', 'pending');

        if (vacationError) throw vacationError;

        if (!vacationData || vacationData.length === 0) {
          setPendingVacations([]);
          return;
        }

        // Get unique user IDs and fetch their names
        const userIds = [...new Set(vacationData.map(v => v.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, naam')
          .in('id', userIds);

        const userNameMap: Record<string, string> = {};
        profilesData?.forEach(p => {
          userNameMap[p.id] = p.naam || 'Onbekend';
        });

        // Combine the data
        const enrichedData = vacationData.map(v => ({
          ...v,
          user_naam: userNameMap[v.user_id] || 'Onbekend'
        }));

        setPendingVacations(enrichedData);
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

          {/* Notification Bell - Shows total alerts count */}
          <button
            onClick={onNotificationClick}
            className={`relative p-2 rounded-xl transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Bell size={20} />
            {(lowStockItems.length + pendingVacations.length) > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-full min-w-[20px]">
                {lowStockItems.length + pendingVacations.length}
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
