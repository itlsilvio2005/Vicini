# 🚀 Guida Risoluzione Problema Vincoli UNIQUE

## 🎯 Problema Identificato

Lo script `RESET_E_INSERISCI_DATI.sql` fallisce con l'errore:
```
duplicate key value violates unique constraint "agenzie_user_id_key"
```

Questo significa che la tabella `agenzie` ha un vincolo UNIQUE sulla colonna `user_id`, impedendo di inserire più agenzie per lo stesso utente.

## ✅ Soluzione in 3 Passi

### Passo 1: Esegui la Migrazione dei Vincoli

1. Apri **Supabase SQL Editor**
2. Copia e incolla il contenuto di **`MIGRAZIONE_RIMOZIONE_VINCOLI.sql`**
3. Clicca **Run**

Questo script:
- ✅ Rimuove il vincolo UNIQUE da `agenzie.user_id`
- ✅ Verifica che il vincolo sia stato rimosso
- ✅ Elenca tutti i vincoli UNIQUE nel database

**Risultato atteso:** Dovresti vedere `✅ Vincolo UNIQUE rimosso da agenzie.user_id`

### Passo 2: Verifica Altri Vincoli (Opzionale ma Consigliato)

1. Copia e incolla il contenuto di **`VERIFICA_VINCOLI_UNIQUE.sql`**
2. Clicca **Run**

Questo script:
- ✅ Elenca tutti i vincoli UNIQUE in tutte le tabelle
- ✅ Ti permette di identificare eventuali altri vincoli problematici

**Se trovi altri vincoli UNIQUE problematici**, rimuovili manualmente:
```sql
ALTER TABLE public.nome_tabella DROP CONSTRAINT IF EXISTS nome_vincolo;
```

### Passo 3: Esegui lo Script di Reset Aggiornato

1. Copia e incolla il contenuto di **`RESET_E_INSERISCI_DATI.sql`**
2. Clicca **Run**

Questo script ora:
- ✅ Disabilita temporaneamente RLS per permettere la cancellazione
- ✅ Cancella tutti i dati in ordine corretto (figlie prima, padri dopo)
- ✅ Verifica che tutte le tabelle siano vuote
- ✅ Inserisce i dati di esempio con `ON CONFLICT (user_id) DO UPDATE`
- ✅ Riabilita RLS alla fine

**Risultato atteso:**
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

## 🔍 Se il Problema Persiste

### Verifica 1: Controlla se i DELETE Funzionano

Prima di eseguire lo script di reset, verifica che le tabelle siano effettivamente vuote:

```sql
SELECT 'nucleo' AS tabella, COUNT(*) AS righe FROM public.nucleo
UNION ALL SELECT 'volonta', COUNT(*) FROM public.volonta
UNION ALL SELECT 'ordini_fiori', COUNT(*) FROM public.ordini_fiori
UNION ALL SELECT 'pensieri', COUNT(*) FROM public.pensieri
UNION ALL SELECT 'pratiche', COUNT(*) FROM public.pratiche
UNION ALL SELECT 'manifesti', COUNT(*) FROM public.manifesti
UNION ALL SELECT 'agenzie', COUNT(*) FROM public.agenzie;
```

Se vedi righe > 0, i DELETE non stanno funzionando. Controlla:
- ✅ RLS è disabilitato?
- ✅ L'ordine di cancellazione è corretto?
- ✅ Ci sono errori nei log di Supabase?

### Verifica 2: Controlla i Vincoli Rimanenti

Esegui di nuovo `VERIFICA_VINCOLI_UNIQUE.sql` e verifica che non ci siano vincoli UNIQUE su `agenzie.user_id`.

### Verifica 3: Forza la Cancellazione

Se i DELETE non funzionano, prova a forzare la cancellazione con TRUNCATE:

```sql
TRUNCATE TABLE public.nucleo, public.volonta, public.ordini_fiori, 
               public.pensieri, public.pratiche, public.manifesti, 
               public.agenzie CASCADE;
```

⚠️ **Attenzione**: TRUNCATE è più aggressivo di DELETE e resetta anche le sequenze.

## 📋 Checklist Completa

- [ ] Esegui `MIGRAZIONE_RIMOZIONE_VINCOLI.sql`
- [ ] Verifica che il vincolo UNIQUE sia stato rimosso
- [ ] (Opzionale) Esegui `VERIFICA_VINCOLI_UNIQUE.sql` per controllare altri vincoli
- [ ] Esegui `RESET_E_INSERISCI_DATI.sql`
- [ ] Verifica che tutte le tabelle abbiano i dati corretti
- [ ] Testa l'applicazione con `npm run dev`
- [ ] Prova il login come agenzia e come utente privato

## 🆘 Troubleshooting Avanzato

### Errore: "permission denied for table"
RLS sta bloccando le operazioni. Assicurati che lo script disabiliti RLS prima dei DELETE.

### Errore: "violates foreign key constraint"
L'ordine di cancellazione non è corretto. Assicurati di cancellare prima le tabelle figlie.

### Errore: "duplicate key value violates unique constraint"
C'è ancora un vincolo UNIQUE. Esegui `VERIFICA_VINCOLI_UNIQUE.sql` e rimuovi i vincoli problematici.

### I dati non vengono inseriti
Controlla che gli UUID degli utenti esistano in `auth.users`:
```sql
SELECT id, email FROM auth.users 
WHERE id IN ('eba41f64-3173-4c6a-974c-18069d000dc2', '9f564219-7250-4077-a50a-ebb2f2353bad');
```

## 📞 Supporto

Se il problema persiste dopo aver seguito tutti i passaggi:
1. Copia l'errore esatto
2. Copia l'output di `VERIFICA_VINCOLI_UNIQUE.sql`
3. Copia l'output della query di verifica delle tabelle vuote
4. Invia tutto per analisi

## 📚 File Correlati

- `MIGRAZIONE_RIMOZIONE_VINCOLI.sql` - Rimuove il vincolo UNIQUE
- `VERIFICA_VINCOLI_UNIQUE.sql` - Verifica tutti i vincoli
- `RESET_E_INSERISCI_DATI.sql` - Script di reset aggiornato
- `SUPABASE_SCHEMA.sql` - Schema originale (già corretto)

---

**Stato**: ✅ Soluzione completa pronta per l'esecuzione
