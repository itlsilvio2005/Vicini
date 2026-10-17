# 🚀 Guida Completa: Fix Login + Nuova Registrazione

## ✅ Cosa è Stato Implementato

1. ✅ **Pagina di Registrazione Pubblica** (`/registrazione`)
   - Form completo con validazione
   - Scelta tra utente Privato e Agenzia
   - Conferma password
   - Messaggio di successo con redirect automatico

2. ✅ **Link dalla Pagina di Login**
   - Aggiunto link "Non hai un account? Registrati"
   - Porta alla nuova pagina di registrazione

3. ✅ **Componente ModerazionePensieri**
   - Tab "Moderazione" nella dashboard agenzia
   - Lista pensieri in attesa di approvazione
   - Pulsanti Approva/Rifiuta

4. ✅ **Trigger SQL per Moderazione Automatica**
   - Filtro server-side per parole offensive
   - Marcatura automatica pensieri sospetti

---

## 🔴 PRIORITÀ 1: Fix Login Agenzia (BLOCCANTE)

Il login come agenzia fallisce perché ci sono **3 agenzie con lo stesso user_id** nel database.

### Soluzione (5 minuti)

#### Passo 1: Apri Supabase SQL Editor
1. Vai su https://supabase.com/dashboard/project/fufqqwlmiqlvrxcnpekk/sql-editor
2. Clicca **"New Query"**

#### Passo 2: Esegui lo Script di Fix
1. Apri il file `RESET_COMPLETO_AGENZIE.sql` dal tuo progetto
2. Copia **TUTTO** il contenuto
3. Incolla in Supabase SQL Editor
4. Clicca **"Run"**

#### Passo 3: Verifica il Fix
Esegui questa query:
```sql
SELECT COUNT(*) FROM public.agenzie;
```
**Risultato atteso:** `1` (una sola agenzia)

#### Passo 4: Testa il Login
1. Vai su http://localhost:3001/login
2. Login come agenzia:
   - Email: `agenzia@vicini.mo`
   - Password: `test123456`
3. La dashboard deve caricarsi senza errori
4. Clicca sulla tab **"Moderazione"** (nuova!)

---

## 🟢 PRIORITÀ 2: Test della Nuova Registrazione

### Test 1: Pagina di Registrazione
1. Vai su http://localhost:3001/login
2. Clicca sul link **"Non hai un account? Registrati"**
3. Devi essere reindirizzato a http://localhost:3001/registrazione

### Test 2: Registrazione Utente Privato
1. Seleziona **"Privato"**
2. Compila il form:
   - Nome: `Mario Rossi`
   - Email: `mario.rossi@test.it`
   - Password: `Password123`
   - Conferma Password: `Password123`
3. Clicca **"Registrati"**
4. Devi vedere il messaggio di successo e essere reindirizzato a `/area-privata`

### Test 3: Registrazione Agenzia
1. Torna a http://localhost:3001/registrazione
2. Seleziona **"Agenzia"**
3. Compila il form:
   - Nome: `Nuova Agenzia Funebre`
   - Email: `nuova.agenzia@test.it`
   - Password: `Password123`
   - Conferma Password: `Password123`
4. Clicca **"Registrati"**
5. Devi essere reindirizzato a `/area-riservata`

---

## 🟡 PRIORITÀ 3: Trigger Moderazione Automatica

### Esegui in Supabase SQL Editor
1. Apri il file `TRIGGER_MODERAZIONE_PENSIERI.sql`
2. Copia **TUTTO** il contenuto
3. Incolla in Supabase SQL Editor
4. Clicca **"Run"**

### Verifica il Trigger
```sql
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.pensieri'::regclass;
```
**Risultato atteso:** Deve mostrare `trigger_modera_pensiero`

### Test della Moderazione
1. Login come utente privato
2. Vai su un manifesto
3. Lascia un pensiero con testo normale: "Condoglianze alla famiglia"
4. Lascia un pensiero con testo sospetto: "finalmente se ne va"
5. Login come agenzia
6. Vai sulla tab **"Moderazione"**
7. Il pensiero sospetto deve apparire in lista
8. Clicca **"Approva"** o **"Rifiuta"**

