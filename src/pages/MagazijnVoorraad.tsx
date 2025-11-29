import React from 'react';
import { Package, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const MagazijnVoorraad: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Package className={`h-16 w-16 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {t('magazijnVoorraad')}
          </h1>

          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
            <Clock className="h-4 w-4 mr-2" />
            {t('comingSoon')}
          </div>

          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('comingSoonMessage')}
          </p>

          <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Geplande functies:
            </h3>
            <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>• Voorraad beheer</li>
              <li>• Barcode scanning</li>
              <li>• Automatische bestellingen</li>
              <li>• Rapportages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagazijnVoorraad;