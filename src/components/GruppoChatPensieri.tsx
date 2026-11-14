import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { filtraTesto, MESSAGGI_FILTRO } from '../lib/filtro-offese';
import { CampoTrappola, bersaglioBot } from './CampoTrappola';
import { Send, Loader2, AlertCircle, MessageCircle, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { urlPubblico } from '../data';

interface Props {
  manifestoId: string;
  manifestoNome: string;
}

/** Pensiero approvato, come lo restituisce la funzione pensieri_del_manifesto (niente dati dell'autore). */
interface PensieroPubblico {
  id: string;
  nome: string;
  relazione: string | null;
  testo: string;
  creato_il: string;
}

export function GruppoChatPensieri({ manifestoId, manifestoNome }: Props) {
  const { utente } = useAuth();
  const [pensieri, setPensieri] = useState<PensieroPubblico[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [nuovoTesto, setNuovoTesto] = useState('');
  const [nomeVisibile, setNomeVisibile] = useState(utente?.nome_completo ?? '');
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState('');
  const [inviato, setInviato] = useState(false);
  const [mostraQR, setMostraQR] = useState(false);

  useEffect(() => {
    void caricaPensieri();
  }, [manifestoId]);

  // Legge solo i pensieri già approvati, tramite funzione: nessun accesso diretto alla tabella.
  const caricaPensieri = async () => {
    const { data, error } = await supabase.rpc('pensieri_del_manifesto', { p_manifesto: manifestoId });
    if (error) {
      console.error('Errore caricamento pensieri:', error);
    } else {
      setPensieri((data as PensieroPubblico[]) || []);
    }
    setCaricamento(false);
  };

  const handleInvia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (bersaglioBot(e.currentTarget)) {
      // Il bot crede di aver inviato: non salviamo nulla.
      setNuovoTesto('');
      setInviato(true);
      return;
    }
    if (!utente) {
      setErrore('Devi essere autenticato per lasciare un pensiero');
      return;
    }

    const nome = nomeVisibile.trim();
    if (nome.length < 2) {
      setErrore('Scrivi il nome che vuoi far vedere (almeno 2 lettere).');
      return;
    }

    // Filtro anti-offese lato client (il database lo ricontrolla comunque).
    const risultato = filtraTesto(nuovoTesto);
    if (!risultato.approvato) {
      setErrore(MESSAGGI_FILTRO[risultato.livello]);
      return;
    }

    setInvio(true);
    setErrore('');
    setInviato(false);

    // Il pensiero entra in coda: compare solo dopo l'approvazione di famiglia o agenzia.
    const { error } = await supabase.rpc('lascia_pensiero', {
      p_manifesto: manifestoId,
      p_nome: nome,
      p_relazione: null,
      p_testo: nuovoTesto.trim(),
    });

    if (error) {
      const m = String(error.message || '');
      setErrore(
        /moderazione|Troppi pensieri|molti pensieri|Indica il tuo nome|non trovato/i.test(m)
          ? m
          : 'Non è stato possibile inviare il pensiero. Riprova tra poco.',
      );
    } else {
      setNuovoTesto('');
      setInviato(true);
    }
    setInvio(false);
  };

  const urlCondivisione = `${urlPubblico()}/manifesto/${manifestoId}`;

  if (caricamento) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-bronze-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-night-800 to-night-900 text-white p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Gruppo Pensieri
          </h3>
          <button
            onClick={() => setMostraQR(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <QrCode className="w-5 h-5" />
            Condividi
          </button>
        </div>
        <p className="text-gray-300 text-sm">
          In memoria di <strong className="text-bronze-300">{manifestoNome}</strong>
        </p>
      </div>

      {/* QR Code Modal */}
      {mostraQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Condividi Gruppo</h3>
              <button
                onClick={() => setMostraQR(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Chiudi"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={urlCondivisione} size={200} />
            </div>
            <p className="text-center text-sm text-gray-600 mb-4">
              Inquadra il QR code per accedere al gruppo pensieri
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Oppure condividi il link:</p>
              <p className="text-sm text-bronze-600 font-mono break-all">{urlCondivisione}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista Pensieri (solo approvati) */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {pensieri.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Nessun pensiero ancora</p>
            <p className="text-sm">Sii il primo a lasciare un ricordo</p>
          </div>
        ) : (
          pensieri.map((pensiero) => (
            <div key={pensiero.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-bronze-500 rounded-full flex items-center justify-center text-white font-bold" aria-hidden="true">
                  {pensiero.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{pensiero.nome}</span>
                    {pensiero.relazione && <span className="text-xs text-gray-500">· {pensiero.relazione}</span>}
                  </div>
                  <p className="text-gray-700">{pensiero.testo}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(pensiero.creato_il).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Invio */}
      {utente ? (
        <form onSubmit={handleInvia} className="relative border-t border-gray-200 p-6">
          <CampoTrappola />
          {inviato && (
            <p role="status" className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Grazie. Il tuo pensiero comparirà dopo l’approvazione della famiglia o dell’agenzia.
            </p>
          )}
          {errore && (
            <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errore}</span>
            </div>
          )}
          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Il tuo nome (visibile agli altri)</span>
            <input
              type="text"
              value={nomeVisibile}
              onChange={(e) => setNomeVisibile(e.target.value)}
              maxLength={80}
              autoComplete="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
              disabled={invio}
            />
          </label>
          <div className="flex gap-3">
            <label className="flex-1">
              <span className="sr-only">Scrivi il tuo pensiero</span>
              <input
                type="text"
                value={nuovoTesto}
                onChange={(e) => setNuovoTesto(e.target.value)}
                maxLength={400}
                placeholder="Lascia un pensiero..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                disabled={invio}
              />
            </label>
            <button
              type="submit"
              disabled={invio || !nuovoTesto.trim()}
              className="px-6 py-3 bg-bronze-500 text-white rounded-lg font-medium hover:bg-bronze-600 disabled:opacity-50 flex items-center gap-2"
            >
              {invio ? <Loader2 className="animate-spin w-5 h-5" /> : (<><Send className="w-5 h-5" />Invia</>)}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            I messaggi vengono moderati prima di essere pubblicati.
          </p>
        </form>
      ) : (
        <div className="border-t border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-2">Accedi per lasciare un pensiero</p>
          <a href="/login" className="inline-block px-6 py-2 bg-bronze-500 text-white rounded-lg font-medium hover:bg-bronze-600">
            Accedi
          </a>
        </div>
      )}
    </div>
  );
}
