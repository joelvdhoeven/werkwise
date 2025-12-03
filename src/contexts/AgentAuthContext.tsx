import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SalesAgent {
  id: string;
  email: string;
  naam: string;
  role: 'sales' | 'manager' | 'admin' | 'superuser' | 'sales_admin';
  commission_percentage: number;
  is_active: boolean;
  created_at: string;
}

interface AgentAuthContextType {
  agent: SalesAgent | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

const AgentAuthContext = createContext<AgentAuthContextType | undefined>(undefined);

export const useAgentAuth = () => {
  const context = useContext(AgentAuthContext);
  if (!context) {
    throw new Error('useAgentAuth must be used within an AgentAuthProvider');
  }
  return context;
};

interface AgentAuthProviderProps {
  children: ReactNode;
}

export const AgentAuthProvider: React.FC<AgentAuthProviderProps> = ({ children }) => {
  const [agent, setAgent] = useState<SalesAgent | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    // Clear any existing session
    await supabase.auth.signOut();
    setAgent(null);
    localStorage.removeItem('currentAgent');

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      if (authError.message === 'Invalid login credentials') {
        throw new Error('E-mailadres of wachtwoord is onjuist');
      }
      throw new Error('Inloggen mislukt');
    }

    if (!authData.user?.id) {
      throw new Error('Inloggen mislukt');
    }

    // Get sales agent profile
    const { data: agentProfile, error: profileError } = await supabase
      .from('sales_agents')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (profileError || !agentProfile) {
      await supabase.auth.signOut();
      throw new Error('Dit account heeft geen toegang tot de sales omgeving');
    }

    if (!agentProfile.is_active) {
      await supabase.auth.signOut();
      throw new Error('Dit account is gedeactiveerd');
    }

    const salesAgent: SalesAgent = {
      id: agentProfile.id,
      email: agentProfile.email,
      naam: agentProfile.naam,
      role: agentProfile.role,
      commission_percentage: agentProfile.commission_percentage,
      is_active: agentProfile.is_active,
      created_at: agentProfile.created_at
    };

    setAgent(salesAgent);
    localStorage.setItem('currentAgent', JSON.stringify(salesAgent));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Signout error:', error);
    } finally {
      setAgent(null);
      localStorage.removeItem('currentAgent');
    }
  };

  const isAdmin = (): boolean => {
    return agent?.role === 'sales_admin' || agent?.role === 'admin' || agent?.role === 'superuser';
  };

  // Check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Try to get sales agent profile
          const { data: agentProfile } = await supabase
            .from('sales_agents')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          if (agentProfile && agentProfile.is_active) {
            const salesAgent: SalesAgent = {
              id: agentProfile.id,
              email: agentProfile.email,
              naam: agentProfile.naam,
              role: agentProfile.role,
              commission_percentage: agentProfile.commission_percentage,
              is_active: agentProfile.is_active,
              created_at: agentProfile.created_at
            };
            setAgent(salesAgent);
            localStorage.setItem('currentAgent', JSON.stringify(salesAgent));
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setAgent(null);
        localStorage.removeItem('currentAgent');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <AgentAuthContext.Provider value={{ agent, loading, login, logout, isAdmin }}>
      {children}
    </AgentAuthContext.Provider>
  );
};
