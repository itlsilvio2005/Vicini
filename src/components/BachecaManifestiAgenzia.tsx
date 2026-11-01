import { useState, useEffect, useRef } from 'react';
import { supabase, Manifesto, isSupabaseConfigured } from '../lib/supabase';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Sparkles, Camera, Upload, Zap, Image as ImageIcon, CheckCircle2, X } from 'lucide-react';
import { COMUNI, RITI } from '../data';

interface Props {
  agenziaId: string;
}

export interface OpzioneAgenzia {
  id: string;
  nome: string;
}

const CAMERE_ARDENTI_RAPIDE = [
  { etichetta: 'Terracielo Modena', luogo: 'Terracielo Funeral Home', indirizzo: 'Via Emilia Est 1320, Modena', orari: 'Tutti i giorni 8:00 - 19:30' },
  { etichetta: 'Policlinico Modena', luogo: 'Camere Ardenti Policlinico di Modena', indirizzo: 'Via del Pozzo 71, Modena', orari: 'Feriali e festivi 8:30 - 18:00' },
  { etichetta: 'Osp. Baggiovara', luogo: 'Ospedale Civile di Baggiovara', indirizzo: 'Via Pietro Giardini 1355, Modena', orari: 'Tutti i giorni 8:30 - 18:00' },
  { etichetta: 'Osp. Carpi', luogo: 'Camere Ardenti Ospedale Ramazzini', indirizzo: 'Via Guido Molinari 2, Carpi', orari: '8:30 - 18:30' },
  { etichetta: 'Osp. Sassuolo', luogo: 'Ospedale di Sassuolo', indirizzo: 'Via Francesco Ruini 2, Sassuolo', orari: '8:30 - 18:30' },
  { etichetta: 'Abitazione', luogo: 'Abitazione privata', indirizzo: '', orari: '9:00 - 19:00' },
];

type TipoCommiato = 'Tumulazione' | 'Cremazione' | 'Inumazione';
const CIMITERI_RAPIDI: { etichetta: string; tipo: TipoCommiato; luogo: string; cimitero: string }[] = [
  { etichetta: 'Crematorio Modena', tipo: 'Cremazione', luogo: 'Tempio Crematorio di Modena', cimitero: 'Cimitero di San Cataldo (Modena)' },
  { etichetta: 'San Cataldo (Tumulazione)', tipo: 'Tumulazione', luogo: 'Cimitero Monumentale di San Cataldo', cimitero: 'San Cataldo, Modena' },
  { etichetta: 'Cimitero locale', tipo: 'Tumulazione', luogo: 'Cimitero cittadino', cimitero: 'Cimitero comunale' },
];

const ORARI_FUNERALE_RAPIDI = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:30', '15:00', '15:30', '16:00'];

