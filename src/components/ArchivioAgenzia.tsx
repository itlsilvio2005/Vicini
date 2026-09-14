import { useState, useEffect } from 'react';
import { supabase, Pratica, OrdineFiori } from '../lib/supabase';
import { Loader2, FileText, Flower, Eye, Send } from 'lucide-react';

interface Props {
  agenziaId: string;
}

export function ArchivioAgenzia({ agenziaId }: Props) {
  const [tabAttivo, setTabAttivo] = useState<'pratiche' | 'ordini'>('pratiche');
  const [pratiche, setPratiche] = useState<Pratica[]>([]);
  const [ordini, setOrdini] = useState<OrdineFiori[]>([]);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    caricaDati();
  }, [agenziaId]);

  const caricaDati = async () => {
    const [praticheResult, ordiniResult] = await Promise.all([
      supabase
        .from('pratiche')
        .select('*')
        .eq('agenzia_id', agenziaId)
        .order('created_at', { ascending: false }),
      supabase
        .from('ordini_fiori')
        .select(`
          *,
          manifesti!inner(agenzia_id)
        `)
        .eq('manifesti.agenzia_id', agenziaId)
        .order('created_at', { ascending: false }),
    ]);

    if (praticheResult.data) setPratiche(praticheResult.data);
    if (ordiniResult.data) setOrdini(ordiniResult.data);
    setCaricamento(false);
  };

  const handleInviaFattura = async (ordineId: string, email: string) => {
    const { error } = await supabase
      .from('ordini_fiori')
      .update({ fattura_inviata: true })
      .eq('id', ordineId);

    if (error) {
      alert('Errore durante l\'invio della fattura');
    } else {
      setOrdini(ordini.map(o => 
        o.id === ordineId ? { ...o, fattura_inviata: true } : o
      ));
      alert(`Fattura inviata a ${email}`);
    }
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Archivio</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTabAttivo('pratiche')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            tabAttivo === 'pratiche'
              ? 'bg-bronze-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          Pratiche ({pratiche.length})
        </button>
        <button
          onClick={() => setTabAttivo('ordini')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            tabAttivo === 'ordini'
              ? 'bg-bronze-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Flower className="w-5 h-5" />
          Ordini Fiori ({ordini.length})
        </button>
      </div>

      {/* Pratiche */}
      {tabAttivo === 'pratiche' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {pratiche.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nessuna pratica archiviata
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fattura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defunto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comune</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Importo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pratiche.map(pratica => (
                  <tr key={pratica.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {pratica.num_fattura}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {pratica.defunto}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {pratica.comune}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {pratica.data_cerimonia}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      € {pratica.imponibile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pratica.stato === 'Completata'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {pratica.stato}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Ordini Fiori */}
      {tabAttivo === 'ordini' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {ordini.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nessun ordine fiori
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Composizione</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Importo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ordini.map(ordine => (
                  <tr key={ordine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {ordine.cliente_nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ordine.cliente_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ordine.composizione}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      € {ordine.importo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ordine.stato === 'Completato'
                          ? 'bg-green-100 text-green-700'
                          : ordine.stato === 'Confermato'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ordine.stato}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ordine.fattura_inviata ? (
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Fattura inviata
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInviaFattura(ordine.id, ordine.cliente_email)}
                          className="flex items-center gap-1 px-3 py-1 bg-bronze-500 text-white rounded-lg text-sm font-medium hover:bg-bronze-600"
                        >
                          <Send className="w-4 h-4" />
                          Invia Fattura
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
