import { useEffect, useSyncExternalStore } from 'react';
import { AGENZIE, MANIFESTI, type Manifesto } from '../data';
import { isSupabaseConfigured, supabase } from './supabase';

// ============================================================================
// Fonte unica dei manifesti.
//  - In produzione i manifesti arrivano SOLO dal database: mai dati di esempio.
//  - I manifesti di esempio (src/data.ts) si vedono solo in sviluppo (npm run dev)
//    quando Supabase non è configurato.
// ============================================================================

export type StatoManifesti = 'caricamento' | 'ok' | 'errore';

interface Stato {
  manifesti: Manifesto[];
  stato: StatoManifesti;
}

const USA_DEMO = import.meta.env.DEV && !isSupabaseConfigured();

let corrente: Stato = USA_DEMO
  ? { manifesti: MANIFESTI, stato: 'ok' }
  : { manifesti: [], stato: 'caricamento' };
let avviato = false;
const ascoltatori = new Set<() => void>();

function imposta(nuovo: Stato) {
  corrente = nuovo;
  ascoltatori.forEach((f) => f());
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Converte una riga della tabella `manifesti` (con l'agenzia collegata) nel formato usato dal sito. */
export function daRiga(m: any): Manifesto {
  const ag = m.agenzie ?? null;
  return {
    id: m.id,
    nome: m.nome_defunto,
    anni: m.anni,
    nascita: m.data_nascita || '',
    morte: m.data_morte || '',
    comune: m.comune,
    rito: m.rito,
    cameraArdente: {
      luogo: m.camera_ardente_luogo || '',
      indirizzo: m.camera_ardente_indirizzo || '',
      orari: m.camera_ardente_orari || '',
      indicazioni: m.camera_ardente_indicazioni || '',
    },
    funerale: {
      giorno: m.funerale_giorno || '',
      ora: m.funerale_ora || '',
      luogo: m.funerale_luogo || '',
      indirizzo: m.funerale_indirizzo || '',
      dettagli: m.funerale_dettagli || '',
    },
    commiato: {
      tipo: m.commiato_tipo || 'Cremazione',
      luogo: m.commiato_luogo || '',
      cimitero: m.commiato_cimitero || '',
    },
    agenzia: m.agenzia_id ?? ag?.id ?? '',
    agenziaInfo: ag
      ? {
          nome: ag.nome ?? '',
          indirizzo: ag.indirizzo ?? '',
          telefono: ag.telefono ?? '',
          email: ag.email ?? '',
        }
      : undefined,
    pubblicato: m.pubblicato_il ? new Date(m.pubblicato_il).toLocaleDateString('it-IT') : '',
    pensieri: [],
  } as Manifesto;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function ricaricaManifesti(): Promise<void> {
  if (USA_DEMO) return;
  if (!isSupabaseConfigured()) {
    imposta({ manifesti: [], stato: 'errore' });
    return;
  }
  const { data, error } = await supabase
    .from('manifesti')
    .select('*, agenzie!inner(id, nome, indirizzo, telefono, email)')
    .eq('pubblicato', true)
    .order('pubblicato_il', { ascending: false });

  if (error || !Array.isArray(data)) {
    console.error('Errore caricamento manifesti:', error);
    // Si tiene l'ultimo elenco buono, se c'è: meglio dati un po' vecchi di una bacheca vuota.
    imposta({ manifesti: corrente.manifesti, stato: corrente.manifesti.length ? 'ok' : 'errore' });
    return;
  }
  imposta({ manifesti: data.map(daRiga), stato: 'ok' });
}

/** Dati dell'agenzia da mostrare: quelli del database, altrimenti l'elenco statico. Mai un'agenzia "a caso". */
export function infoAgenzia(m: Manifesto): { nome: string; indirizzo: string; telefono: string; email: string } {
  if (m.agenziaInfo && m.agenziaInfo.nome) return m.agenziaInfo;
  const trovata = AGENZIE.find((a) => a.id === m.agenzia);
  if (trovata) return trovata;
  return { nome: 'Agenzia funebre', indirizzo: '', telefono: '', email: '' };
}

export function useManifesti(): Stato {
  const snapshot = useSyncExternalStore(
    (cb) => {
      ascoltatori.add(cb);
      return () => ascoltatori.delete(cb);
    },
    () => corrente,
  );
  useEffect(() => {
    if (!avviato) {
      avviato = true;
      void ricaricaManifesti();
    }
  }, []);
  return snapshot;
}
