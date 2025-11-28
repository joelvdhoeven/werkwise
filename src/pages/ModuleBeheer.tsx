import React, { useState, useEffect } from 'react';
import { Package, Settings as SettingsIcon, Save, Database, PlayCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { seedMockData, mockUserCredentials } from '../utils/seedMockData';

const ModuleBeheer: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [seedingData, setSeedingData] = useState(false);
  const [seedResults, setSeedResults] = useState<{ success: string[]; errors: string[] } | null>(null);

  const [moduleSettings, setModuleSettings] = useState<{
    module_invoicing: boolean;
    module_hourly_rates: boolean;
    module_damage_reports: boolean;
    module_inventory: boolean;
    module_notifications: boolean;
    module_email_notifications: boolean;
    module_time_registration: boolean;
    module_special_tools: boolean;
    module_financial_dashboard: boolean;
    csv_separator: ',' | ';';
  }>({
    module_invoicing: true,
    module_hourly_rates: true,
    module_damage_reports: true,
    module_inventory: true,
    module_notifications: true,
    module_email_notifications: true,
    module_time_registration: true,
    module_special_tools: true,
    module_financial_dashboard: true,
    csv_separator: ';',
  });

  useEffect(() => {
    loadModuleSettings();
  }, []);

  const loadModuleSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const csvSeparator = data.csv_separator === ',' || data.csv_separator === ';'
          ? data.csv_separator
          : ';';

        setModuleSettings({
          module_invoicing: data.module_invoicing,
          module_hourly_rates: data.module_hourly_rates,
          module_damage_reports: data.module_damage_reports,
          module_inventory: data.module_inventory,
          module_notifications: data.module_notifications,
          module_email_notifications: data.module_email_notifications,
          module_time_registration: data.module_time_registration,
          module_special_tools: data.module_special_tools,
          module_financial_dashboard: data.module_financial_dashboard,
          csv_separator: csvSeparator,
        });
      }
    } catch (error) {
      console.error('Error loading module settings:', error);
    }
  };

  const saveModuleSettings = async () => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          ...moduleSettings,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;

      setSuccessMessage('Module instellingen opgeslagen!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reload de pagina om menu items te updaten
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error saving module settings:', error);
      setErrorMessage('Fout bij het opslaan van instellingen');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleSeedData = async () => {
    if (seedingData) return;

    const confirmed = window.confirm(
      'Dit zal demo data aanmaken in de database:\n\n' +
      '- 5 gebruikers (admin, kantoorpersoneel, medewerkers, zzper)\n' +
      '- Projecten, urenregistraties, voorraad\n' +
      '- Schademeldingen, tickets, notificaties\n' +
      '- Vakantieaanvragen en meer\n\n' +
      'Weet je zeker dat je door wilt gaan?'
    );

    if (!confirmed) return;

    setSeedingData(true);
    setSeedResults(null);

    try {
      const results = await seedMockData();
      setSeedResults(results);

      if (results.errors.length === 0) {
        setSuccessMessage('Demo data succesvol aangemaakt!');
      } else if (results.success.length > 0) {
        setSuccessMessage(`Demo data aangemaakt met ${results.errors.length} waarschuwingen`);
      } else {
        setErrorMessage('Er zijn fouten opgetreden bij het aanmaken van demo data');
      }
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Error seeding data:', error);
      setErrorMessage('Fout bij het aanmaken van demo data: ' + error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSeedingData(false);
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

      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Systeeminstellingen</h1>
      </div>

      <div className="space-y-6">
        <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-red-600" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Module Beheer</h2>
          </div>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Schakel modules in of uit. Uitgeschakelde modules worden verborgen in de navigatie en zijn niet toegankelijk.
          </p>

          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Financieel Dashboard</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Inzicht in omzet, kosten, winst en statistieken</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleSettings.module_financial_dashboard}
                  onChange={(e) => setModuleSettings({ ...moduleSettings, module_financial_dashboard: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Urenregistratie</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Registreer gewerkte uren op projecten</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleSettings.module_time_registration}
                  onChange={(e) => setModuleSettings({ ...moduleSettings, module_time_registration: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Voorraadbeheer</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Beheer voorraad en boek materiaal af</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleSettings.module_inventory}
                  onChange={(e) => setModuleSettings({ ...moduleSettings, module_inventory: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Schademeldingen</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Registreer en beheer schademeldingen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleSettings.module_damage_reports}
                  onChange={(e) => setModuleSettings({ ...moduleSettings, module_damage_reports: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Speciaal Gereedschap</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Beheer speciaal gereedschap en onderhoud</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleSettings.module_special_tools}
                  onChange={(e) => setModuleSettings({ ...moduleSettings, module_special_tools: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Factuur Generatie</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Genereer facturen vanuit projecten</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleSettings.module_invoicing}
                  onChange={(e) => setModuleSettings({ ...moduleSettings, module_invoicing: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Uurtarieven Instellingen</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Beheer uurtarieven voor medewerkers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleSettings.module_hourly_rates}
                  onChange={(e) => setModuleSettings({ ...moduleSettings, module_hourly_rates: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Meldingen</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Systeem meldingen en beheer</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleSettings.module_notifications}
                  onChange={(e) => setModuleSettings({ ...moduleSettings, module_notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>E-mail Notificaties</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Automatische e-mail notificaties</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleSettings.module_email_notifications}
                  onChange={(e) => setModuleSettings({ ...moduleSettings, module_email_notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              </label>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon size={20} className="text-red-600" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>CSV Export/Import Instellingen</h2>
          </div>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Kies het scheidingsteken voor CSV bestanden. Puntkomma (;) werkt het beste voor Excel in Europa.
          </p>

          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>CSV Scheidingsteken</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {moduleSettings.csv_separator === ';'
                    ? 'Puntkomma (;) - Aanbevolen voor Excel'
                    : 'Komma (,) - Standaard CSV format'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setModuleSettings({ ...moduleSettings, csv_separator: ';' })}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    moduleSettings.csv_separator === ';'
                      ? 'bg-red-600 text-white'
                      : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Puntkomma (;)
                </button>
                <button
                  onClick={() => setModuleSettings({ ...moduleSettings, csv_separator: ',' })}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    moduleSettings.csv_separator === ','
                      ? 'bg-red-600 text-white'
                      : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Komma (,)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Data Section */}
        <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Database size={20} className="text-red-600" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Demo Data</h2>
          </div>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Genereer demo data om de applicatie te testen. Dit maakt gebruikers, projecten, urenregistraties, voorraad en meer aan.
          </p>

          <div className="space-y-4">
            <div className={`p-4 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Demo Accounts</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    De volgende accounts worden aangemaakt (wachtwoord: demowerkwise):
                  </p>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {mockUserCredentials.map((user, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          user.role === 'admin'
                            ? isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                            : user.role === 'kantoorpersoneel'
                              ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                              : user.role === 'zzper'
                                ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                                : isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                        <span>{user.naam}</span>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>({user.email})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={handleSeedData}
                  disabled={seedingData}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    seedingData
                      ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                  }`}
                >
                  {seedingData ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Bezig...</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle size={16} />
                      <span>Demo Data Aanmaken</span>
                    </>
                  )}
                </button>
              </div>

              {/* Results Section */}
              {seedResults && (
                <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Resultaten:</p>
                  {seedResults.success.length > 0 && (
                    <div className="mb-2">
                      <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        Succesvol: {seedResults.success.length} items
                      </p>
                    </div>
                  )}
                  {seedResults.errors.length > 0 && (
                    <div>
                      <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        Fouten: {seedResults.errors.length}
                      </p>
                      <ul className={`text-xs mt-1 space-y-1 max-h-32 overflow-y-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {seedResults.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {seedResults.errors.length > 5 && (
                          <li>... en {seedResults.errors.length - 5} meer</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={saveModuleSettings}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-md hover:from-red-700 hover:to-rose-700 transition-colors"
          >
            <Save size={16} />
            <span>Instellingen Opslaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleBeheer;
