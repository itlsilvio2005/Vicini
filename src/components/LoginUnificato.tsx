import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Mail, Lock, AlertCircle, Loader2, Flame } from 'lucide-react';

type TipoUtente = 'privato' | 'agenzia';

export function LoginUnificato() {
  const [tipoUtente, setTipoUtente] = useState<TipoUtente>('privato');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [isRegistrazione, setIsRegistrazione] = useState(false);
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    try {
      if (isRegistrazione) {
        const result = await signup(email, password, tipoUtente, nome);
        if (result.error) {
          setErrore(result.error);
        } else {
          navigate(tipoUtente === 'agenzia' ? '/area-riservata' : '/area-privata');
        }
      } else {
        const result = await login(email, password);
        if (result.error) {
          setErrore(result.error);
        } else {
          navigate(tipoUtente === 'agenzia' ? '/area-riservata' : '/area-privata');
        }
      }
    } catch (err) {
      setErrore('Si è verificato un errore. Riprova.');
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-night-800 mb-4">
            <Flame className="w-8 h-8 text-bronze-400" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-ink mb-2">Vicini</h1>
          <p className="text-ink-faint text-sm">Area Riservata · Provincia di Modena</p>
        </div>

        {/* Card Login */}
        <div className="bg-card rounded-xl border border-line shadow-lg p-8">
          {/* Selettore Tipo Utente */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setTipoUtente('privato')}
              className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all ${
                tipoUtente === 'privato'
                  ? 'bg-night-800 text-bronze-300 border-2 border-bronze-500 shadow-md'
                  : 'bg-paper border border-line text-ink-soft hover:border-bronze-500 hover:text-bronze-600'
              }`}
            >
              <User className="inline-block w-5 h-5 mr-2" />
              Privato
            </button>
            <button
              type="button"
              onClick={() => setTipoUtente('agenzia')}
              className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all ${
                tipoUtente === 'agenzia'
                  ? 'bg-night-800 text-bronze-300 border-2 border-bronze-500 shadow-md'
                  : 'bg-paper border border-line text-ink-soft hover:border-bronze-500 hover:text-bronze-600'
              }`}
            >
              <Building2 className="inline-block w-5 h-5 mr-2" />
              Agenzia
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistrazione && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 border border-line bg-paper rounded-md text-ink focus:ring-2 focus:ring-bronze-500 focus:border-bronze-500 transition"
                  placeholder="Mario Rossi"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-2">
                <Mail className="inline-block w-4 h-4 mr-2 text-bronze-600" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-line bg-paper rounded-md text-ink focus:ring-2 focus:ring-bronze-500 focus:border-bronze-500 transition"
                placeholder="mario.rossi@email.it"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-2">
                <Lock className="inline-block w-4 h-4 mr-2 text-bronze-600" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-line bg-paper rounded-md text-ink focus:ring-2 focus:ring-bronze-500 focus:border-bronze-500 transition"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {errore && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errore}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={caricamento}
              className="w-full py-3 px-4 bg-bronze-500 text-night-950 rounded-md font-bold hover:bg-bronze-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
            >
              {caricamento ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Caricamento...
                </>
              ) : isRegistrazione ? (
                'Registrati'
              ) : (
                'Accedi'
              )}
            </button>
          </form>

          {/* Toggle Login/Registrazione */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistrazione(!isRegistrazione);
                setErrore('');
              }}
              className="text-bronze-600 hover:text-bronze-700 font-semibold link-rule"
            >
              {isRegistrazione
                ? 'Hai già un account? Accedi'
                : 'Non hai un account? Registrati'}
            </button>
          </div>

          {/* Info Tipo Utente */}
          <div className="mt-6 p-4 bg-paper border border-line-soft rounded-md">
            <p className="text-sm text-ink-soft">
              {tipoUtente === 'privato' ? (
                <>
                  <strong className="text-ink">Utente Privato:</strong> Accedi per gestire le tue volontà funebri e il tuo nucleo familiare.
                </>
              ) : (
                <>
                  <strong className="text-ink">Agenzia Funebre:</strong> Accedi per gestire manifesti, pratiche e ordini.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-ink-faint text-xs">
          <p>Provincia di Modena · Servizi Funebri</p>
        </div>
      </div>
    </div>
  );
}
