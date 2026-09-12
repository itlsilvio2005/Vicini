import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { supabase, Agenzia } from '../lib/supabase';
import { LogOut, FileText, User, Archive, BarChart3, Loader2 } from 'lucide-react';
import { BachecaManifestiAgenzia } from './BachecaManifestiAgenzia';
import { ProfiloAgenzia } from './ProfiloAgenzia';
import { ArchivioAgenzia } from './ArchivioAgenzia';
import { BackofficeAgenzia } from './BackofficeAgenzia';

type SezioneDashboard = 'bacheca' | 'profilo' | 'archivio' | 'backoffice';

export function DashboardAgenzia() {
  const { utente, logout } = useAuth();
  const navigate = useNavigate();
  const [sezioneAttiva, setSezioneAttiva] = useState<SezioneDashboard>('bacheca');
  const [agenzia, setAgenzia] = useState<Agenzia | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    if (!utente || utente.ruolo !== 'agenzia') {
      navigate('/login');
      return;
    }
    caricaAgenzia();
  }, [utente, navigate]);

  const caricaAgenzia = async () => {
    if (!utente) return;
    
    const { data, error } = await supabase
      .from('agenzie')
      .select('*')
      .eq('user_id', utente.id)
      .single();

    if (error) {
      console.error('Errore caricamento agenzia:', error);
    } else {
      setAgenzia(data);
    }
    setCaricamento(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (caricamento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-bronze-500" />
      </div>
    );
  }

  if (!agenzia) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profilo Agenzia Non Trovato</h2>
          <p className="text-gray-600 mb-6">
            Il tuo account è registrato come agenzia, ma non è stato ancora creato un profilo agenzia.
            Contatta l'amministrazione per completare la configurazione.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-bronze-500 text-white rounded-lg font-medium hover:bg-bronze-600"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Dashboard */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Agenzia</h1>
              <span className="px-3 py-1 bg-bronze-100 text-bronze-700 rounded-full text-sm font-medium">
                {agenzia.nome}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{utente?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Esci
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setSezioneAttiva('bacheca')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                sezioneAttiva === 'bacheca'
                  ? 'border-bronze-500 text-bronze-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5" />
              Bacheca Manifesti
            </button>
            <button
              onClick={() => setSezioneAttiva('profilo')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                sezioneAttiva === 'profilo'
                  ? 'border-bronze-500 text-bronze-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              Profilo
            </button>
            <button
              onClick={() => setSezioneAttiva('archivio')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                sezioneAttiva === 'archivio'
                  ? 'border-bronze-500 text-bronze-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Archive className="w-5 h-5" />
              Archivio
            </button>
            <button
              onClick={() => setSezioneAttiva('backoffice')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                sezioneAttiva === 'backoffice'
                  ? 'border-bronze-500 text-bronze-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Backoffice
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sezioneAttiva === 'bacheca' && (
          <BachecaManifestiAgenzia agenziaId={agenzia.id} />
        )}
        {sezioneAttiva === 'profilo' && (
          <ProfiloAgenzia agenzia={agenzia} onAggiornato={caricaAgenzia} />
        )}
        {sezioneAttiva === 'archivio' && (
          <ArchivioAgenzia agenziaId={agenzia.id} />
        )}
        {sezioneAttiva === 'backoffice' && (
          <BackofficeAgenzia agenziaId={agenzia.id} />
        )}
      </main>
    </div>
  );
}
