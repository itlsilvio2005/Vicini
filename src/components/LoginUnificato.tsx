import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-night-900 to-night-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Vicini</h1>
          <p className="text-gray-300">Area Riservata</p>
        </div>

        {/* Card Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Selettore Tipo Utente */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setTipoUtente('privato')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                tipoUtente === 'privato'
                  ? 'bg-bronze-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User className="inline-block w-5 h-5 mr-2" />
              Privato
            </button>
            <button
              type="button"
              onClick={() => setTipoUtente('agenzia')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                tipoUtente === 'agenzia'
                  ? 'bg-bronze-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500 focus:border-transparent"
                  placeholder="Mario Rossi"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline-block w-4 h-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500 focus:border-transparent"
                placeholder="mario.rossi@email.it"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline-block w-4 h-4 mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {errore && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errore}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={caricamento}
              className="w-full py-3 px-4 bg-bronze-500 text-white rounded-lg font-medium hover:bg-bronze-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              className="text-bronze-600 hover:text-bronze-700 font-medium"
            >
              {isRegistrazione
                ? 'Hai già un account? Accedi'
                : 'Non hai un account? Registrati'}
            </button>
          </div>

          {/* Info Tipo Utente */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {tipoUtente === 'privato' ? (
                <>
                  <strong>Utente Privato:</strong> Accedi per gestire le tue volontà funebri e il tuo nucleo familiare.
                </>
              ) : (
                <>
                  <strong>Agenzia Funebre:</strong> Accedi per gestire manifesti, pratiche e ordini.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>Provincia di Modena · Servizi Funebri</p>
        </div>
      </div>
    </div>
  );
}
