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

// Le scorciatoie demo (credenziali di prova, sessione finta in localStorage)
// esistono SOLO in sviluppo. Vite sostituisce import.meta.env.DEV con `false`
// nella build di produzione, quindi questo codice non finisce nel bundle.
const DEMO_ABILITATA = import.meta.env.DEV;
const MSG_NON_CONFIGURATO = 'Servizio non disponibile al momento. Riprova più tardi.';

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utente, setUtente] = useState<UtenteAutenticato | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const supabaseAttivo = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseAttivo) {
      if (DEMO_ABILITATA) {
        // Solo sviluppo: ripristina la sessione mock da localStorage
        const mockSession = localStorage.getItem('vicini_mock_session');
        if (mockSession) {
          try {
            setUtente(JSON.parse(mockSession));
          } catch {
            localStorage.removeItem('vicini_mock_session');
          }
        }
      } else {
        // Produzione: nessuna sessione finta è mai valida; elimina residui
        try { localStorage.removeItem('vicini_mock_session'); } catch { /* ignora */ }
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
    if (DEMO_ABILITATA) {
      // Solo sviluppo: credenziali di prova
      const credenzialiDemo = {
        'agenzia@vicini.mo': { password: 'test123456', ruolo: 'agenzia' as const, nome: 'Agenzia Demo' },
        'utente@vicini.mo': { password: 'test123456', ruolo: 'privato' as const, nome: 'Utente Demo' },
      };

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
        // Solo sviluppo, senza Supabase: accesso finto per altre credenziali
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
    }

    // Produzione senza Supabase configurato: rifiuta, non concedere mai accesso
    if (!supabaseAttivo) return { error: MSG_NON_CONFIGURATO };

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
    if (!supabaseAttivo && !DEMO_ABILITATA) return { error: MSG_NON_CONFIGURATO };

    if (!supabaseAttivo) {
      // Solo sviluppo: mock signup per demo
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
