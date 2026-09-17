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
  const [sezioneDemo, setSezioneDemo] = useState<SezioneDashboard>('bacheca');
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
    // Agenzia non trovata nel database: mostra dashboard demo
    const agenziaDemo: Agenzia = {
      id: 'demo-agency-id',
      user_id: utente?.id || '',
      nome: 'Onoranze Funebri Demo',
      indirizzo: 'Via Demo, 123 — Modena (MO)',
      descrizione: 'Agenzia demo per visualizzare la dashboard',
      telefono: '059 123 456',
      email: utente?.email || 'demo@vicini.mo',
      logo_url: null,
      foto_sede_url: null,
      orari_apertura: 'Lunedì-Venerdì 9:00-18:00',
      servizi_offerti: ['Trasporto salma', 'Allestimento camera ardente', 'Organizzazione cerimonia'],
      aree_coperte: ['Modena', 'Provincia'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Dashboard */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Agenzia</h1>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  ⚠️ Modalità Demo - Profilo non configurato
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

        {/* Messaggio informativo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-yellow-900 mb-2">⚠️ Profilo Agenzia Non Trovato</h2>
            <p className="text-yellow-800 mb-3">
              Il tuo account è registrato come agenzia, ma non è stato ancora creato un profilo agenzia nel database.
            </p>
            <p className="text-yellow-800 mb-3">
              <strong>Per configurare il profilo:</strong>
            </p>
            <ol className="list-decimal list-inside text-yellow-800 space-y-1 mb-3">
              <li>Vai su Supabase Dashboard → Table Editor</li>
              <li>Clicca sulla tabella <code className="bg-yellow-100 px-2 py-0.5 rounded">agenzie</code></li>
              <li>Clicca "+ New Row"</li>
              <li>Compila i campi con i dati della tua agenzia</li>
              <li>Assicurati che <code className="bg-yellow-100 px-2 py-0.5 rounded">user_id</code> sia: <code className="bg-yellow-100 px-2 py-0.5 rounded">{utente?.id}</code></li>
            </ol>
            <p className="text-yellow-800">
              Nel frattempo, stai visualizzando una dashboard demo con dati di esempio.
            </p>
          </div>

          {/* Dashboard demo */}
          <DashboardContent 
            agenzia={agenziaDemo} 
            sezioneAttiva={sezioneDemo}
            setSezioneAttiva={setSezioneDemo}
            onAggiornato={() => {}}
          />
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

      {/* Content */}
      <DashboardContent agenzia={agenzia} sezioneAttiva={sezioneAttiva} setSezioneAttiva={setSezioneAttiva} onAggiornato={caricaAgenzia} />
    </div>
  );
}

// Componente per il contenuto della dashboard (riutilizzabile)
function DashboardContent({ 
  agenzia, 
  sezioneAttiva, 
  setSezioneAttiva,
  onAggiornato 
}: { 
  agenzia: Agenzia; 
  sezioneAttiva: SezioneDashboard;
  setSezioneAttiva: (s: SezioneDashboard) => void;
  onAggiornato: () => void;
}) {
  return (
    <>
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
          <ProfiloAgenzia agenzia={agenzia} onAggiornato={onAggiornato} />
        )}
        {sezioneAttiva === 'archivio' && (
          <ArchivioAgenzia agenziaId={agenzia.id} />
        )}
        {sezioneAttiva === 'backoffice' && (
          <BackofficeAgenzia agenziaId={agenzia.id} />
        )}
      </main>
    </>
  );
}
