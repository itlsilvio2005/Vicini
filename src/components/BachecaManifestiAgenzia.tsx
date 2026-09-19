import { useState, useEffect } from 'react';
import { supabase, Manifesto, isSupabaseConfigured } from '../lib/supabase';
import { Plus, Edit2, Trash2, Eye, Loader2, AlertCircle } from 'lucide-react';
import { COMUNI, RITI } from '../data';

interface Props {
  agenziaId: string;
}

export function BachecaManifestiAgenzia({ agenziaId }: Props) {
  const [manifesti, setManifesti] = useState<Manifesto[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [mostraForm, setMostraForm] = useState(false);
  const [manifestoEdit, setManifestoEdit] = useState<Manifesto | null>(null);

  useEffect(() => {
    caricaManifesti();
  }, [agenziaId]);

  const caricaManifesti = async () => {
    setErrore(null);
    
    // Se Supabase non è configurato, usa lista vuota
    if (!isSupabaseConfigured()) {
      console.log('Supabase non configurato, bacheca vuota');
      setCaricamento(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('manifesti')
        .select('*')
        .eq('agenzia_id', agenziaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore caricamento manifesti:', error);
        throw error;
      }

      setManifesti(data || []);
    } catch (err) {
      console.error('Errore caricamento bacheca:', err);
      setErrore('Impossibile caricare i manifesti. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };

  const handleElimina = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo manifesto?')) return;

    const { error } = await supabase.from('manifesti').delete().eq('id', id);

    if (error) {
      alert('Errore durante l\'eliminazione');
    } else {
      setManifesti(manifesti.filter(m => m.id !== id));
    }
  };

  const handleTogglePubblicato = async (id: string, pubblicato: boolean) => {
    const { error } = await supabase
      .from('manifesti')
      .update({ pubblicato: !pubblicato })
      .eq('id', id);

    if (error) {
      alert('Errore durante l\'aggiornamento');
    } else {
      setManifesti(manifesti.map(m => 
        m.id === id ? { ...m, pubblicato: !pubblicato } : m
      ));
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
            onClick={caricaManifesti}
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bacheca Manifesti</h2>
        <button
          onClick={() => {
            setManifestoEdit(null);
            setMostraForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-bronze-500 text-white rounded-lg font-medium hover:bg-bronze-600"
        >
          <Plus className="w-5 h-5" />
          Nuovo Manifesto
        </button>
      </div>

      {/* Lista Manifesti */}
      {manifesti.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">Nessun manifesto creato</p>
          <button
            onClick={() => setMostraForm(true)}
            className="px-6 py-3 bg-bronze-500 text-white rounded-lg font-medium hover:bg-bronze-600"
          >
            Crea il primo manifesto
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {manifesti.map(manifesto => (
            <div key={manifesto.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{manifesto.nome_defunto}</h3>
                  <p className="text-gray-600">
                    {manifesto.comune} · {manifesto.rito}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTogglePubblicato(manifesto.id, manifesto.pubblicato)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      manifesto.pubblicato
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {manifesto.pubblicato ? 'Pubblicato' : 'Bozza'}
                  </button>
                  <button
                    onClick={() => {
                      setManifestoEdit(manifesto);
                      setMostraForm(true);
                    }}
                    className="p-2 text-gray-600 hover:text-bronze-600"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleElimina(manifesto.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Data Morte</p>
                  <p className="font-medium">{manifesto.data_morte || 'Non specificata'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Funerale</p>
                  <p className="font-medium">
                    {manifesto.funerale_giorno ? `${manifesto.funerale_giorno} ore ${manifesto.funerale_ora}` : 'Non programmato'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Commiato</p>
                  <p className="font-medium">{manifesto.commiato_tipo || 'Non specificato'}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm text-gray-500">
                <span>Creato: {new Date(manifesto.created_at).toLocaleDateString('it-IT')}</span>
                <span>Aggiornato: {new Date(manifesto.updated_at).toLocaleDateString('it-IT')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Creazione/Modifica */}
      {mostraForm && (
        <FormManifesto
          agenziaId={agenziaId}
          manifesto={manifestoEdit}
          onSalvato={() => {
            setMostraForm(false);
            setManifestoEdit(null);
            caricaManifesti();
          }}
          onAnnullato={() => {
            setMostraForm(false);
            setManifestoEdit(null);
          }}
        />
      )}
    </div>
  );
}

// Form per creazione/modifica manifesto
function FormManifesto({
  agenziaId,
  manifesto,
  onSalvato,
  onAnnullato,
}: {
  agenziaId: string;
  manifesto: Manifesto | null;
  onSalvato: () => void;
  onAnnullato: () => void;
}) {
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState('');
  
  const [formData, setFormData] = useState({
    nome_defunto: manifesto?.nome_defunto || '',
    anni: manifesto?.anni || '',
    data_nascita: manifesto?.data_nascita || '',
    data_morte: manifesto?.data_morte || '',
    comune: manifesto?.comune || 'Modena',
    rito: manifesto?.rito || 'Cattolico',
    camera_ardente_luogo: manifesto?.camera_ardente_luogo || '',
    camera_ardente_indirizzo: manifesto?.camera_ardente_indirizzo || '',
    camera_ardente_orari: manifesto?.camera_ardente_orari || '',
    camera_ardente_indicazioni: manifesto?.camera_ardente_indicazioni || '',
    funerale_giorno: manifesto?.funerale_giorno || '',
    funerale_ora: manifesto?.funerale_ora || '',
    funerale_luogo: manifesto?.funerale_luogo || '',
    funerale_indirizzo: manifesto?.funerale_indirizzo || '',
    funerale_dettagli: manifesto?.funerale_dettagli || '',
    commiato_tipo: manifesto?.commiato_tipo || '',
    commiato_luogo: manifesto?.commiato_luogo || '',
    commiato_cimitero: manifesto?.commiato_cimitero || '',
    pubblicato: manifesto?.pubblicato ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaricamento(true);
    setErrore('');

    const datiManifesto = {
      ...formData,
      agenzia_id: agenziaId,
      anni: formData.anni ? parseInt(formData.anni as string) : null,
    };

    let error;
    if (manifesto) {
      // Aggiorna
      const result = await supabase
        .from('manifesti')
        .update(datiManifesto)
        .eq('id', manifesto.id);
      error = result.error;
    } else {
      // Crea
      const result = await supabase
        .from('manifesti')
        .insert([datiManifesto]);
      error = result.error;
    }

    if (error) {
      setErrore('Errore durante il salvataggio: ' + error.message);
    } else {
      onSalvato();
    }
    setCaricamento(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">
            {manifesto ? 'Modifica Manifesto' : 'Nuovo Manifesto'}
          </h3>
          <button
            onClick={onAnnullato}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errore && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{errore}</span>
            </div>
          )}

          {/* Dati Defunto */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Dati del Defunto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome_defunto}
                  onChange={(e) => setFormData({...formData, nome_defunto: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Età
                </label>
                <input
                  type="number"
                  value={formData.anni}
                  onChange={(e) => setFormData({...formData, anni: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Nascita
                </label>
                <input
                  type="text"
                  value={formData.data_nascita}
                  onChange={(e) => setFormData({...formData, data_nascita: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                  placeholder="es. 15 marzo 1946"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Morte *
                </label>
                <input
                  type="text"
                  value={formData.data_morte}
                  onChange={(e) => setFormData({...formData, data_morte: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                  placeholder="es. 10 febbraio 2026"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comune *
                </label>
                <select
                  value={formData.comune}
                  onChange={(e) => setFormData({...formData, comune: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                  required
                >
                  {COMUNI.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rito *
                </label>
                <select
                  value={formData.rito}
                  onChange={(e) => setFormData({...formData, rito: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                  required
                >
                  {RITI.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Camera Ardente */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Camera Ardente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Luogo
                </label>
                <input
                  type="text"
                  value={formData.camera_ardente_luogo}
                  onChange={(e) => setFormData({...formData, camera_ardente_luogo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indirizzo
                </label>
                <input
                  type="text"
                  value={formData.camera_ardente_indirizzo}
                  onChange={(e) => setFormData({...formData, camera_ardente_indirizzo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orari
                </label>
                <input
                  type="text"
                  value={formData.camera_ardente_orari}
                  onChange={(e) => setFormData({...formData, camera_ardente_orari: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                  placeholder="es. Oggi 9:00-19:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indicazioni
                </label>
                <input
                  type="text"
                  value={formData.camera_ardente_indicazioni}
                  onChange={(e) => setFormData({...formData, camera_ardente_indicazioni: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>
            </div>
          </div>

          {/* Funerale */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Funerale</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giorno
                </label>
                <input
                  type="text"
                  value={formData.funerale_giorno}
                  onChange={(e) => setFormData({...formData, funerale_giorno: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                  placeholder="es. Giovedì 12 febbraio 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ora
                </label>
                <input
                  type="text"
                  value={formData.funerale_ora}
                  onChange={(e) => setFormData({...formData, funerale_ora: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                  placeholder="es. 10:30"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Luogo
                </label>
                <input
                  type="text"
                  value={formData.funerale_luogo}
                  onChange={(e) => setFormData({...formData, funerale_luogo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indirizzo
                </label>
                <input
                  type="text"
                  value={formData.funerale_indirizzo}
                  onChange={(e) => setFormData({...formData, funerale_indirizzo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dettagli
                </label>
                <textarea
                  value={formData.funerale_dettagli}
                  onChange={(e) => setFormData({...formData, funerale_dettagli: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>
            </div>
          </div>

          {/* Commiato */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Commiato</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.commiato_tipo}
                  onChange={(e) => setFormData({...formData, commiato_tipo: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                >
                  <option value="">Seleziona...</option>
                  <option value="Tumulazione">Tumulazione</option>
                  <option value="Cremazione">Cremazione</option>
                  <option value="Inumazione">Inumazione</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Luogo
                </label>
                <input
                  type="text"
                  value={formData.commiato_luogo}
                  onChange={(e) => setFormData({...formData, commiato_luogo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cimitero
                </label>
                <input
                  type="text"
                  value={formData.commiato_cimitero}
                  onChange={(e) => setFormData({...formData, commiato_cimitero: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>
            </div>
          </div>

          {/* Pubblicazione */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pubblicato"
              checked={formData.pubblicato}
              onChange={(e) => setFormData({...formData, pubblicato: e.target.checked})}
              className="w-5 h-5 text-bronze-500 rounded focus:ring-bronze-500"
            />
            <label htmlFor="pubblicato" className="text-sm font-medium text-gray-700">
              Pubblica immediatamente nella bacheca pubblica
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onAnnullato}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={caricamento}
              className="flex-1 px-6 py-3 bg-bronze-500 text-white rounded-lg font-medium hover:bg-bronze-600 disabled:opacity-50 flex items-center justify-center"
            >
              {caricamento ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Salvataggio...
                </>
              ) : (
                'Salva Manifesto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
