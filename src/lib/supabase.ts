import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURAZIONE SUPABASE
// ============================================================================
// IMPORTANTE: Inserisci qui le tue credenziali Supabase
// Le trovi in: Supabase Dashboard → Settings → API

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    '%c⚠️ Supabase non configurato',
    'color: #ff6b6b; font-weight: bold; font-size: 14px;',
    '\n\nPer configurare Supabase:' +
    '\n1. Crea un progetto su https://supabase.com' +
    '\n2. Esegui SUPABASE_SCHEMA.sql nel SQL Editor' +
    '\n3. Copia URL e anon key da Settings → API' +
    '\n4. Crea un file .env con:' +
    '\n   VITE_SUPABASE_URL=https://xxxxx.supabase.co' +
    '\n   VITE_SUPABASE_ANON_KEY=your-anon-key' +
    '\n\nNel frattempo l\'app usa dati di esempio locali.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TIPI DATI
// ============================================================================

export type Ruolo = 'privato' | 'agenzia';

export interface ProfiloUtente {
  id: string;
  email: string;
  ruolo: Ruolo;
  nome_completo: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agenzia {
  id: string;
  user_id: string;
  nome: string;
  indirizzo: string;
  descrizione: string | null;
  telefono: string;
  email: string;
  logo_url: string | null;
  foto_sede_url: string | null;
  orari_apertura: string | null;
  servizi_offerti: string[] | null;
  aree_coperte: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Manifesto {
  id: string;
  agenzia_id: string;
  nome_defunto: string;
  anni: number | null;
  data_nascita: string | null;
  data_morte: string | null;
  comune: string;
  rito: 'Cattolico' | 'Musulmano' | 'Civile' | 'Ortodosso';
  camera_ardente_luogo: string | null;
  camera_ardente_indirizzo: string | null;
  camera_ardente_orari: string | null;
  camera_ardente_indicazioni: string | null;
  funerale_giorno: string | null;
  funerale_ora: string | null;
  funerale_luogo: string | null;
  funerale_indirizzo: string | null;
  funerale_dettagli: string | null;
  commiato_tipo: 'Tumulazione' | 'Cremazione' | 'Inumazione' | null;
  commiato_luogo: string | null;
  commiato_cimitero: string | null;
  pubblicato: boolean;
  pubblicato_il: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pensiero {
  id: string;
  manifesto_id: string;
  user_id: string | null;
  nome: string;
  relazione: string | null;
  testo: string;
  approvato: boolean;
  creato_il: string;
}

export interface OrdineFiori {
  id: string;
  manifesto_id: string;
  user_id: string | null;
  composizione: string;
  importo: number;
  nastro: string | null;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefono: string;
  stato: 'Da evadere' | 'Confermato' | 'Completato';
  fattura_inviata: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pratica {
  id: string;
  agenzia_id: string;
  manifesto_id: string | null;
  num_fattura: string;
  defunto: string;
  comune: string;
  data_cerimonia: string;
  rito: string;
  stato: 'In corso' | 'Completata';
  imponibile: number;
  famiglia: string | null;
  created_at: string;
  updated_at: string;
}

export interface Volonta {
  id: string;
  user_id: string;
  agenzia_id: string | null;
  rito: string | null;
  destinazione: string | null;
  trasporto_fuori_comune: boolean;
  trasporto_comune: string | null;
  trasporto_citta: string | null;
  rimpatrio_estero: boolean;
  rimpatrio_paese: string | null;
  dettagli_rito: Record<string, any> | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface MembroNucleo {
  id: string;
  user_id: string;
  nome: string;
  relazione: string;
  comune: string;
  contatto: string;
  created_at: string;
}

// ============================================================================
// HELPER: verifica se Supabase è configurato
// ============================================================================

export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';
}
