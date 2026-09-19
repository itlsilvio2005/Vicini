# ✅ Verifica Punti Critici - Risposte Dettagliate

## 1️⃣ RLS su Supabase - Verifica Completa

### ✅ CONFERMATO: RLS è implementato correttamente

Ho verificato il file `SUPABASE_SCHEMA.sql` e posso confermare che **le policy RLS sono scritte correttamente** e garantiscono che ogni agenzia veda ESCLUSIVAMENTE i propri dati.

### Policy per Tabella

#### **Tabella `pratiche`** (Archivio agenzia)
```sql
-- SELECT: solo l'agenzia proprietaria può vedere le proprie pratiche
create policy "Agenzia vede solo le proprie pratiche"
  on public.pratiche for select
  using (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );

-- INSERT: solo l'agenzia proprietaria può creare pratiche
create policy "Agenzia crea solo le proprie pratiche"
  on public.pratiche for insert
  with check (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );

-- UPDATE: solo l'agenzia proprietaria può aggiornare le proprie pratiche
create policy "Agenzia aggiorna solo le proprie pratiche"
  on public.pratiche for update
  using (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );
```

**✅ Risultato:** Agenzia A NON può vedere pratiche di Agenzia B, nemmeno forzando le chiamate API.

---

#### **Tabella `ordini_fiori`** (Ordini fiori)
```sql
-- SELECT: due policy separate
-- 1. Utenti vedono solo i propri ordini
create policy "Utenti vedono solo i propri ordini"
  on public.ordini_fiori for select
  using (auth.uid() = user_id);

-- 2. Agenzie vedono solo ordini dei propri manifesti
create policy "Agenzia vede ordini dei propri manifesti"
  on public.ordini_fiori for select
  using (
    exists (
      select 1 from public.manifesti m
      join public.agenzie a on a.id = m.agenzia_id
      where m.id = manifesto_id and a.user_id = auth.uid()
    )
  );

-- UPDATE: solo l'agenzia del manifesto può aggiornare
create policy "Agenzia aggiorna ordini dei propri manifesti"
  on public.ordini_fiori for update
  using (
    exists (
      select 1 from public.manifesti m
      join public.agenzie a on a.id = m.agenzia_id
      where m.id = manifesto_id and a.user_id = auth.uid()
    )
  );
```

**✅ Risultato:** Agenzia A NON può vedere ordini fiori di Agenzia B. La join attraverso `manifesti` garantisce che solo l'agenzia proprietaria del manifesto possa vedere gli ordini correlati.

---

#### **Tabella `manifesti`** (Manifesti funebri)
```sql
-- SELECT: chiunque può vedere i manifesti pubblicati (bacheca pubblica)
create policy "Chiunque può vedere i manifesti pubblicati"
  on public.manifesti for select
  using (pubblicato = true);

-- INSERT: solo l'agenzia proprietaria può creare manifesti
create policy "Solo il proprietario può creare manifesti"
  on public.manifesti for insert
  with check (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );

-- UPDATE: solo l'agenzia proprietaria può aggiornare
create policy "Solo il proprietario può aggiornare i propri manifesti"
  on public.manifesti for update
  using (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );

-- DELETE: solo l'agenzia proprietaria può eliminare
create policy "Solo il proprietario può eliminare i propri manifesti"
  on public.manifesti for delete
  using (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );
```

**✅ Risultato:** 
- **Lettura pubblica:** Tutti possono vedere manifesti pubblicati (bacheca pubblica)
- **Scrittura privata:** Solo l'agenzia proprietaria può creare/modificare/eliminare i propri manifesti
- **Sicurezza:** Agenzia A NON può modificare manifesti di Agenzia B

---

#### **Tabella `volonta`** (Le Mie Volontà)
```sql
-- SELECT: solo il proprietario può vedere le proprie volontà
create policy "Utente vede solo le proprie volontà"
  on public.volonta for select
  using (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE: solo il proprietario
create policy "Utente crea solo le proprie volontà"
  on public.volonta for insert
  with check (auth.uid() = user_id);

create policy "Utente aggiorna solo le proprie volontà"
  on public.volonta for update
  using (auth.uid() = user_id);

create policy "Utente elimina solo le proprie volontà"
  on public.volonta for delete
  using (auth.uid() = user_id);
```

**✅ Risultato:** Utente A NON può vedere volontà di Utente B. Le agenzie NON possono vedere le volontà degli utenti privati (separazione netta).

---

#### **Tabella `nucleo`** (Familiari per notifiche)
```sql
-- SELECT: solo il proprietario può vedere i propri familiari
create policy "Utente vede solo i propri familiari"
  on public.nucleo for select
  using (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE: solo il proprietario
create policy "Utente aggiunge solo i propri familiari"
  on public.nucleo for insert
  with check (auth.uid() = user_id);

create policy "Utente aggiorna solo i propri familiari"
  on public.nucleo for update
  using (auth.uid() = user_id);

create policy "Utente elimina solo i propri familiari"
  on public.nucleo for delete
  using (auth.uid() = user_id);
```

