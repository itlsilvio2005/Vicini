import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured, ProfiloUtente, Ruolo } from './supabase';

// ============================================================================
// TIPI
// ============================================================================

export interface UtenteAutenticato {
  id: string;
  email: string;
  ruolo: Ruolo;
  nome_completo: string | null;
  telefono: string | null;
}

interface AuthContextType {
  utente: UtenteAutenticato | null;
  caricamento: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, ruolo: Ruolo, nome?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isSupabaseAttivo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utente, setUtente] = useState<UtenteAutenticato | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const supabaseAttivo = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseAttivo) {
      // Fallback: controlla localStorage per sessione mock
      const mockSession = localStorage.getItem('vicini_mock_session');
      if (mockSession) {
        try {
          setUtente(JSON.parse(mockSession));
        } catch {
          localStorage.removeItem('vicini_mock_session');
        }
      }
      setCaricamento(false);
      return;
    }

    // Supabase attivo: controlla sessione
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        caricaProfilo(session.user.id);
      } else {
        setCaricamento(false);
      }
    });

    // Listener per cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        caricaProfilo(session.user.id);
      } else {
        setUtente(null);
        setCaricamento(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseAttivo]);

  async function caricaProfilo(userId: string) {
    try {
      const { data: profilo, error } = await supabase
        .from('profilo_utenti')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profilo) {
        console.error('Errore caricamento profilo:', error);
        setCaricamento(false);
        return;
      }

      setUtente({
        id: profilo.id,
        email: profilo.email,
        ruolo: profilo.ruolo,
        nome_completo: profilo.nome_completo,
        telefono: profilo.telefono,
      });
    } catch (err) {
      console.error('Errore caricamento profilo:', err);
    } finally {
      setCaricamento(false);
    }
  }

  async function login(email: string, password: string): Promise<{ error?: string }> {
    // Sistema demo: funziona sempre con credenziali di test
    const credenzialiDemo = {
      'agenzia@vicini.mo': { password: 'test123456', ruolo: 'agenzia' as const, nome: 'Agenzia Demo' },
      'utente@vicini.mo': { password: 'test123456', ruolo: 'privato' as const, nome: 'Utente Demo' },
    };

    // Se le credenziali sono quelle demo, usa il sistema demo
    if (credenzialiDemo[email as keyof typeof credenzialiDemo]?.password === password) {
      const mockUser: UtenteAutenticato = {
        id: email === 'agenzia@vicini.mo' ? 'eba41f64-3173-4c6a-974c-18069d000dc2' : '9f564219-7250-4077-a50a-ebb2f2353bad',
        email,
        ruolo: credenzialiDemo[email as keyof typeof credenzialiDemo].ruolo,
        nome_completo: credenzialiDemo[email as keyof typeof credenzialiDemo].nome,
        telefono: null,
      };
      localStorage.setItem('vicini_mock_session', JSON.stringify(mockUser));
      setUtente(mockUser);
      return {};
    }

    if (!supabaseAttivo) {
      // Fallback mock per altre credenziali
      const mockUser: UtenteAutenticato = {
        id: 'mock-user-id',
        email,
        ruolo: email.includes('agenzia') ? 'agenzia' : 'privato',
        nome_completo: 'Utente Demo',
        telefono: null,
      };
      localStorage.setItem('vicini_mock_session', JSON.stringify(mockUser));
      setUtente(mockUser);
      return {};
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }

  async function signup(
    email: string,
    password: string,
    ruolo: Ruolo,
    nome?: string
  ): Promise<{ error?: string }> {
    if (!supabaseAttivo) {
      // Mock signup per demo
      const mockUser: UtenteAutenticato = {
        id: 'mock-user-id-' + Date.now(),
        email,
        ruolo,
        nome_completo: nome || 'Nuovo Utente',
        telefono: null,
      };
      localStorage.setItem('vicini_mock_session', JSON.stringify(mockUser));
      setUtente(mockUser);
      return {};
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { ruolo },
      },
    });

    if (error) return { error: error.message };
    return {};
  }

  async function logout(): Promise<void> {
    if (!supabaseAttivo) {
      localStorage.removeItem('vicini_mock_session');
      setUtente(null);
      return;
    }

    await supabase.auth.signOut();
    setUtente(null);
  }

  return (
    <AuthContext.Provider
      value={{
        utente,
        caricamento,
        login,
        signup,
        logout,
        isSupabaseAttivo: supabaseAttivo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato dentro un AuthProvider');
  }
  return context;
}