function formattaDataItaliana(offsetGiorni: number, conGiornoSettimana = false): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetGiorni);
  if (conGiornoSettimana) {
    const s = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Comprime l'immagine lato client per caricamento istantaneo e fallback DataURL
async function comprimiImmagine(file: File, maxDim = 700, quality = 0.82): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas non supportato'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => (blob ? resolve({ blob, dataUrl }) : reject(new Error('Compressione fallita'))),
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Estrae i campi del manifesto dal testo letto tramite OCR o incollato
function analizzaTestoManifesto(rawText: string) {
  const testo = rawText.replace(/\r/g, '\n').trim();
  const righe = testo.split('\n').map((r) => r.trim()).filter(Boolean);
  const risultato: Record<string, any> = {};

  // 1. Età ("di anni 84" o "anni 84")
  const matchAnni = testo.match(/(?:di\s+anni|anni)\s+(\d{1,3})/i);
  if (matchAnni) {
    risultato.anni = matchAnni[1];
  }

  // 2. Comune (cerca tra i comuni di Modena)
  for (const c of COMUNI) {
    const re = new RegExp(`\\b${c}\\b`, 'i');
    if (re.test(testo)) {
      risultato.comune = c;
      break;
    }
  }

  // 3. Ora del funerale ("alle ore 10:30", "ore 15.00", "ore 10,30")
  const matchOra = testo.match(/(?:alle\s+ore|ore)\s*(\d{1,2})[:.,](\d{2})/i);
  if (matchOra) {
    risultato.funerale_ora = `${matchOra[1].padStart(2, '0')}:${matchOra[2]}`;
  }

  // 4. Giorno del funerale ("Lunedì 3 novembre...", "Martedì 4...")
  const matchGiorno = testo.match(/((?:luned[iì]|marted[iì]|mercoled[iì]|gioved[iì]|venerd[iì]|sabato|domenica)\s+\d{1,2}\s+[a-zàèéìòù]+(?:\s+\d{4})?)/i);
  if (matchGiorno) {
    const g = matchGiorno[1].trim();
    risultato.funerale_giorno = g.charAt(0).toUpperCase() + g.slice(1);
  }

  // 5. Data di morte ("il giorno 1 novembre 2026", "spent[oa] il 1/11/2026", ecc.)
  const matchMorte = testo.match(/(?:il\s+giorno|mancat[oa].*?il|spent[oa].*?il|decedut[oa].*?il)\s+(\d{1,2}\s+[a-zàèéìòù]+(?:\s+\d{4})?|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (matchMorte) {
    risultato.data_morte = matchMorte[1].trim();
  }

  // 6. Camera ardente
  if (/terracielo/i.test(testo)) {
    risultato.camera_ardente_luogo = 'Terracielo Funeral Home';
    risultato.camera_ardente_indirizzo = 'Via Emilia Est 1320, Modena';
  } else if (/policlinico/i.test(testo)) {
    risultato.camera_ardente_luogo = 'Camere Ardenti Policlinico di Modena';
    risultato.camera_ardente_indirizzo = 'Via del Pozzo 71, Modena';
  } else if (/baggiovara/i.test(testo)) {
    risultato.camera_ardente_luogo = 'Ospedale Civile di Baggiovara';
    risultato.camera_ardente_indirizzo = 'Via Pietro Giardini 1355, Modena';
  }

  // 7. Luogo funerale (Chiesa / Parrocchia / Duomo)
  const matchChiesa = testo.match(/((?:Chiesa\s+Parrocchiale|Chiesa|Parrocchia|Duomo|Santuario)\s+(?:di\s+)?[^\n,.;]{3,45})/i);
  if (matchChiesa) {
    risultato.funerale_luogo = matchChiesa[1].trim();
  }

  // 8. Commiato
  if (/cremazion|crematorio/i.test(testo)) {
    risultato.commiato_tipo = 'Cremazione';
    risultato.commiato_luogo = 'Tempio Crematorio di Modena';
  } else if (/tumulazion/i.test(testo)) {
    risultato.commiato_tipo = 'Tumulazione';
  } else if (/inumazion/i.test(testo)) {
    risultato.commiato_tipo = 'Inumazione';
  }
  if (/san\s+cataldo/i.test(testo)) {
    risultato.commiato_cimitero = 'Cimitero di San Cataldo (Modena)';
    if (!risultato.commiato_tipo) risultato.commiato_tipo = 'Tumulazione';
  }

  // 9. Nome del defunto: cerca la riga subito prima di "di anni" oppure una riga tutta in MAIUSCOLO con 2-4 parole
  const idxAnni = righe.findIndex((r) => /(?:di\s+anni|anni)\s+\d{1,3}/i.test(r));
  if (idxAnni > 0) {
    const candidata = righe[idxAnni - 1].replace(/[^a-zA-ZÀ-ÿ'\s\-]/g, '').trim();
    if (candidata.split(/\s+/).length >= 2 && candidata.length <= 45) {
      risultato.nome_defunto = candidata;
    }
  }
  if (!risultato.nome_defunto) {
    const rigaMaiuscola = righe.find((r) => {
      const pulita = r.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
      const parole = pulita.split(/\s+/);
      return (
        parole.length >= 2 &&
        parole.length <= 4 &&
        pulita.length >= 6 &&
        pulita === pulita.toUpperCase() &&
        !/ONORANZE|FUNEBRI|COMUNE|PROVINCIA|MODENA|FAMIGLIA|RINGRAZIA/i.test(pulita)
      );
    });
    if (rigaMaiuscola) {
      risultato.nome_defunto = rigaMaiuscola
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  }

  return risultato;
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
    if (!isSupabaseConfigured()) {
      setCaricamento(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('manifesti')
        .select('*')
        .eq('agenzia_id', agenziaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
      setManifesti(manifesti.filter((m) => m.id !== id));
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
      setManifesti(
        manifesti.map((m) => (m.id === id ? { ...m, pubblicato: !pubblicato } : m))
      );
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
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bacheca Manifesti</h2>
          <p className="text-sm text-gray-500">Carica un manifesto compilando i campi rapidi oppure scansionando una foto.</p>
        </div>
        <button
          onClick={() => {
            setManifestoEdit(null);
            setMostraForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-bronze-500 text-white rounded-lg font-medium hover:bg-bronze-600 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nuovo Manifesto Rapido
        </button>
      </div>

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
          {manifesti.map((manifesto) => (
            <div key={manifesto.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-4">
                  {(manifesto as any).foto_url ? (
                    <img
                      src={(manifesto as any).foto_url}
                      alt={manifesto.nome_defunto}
                      className="w-16 h-20 object-cover rounded-lg border border-bronze-300 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{manifesto.nome_defunto}</h3>
                    <p className="text-gray-600">
                      {manifesto.anni ? `${manifesto.anni} anni · ` : ''}{manifesto.comune} · {manifesto.rito}
                    </p>
                  </div>
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
                    title="Modifica"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleElimina(manifesto.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                    title="Elimina"
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
                    {manifesto.funerale_giorno
                      ? `${manifesto.funerale_giorno}${manifesto.funerale_ora ? ` ore ${manifesto.funerale_ora}` : ''}`
                      : 'Non programmato'}
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

export function FormManifesto({
  agenziaId,
  agenzieDisponibili,
  manifesto,
  onSalvato,
  onAnnullato,
}: {
  agenziaId: string;
  agenzieDisponibili?: OpzioneAgenzia[];
  manifesto: Manifesto | null;
  onSalvato: () => void;
  onAnnullato: () => void;
}) {
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState('');
  const [agenziaSelezionata, setAgenziaSelezionata] = useState(
    manifesto?.agenzia_id || agenziaId || (agenzieDisponibili?.[0]?.id ?? '')
  );

  // Stato per OCR e analisi automatica da foto/testo
  const [scansioneInCorso, setScansioneInCorso] = useState(false);
  const [progressoOcr, setProgressoOcr] = useState(0);
  const [messaggioSmart, setMessaggioSmart] = useState<string | null>(null);
  const [testoLibero, setTestoLibero] = useState('');
  const [mostraIncollaTesto, setMostraIncollaTesto] = useState(false);

  // Stato per la foto del defunto
  const [caricamentoFoto, setCaricamentoFoto] = useState(false);
  const inputOcrRef = useRef<HTMLInputElement | null>(null);
  const inputFotoRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    nome_defunto: manifesto?.nome_defunto || '',
    anni: manifesto?.anni || '',
    data_nascita: manifesto?.data_nascita || '',
    data_morte: manifesto?.data_morte || formattaDataItaliana(0, false),
    comune: manifesto?.comune || 'Modena',
    rito: manifesto?.rito || 'Cattolico',
    camera_ardente_luogo: manifesto?.camera_ardente_luogo || '',
    camera_ardente_indirizzo: manifesto?.camera_ardente_indirizzo || '',
    camera_ardente_orari: manifesto?.camera_ardente_orari || '9:00 - 19:00',
    camera_ardente_indicazioni: manifesto?.camera_ardente_indicazioni || '',
    funerale_giorno: manifesto?.funerale_giorno || formattaDataItaliana(1, true),
    funerale_ora: manifesto?.funerale_ora || '10:00',
    funerale_luogo: manifesto?.funerale_luogo || '',
    funerale_indirizzo: manifesto?.funerale_indirizzo || '',
    funerale_dettagli: manifesto?.funerale_dettagli || '',
    commiato_tipo: manifesto?.commiato_tipo || 'Tumulazione',
    commiato_luogo: manifesto?.commiato_luogo || '',
    commiato_cimitero: manifesto?.commiato_cimitero || '',
    foto_url: (manifesto as any)?.foto_url || '',
    pubblicato: manifesto?.pubblicato ?? true,
  });

  // Carica la foto del defunto (prova Supabase Storage e usa DataURL compresso come fallback sicuro)
  const handleCaricaFotoDefunto = async (file: File) => {
    setCaricamentoFoto(true);
    setErrore('');
    try {
      const { blob, dataUrl } = await comprimiImmagine(file, 600, 0.84);
      const nomeFile = `${agenziaSelezionata || 'admin'}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { error: uploadErr } = await supabase.storage
        .from('manifesti-foto')
        .upload(nomeFile, blob, { contentType: 'image/jpeg', upsert: true });

      if (!uploadErr) {
        const { data: pubUrl } = supabase.storage.from('manifesti-foto').getPublicUrl(nomeFile);
        setFormData((prev) => ({ ...prev, foto_url: pubUrl.publicUrl || dataUrl }));
      } else {
        // Fallback immediato in base64 compresso se il bucket non è ancora attivo
        setFormData((prev) => ({ ...prev, foto_url: dataUrl }));
      }
    } catch (e: any) {
      setErrore('Impossibile elaborare la foto selezionata.');
    } finally {
      setCaricamentoFoto(false);
    }
  };

  // Legge un'immagine di manifesto con OCR (Tesseract.js via CDN) e compila i campi
  const handleScansionaManifesto = async (file: File) => {
    setScansioneInCorso(true);
    setProgressoOcr(10);
    setMessaggioSmart(null);
    setErrore('');

    try {
      // Usa anche l'immagine come anteprima se non c'è ancora una foto
      const { dataUrl } = await comprimiImmagine(file, 1400, 0.9);

      // Carica Tesseract.js dinamicamente dal CDN ufficiale solo quando serve
      if (!(window as any).Tesseract) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Impossibile caricare il motore OCR.'));
          document.head.appendChild(script);
        });
      }

      const Tesseract = (window as any).Tesseract;
      const result = await Tesseract.recognize(dataUrl, 'ita', {
        logger: (m: any) => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            setProgressoOcr(Math.round(m.progress * 100));
          }
        },
      });

      const testoEstratto: string = result?.data?.text || '';
      if (!testoEstratto.trim()) {
        throw new Error('Nessun testo leggibile trovato nell\'immagine.');
      }

      setTestoLibero(testoEstratto);
      const estratti = analizzaTestoManifesto(testoEstratto);
      setFormData((prev) => ({
        ...prev,
        ...estratti,
      }));

      const quantiCampi = Object.keys(estratti).length;
      setMessaggioSmart(
        quantiCampi > 0
          ? `Foto analizzata! Ho compilato automaticamente ${quantiCampi} campi dal manifesto. Controlla e clicca Salva.`
          : 'Testo letto dalla foto. Controlla i campi qui sotto prima di salvare.'
      );
    } catch (err: any) {
      console.error('Errore OCR:', err);
      setErrore(err.message || 'Errore durante la lettura della foto del manifesto.');
    } finally {
      setScansioneInCorso(false);
      setProgressoOcr(0);
    }
  };

  const handleApplicaTestoIncollato = () => {
    if (!testoLibero.trim()) return;
    const estratti = analizzaTestoManifesto(testoLibero);
    setFormData((prev) => ({ ...prev, ...estratti }));
    setMessaggioSmart(`Campi estratti dal testo (${Object.keys(estratti).length} rilevati)!`);
    setMostraIncollaTesto(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agenziaSelezionata) {
      setErrore('Seleziona un\'agenzia a cui associare il manifesto.');
      return;
    }
    setCaricamento(true);
    setErrore('');

    const datiBase: Record<string, any> = {
      nome_defunto: formData.nome_defunto,
      anni: formData.anni ? parseInt(formData.anni as string) : null,
      data_nascita: formData.data_nascita,
      data_morte: formData.data_morte,
      comune: formData.comune,
      rito: formData.rito,
      camera_ardente_luogo: formData.camera_ardente_luogo,
      camera_ardente_indirizzo: formData.camera_ardente_indirizzo,
      camera_ardente_orari: formData.camera_ardente_orari,
      camera_ardente_indicazioni: formData.camera_ardente_indicazioni,
      funerale_giorno: formData.funerale_giorno,
      funerale_ora: formData.funerale_ora,
      funerale_luogo: formData.funerale_luogo,
      funerale_indirizzo: formData.funerale_indirizzo,
      funerale_dettagli: formData.funerale_dettagli,
      commiato_tipo: formData.commiato_tipo,
      commiato_luogo: formData.commiato_luogo,
      commiato_cimitero: formData.commiato_cimitero,
      pubblicato: formData.pubblicato,
      agenzia_id: agenziaSelezionata,
    };

    const datiConFoto = formData.foto_url ? { ...datiBase, foto_url: formData.foto_url } : datiBase;

    let error;
    if (manifesto) {
      let res = await supabase.from('manifesti').update(datiConFoto).eq('id', manifesto.id);
      if (res.error && res.error.message?.includes('foto_url')) {
        res = await supabase.from('manifesti').update(datiBase).eq('id', manifesto.id);
      }
      error = res.error;
    } else {
      let res = await supabase.from('manifesti').insert([datiConFoto]);
      if (res.error && res.error.message?.includes('foto_url')) {
        res = await supabase.from('manifesti').insert([datiBase]);
      }
      error = res.error;
    }

    if (error) {
      setErrore('Errore durante il salvataggio: ' + error.message);
    } else {
      onSalvato();
    }
    setCaricamento(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {manifesto ? 'Modifica Manifesto' : 'Inserimento Rapido Manifesto'}
            </h3>
            <p className="text-xs text-gray-500">
              Compila con un clic oppure carica la foto di un manifesto per estrarre i dati automaticamente
            </p>
          </div>
          <button
            onClick={onAnnullato}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* BARRA DI COMPILAZIONE INTELLIGENTE DA FOTO O TESTO */}
          <div className="rounded-xl border-2 border-dashed border-bronze-400 bg-amber-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-bronze-500 text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Compilazione automatica da Foto del Manifesto (OCR)
                  </h4>
                  <p className="text-xs text-gray-600">
                    Hai la foto o la locandina del manifesto? Caricala qui e l&apos;app estrarrà nome, età, date, chiesa e orari.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <input
                  ref={inputOcrRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleScansionaManifesto(f);
                  }}
                />
                <button
                  type="button"
                  disabled={scansioneInCorso}
                  onClick={() => inputOcrRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-night-900 text-bronze-300 text-xs font-bold uppercase tracking-wider hover:bg-night-800 disabled:opacity-50"
                >
                  {scansioneInCorso ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Lettura in corso ({progressoOcr}%)...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Da foto manifesto
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMostraIncollaTesto(!mostraIncollaTesto)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  <Zap className="w-3.5 h-3.5 text-bronze-600" />
                  Incolla testo
                </button>
              </div>
            </div>

            {mostraIncollaTesto && (
              <div className="mt-3 pt-3 border-t border-amber-200 space-y-2">
                <textarea
                  value={testoLibero}
                  onChange={(e) => setTestoLibero(e.target.value)}
                  rows={3}
                  placeholder="Incolla qui il testo del necrologio (es. 'È mancato Mario Rossi di anni 82... I funerali avranno luogo Lunedì 3 novembre alle ore 10:30 partendo da Terracielo...')"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={handleApplicaTestoIncollato}
                  className="px-4 py-1.5 rounded-lg bg-bronze-500 text-white text-xs font-bold hover:bg-bronze-600"
                >
                  Estrai dati dal testo
                </button>
              </div>
            )}

            {messaggioSmart && (
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-800 bg-green-100/80 border border-green-300 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" />
                <span>{messaggioSmart}</span>
              </div>
            )}
          </div>

          {errore && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errore}</span>
            </div>
          )}

          {/* Scelta Agenzia (visibile in modalità Admin) */}
          {agenzieDisponibili && agenzieDisponibili.length > 0 && (
            <div className="rounded-xl border border-bronze-300 bg-stone-50 p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Agenzia Funebre di riferimento *
              </label>
              <select
                value={agenziaSelezionata}
                onChange={(e) => setAgenziaSelezionata(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-bronze-500"
                required
              >
                {agenzieDisponibili.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SEZIONE 1: FOTO + DATI PRINCIPALI DEFUNTO */}
          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 items-start">
            {/* Box Foto Defunto */}
            <div className="flex flex-col items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Foto Defunto
              </label>
              <div
                onClick={() => inputFotoRef.current?.click()}
                className="group relative w-36 h-44 rounded-xl border-2 border-dashed border-gray-300 hover:border-bronze-500 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition"
              >
                {formData.foto_url ? (
                  <>
                    <img
                      src={formData.foto_url}
                      alt="Foto defunto"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition">
                      Cambia foto
                    </div>
                  </>
                ) : caricamentoFoto ? (
                  <Loader2 className="w-6 h-6 animate-spin text-bronze-500" />
                ) : (
                  <div className="text-center p-3">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1.5 group-hover:text-bronze-600" />
                    <span className="text-xs font-medium text-gray-600 block">Carica foto</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG</span>
                  </div>
                )}
              </div>
              <input
                ref={inputFotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCaricaFotoDefunto(f);
                }}
              />
              {formData.foto_url && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, foto_url: '' })}
                  className="mt-1.5 text-xs text-red-600 hover:underline"
                >
                  Rimuovi foto
                </button>
              )}
            </div>

            {/* Campi Dati Defunto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Nome e Cognome del Defunto *
                </label>
                <input
                  type="text"
                  value={formData.nome_defunto}
                  onChange={(e) => setFormData({ ...formData, nome_defunto: e.target.value })}
                  placeholder="es. Giuseppe Verdi"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Età (anni)
                </label>
                <input
                  type="number"
                  value={formData.anni}
                  onChange={(e) => setFormData({ ...formData, anni: e.target.value })}
                  placeholder="es. 84"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data di Nascita (opzionale)
                </label>
                <input
                  type="text"
                  value={formData.data_nascita}
                  onChange={(e) => setFormData({ ...formData, data_nascita: e.target.value })}
                  placeholder="es. 15 marzo 1942"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Data Morte *
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, data_morte: formattaDataItaliana(-1) })}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-gray-100 hover:bg-bronze-100 text-gray-700 rounded"
                    >
                      Ieri
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, data_morte: formattaDataItaliana(0) })}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-gray-100 hover:bg-bronze-100 text-gray-700 rounded"
                    >
                      Oggi
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.data_morte}
                  onChange={(e) => setFormData({ ...formData, data_morte: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comune *</label>
                  <select
                    value={formData.comune}
                    onChange={(e) => setFormData({ ...formData, comune: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                    required
                  >
                    {COMUNI.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rito *</label>
                  <select
                    value={formData.rito}
                    onChange={(e) => setFormData({ ...formData, rito: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                    required
                  >
                    {RITI.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SEZIONE 2: CAMERA ARDENTE CON SCELTA RAPIDA */}
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="text-base font-bold text-gray-900">Camera Ardente</h4>
              <div className="flex flex-wrap gap-1.5">
                {CAMERE_ARDENTI_RAPIDE.map((ca) => (
                  <button
                    key={ca.etichetta}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        camera_ardente_luogo: ca.luogo,
                        camera_ardente_indirizzo: ca.indirizzo || formData.camera_ardente_indirizzo,
                        camera_ardente_orari: ca.orari,
                      })
                    }
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-gray-300 text-gray-700 hover:border-bronze-500 hover:bg-amber-50 transition"
                  >
                    + {ca.etichetta}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Luogo</label>
                <input
                  type="text"
                  value={formData.camera_ardente_luogo}
                  onChange={(e) => setFormData({ ...formData, camera_ardente_luogo: e.target.value })}
                  placeholder="es. Terracielo Funeral Home"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Indirizzo</label>
                <input
                  type="text"
                  value={formData.camera_ardente_indirizzo}
                  onChange={(e) => setFormData({ ...formData, camera_ardente_indirizzo: e.target.value })}
                  placeholder="es. Via Emilia Est 1320, Modena"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Orari visite</label>
                <input
                  type="text"
                  value={formData.camera_ardente_orari}
                  onChange={(e) => setFormData({ ...formData, camera_ardente_orari: e.target.value })}
                  placeholder="es. 8:30 - 19:00"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* SEZIONE 3: FUNERALE CON GIORNI E ORARI IN 1 CLIC */}
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
            <h4 className="text-base font-bold text-gray-900 mb-3">Cerimonia Funebre</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600">Giorno del funerale</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, funerale_giorno: formattaDataItaliana(0, true) })}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-gray-300 rounded hover:border-bronze-500"
                    >
                      Oggi
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, funerale_giorno: formattaDataItaliana(1, true) })}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-gray-300 rounded hover:border-bronze-500"
                    >
                      Domani
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, funerale_giorno: formattaDataItaliana(2, true) })}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-gray-300 rounded hover:border-bronze-500"
                    >
                      Dopodomani
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.funerale_giorno}
                  onChange={(e) => setFormData({ ...formData, funerale_giorno: e.target.value })}
                  placeholder="es. Lunedì 3 novembre 2026"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600">Ora</label>
                  <div className="flex flex-wrap gap-1">
                    {ORARI_FUNERALE_RAPIDI.map((ora) => (
                      <button
                        key={ora}
                        type="button"
                        onClick={() => setFormData({ ...formData, funerale_ora: ora })}
                        className={`px-1.5 py-0.5 text-[11px] font-semibold rounded border ${
                          formData.funerale_ora === ora
                            ? 'bg-bronze-500 text-white border-bronze-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-bronze-400'
                        }`}
                      >
                        {ora}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.funerale_ora}
                  onChange={(e) => setFormData({ ...formData, funerale_ora: e.target.value })}
                  placeholder="es. 10:30"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Chiesa / Sala del Commiato</label>
                <input
                  type="text"
                  value={formData.funerale_luogo}
                  onChange={(e) => setFormData({ ...formData, funerale_luogo: e.target.value })}
                  placeholder="es. Chiesa Parrocchiale di San Faustino"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Indirizzo Chiesa / Sala</label>
                <input
                  type="text"
                  value={formData.funerale_indirizzo}
                  onChange={(e) => setFormData({ ...formData, funerale_indirizzo: e.target.value })}
                  placeholder="es. Via Giardini 230, Modena"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Epigrafe / Testo di annuncio e ringraziamento</label>
                <textarea
                  value={formData.funerale_dettagli}
                  onChange={(e) => setFormData({ ...formData, funerale_dettagli: e.target.value })}
                  rows={2}
                  placeholder="es. Ne danno il triste annuncio i figli, i nipoti e i parenti tutti. Si ringraziano quanti prenderanno parte alla cerimonia."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* SEZIONE 4: COMMIATO CON SCELTA RAPIDA */}
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="text-base font-bold text-gray-900">Commiato e Destinazione</h4>
              <div className="flex flex-wrap gap-1.5">
                {CIMITERI_RAPIDI.map((ci) => (
                  <button
                    key={ci.etichetta}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        commiato_tipo: ci.tipo,
                        commiato_luogo: ci.luogo,
                        commiato_cimitero: ci.cimitero,
                      })
                    }
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-gray-300 text-gray-700 hover:border-bronze-500 hover:bg-amber-50 transition"
                  >
                    + {ci.etichetta}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <select
                  value={formData.commiato_tipo}
                  onChange={(e) => setFormData({ ...formData, commiato_tipo: e.target.value as TipoCommiato })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Seleziona...</option>
                  <option value="Tumulazione">Tumulazione</option>
                  <option value="Cremazione">Cremazione</option>
                  <option value="Inumazione">Inumazione</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Luogo</label>
                <input
                  type="text"
                  value={formData.commiato_luogo}
                  onChange={(e) => setFormData({ ...formData, commiato_luogo: e.target.value })}
                  placeholder="es. Tempio Crematorio"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cimitero</label>
                <input
                  type="text"
                  value={formData.commiato_cimitero}
                  onChange={(e) => setFormData({ ...formData, commiato_cimitero: e.target.value })}
                  placeholder="es. Cimitero di San Cataldo"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Pubblicazione e Azioni */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pubblicato}
                onChange={(e) => setFormData({ ...formData, pubblicato: e.target.checked })}
                className="w-5 h-5 text-bronze-500 rounded focus:ring-bronze-500"
              />
              <span className="text-sm font-medium text-gray-800">
                Pubblica subito nella bacheca pubblica
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onAnnullato}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={caricamento}
                className="px-6 py-2.5 bg-bronze-500 text-white rounded-lg font-bold hover:bg-bronze-600 disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {caricamento ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Salvataggio...
                  </>
                ) : (
                  'Salva e Pubblica Manifesto'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