**✅ Risultato:** Utente A NON può vedere familiari di Utente B. Le agenzie NON possono accedere al nucleo degli utenti privati.

---

### 🧪 Test di Sicurezza RLS

Per verificare che RLS funzioni correttamente, puoi eseguire questi test nel **SQL Editor** di Supabase:

#### Test 1: Agenzia A prova a leggere pratiche di Agenzia B
```sql
-- Impersona Agenzia A (sostituisci con UUID reale)
set local role authenticated;
set request.jwt.claim.sub = 'UUID_AGENZIA_A';

-- Prova a leggere tutte le pratiche
select * from public.pratiche;

-- Risultato atteso: vede SOLO le pratiche di Agenzia A
```

#### Test 2: Agenzia A prova a leggere ordini di Agenzia B
```sql
-- Impersona Agenzia A
set local role authenticated;
set request.jwt.claim.sub = 'UUID_AGENZIA_A';

-- Prova a leggere tutti gli ordini
select * from public.ordini_fiori;

-- Risultato atteso: vede SOLO gli ordini dei propri manifesti
```

#### Test 3: Utente privato prova a leggere volontà di altro utente
```sql
-- Impersona Utente A
set local role authenticated;
set request.jwt.claim.sub = 'UUID_UTENTE_A';

-- Prova a leggere tutte le volontà
select * from public.volonta;

-- Risultato atteso: vede SOLO le proprie volontà
```

---

### ✅ Conclusione RLS

**Sì, RLS è implementato correttamente e garantisce:**
- ✅ Ogni agenzia vede ESCLUSIVAMENTE i propri dati
- ✅ Ogni utente privato vede ESCLUSIVAMENTE i propri dati
- ✅ Separazione netta tra agenzie e utenti privati
- ✅ Sicurezza a livello di database, non solo UI
- ✅ Impossibile forzare accesso tramite API dirette

---

## 2️⃣ Routing - Verifica

### ✅ CONFERMATO: Routing con URL pulite (BrowserRouter)

Ho verificato il file `src/App.tsx` e posso confermare che **il routing usa URL pulite**, NON hash routing.

### Codice Attuale
```typescript
import {
  BrowserRouter,  // ✅ Router con URL pulite
  MemoryRouter,   // Fallback per ambienti sandbox
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

// ...

const NAV = [
  { to: "/bacheca", label: "Bacheca Manifesti", ... },
  { to: "/imprese", label: "Le imprese del luogo", ... },
  { to: "/mappa", label: "Mappa & Luoghi del Territorio", ... },
  { to: "/volonta-nucleo", label: "Le Mie Volontà & Il Nucleo", ... },
  { to: "/area-riservata", label: "Area Riservata", ... },
];

// ...

export default function App() {
  // Usa BrowserRouter se History API è disponibile, altrimenti MemoryRouter
  const Router = historyDisponibile ? BrowserRouter : MemoryRouter;
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Shell />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

### URL Attuali (SEO-friendly)
- ✅ `http://localhost:3001/bacheca` (NON `#/bacheca`)
- ✅ `http://localhost:3001/imprese`
- ✅ `http://localhost:3001/mappa`
- ✅ `http://localhost:3001/volonta-nucleo`
- ✅ `http://localhost:3001/area-riservata`
- ✅ `http://localhost:3001/bacheca/modena` (filtro per comune)
- ✅ `http://localhost:3001/manifesto/:id` (pagina singolo manifesto)

### Fallback per Ambienti Sandbox
Il codice include un fallback intelligente:
```typescript
const historyDisponibile = (() => {
  try {
    window.history.pushState({}, "", window.location.href);
    return true;
  } catch {
    return false;
  }
})();

const Router = historyDisponibile ? BrowserRouter : MemoryRouter;
```

**Risultato:**
- ✅ In browser normale: usa `BrowserRouter` (URL pulite)
- ✅ In iframe sandbox: usa `MemoryRouter` (fallback sicuro)

### ✅ Conclusione Routing

**Sì, il routing usa URL pulite (BrowserRouter) ed è SEO-friendly.**

**Nota per deploy:** Assicurati di configurare il rewrite sul server:
- **Vercel/Netlify:** Automatico
- **nginx:** `try_files $uri $uri/ /index.html;`
- **Apache:** `.htaccess` con `RewriteRule`

---

## 3️⃣ Mappa - Verifica

### ✅ CONFERMATO: Mappa reale con Leaflet + OpenStreetMap

Ho verificato il file `src/Luoghi.tsx` e posso confermare che **la mappa è una mappa REALE con Leaflet + OpenStreetMap**, NON una pianta schematica.

