import React from 'react';
import { ChevronDown, LogOut, Globe, Bell, Menu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Language, Notification } from '../types';
import { useSupabaseQuery } from '../hooks/useSupabase';

interface HeaderProps {
  onNotificationClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNotificationClick, onMenuClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

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
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-4">
      <div className="flex justify-between items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} className="text-gray-600" />
        </button>
        <div className="flex-1 lg:flex-none"></div>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center space-x-1 md:space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-xl hover:bg-gray-50">
              <span className="text-base">{currentLanguage.flag}</span>
              <span className="hidden md:inline font-medium">{currentLanguage.name}</span>
              <ChevronDown size={16} className="hidden md:inline text-gray-400" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                    language === lang.code ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Bell size={20} />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full min-w-[20px]">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* User Info */}
          <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.naam}
                className="w-9 h-9 rounded-xl object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-sm">
                  {user?.naam?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">{user?.naam}</span>
              <span className="text-xs text-gray-500">{user ? getRoleDisplayName(user.role) : ''}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors"
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
