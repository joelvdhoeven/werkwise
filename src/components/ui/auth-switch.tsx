import { cn } from "../../lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "../../contexts/ThemeContext";

interface AuthSwitchProps {
  language: 'nl' | 'en' | 'pl';
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string;
  success: string;
  translations: {
    login: string;
    register: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    choosePassword: string;
    fullName: string;
    fullNamePlaceholder: string;
    loggingIn: string;
    registering: string;
    createAccount: string;
    forgotPassword: string;
  };
}

export function AuthSwitch({
  language,
  onLogin,
  onRegister,
  isLoading,
  error,
  success,
  translations: t,
}: AuthSwitchProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await onLogin(email, password);
    } else {
      await onRegister(fullName, email, password);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setFullName("");
  };

  return (
    <div className={cn("w-full max-w-md mx-auto")}>
      {/* Logo and Title */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-3 flex items-center justify-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <span className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
            WerkWise
          </span>
        </motion.div>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {language === 'nl' ? 'Log in om verder te gaan' : language === 'pl' ? 'Zaloguj się, aby kontynuować' : 'Sign in to continue'}
        </motion.p>
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl shadow-xl overflow-hidden ${
          isDark
            ? 'bg-gray-900 border border-gray-800 shadow-black/30'
            : 'bg-white border border-gray-100 shadow-gray-200/50'
        }`}
      >
        {/* Tab Switcher */}
        <div className={`flex p-1.5 m-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => !isLoading && setIsLogin(true)}
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold transition-all rounded-lg relative",
              isLogin
                ? isDark
                  ? "bg-gray-700 text-white shadow-sm"
                  : "bg-white text-gray-900 shadow-sm"
                : isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t.login}
          </button>
          <button
            onClick={() => !isLoading && setIsLogin(false)}
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold transition-all rounded-lg relative",
              !isLogin
                ? isDark
                  ? "bg-gray-700 text-white shadow-sm"
                  : "bg-white text-gray-900 shadow-sm"
                : isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t.register}
          </button>
        </div>

        {/* Form */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl text-sm ${isDark ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-100 text-red-600'}`}
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${isDark ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-green-50 border border-green-100 text-green-600'}`}
              >
                <CheckCircle className="h-5 w-5" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.fullName}
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        isDark
                          ? 'bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500'
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'
                      }`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.email}
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                    isDark
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.password}
              </label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? t.passwordPlaceholder : t.choosePassword}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                    isDark
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className={`text-xs font-medium ${isDark ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'}`}
                >
                  {t.forgotPassword}
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>{isLogin ? t.loggingIn : t.registering}</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? t.login : t.createAccount}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthSwitch;
