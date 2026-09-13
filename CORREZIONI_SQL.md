# ✅ Correzioni SQL Applicate

## Problemi Risolti

### 1. Errore "duplicate key value violates unique constraint"
**Causa**: La tabella `agenzie` aveva un vincolo `UNIQUE` su `user_id`, impedendo a un singolo utente di avere più agenzie.

**Correzione**: Rimosso il vincolo `UNIQUE` dalla colonna `user_id` in `SUPABASE_SCHEMA.sql`.

**File modificato**: 
- `SUPABASE_SCHEMA.sql` (linea 44)

**Prima**:
```sql
user_id uuid references public.profilo_utenti(id) on delete cascade unique,
```

**Dopo**:
```sql
user_id uuid references public.profilo_utenti(id) on delete cascade,
```

### 2. Errore ordine di cancellazione
**Causa**: I DELETE non rispettavano l'ordine delle dipendenze (foreign keys).

**Correzione**: Riordinato i DELETE per cancellare prima le tabelle figlie, poi le padri.

**File modificato**: 
- `RESET_E_INSERISCI_DATI.sql` (linee 14-24)

**Ordine corretto**:
1. `nucleo` (dipende da profilo_utenti)
2. `volonta` (dipende da profilo_utenti, agenzie)
3. `ordini_fiori` (dipende da manifesti, profilo_utenti)
4. `pensieri` (dipende da manifesti, profilo_utenti)
5. `pratiche` (dipende da agenzie, manifesti)
6. `manifesti` (dipende da agenzie)
8. `agenzie` (dipende da profilo_utenti)

### 3. Gestione conflitti su INSERT multipli
**Causa**: Eseguendo lo script più volte, si potevano verificare errori di chiave duplicata.

**Correzione**: Aggiunto `ON CONFLICT (id) DO NOTHING` a tutti gli INSERT.

**File modificato**: 
- `RESET_E_INSERISCI_DATI.sql` (7 INSERT aggiornati)

**Esempio**:
```sql
INSERT INTO public.agenzie (...)
VALUES (...)
ON CONFLICT (id) DO NOTHING;
```

## 📄 File Aggiornati

1. ✅ **`SUPABASE_SCHEMA.sql`**
   - Rimosso vincolo UNIQUE da `agenzie.user_id`
   - Aggiornato commento della policy

3. ✅ **`RESET_E_INSERISCI_DATI.sql`**
   - Riordinato cancellazione tabelle (ordine corretto)
   - Aggiunto `ON CONFLICT DO NOTHING` a tutti gli INSERT
   - Script ora eseguibile più volte senza errori

## 🎯 Risultato

Lo script `RESET_E_INSERISCI_DATI.sql` ora:
- ✅ Cancella tutti i dati esistenti senza violare vincoli
- ✅ Inserisce 3 agenzie per lo stesso utente agenzia
- ✅ Inserisce 4 manifesti, pensieri, ordini, pratiche
- ✅ Inserisce 1 volontà e 3 membri del nucleo
- ✅ Può essere eseguito più volte senza errori
- ✅ Gestisce automaticamente i conflitti di chiave

## 🚀 Come Usare

### Se hai già eseguito lo schema SQL

Esegui solo `RESET_E_INSERISCI_DATI.sql`:
```bash
# Apri Supabase SQL Editor
# Copia e incolla RESET_E_INSERISCI_DATI.sql
# Clicca Run
```

### Se devi reinstallare tutto da zero

1. Esegui `SUPABASE_SCHEMA.sql` (crea le tabelle)
3. Esegui `RESET_E_INSERISCI_DATI.sql` (inserisce i dati)

## 📋 Dati Inseriti

Dopo l'esecuzione, avrai:
- ✅ 3 agenzie (Pecorari, San Martino, Borsari)
- ✅ 4 manifesti (Mario Rossi, Giuseppe Verdi, Ahmed Hassan, Maria Bianchi)
- ✅ 3 pensieri
- ✅ 2 ordini fiori
- ✅ 2 pratiche
- ✅ 1 volontà
- ✅ 3 membri del nucleo

## 🔍 Verifica

Lo script termina con una query di verifica che mostra il conteggio delle righe per ogni tabella. Dovresti vedere:

```
✅ agenzie      | 3
✅ manifesti    | 4
✅ pensieri     | 3
✅ ordini_fiori | 2
✅ pratiche     | 2
✅ volonta      | 1
✅ nucleo       | 3
```

## 🆘 Troubleshooting

### Errore "relation does not exist"
Le tabelle non esistono ancora. Esegui prima `SUPABASE_SCHEMA.sql`.

### Errore "duplicate key"
Lo script dovrebbe gestire automaticamente i conflitti con `ON CONFLICT DO NOTHING`. Se l'errore persiste, verifica che lo schema sia aggiornato.

### Errore "foreign key violation"
L'ordine di cancellazione non è corretto. Verifica che i DELETE siano nell'ordine specificato.

---

**Stato**: ✅ Tutti i problemi risolti, script pronto all'uso.
