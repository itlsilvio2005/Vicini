import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, FileText, Flower, Users, TrendingUp } from 'lucide-react';

interface Props {
  agenziaId: string;
}

export function BackofficeAgenzia({ agenziaId }: Props) {
  const [caricamento, setCaricamento] = useState(true);
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
    const [manifestiResult, praticheResult, ordiniResult] = await Promise.all([
      supabase.from('manifesti').select('id, pubblicato').eq('agenzia_id', agenziaId),
      supabase.from('pratiche').select('id, stato, imponibile').eq('agenzia_id', agenziaId),
      supabase.from('ordini_fiori').select('id, stato').eq('manifesti.agenzia_id', agenziaId),
    ]);

    const manifesti = manifestiResult.data || [];
    const pratiche = praticheResult.data || [];
    const ordini = ordiniResult.data || [];

    setStats({
      manifestiTotali: manifesti.length,
      manifestiPubblicati: manifesti.filter(m => m.pubblicato).length,
      praticheTotali: pratiche.length,
      praticheInCorso: pratiche.filter(p => p.stato === 'In corso').length,
      ordiniTotali: ordini.length,
      ordiniDaEvadere: ordini.filter(o => o.stato === 'Da evadere').length,
      fatturatoTotale: pratiche.reduce((sum, p) => sum + (p.imponibile || 0), 0),
    });

    setCaricamento(false);
  };

  if (caricamento) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-bronze-500" />
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
