import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Loader2, Users, User, Shield } from 'lucide-react';
import { useAgentAuth } from '../contexts/AgentAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { supabase } from '../lib/supabase';

type AgentRole = 'sales' | 'admin' | 'superuser' | 'manager';

const ROLE_OPTIONS: { value: AgentRole; label: string; description: string }[] = [
  { value: 'sales', label: 'Sales Agent', description: 'Standaard sales medewerker' },
  { value: 'manager', label: 'Manager', description: 'Sales team manager' },
  { value: 'admin', label: 'Admin', description: 'Beheertoegang tot alle functies' },
  { value: 'superuser', label: 'Superuser', description: 'Volledige systeemtoegang' },
];

const AgentLogin: React.FC = () => {
  const { login } = useAgentAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [naam, setNaam] = useState('');
  const [role, setRole] = useState<AgentRole>('sales');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vul alle velden in');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Inloggen mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!naam || !email || !password) {
      setError('Vul alle velden in');
      return;
    }

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters zijn');
      return;
    }

    setIsLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: naam,
            role: role
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Dit e-mailadres is al geregistreerd');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (authData.user) {
        // Create sales agent profile
        const { error: profileError } = await supabase.from('sales_agents').insert({
          auth_user_id: authData.user.id,
          email: email,
          naam: naam,
          role: role,
          commission_percentage: role === 'sales' ? 10 : 0,
          is_active: true
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // If profile creation fails, show error
          setError('Account aangemaakt maar profiel kon niet worden opgeslagen. Neem contact op met een admin.');
          return;
        }

        // Sign out so user can login fresh (prevents auth context error)
        await supabase.auth.signOut();

        setSuccess('Account aangemaakt! Je kunt nu inloggen.');
        setIsRegister(false);
        setNaam('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Registratie mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
      isDark
        ? 'bg-gray-950'
        : 'bg-gradient-to-br from-red-50 via-white to-rose-50'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-red-900/20' : 'bg-red-200/50'}`} />
        <div className={`absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-rose-900/20' : 'bg-rose-200/50'}`} />
        <div className={`absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl ${isDark ? 'bg-pink-900/10' : 'bg-pink-200/30'}`} />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Back to Home Link + Theme Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className={`inline-flex items-center space-x-2 transition-colors group ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Terug naar Home</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Login/Register Card */}
        <div className={`rounded-3xl shadow-2xl p-8 sm:p-10 border relative overflow-hidden ${
          isDark
            ? 'bg-gray-900 border-gray-800 shadow-red-500/5'
            : 'bg-white border-gray-100 shadow-gray-200/50'
        }`}>
          {/* Decorative gradient */}
          <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-70 ${isDark ? 'bg-red-500/10' : 'bg-gradient-to-br from-red-100 to-rose-100'}`} />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Sales Portal
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {isRegister ? 'Maak een sales account aan' : 'Log in met je sales account'}
              </p>
            </div>

            {/* Toggle Login/Register */}
            <div className={`flex rounded-xl p-1 mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  !isRegister
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inloggen
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  isRegister
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Registreren
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`mb-6 p-4 rounded-xl text-sm ${isDark ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className={`mb-6 p-4 rounded-xl text-sm ${isDark ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-5">
              {isRegister && (
                <>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Volledige naam
                    </label>
                    <div className="relative">
                      <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={naam}
                        onChange={(e) => setNaam(e.target.value)}
                        placeholder="Je volledige naam"
                        className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                          isDark
                            ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Rol / Rechten
                    </label>
                    <div className="relative">
                      <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as AgentRole)}
                        className={`w-full pl-12 pr-10 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none cursor-pointer ${
                          isDark
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <p className={`mt-1.5 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {ROLE_OPTIONS.find(r => r.value === role)?.description}
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  E-mailadres
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="naam@werkwise.nl"
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Wachtwoord
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegister ? 'Min. 6 karakters' : 'Je wachtwoord'}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                  isLoading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/25 hover:shadow-red-500/40'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isRegister ? 'Bezig met registreren...' : 'Bezig met inloggen...'}
                  </span>
                ) : (
                  isRegister ? 'Account aanmaken' : 'Inloggen'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            © 2025 WerkWise Sales Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;
