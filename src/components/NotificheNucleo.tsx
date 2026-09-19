import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, Manifesto } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notifica {
  id: string;
  user_id: string;
  titolo: string;
  messaggio: string;
  manifesto_id: string;
  defunto_nome: string;
  comune: string;
  data_pubblicazione: string;
  letta: boolean;
  data_creazione: string;
}

/**
 * Hook per gestire le notifiche real-time del Nucleo
 * Monitora la pubblicazione di nuovi manifesti e notifica l'utente
 * se il defunto corrisponde a un familiare registrato nel Nucleo
 */
export function useNotificheNucleo() {
  const { utente } = useAuth();
  const navigate = useNavigate();
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);
  const [nonLette, setNonLette] = useState(0);

  // Carica notifiche esistenti da Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || !utente) return;

    const caricaNotifiche = async () => {
      const { data, error } = await supabase
        .from('notifiche_nucleo')
        .select('*')
        .eq('user_id', utente.id)
        .order('data_creazione', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Errore caricamento notifiche:', error);
        return;
      }

      if (data) {
        setNotifiche(data);
        setNonLette(data.filter(n => !n.letta).length);
      }
    };

    caricaNotifiche();
  }, [utente]);

  // Iscriviti ai cambiamenti real-time nella tabella manifesti
  useEffect(() => {
    if (!isSupabaseConfigured() || !utente) return;

    const subscription = supabase
      .channel('manifesti-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'manifesti',
          filter: 'pubblicato=eq.true',
        },
        async (payload) => {
          const nuovoManifesto = payload.new as Manifesto;
          
          // Controlla se il defunto corrisponde a un familiare del Nucleo
          const corrisponde = await controllaCorrispondenzaNucleo(
            utente.id,
            nuovoManifesto.nome_defunto,
            nuovoManifesto.comune
          );

          if (corrisponde) {
            // Crea notifica
            await creaNotifica(utente.id, nuovoManifesto);
            
            // Ricarica notifiche
            const { data } = await supabase
              .from('notifiche_nucleo')
              .select('*')
              .eq('user_id', utente.id)
              .order('data_creazione', { ascending: false })
              .limit(50);

            if (data) {
              setNotifiche(data);
              setNonLette(data.filter(n => !n.letta).length);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [utente]);

  /**
   * Controlla se il defunto corrisponde a un familiare del Nucleo
   */
  const controllaCorrispondenzaNucleo = async (
    userId: string,
    nomeDefunto: string,
    comune: string
  ): Promise<boolean> => {
    const { data, error } = await supabase
      .from('nucleo')
      .select('nome, comune')
      .eq('user_id', userId);

    if (error || !data) return false;

    // Controlla se c'è una corrispondenza per nome e comune
    return data.some(familiare => {
      const nomeNorm = familiare.nome.toLowerCase().trim();
      const defuntoNorm = nomeDefunto.toLowerCase().trim();
      const comuneFam = familiare.comune.toLowerCase().trim();
      const comuneDef = comune.toLowerCase().trim();

      // Corrispondenza esatta o parziale del nome + stesso comune
      return (
        (nomeNorm === defuntoNorm || 
         nomeNorm.includes(defuntoNorm) || 
         defuntoNorm.includes(nomeNorm)) &&
        comuneFam === comuneDef
      );
    });
  };

  /**
   * Crea una nuova notifica nel database
   */
  const creaNotifica = async (userId: string, manifesto: Manifesto) => {
    const notifica = {
      user_id: userId,
      titolo: `Nuovo manifesto per ${manifesto.nome_defunto}`,
      messaggio: `È stato pubblicato un manifesto funebre per ${manifesto.nome_defunto} a ${manifesto.comune}.`,
      manifesto_id: manifesto.id,
      defunto_nome: manifesto.nome_defunto,
      comune: manifesto.comune,
      data_pubblicazione: manifesto.pubblicato_il || new Date().toISOString(),
      letta: false,
    };

    const { error } = await supabase
      .from('notifiche_nucleo')
      .insert([notifica]);

    if (error) {
      console.error('Errore creazione notifica:', error);
    }
  };

  /**
   * Marca una notifica come letta
   */
  const marcaComeLetta = async (notificaId: string) => {
    const { error } = await supabase
      .from('notifiche_nucleo')
      .update({ letta: true })
      .eq('id', notificaId);

    if (!error) {
      setNotifiche(prev =>
        prev.map(n => n.id === notificaId ? { ...n, letta: true } : n)
      );
      setNonLette(prev => Math.max(0, prev - 1));
    }
  };

  /**
   * Marca tutte le notifiche come lette
   */
  const marcaTutteComeLette = async () => {
    if (!utente) return;

    const { error } = await supabase
      .from('notifiche_nucleo')
      .update({ letta: true })
      .eq('user_id', utente.id)
      .eq('letta', false);

    if (!error) {
      setNotifiche(prev => prev.map(n => ({ ...n, letta: true })));
      setNonLette(0);
    }
  };

  /**
   * Elimina una notifica
   */
  const eliminaNotifica = async (notificaId: string) => {
    const { error } = await supabase
      .from('notifiche_nucleo')
      .delete()
      .eq('id', notificaId);

    if (!error) {
      const notifica = notifiche.find(n => n.id === notificaId);
      setNotifiche(prev => prev.filter(n => n.id !== notificaId));
      if (notifica && !notifica.letta) {
        setNonLette(prev => Math.max(0, prev - 1));
      }
    }
  };

  /**
   * Naviga al manifesto della notifica
   */
  const vaiAlManifesto = (manifestoId: string) => {
    navigate(`/manifesto/${manifestoId}`);
  };

  return {
    notifiche,
    nonLette,
    marcaComeLetta,
    marcaTutteComeLette,
    eliminaNotifica,
    vaiAlManifesto,
  };
}

/**
 * Componente UI per il pannello notifiche
 */
export function PannelloNotifiche() {
  const {
    notifiche,
    nonLette,
    marcaComeLetta,
    marcaTutteComeLette,
    eliminaNotifica,
    vaiAlManifesto,
  } = useNotificheNucleo();

  const [aperto, setAperto] = useState(false);

  if (!isSupabaseConfigured()) return null;

  return (
    <div className="relative">
      {/* Bottone campanella */}
      <button
        onClick={() => setAperto(!aperto)}
        className="relative p-2 text-gray-600 hover:text-bronze-600 transition-colors"
        aria-label="Notifiche"
      >
        <Bell className="w-6 h-6" />
        {nonLette > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {nonLette > 9 ? '9+' : nonLette}
          </span>
        )}
      </button>

      {/* Pannello notifiche */}
      {aperto && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifiche</h3>
            <div className="flex items-center gap-2">
              {nonLette > 0 && (
                <button
                  onClick={marcaTutteComeLette}
                  className="text-sm text-bronze-600 hover:text-bronze-700 font-medium"
                >
                  Segna tutte come lette
                </button>
              )}
              <button
                onClick={() => setAperto(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lista notifiche */}
          <div className="max-h-96 overflow-y-auto">
            {notifiche.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nessuna notifica</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifiche.map(notifica => (
                  <li
                    key={notifica.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notifica.letta ? 'bg-bronze-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          !notifica.letta ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notifica.titolo}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notifica.messaggio}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notifica.data_creazione).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => vaiAlManifesto(notifica.manifesto_id)}
                          className="p-1 text-bronze-600 hover:text-bronze-700"
                          aria-label="Vai al manifesto"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        {!notifica.letta && (
                          <button
                            onClick={() => marcaComeLetta(notifica.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            aria-label="Segna come letta"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => eliminaNotifica(notifica.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                          aria-label="Elimina notifica"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