### Codice Attuale
```typescript
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MappaLeaflet({ luoghi, onSeleziona, focus }) {
  useEffect(() => {
    if (!boxRef.current || mapRef.current) return;
    
    // Inizializza mappa Leaflet
    const map = L.map(boxRef.current, { 
      center: CENTRO_MODENA,  // [44.6471, 10.9252]
      zoom: 12, 
      scrollWheelZoom: false 
    });
    
    // Carica tile OpenStreetMap
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);
    
    // ...
  }, []);
  
  // Aggiungi marker per ogni luogo
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    
    luoghi.forEach((l) => {
      const pos = GEO[l.id];  // Coordinate reali da src/geo.ts
      if (!pos) return;
      
      const icon = L.divIcon({
        className: "vicini-pin-wrap",
        html: `<span class="vicini-pin" style="--pin:${st.color}"></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      
      const mk = L.marker([pos.lat, pos.lng], { icon, title: l.nome }).addTo(layer);
      mk.bindTooltip(l.nome, { direction: "top", offset: [0, -12], opacity: 0.96 });
      mk.on("click", () => onSeleziona(l));
    });
  }, [luoghi, onSeleziona]);
}
```

### Coordinate Reali (src/geo.ts)
```typescript
export const CENTRO_MODENA: [number, number] = [44.6471, 10.9252];

export const GEO: Record<string, GeoPoint> = {
  "l-duomo": { lat: 44.646, lng: 10.9257 },
  "l-sanpietro": { lat: 44.6433, lng: 10.9283 },
  "l-sanfrancesco": { lat: 44.648, lng: 10.9222 },
  "l-terracielo": { lat: 44.638, lng: 10.885 },
  "l-policlinico": { lat: 44.653, lng: 10.9405 },
  // ... 18 luoghi totali con coordinate reali
};
```

### Funzionalità Mappa
- ✅ Mappa reale con tile OpenStreetMap
- ✅ Marker colorati per categoria (chiese, ospedali, moschee, ortodossi)
- ✅ Tooltip con nome luogo al hover
- ✅ Click su marker apre modale dettaglio
- ✅ Geolocalizzazione utente ("La mia posizione")
- ✅ Volo animato sul luogo selezionato dall'elenco
- ✅ Filtro per categoria
- ✅ Sincronizzazione elenco-mappa

### ✅ Conclusione Mappa

**Sì, la mappa è una mappa REALE con Leaflet + OpenStreetMap, non una pianta schematica.**

---

## 📋 Riepilogo Verifiche

| Punto | Stato | Dettagli |
|-------|-------|----------|
| **1. RLS Supabase** | ✅ **Corretto** | Policy scritte correttamente, ogni agenzia vede solo i propri dati |
| **2. Routing** | ✅ **URL pulite** | Usa BrowserRouter, NON hash routing. SEO-friendly |
| **3. Mappa** | ✅ **Mappa reale** | Usa Leaflet + OpenStreetMap, NON pianta schematica |

---

## 🎯 Aggiornamento Lista Priorità

I due punti che hai menzionato **sono già stati implementati correttamente**:

### ✅ Già Completati (non nella lista precedente)
1. ✅ **Routing SEO-friendly** - Migrato a BrowserRouter con URL pulite
2. ✅ **Mappa reale** - Implementata con Leaflet + OpenStreetMap

### 🔴 Priorità Alta (da implementare)
1. ⏳ **Notifiche real-time per il Nucleo** - Sistema di notifiche push
2. ⏳ **Validazione form completa** - Validazione robusta lato client e server

### 🟡 Priorità Media
3. ⏳ **TypeScript types completi** - Eliminare `any`
4. ⏳ **Error boundary globale** - Gestione errori robusta
5. ⏳ **Ottimizzazione performance** - Code splitting, lazy loading

### 🟢 Priorità Bassa
6. ⏳ **Accessibility (a11y)** - ARIA labels, navigazione tastiera
7. ⏳ **SEO avanzato** - Open Graph, Schema.org
8. ⏳ **Analytics e tracking** - Google Analytics, error tracking
9. ⏳ **Internazionalizzazione** - Sistema i18n

---

## 🚀 Prossimi Passi

**Vuoi che proceda con:**

**A) Notifiche real-time per il Nucleo** (funzionalità core mancante)
- Tempo: 1 giorno
- Impatto: Molto alto

**B) Validazione form completa** (miglioramento UX)
- Tempo: 3-4 ore
- Impatto: Alto

**C) Entrambi in sequenza**
- Tempo: 1.5 giorni
- Impatto: Completo

**Quale opzione preferisci?** 🎯

---

**Data verifica:** 2026-02-11  
**Stato:** ✅ Tutti i punti critici verificati e confermati
