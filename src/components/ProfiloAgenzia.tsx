import { useState } from 'react';
import { supabase, Agenzia } from '../lib/supabase';
import { Upload, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { validaDatiAgenzia } from '../lib/validazione';

interface Props {
  agenzia: Agenzia;
  onAggiornato: () => void;
}

export function ProfiloAgenzia({ agenzia, onAggiornato }: Props) {
  const [caricamento, setCaricamento] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messaggio, setMessaggio] = useState<{ tipo: 'success' | 'error'; testo: string } | null>(null);
  
  const [formData, setFormData] = useState({
    nome: agenzia.nome,
    indirizzo: agenzia.indirizzo,
    descrizione: agenzia.descrizione || '',
    telefono: agenzia.telefono,
    email: agenzia.email,
    orari_apertura: agenzia.orari_apertura || '',
    servizi_offerti: agenzia.servizi_offerti?.join(', ') || '',
    aree_coperte: agenzia.aree_coperte?.join(', ') || '',
    logo_url: agenzia.logo_url || '',
    foto_sede_url: agenzia.foto_sede_url || '',
  });

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'logo' | 'sede') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessaggio(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${agenzia.id}-${tipo}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(tipo === 'logo' ? 'agenzie-loghi' : 'agenzie-foto-sede')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(tipo === 'logo' ? 'agenzie-loghi' : 'agenzie-foto-sede')
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        [tipo === 'logo' ? 'logo_url' : 'foto_sede_url']: data.publicUrl,
      });

      setMessaggio({ tipo: 'success', testo: 'Foto caricata con successo' });
    } catch (error: any) {
      setMessaggio({ tipo: 'error', testo: 'Errore durante il caricamento: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaricamento(true);
    setMessaggio(null);

    // Validazione avanzata dei dati agenzia
    const validazione = validaDatiAgenzia({
      nome: formData.nome,
      indirizzo: formData.indirizzo,
      telefono: formData.telefono,
      email: formData.email,
    });

    if (!validazione.valido) {
      setMessaggio({ 
        tipo: 'error', 
        testo: Object.values(validazione.errori).join('. ') 
      });
      setCaricamento(false);
      return;
    }

    const datiAggiornati = {
      ...formData,
      servizi_offerti: formData.servizi_offerti.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      aree_coperte: formData.aree_coperte.split(',').map((s: string) => s.trim()).filter((s: string) => s),
    };

    const { error } = await supabase
      .from('agenzie')
      .update(datiAggiornati)
      .eq('id', agenzia.id);

    if (error) {
      setMessaggio({ tipo: 'error', testo: 'Errore durante il salvataggio: ' + error.message });
    } else {
      setMessaggio({ tipo: 'success', testo: 'Profilo aggiornato con successo' });
      onAggiornato();
    }
    setCaricamento(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profilo Agenzia</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Messaggio */}
        {messaggio && (
          <div className={`flex items-center gap-2 p-4 rounded-lg ${
            messaggio.tipo === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {messaggio.tipo === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{messaggio.testo}</span>
          </div>
        )}

        {/* Logo e Foto Sede */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Immagini</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Agenzia
              </label>
              <div className="flex items-center gap-4">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="Logo"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Nessun logo</span>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-bronze-500 text-white rounded-lg cursor-pointer hover:bg-bronze-600">
                  <Upload className="w-5 h-5" />
                  <span>{uploading ? 'Caricamento...' : 'Carica'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadFoto(e, 'logo')}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Foto Sede */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto della Sede
              </label>
              <div className="flex items-center gap-4">
                {formData.foto_sede_url ? (
                  <img
                    src={formData.foto_sede_url}
                    alt="Sede"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Nessuna foto</span>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-bronze-500 text-white rounded-lg cursor-pointer hover:bg-bronze-600">
                  <Upload className="w-5 h-5" />
                  <span>{uploading ? 'Caricamento...' : 'Carica'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadFoto(e, 'sede')}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Dati Principali */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dati Principali</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Agenzia *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo *
              </label>
              <input
                type="text"
                value={formData.indirizzo}
                onChange={(e) => setFormData({...formData, indirizzo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefono *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione
              </label>
              <textarea
                value={formData.descrizione}
                onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                placeholder="Descrivi la tua agenzia funebre..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orari di Apertura
              </label>
              <input
                type="text"
                value={formData.orari_apertura}
                onChange={(e) => setFormData({...formData, orari_apertura: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                placeholder="es. Lunedì-Venerdì 9:00-18:00, Sabato 9:00-13:00"
              />
            </div>
          </div>
        </div>

        {/* Servizi e Aree */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Servizi e Aree</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servizi Offerti
              </label>
              <textarea
                value={formData.servizi_offerti}
                onChange={(e) => setFormData({...formData, servizi_offerti: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                placeholder="Separa i servizi con una virgola, es: Trasporto salma, Cremazione, Onoranze"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa i servizi con una virgola
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aree Coperte
              </label>
              <textarea
                value={formData.aree_coperte}
                onChange={(e) => setFormData({...formData, aree_coperte: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                placeholder="Separa le aree con una virgola, es: Modena, Nonantola, Ravarino"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa le aree con una virgola
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={caricamento}
            className="flex items-center gap-2 px-6 py-3 bg-bronze-500 text-white rounded-lg font-medium hover:bg-bronze-600 disabled:opacity-50"
          >
            {caricamento ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salva Modifiche
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
