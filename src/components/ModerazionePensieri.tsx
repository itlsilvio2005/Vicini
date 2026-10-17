import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Check, X, AlertCircle, Loader2, MessageCircle } from 'lucide-react';

interface PensieroDaModerare {
  id: string;
  manifesto_id: string;
  user_id: string | null;
  nome: string;
  relazione: string | null;
  testo: string;
  approvato: boolean;
  creato_il: string;
  manifesti?: {
    nome_defunto: string;
    comune: string;
  };
}

interface Props {
  agenziaId: string;
}

export function ModerazionePensieri({ agenziaId }: Props) {
  const [pensieri, setPensieri] = useState<PensieroDaModerare[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    caricaPensieri();
  }, [agenziaId]);

  const caricaPensieri = async () => {
    if (!isSupabaseConfigured()) {
      setCaricamento(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pensieri')
        .select(`
          *,
          manifesti!inner(
            agenzia_id,
            nome_defunto,
            comune
          )
        `)
        .eq('manifesti.agenzia_id', agenziaId)
        .eq('approvato', false)
        .order('creato_il', { ascending: false });

      if (error) throw error;

      setPensieri((data || []).map(p => ({
        ...p,
        manifesti: Array.isArray(p.manifesti) ? p.manifesti[0] : p.manifesti,
      })));
    } catch (err) {
      console.error('Errore caricamento pensieri:', err);
      setErrore('Impossibile caricare i pensieri da moderare');
    } finally {
      setCaricamento(false);
    }
  };

  const approva = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pensieri')
        .update({ approvato: true })
        .eq('id', id);

      if (error) throw error;

      setPensieri(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Errore approvazione:', err);
      alert('Errore durante l\'approvazione');
    }
  };

  const rifiuta = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo pensiero?')) return;

    try {
      const { error } = await supabase
        .from('pensieri')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPensieri(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Errore eliminazione:', err);
      alert('Errore durante l\'eliminazione');
    }
  };

  if (caricamento) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-bronze-500" />
      </div>
    );
  }

  if (errore) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Errore</h3>
          </div>
          <p className="text-red-700 mb-4">{errore}</p>
          <button
            onClick={caricaPensieri}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-bronze-500" />
          Moderazione Pensieri
        </h2>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          {pensieri.length} in attesa
        </span>
      </div>

      {pensieri.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">Nessun pensiero in attesa di moderazione</p>
          <p className="text-gray-400 text-sm mt-2">
            I nuovi pensieri appariranno qui per la revisione
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pensieri.map(pensiero => (
            <div
              key={pensiero.id}
              className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-400"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pensiero.nome}
                    {pensiero.relazione && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({pensiero.relazione})
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Per: {pensiero.manifesti?.nome_defunto} · {pensiero.manifesti?.comune}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(pensiero.creato_il).toLocaleString('it-IT')}
                  </p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  In attesa
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 italic">"{pensiero.testo}"</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => approva(pensiero.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Approva
                </button>
                <button
                  onClick={() => rifiuta(pensiero.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Rifiuta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
