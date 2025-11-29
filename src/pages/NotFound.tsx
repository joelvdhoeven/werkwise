import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className={`text-[150px] font-bold leading-none ${isDark ? 'text-gray-800' : 'text-gray-200'}`}>
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl">?</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Pagina niet gevonden
        </h2>
        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isDark
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
            Ga terug
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg"
          >
            <Home className="h-5 w-5" />
            Ga naar homepage
          </button>
        </div>

        {/* Extra Help */}
        <p className={`mt-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Hulp nodig? Neem contact op via{' '}
          <a href="mailto:support@werkwise.nl" className="text-red-500 hover:underline">
            support@werkwise.nl
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
