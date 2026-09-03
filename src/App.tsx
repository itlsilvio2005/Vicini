import { useCallback, useEffect, useState } from "react";
import { MANIFESTI, ORDINI_INIZIALI, type Manifesto, type OrdineFiori, type Pensiero } from "./data";
import { ToastProvider } from "./lib";
import { TopBar, Header, Masthead, Footer } from "./layout";
import { Bacheca } from "./Bacheca";
import { Luoghi } from "./Luoghi";
import { Agenzie } from "./Agenzie";
import { Volonta } from "./Volonta";
import { Nucleo } from "./Nucleo";
import { Backoffice } from "./Backoffice";

type View = "sito" | "backoffice";

export default function App() {
  const [view, setView] = useState<View>("sito");
  const [manifesti, setManifesti] = useState<Manifesto[]>(MANIFESTI);
  const [ordini, setOrdini] = useState<OrdineFiori[]>(ORDINI_INIZIALI);
  const [prefill, setPrefill] = useState<{ id: string; ts: number } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [view]);

  const aggiungiOrdine = useCallback((o: OrdineFiori) => {
    setOrdini((list) => [o, ...list]);
  }, []);

  const aggiungiPensiero = useCallback((manifestoId: string, p: Pensiero) => {
    setManifesti((list) =>
      list.map((m) => (m.id === manifestoId ? { ...m, pensieri: [p, ...m.pensieri] } : m))
    );
  }, []);

  const scegliAgenzia = useCallback((id: string) => {
    setPrefill({ id, ts: Date.now() });
    requestAnimationFrame(() => {
      document.getElementById("volonta")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const fatturaInviata = useCallback((id: string) => {
    setOrdini((list) => list.map((o) => (o.id === id ? { ...o, fatturaInviata: true } : o)));
  }, []);

  if (view === "backoffice") {
    return (
      <ToastProvider>
        <div className="paper-ambient">
          <Backoffice
            ordini={ordini}
            onFatturaInviata={fatturaInviata}
            onExit={() => setView("sito")}
          />
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="paper-ambient">
        <TopBar />
        <Header onBackoffice={() => setView("backoffice")} />
        <main>
          <Masthead />
          <Bacheca
            manifesti={manifesti}
            onNuovoOrdine={aggiungiOrdine}
            onNuovoPensiero={aggiungiPensiero}
          />
          <Luoghi />
          <Agenzie onAffida={scegliAgenzia} />
          <Volonta prefillAgenzia={prefill ? prefill.id : null} />
          <Nucleo />
        </main>
        <Footer onBackoffice={() => setView("backoffice")} />
      </div>
    </ToastProvider>
  );
}
