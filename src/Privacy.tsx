import { PageMast } from "./lib";

const EMAIL = "info.vicini059@gmail.com";

function Sezione({ titolo, children }: { titolo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl font-semibold text-ink">{titolo}</h2>
      <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export function Privacy() {
  return (
    <div>
      <PageMast
        kicker="Informativa sul trattamento dei dati"
        title={<>Privacy e <em className="italic text-bronze-300">dati personali</em></>}
        sub="Cosa raccogliamo, perché, per quanto tempo e come puoi chiederne la modifica o la cancellazione. In parole semplici."
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-[12.5px] text-ink-faint">Ultimo aggiornamento: 7 novembre 2026</p>

        <Sezione titolo="Chi tratta i tuoi dati">
          <p>
            Il titolare del trattamento è <strong className="text-ink">Vicini</strong>, piattaforma dei servizi funebri per la
            provincia di Modena. Per qualsiasi richiesta sui tuoi dati scrivi a{" "}
            <a href={`mailto:${EMAIL}`} className="font-semibold text-bronze-700 underline">{EMAIL}</a>.
          </p>
        </Sezione>

        <Sezione titolo="Quali dati raccogliamo">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">Se navighi senza registrarti:</strong> contiamo in forma anonima alcune azioni (per
              esempio quante volte viene aperta una pagina) senza collegarle a una persona. Sul tuo dispositivo salviamo un codice
              casuale che serve solo a limitare gli abusi sugli omaggi virtuali.
            </li>
            <li>
              <strong className="text-ink">Pensieri di cordoglio:</strong> nome, legame con la persona (facoltativo) e testo. Sono
              pubblici sul manifesto. Non scrivere dati che non vuoi rendere visibili.
            </li>
            <li>
              <strong className="text-ink">Omaggi virtuali:</strong> tipo di omaggio, nome (facoltativo, non viene mostrato) e il
              codice casuale del dispositivo.
            </li>
            <li>
              <strong className="text-ink">Account:</strong> email, nome e password. La password è gestita dal servizio di accesso
              in forma protetta e non è leggibile da noi.
            </li>
            <li>
              <strong className="text-ink">Nucleo e volontà:</strong> anno di nascita, comune, codice nucleo e le volontà che scegli
              di scrivere. Sono visibili solo a te. Possono rivelare convinzioni religiose o altre informazioni delicate: li
              trattiamo solo con il tuo consenso, che puoi ritirare quando vuoi.
            </li>
            <li>
              <strong className="text-ink">Agenzie:</strong> dati dell’attività e dell’account di chi gestisce l’agenzia. Vicini
              approva ogni agenzia prima di attivarla.
            </li>
          </ul>
        </Sezione>

        <Sezione titolo="L’assistente con intelligenza artificiale">
          <p>
            Per le domande libere l’assistente usa un servizio di terzi (Google Gemini, nella versione gratuita). Prima dell’invio
            togliamo numeri di telefono, email e codici fiscali che compaiono nel testo, ma non puoi essere sicuro che il filtro li
            trovi tutti: <strong className="text-ink">non scrivere nomi, indirizzi o altri dati personali</strong>. Nella versione
            gratuita Google può conservare le domande e usarle per migliorare i propri servizi. Vicini non salva il testo delle
            tue domande: conta soltanto quante richieste arrivano ogni giorno. L’assistente non viene mai chiamato senza il tuo
            consenso.
          </p>
        </Sezione>

        <Sezione titolo="Perché li usiamo">
          <ul className="list-disc space-y-2 pl-5">
            <li>Per fornire il servizio che hai chiesto (account, pensieri, omaggi, volontà): esecuzione del servizio e, dove indicato, il tuo consenso.</li>
            <li>Per proteggere il sito da abusi e misurare in forma aggregata come viene usato: interesse legittimo del titolare.</li>
            <li>Non vendiamo i tuoi dati e non li usiamo per pubblicità.</li>
          </ul>
        </Sezione>

        <Sezione titolo="Per quanto tempo li conserviamo">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-ink">30 giorni:</strong> il codice del dispositivo collegato agli omaggi virtuali. Passati 30 giorni resta solo il conteggio, senza alcun codice.</li>
            <li><strong className="text-ink">24 ore:</strong> i tentativi di ricerca di un codice nucleo, usati per limitare gli abusi.</li>
            <li><strong className="text-ink">Account, nucleo e volontà:</strong> finché non chiedi la cancellazione.</li>
            <li><strong className="text-ink">Manifesti e pensieri:</strong> finché l’agenzia mantiene pubblicato il manifesto; puoi chiedere in qualsiasi momento la rimozione di un tuo pensiero.</li>
            <li>I fornitori tecnici (vedi sotto) possono tenere per un periodo limitato registri tecnici di sicurezza, come l’indirizzo IP.</li>
          </ul>
        </Sezione>

        <Sezione titolo="Chi può vedere i dati">
          <p>
            Usiamo fornitori tecnici che trattano i dati per nostro conto: Vercel (pubblicazione del sito), Supabase (database e
            accesso) e, solo se usi l’assistente con il tuo consenso, Google. Le agenzie vedono i dati relativi ai propri manifesti.
            Non comunichiamo i dati ad altri.
          </p>
        </Sezione>

        <Sezione titolo="I tuoi diritti">
          <p>
            Puoi chiedere di accedere ai tuoi dati, correggerli, cancellarli, limitarne l’uso, riceverne una copia o opporti al
            trattamento; puoi ritirare un consenso in ogni momento. Scrivi a{" "}
            <a href={`mailto:${EMAIL}`} className="font-semibold text-bronze-700 underline">{EMAIL}</a>: rispondiamo di norma entro
            30 giorni. Se ritieni che i tuoi diritti non siano rispettati puoi rivolgerti al Garante per la protezione dei dati
            personali (garanteprivacy.it).
          </p>
        </Sezione>
      </div>
    </div>
  );
}
