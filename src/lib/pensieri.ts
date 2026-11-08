import { useEffect, useSyncExternalStore } from 'react';
import type { Manifesto, Pensiero } from '../data';
import { isSupabaseConfigured, supabase } from './supabase';

// Pensieri pubblici = SOLO quelli approvati dalla famiglia, dall'agenzia o
// dall'amministratore (funzione pensieri_pubblici nel database).

type PerManifesto = Record<string, Pensiero[]>;

let store: PerManifesto = {};
let caricato = false;
const ascoltatori = new Set<() => void>();

export async function ricaricaPensieri() {
  if (!isSupabaseConfigured()) return;
  const { data, error } = await supabase.rpc('pensieri_pubblici');
  if (error || !Array.isArray(data)) return;
  const nuovo: PerManifesto = {};
  for (const r of data as { manifesto_id: string; nome: string; relazione: string | null; testo: string; creato_il: string }[]) {
    (nuovo[r.manifesto_id] ??= []).push({
      nome: r.nome,
      relazione: r.relazione ?? undefined,
      testo: r.testo,
      quando: new Date(r.creato_il).toLocaleDateString('it-IT'),
    });
  }
  store = nuovo;
  ascoltatori.forEach((f) => f());
}

/** Pensieri approvati del manifesto, più quelli dei manifesti di esempio. */
export function usePensieriDi(m: Manifesto | undefined): Pensiero[] {
  const snapshot = useSyncExternalStore(
    (cb) => {
      ascoltatori.add(cb);
      return () => ascoltatori.delete(cb);
    },
    () => store,
  );
  useEffect(() => {
    if (!caricato) {
      caricato = true;
      void ricaricaPensieri();
    }
  }, []);
  if (!m) return [];
  return [...(snapshot[m.id] ?? []), ...m.pensieri];
}
