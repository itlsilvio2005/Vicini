# 🚀 GUIDA ESECUZIONE IN 3 STEP SEPARATI

## ⚠️ IMPORTANTE: Perché 3 Step Separati?

Supabase SQL Editor esegue ogni script come una **transazione atomica**. Se un comando fallisce, **tutto viene annullato**, incluso il DROP CONSTRAINT eseguito poco prima.

Per questo motivo, dobbiamo separare le operazioni in **3 step indipendenti**, ognuno eseguito come transazione separata.

---

## 📋 ESECUZIONE IN ORDINE

### 🔹 STEP 1: Rimuovi il Vincolo UNIQUE

**File:** `STEP_1_RIMUOVI_VINCOLO.sql`

**Cosa fa:**
- Rimuove il vincolo UNIQUE dalla colonna `user_id` della tabella `agenzie`
- Permette di inserire più agenzie con lo stesso user_id

**Come eseguire:**
1. Apri Supabase SQL Editor
2. Copia **TUTTO** il contenuto di `STEP_1_RIMUOVI_VINCOLO.sql`
3. Incolla e clicca **Run**
4. Devi vedere: `✅ Vincolo UNIQUE rimosso da agenzie.user_id`

**Output atteso:**
```
status
----------------------------------------
✅ Vincolo UNIQUE rimosso da agenzie.user_id
```

---

### 🔹 STEP 2: Verifica che il Vincolo sia Sparito

**File:** `STEP_2_VERIFICA_VINCOLO.sql`

**Cosa fa:**
- Verifica che il vincolo UNIQUE sia stato effettivamente rimosso
- Se vedi ancora `agenzie_user_id_key`, il vincolo è ancora presente

**Come eseguire:**
1. Copia **TUTTO** il contenuto di `STEP_2_VERIFICA_VINCOLO.sql`
2. Incolla e clicca **Run**

**Output atteso (SUCCESSO):**
```
vincolo | tabella | definizione
--------|---------|-------------
(0 rows)

status
------------------------------------------------------------
✅ Nessun vincolo UNIQUE trovato - puoi procedere con STEP 3
```

**Se vedi ancora il vincolo:**
```
vincolo              | tabella  | definizione
---------------------|----------|---------------------------
agenzie_user_id_key  | agenzie  | UNIQUE (user_id)

status
------------------------------------------------------------
❌ Vincoli UNIQUE ancora presenti - ripeti STEP 1
```

**Cosa fare se il vincolo è ancora presente:**
- Ripeti lo STEP 1
- Se il problema persiste, prova a eseguire manualmente:
  ```sql
  ALTER TABLE public.agenzie DROP CONSTRAINT agenzie_user_id_key;
  ```

---

### 🔹 STEP 3: Reset e Inserimento Dati

**File:** `STEP_3_RESET_E_INSERISCI.sql`

**Cosa fa:**
- Cancella tutti i dati esistenti
- Inserisce i dati di esempio (3 agenzie, 4 manifesti, ecc.)
- Riabilita RLS su tutte le tabelle

**Come eseguire:**
1. Copia **TUTTO** il contenuto di `STEP_3_RESET_E_INSERISCI.sql`
2. Incolla e clicca **Run**

**Output atteso:**
```
tabella      | righe
-------------|--------
nucleo       | 0
volonta      | 0
ordini_fiori | 0
pensieri     | 0
pratiche     | 0
manifesti    | 0
agenzie      | 0

tabella      | righe
-------------|--------
✅ agenzie   | 3
✅ manifesti | 4
✅ pensieri  | 3
✅ ordini_fiori | 2
✅ pratiche  | 2
✅ volonta   | 1
✅ nucleo    | 3

status
----------------------------------------
✅ RLS riabilitato su tutte le tabelle
```

---

## 🎯 CHECKLIST FINALE

Dopo aver eseguito tutti e 3 gli step, verifica:

- [ ] STEP 1 eseguito con successo
- [ ] STEP 2 mostra 0 vincoli UNIQUE
- [ ] STEP 3 mostra 3 agenzie, 4 manifesti, ecc.
- [ ] Nel Table Editor di Supabase vedi i dati inseriti
- [ ] L'applicazione funziona con `npm run dev`
- [ ] Login come agenzia funziona
- [ ] Login come utente privato funziona

---

## 🔍 TROUBLESHOOTING

### Errore: "constraint does not exist" (STEP 1)
Il vincolo non esiste più. Puoi ignorare l'errore e procedere con STEP 2.

### Errore: "duplicate key value violates unique constraint" (STEP 3)
Il vincolo UNIQUE è ancora presente. Ripeti STEP 1 e STEP 2.

### Errore: "foreign key violation" (STEP 3)
Gli UUID degli utenti non esistono in `auth.users`. Verifica che gli utenti siano stati creati correttamente in Supabase Authentication.

### STEP 2 mostra ancora il vincolo
Il DROP CONSTRAINT non ha funzionato. Prova:
```sql
-- Verifica tutti i vincoli sulla tabella agenzie
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.agenzie'::regclass;

-- Rimuovi manualmente il vincolo
ALTER TABLE public.agenzie DROP CONSTRAINT IF EXISTS agenzie_user_id_key;
```

---

## 📊 STRUTTURA DATI FINALE

### Utenti
- **Agenzia**: `eba41f64-3173-4c6a-974c-18069d000dc2` (gestisce 3 agenzie)
- **Privato**: `9f564219-7250-4077-a50a-ebb2f2353bad`

### Agenzie (tutte con lo stesso user_id)
1. **Pecorari** - ID: `a1111111-1111-1111-1111-111111111111`
2. **San Martino** - ID: `a2222222-2222-2222-2222-222222222222`
3. **Borsari** - ID: `a3333333-3333-3333-3333-333333333333`

### Manifesti
- 2 manifesti per Pecorari (Mario Rossi, Giuseppe Verdi)
- 2 manifesti per San Martino (Ahmed Hassan, Maria Bianchi)
- 0 manifesti per Borsari (puoi aggiungerli dalla dashboard)

---

## 📁 FILE CREATI

1. ✅ `STEP_1_RIMUOVI_VINCOLO.sql` - Rimuove il vincolo UNIQUE
2. ✅ `STEP_2_VERIFICA_VINCOLO.sql` - Verifica che il vincolo sia sparito
3. ✅ `STEP_3_RESET_E_INSERISCI.sql` - Reset e inserimento dati
4. ✅ `GUIDA_3_STEP.md` - Questa guida

---

## 🎉 RISULTATO

Seguendo questi 3 step separati, ogni operazione viene committata indipendentemente e non rischia di essere annullata da errori successivi. Il vincolo UNIQUE viene rimosso in modo permanente e lo script di inserimento funziona correttamente.

**Buon lavoro!** 🚀
