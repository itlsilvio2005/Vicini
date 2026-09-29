import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Loader2, FileText, Flower, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
  agenziaId: string;
}

export function BackofficeAgenzia({ agenziaId }: Props) {
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [stats, setStats] = useState({
    manifestiTotali: 0,
    manifestiPubblicati: 0,
    praticheTotali: 0,
    praticheInCorso: 0,
    ordiniTotali: 0,
    ordiniDaEvadere: 0,
    fatturatoTotale: 0,
  });

  useEffect(() => {
    caricaStatistiche();
  }, [agenziaId]);

  const caricaStatistiche = async () => {
    setErrore(null);
    
    // Se Supabase non è configurato, usa dati di default
    if (!isSupabaseConfigured()) {
      console.log('Supabase non configurato, uso dati di default');
      setCaricamento(false);
      return;
    }

    try {
      // Carica manifesti
      const { data: manifesti, error: manifestiError } = await supabase
        .from('manifesti')
        .select('id, pubblicato')
        .eq('agenzia_id', agenziaId);

      if (manifestiError) {
        console.error('Errore caricamento manifesti:', manifestiError);
        throw manifestiError;
      }

      // Carica pratiche
      const { data: pratiche, error: praticheError } = await supabase
        .from('pratiche')
        .select('id, stato, imponibile')
        .eq('agenzia_id', agenziaId);

      if (praticheError) {
        console.error('Errore caricamento pratiche:', praticheError);
        throw praticheError;
      }

      // Carica ordini fiori con join corretta
      const { data: ordini, error: ordiniError } = await supabase
        .from('ordini_fiori')
        .select(`
          id,
          stato,
          manifesti!inner(agenzia_id)
        `)
        .eq('manifesti.agenzia_id', agenziaId);

      if (ordiniError) {
        console.error('Errore caricamento ordini:', ordiniError);
        throw ordiniError;
      }

      setStats({
        manifestiTotali: manifesti?.length || 0,
        manifestiPubblicati: manifesti?.filter(m => m.pubblicato).length || 0,
        praticheTotali: pratiche?.length || 0,
        praticheInCorso: pratiche?.filter(p => p.stato === 'In corso').length || 0,
        ordiniTotali: ordini?.length || 0,
        ordiniDaEvadere: ordini?.filter(o => o.stato === 'Da evadere').length || 0,
        fatturatoTotale: pratiche?.reduce((sum, p) => sum + (p.imponibile || 0), 0) || 0,
      });
    } catch (err) {
      console.error('Errore caricamento statistiche:', err);
      setErrore('Impossibile caricare le statistiche. Riprova più tardi.');
    } finally {
      setCaricamento(false);
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
            onClick={caricaStatistiche}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Backoffice - Panoramica</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Manifesti */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.manifestiTotali}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Manifesti Totali</h3>
          <p className="text-xs text-gray-500">
            {stats.manifestiPubblicati} pubblicati
          </p>
        </div>

        {/* Pratiche */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.praticheTotali}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Pratiche Totali</h3>
          <p className="text-xs text-gray-500">
            {stats.praticheInCorso} in corso
          </p>
        </div>

        {/* Ordini Fiori */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Flower className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.ordiniTotali}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Ordini Fiori</h3>
          <p className="text-xs text-gray-500">
            {stats.ordiniDaEvadere} da evadere
          </p>
        </div>

        {/* Fatturato */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-bronze-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-bronze-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              € {(stats.fatturatoTotale / 1000).toFixed(1)}k
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Fatturato Totale</h3>
          <p className="text-xs text-gray-500">
            € {stats.fatturatoTotale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Attività Recenti */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recenti</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {stats.manifestiPubblicati} manifesti pubblicati nella bacheca pubblica
              </p>
              <p className="text-xs text-gray-500">Visibili a tutti i visitatori</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {stats.praticheInCorso} pratiche in corso di gestione
              </p>
              <p className="text-xs text-gray-500">Funerali in preparazione o completati</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Flower className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {stats.ordiniDaEvadere} ordini fiori in attesa di elaborazione
              </p>
              <p className="text-xs text-gray-500">Da confermare e fatturare</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info GDPR */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota Privacy:</strong> I dati mostrati sono relativi esclusivamente alla tua agenzia. 
          Le informazioni sui clienti e sulle volontà degli utenti privati sono protette da Row Level Security (RLS) 
          e non sono accessibili dalle agenzie, in conformità con il GDPR.
        </p>
      </div>
    </div>
  );
}
