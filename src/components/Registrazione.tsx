import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate, Link } from 'react-router-dom';
import { User, Building2, Mail, Lock, AlertCircle, Loader2, Flame, ArrowLeft, CheckCircle } from 'lucide-react';
import { validaEmail, validaPassword, passwordCoincidono } from '../lib/validazione';

type TipoUtente = 'privato' | 'agenzia';

export function Registrazione() {
  const [tipoUtente, setTipoUtente] = useState<TipoUtente>('privato');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [nome, setNome] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const [successo, setSuccesso] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    try {
      // Validazioni
      if (nome.trim().length < 2) {
        setErrore('Il nome deve essere lungo almeno 2 caratteri');
        setCaricamento(false);
        return;
      }

      if (!validaEmail(email)) {
        setErrore('Inserisci un indirizzo email valido');
        setCaricamento(false);
        return;
      }

      const criteriPassword = validaPassword(password);
      if (!criteriPassword.lunghezzaMinima || !criteriPassword.haMaiuscola || !criteriPassword.haMinuscola || !criteriPassword.haNumero) {
        setErrore('La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero');
        setCaricamento(false);
        return;
      }

      if (!passwordCoincidono(password, confermaPassword)) {
        setErrore('Le password non coincidono');
        setCaricamento(false);
        return;
      }

      // Registrazione
      const result = await signup(email, password, tipoUtente, nome);
      
      if (result.error) {
        setErrore(result.error);
      } else {
        setSuccesso(true);
        setTimeout(() => {
          navigate(tipoUtente === 'agenzia' ? '/area-riservata' : '/area-privata');
        }, 2000);
      }
    } catch (err) {
      setErrore('Si è verificato un errore. Riprova.');
    } finally {
      setCaricamento(false);
    }
  };

  if (successo) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-card rounded-xl border border-line shadow-lg p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-semibold text-ink mb-2">
              Registrazione Completata!
            </h2>
            <p className="text-ink-soft mb-6">
              Ti stiamo reindirizzando alla tua area personale...
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-bronze-500 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-night-800 mb-4">
            <Flame className="w-8 h-8 text-bronze-400" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-ink mb-2">Vicini</h1>
          <p className="text-ink-faint text-sm">Registrati · Provincia di Modena</p>
        </div>

        {/* Card Registrazione */}
        <div className="bg-card rounded-xl border border-line shadow-lg p-8">
          {/* Link per tornare al login */}
          <Link 
            to="/login" 
            className="flex items-center gap-2 text-sm text-bronze-600 hover:text-bronze-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna al login
          </Link>

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
                minLength={8}
              />
              <p className="text-xs text-ink-faint mt-1">
                Minimo 8 caratteri, una maiuscola, una minuscola e un numero
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-2">
                <Lock className="inline-block w-4 h-4 mr-2 text-bronze-600" />
                Conferma Password
              </label>
              <input
                type="password"
                value={confermaPassword}
                onChange={(e) => setConfermaPassword(e.target.value)}
                className="w-full px-4 py-3 border border-line bg-paper rounded-md text-ink focus:ring-2 focus:ring-bronze-500 focus:border-bronze-500 transition"
                placeholder="••••••••"
                required
                minLength={8}
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
                  Registrazione in corso...
                </>
              ) : (
                'Registrati'
              )}
            </button>
          </form>

          {/* Info Tipo Utente */}
          <div className="mt-6 p-4 bg-paper border border-line-soft rounded-md">
            <p className="text-sm text-ink-soft">
              {tipoUtente === 'privato' ? (
                <>
                  <strong className="text-ink">Utente Privato:</strong> Registrati per gestire le tue volontà funebri, il tuo nucleo familiare e ricevere notifiche sui manifesti dei tuoi cari.
                </>
              ) : (
                <>
                  <strong className="text-ink">Agenzia Funebre:</strong> Registrati per gestire manifesti, pratiche, ordini e il profilo della tua agenzia.
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