---

## 📊 Riepilogo File Creati/Modificati

### Nuovi File
- ✅ `src/components/Registrazione.tsx` - Pagina di registrazione pubblica
- ✅ `src/components/ModerazionePensieri.tsx` - Componente moderazione
- ✅ `TRIGGER_MODERAZIONE_PENSIERI.sql` - Trigger SQL per moderazione automatica
- ✅ `GUIDA_FIX_URGENZA.md` - Guida rapida fix agenzie
- ✅ `GUIDA_COMPLETA_REGISTRAZIONE.md` - Questa guida

### File Modificati
- ✅ `src/App.tsx` - Aggiunta rotta `/registrazione`
- ✅ `src/components/LoginUnificato.tsx` - Aggiunto link alla registrazione
- ✅ `src/components/DashboardAgenzia.tsx` - Aggiunta tab "Moderazione"

---

## 🎯 Prossimi Passi (Dopo aver completato i test)

### Priorità A: Spostare Chat in Cima (30 minuti)
**File:** `src/Bacheca.tsx`
**Modifica:** Nella funzione `ManifestoDettaglio`, sposta `<GruppoChatPensieri />` subito dopo "Il percorso del commiato"

### Priorità B: Contatore Pensieri nelle Card (1 ora)
**File:** `src/Bacheca.tsx`
**Modifica:** Aggiungi query COUNT e mostra il conteggio nelle card manifesto

### Priorità C: Cleanup File (10 minuti)
```bash
rm CONFIGURAZIONE_OPEN_GRAPH.md
rm scripts/prerender-manifesti.js
rm build.sh
rm public/og-manifesto-default.svg
```

---

## ✅ Checklist Finale

### Fix Login Agenzia
- [ ] Eseguito `RESET_COMPLETO_AGENZIE.sql` in Supabase
- [ ] Verificato che `SELECT COUNT(*) FROM public.agenzie` restituisca `1`
- [ ] Testato login come agenzia: `agenzia@vicini.mo` / `test123456`
- [ ] Dashboard agenzia si carica senza errori

### Test Registrazione
- [ ] Pagina `/registrazione` accessibile
- [ ] Link dalla pagina login funziona
- [ ] Registrazione utente privato funziona
- [ ] Registrazione agenzia funziona
- [ ] Redirect automatico dopo registrazione

### Test Moderazione
- [ ] Eseguito `TRIGGER_MODERAZIONE_PENSIERI.sql` in Supabase
- [ ] Trigger `trigger_modera_pensiero` presente
- [ ] Tab "Moderazione" visibile nella dashboard agenzia
- [ ] Pensieri sospetti appaiono in lista
- [ ] Approva/Rifiuta funzionano

---

## 🆘 Troubleshooting

### Problema: Login agenzia fallisce ancora
**Causa:** Script `RESET_COMPLETO_AGENZIE.sql` non eseguito
**Soluzione:** Esegui lo script e verifica che ci sia 1 sola agenzia

### Problema: Pagina `/registrazione` non esiste
**Causa:** Build non aggiornato
**Soluzione:** Esegui `npm run build` e riavvia il server

### Problema: Tab "Moderazione" non visibile
**Causa:** Modifiche a `DashboardAgenzia.tsx` non applicate
**Soluzione:** Verifica che il file contenga l'import di `ModerazionePensieri` e il button per la tab

---

## 📞 Supporto

Se incontri problemi:
1. Controlla la console del browser (F12) per errori
2. Verifica i log di Supabase
3. Controlla che tutti gli script SQL siano stati eseguiti
4. Assicurati che il build sia aggiornato (`npm run build`)

---

**Stato:** ✅ Tutte le funzionalità implementate, pronto per il testing

**Prossima azione:** Esegui `RESET_COMPLETO_AGENZIE.sql` per fixare il login agenzia
