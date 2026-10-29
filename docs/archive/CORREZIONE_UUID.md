# ✅ CORREZIONE UUID NON VALIDI

## ❌ Problema Identificato

**Errore SQL:**
```
ERROR: 22P02: invalid input syntax for type uuid: "m1111111-1111-1111-1111-111111111111"
```

**Causa:**
Gli UUID devono contenere **solo caratteri esadecimali validi**: `0-9` e `a-f` (o `A-F`).

Ho usato la lettera `m` come prefisso mnemonico per "manifesto", ma `m` **NON è un carattere esadecimale valido**.

## ✅ Soluzione Applicata

Ho sostituito tutti gli UUID dei manifesti con caratteri esadecimali validi:

### Prima (ERRATO):
```sql
'm1111111-1111-1111-1111-111111111111'  -- ❌ 'm' non è esadecimale
'm2222222-2222-2222-2222-222222222222'  -- ❌ 'm' non è esadecimale
'm3333333-3333-3333-3333-333333333333'  -- ❌ 'm' non è esadecimale
'm4444444-4444-4444-4444-444444444444'  -- ❌ 'm' non è esadecimale
```

### Dopo (CORRETTO):
```sql
'11111111-1111-1111-1111-111111111111'  -- ✅ Tutti caratteri esadecimali
'22222222-2222-2222-2222-222222222222'  -- ✅ Tutti caratteri esadecimali
'33333333-3333-3333-3333-333333333333'  -- ✅ Tutti caratteri esadecimali
'44444444-4444-4444-4444-444444444444'  -- ✅ Tutti caratteri esadecimali
```

## 📊 UUID Corretti nel Database

### Agenzie (già corretti):
- `a1111111-1111-1111-1111-111111111111` - Pecorari
- `a2222222-2222-2222-2222-222222222222` - San Martino
- `a3333333-3333-3333-3333-333333333333` - Borsari

### Manifesti (corretti ora):
- `11111111-1111-1111-1111-111111111111` - Mario Rossi
- `22222222-2222-2222-2222-222222222222` - Giuseppe Verdi
- `33333333-3333-3333-3333-333333333333` - Ahmed Hassan
- `44444444-4444-4444-4444-444444444444` - Maria Bianchi

### Utenti (già corretti):
- `eba41f64-3173-4c6a-974c-18069d000dc2` - Agenzia
- `9f564219-7250-4077-a50a-ebb2f2353bad` - Utente Privato

## 🚀 Cosa Fare Ora

### Se hai già eseguito STEP 1 e STEP 2 con successo:

**Riesegui solo STEP 3** con il file aggiornato:

1. Apri **`STEP_3_RESET_E_INSERISCI.sql`** (file aggiornato)
2. Copia tutto il contenuto
3. Incolla nel SQL Editor di Supabase
4. Clicca **Run**
5. ✅ Dovresti vedere:
```
✅ agenzie      | 3
✅ manifesti    | 4
✅ pensieri     | 3
✅ ordini_fiori | 2
✅ pratiche     | 2
✅ volonta      | 1
✅ nucleo       | 3
✅ RLS riabilitato su tutte le tabelle
```

### Se hai già eseguito STEP 3 (con errore):

Non preoccuparti, l'errore ha bloccato l'inserimento. Riesegui STEP 3 con il file corretto.

### Se non hai ancora eseguito nessuno step:

Segui l'ordine corretto:
1. **STEP 1** → `STEP_1_RIMUOVI_VINCOLO.sql`
2. **STEP 2** → `STEP_2_VERIFICA_VINCOLO.sql`
3. **STEP 3** → `STEP_3_RESET_E_INSERISCI.sql` (file aggiornato)

## 📝 Formato UUID Corretto

Un UUID valido deve rispettare questo formato:
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Dove ogni `x` è un carattere esadecimale: `0-9`, `a-f`, o `A-F`.

**Esempi validi:**
- ✅ `11111111-1111-1111-1111-111111111111`
- ✅ `a1111111-1111-1111-1111-111111111111`
- ✅ `eba41f64-3173-4c6a-974c-18069d000dc2`
- ✅ `9f564219-7250-4077-a50a-ebb2f2353bad`

**Esempi non validi:**
- ❌ `m1111111-1111-1111-1111-111111111111` (contiene 'm')
- ❌ `g1111111-1111-1111-1111-111111111111` (contiene 'g')
- ❌ `z1111111-1111-1111-1111-111111111111` (contiene 'z')

## ✅ Verifica Finale

Dopo aver eseguito STEP 3 con successo, verifica nel Table Editor di Supabase:

1. **agenzie**: 3 righe
2. **manifesti**: 4 righe
3. **pensieri**: 3 righe
4. **ordini_fiori**: 2 righe
5. **pratiche**: 2 righe
6. **volonta**: 1 riga
7. **nucleo**: 3 righe

## 🎯 Prossimi Passi

1. ✅ Esegui STEP 3 con il file corretto
2. ✅ Verifica i dati nel Table Editor
3. ✅ Avvia l'app con `npm run dev`
4. ✅ Testa il login come agenzia e come utente privato
5. ✅ Verifica che i manifesti appaiano nella bacheca

---

**File aggiornato:** `STEP_3_RESET_E_INSERISCI.sql`

**Stato:** ✅ Pronto per l'esecuzione
