# ✅ Creazione Automatica Profilo Agenzia

## 🎯 Modifica Implementata

### Problema Risolto
Quando un'agenzia faceva il login per la prima volta, vedeva il messaggio "Profilo Agenzia Non Trovato" e doveva creare manualmente il profilo nel database Supabase.

### Soluzione
Ora il profilo agenzia viene **creato automaticamente** al primo accesso con dati di default.

---

## 📝 Come Funziona

### Flusso di Login

1. **Agenzia fa il login** con email e password
2. **Il sistema controlla** se esiste un profilo nella tabella `agenzie`
3. **Se NON esiste**:
   - Crea automaticamente un nuovo profilo con dati di default
   - Mostra la dashboard con il nuovo profilo
   - L'agenzia può modificare i dati dalla sezione "Profilo"
4. **Se ESISTE**:
   - Carica il profilo esistente
   - Mostra la dashboard normale

### Dati di Default Creati Automaticamente

```typescript
{
  user_id: utente.id,  // UID dell'utente loggato
  nome: 'Nuova Agenzia',
  indirizzo: 'Da configurare',
  descrizione: 'Profilo agenzia da completare. Modifica queste informazioni dalla sezione Profilo.',
  telefono: 'Da configurare',
  email: utente.email,  // Email dell'utente loggato
  logo_url: null,
  foto_sede_url: null,
  orari_apertura: 'Da configurare',
  servizi_offerti: [],
  aree_coperte: [],
}
```

---

## 🧪 Come Testare

### Test 1: Primo Accesso (Profilo Non Esistente)

1. **Elimina il profilo agenzia** da Supabase (se esiste):
   - Vai su Supabase Dashboard → Table Editor
   - Clicca sulla tabella `agenzie`
   - Elimina la riga con `user_id = eba41f64-3173-4c6a-974c-18069d000dc2`

2. **Fai il login** come agenzia:
   - Vai su http://localhost:3001/login
   - Email: `agenzia@vicini.mo`
   - Password: `test123456`

3. **Verifica**:
   - ✅ La dashboard si apre automaticamente
   - ✅ Vedi il messaggio "Nuova Agenzia" nel badge
   - ✅ I campi mostrano "Da configurare"
   - ✅ Nella console del browser (F12) vedi: "Profilo agenzia non trovato, creazione automatica..."
   - ✅ Vedi: "Agenzia creata con successo: [UUID]"

4. **Controlla su Supabase**:
   - Vai su Table Editor → `agenzie`
   - Dovresti vedere una nuova riga con i dati di default

### Test 2: Accesso Successivo (Profilo Esistente)

1. **Ricarica la pagina** o fai logout e login di nuovo
2. **Verifica**:
   - ✅ La dashboard si apre normalmente
   - ✅ Vedi i dati dell'agenzia (anche se sono "Da configurare")
   - ✅ Nella console NON vedi il messaggio di creazione

### Test 3: Modifica del Profilo

1. **Clicca sulla tab "Profilo"**
2. **Modifica i dati**:
   - Nome: "Onoranze Funebri Pecorari"
   - Indirizzo: "Via Nonantolana, 555 — 41122 Modena (MO)"
   - Telefono: "059 364 218"
   - Email: "info@pecorari.it"
   - Descrizione: "Opera nei comuni di Modena, Nonantola e Ravarino..."
   - Orari: "Lunedì-Sabato 8:00-19:00"
   - Servizi: "Trasporto salma, Cremazione, Onoranze"
   - Aree coperte: "Modena, Nonantola, Ravarino"
3. **Clicca "Salva Modifiche"**
4. **Verifica**:
   - ✅ I dati vengono salvati su Supabase
   - ✅ La dashboard mostra i nuovi dati
   - ✅ Puoi caricare logo e foto sede

---

## 🔍 Codice Modificato

### File: `src/components/DashboardAgenzia.tsx`

**Prima:**
```typescript
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
```

**Dopo:**
```typescript
const caricaAgenzia = async () => {
  if (!utente) return;
  
  // Prova a caricare l'agenzia esistente
  const { data, error } = await supabase
    .from('agenzie')
    .select('*')
    .eq('user_id', utente.id)
    .single();

  if (error || !data) {
    // Agenzia non trovata: creala automaticamente con dati di default
    console.log('Profilo agenzia non trovato, creazione automatica...');
    
    const { data: nuovaAgenzia, error: insertError } = await supabase
      .from('agenzie')
      .insert([{
        user_id: utente.id,
        nome: 'Nuova Agenzia',
        indirizzo: 'Da configurare',
        descrizione: 'Profilo agenzia da completare...',
        telefono: 'Da configurare',
        email: utente.email,
        logo_url: null,
        foto_sede_url: null,
        orari_apertura: 'Da configurare',
        servizi_offerti: [],
        aree_coperte: [],
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Errore creazione agenzia:', insertError);
    } else if (nuovaAgenzia) {
      console.log('Agenzia creata con successo:', nuovaAgenzia.id);
      setAgenzia(nuovaAgenzia);
    }
  } else {
    setAgenzia(data);
  }
  setCaricamento(false);
};
```

---

## ⚠️ Note Importanti

### Permessi RLS
La creazione automatica funziona solo se le policy RLS lo permettono. Verifica che la policy di INSERT sulla tabella `agenzie` permetta agli utenti con ruolo `agenzia` di creare profili.

**Policy richiesta:**
```sql
CREATE POLICY "Solo agenzie possono creare il profilo agenzia"
ON public.agenzie FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.profilo_utenti
    WHERE id = auth.uid() AND ruolo = 'agenzia'
  )
);
```

### Fallback di Errore
Se la creazione automatica fallisce (es. problemi di permessi), viene mostrato un messaggio di errore chiaro:
```
Errore di Configurazione
Non è stato possibile creare automaticamente il profilo agenzia.
Contatta l'amministratore di sistema.
```

### Dati di Default
I dati di default sono volutamente generici ("Da configurare") per indicare all'agenzia che deve completare il profilo. L'agenzia può modificare tutti i campi dalla sezione "Profilo".

---

## 🎯 Vantaggi

✅ **Esperienza utente migliorata**: L'agenzia non deve creare manualmente il profilo  
✅ **Onboarding semplificato**: Primo accesso immediato alla dashboard  
✅ **Dati consistenti**: Ogni agenzia ha sempre un profilo nel database  
✅ **Facile da completare**: L'agenzia può modificare i dati dalla sezione "Profilo"  
✅ **Fallback sicuro**: Se la creazione fallisce, viene mostrato un messaggio di errore chiaro  

---

## 📊 Stato

- ✅ Modifica implementata
- ✅ Build completata senza errori
- ✅ Pronto per testing

---

**Data modifica:** 2026-02-11  
**File modificato:** `src/components/DashboardAgenzia.tsx`
