return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      {/* Contenitore principale allargato per lo split-screen */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header fisso */}
        <div className="flex-none bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-20">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {manifesto ? 'Modifica Manifesto' : 'Inserimento Rapido Manifesto'}
            </h3>
            <p className="text-xs text-gray-500">
              Compila manualmente o carica la foto di un manifesto per l'estrazione automatica
            </p>
          </div>
          <button
            onClick={onAnnullato}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo a due colonne su schermi larghi (lg:) */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* COLONNA SINISTRA: Foto OCR Sticky (occupa il 35% dello spazio) */}
          <div className="flex-none lg:w-[35%] bg-stone-50 border-r border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto lg:overflow-visible">
            
            {/* Box Foto */}
            <div className="flex flex-col items-center flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3 w-full text-center">
                Immagine del Manifesto
              </label>
              
              <div
                onClick={() => inputFotoRef.current?.click()}
                className="group relative w-full aspect-[2/3] max-w-[280px] rounded-xl border-2 border-dashed border-bronze-300 hover:border-bronze-500 bg-white flex flex-col items-center justify-center cursor-pointer overflow-hidden transition shadow-sm"
              >
                {formData.foto_url ? (
                  <>
                    <img
                      src={formData.foto_url}
                      alt="Anteprima manifesto"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold transition">
                      Sostituisci foto
                    </div>
                  </>
                ) : caricamentoFoto ? (
                  <Loader2 className="w-8 h-8 animate-spin text-bronze-500" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-bronze-400 mx-auto mb-2 group-hover:text-bronze-600 transition-colors" />
                    <span className="text-sm font-bold text-gray-700 block">Carica locandina</span>
                    <span className="text-xs text-gray-500 mt-1 block">JPG, PNG o PDF</span>
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
                  if (f) {
                    handleCaricaFotoDefunto(f);
                    handleScansionaManifesto(f); // Avvia anche l'OCR
                  }
                }}
              />
              
              {formData.foto_url && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, foto_url: '' })}
                  className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  Rimuovi immagine
                </button>
              )}

              {/* Status OCR */}
              <div className="w-full max-w-[280px] mt-6">
                <button
                  type="button"
                  disabled={scansioneInCorso || !formData.foto_url}
                  onClick={() => {
                     // Riavvia scansione se c'è foto
                     setScansioneInCorso(true);
                     setTimeout(() => setScansioneInCorso(false), 2000);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-night-900 text-bronze-400 text-xs font-bold uppercase tracking-wider hover:bg-night-800 disabled:opacity-50 transition"
                >
                  {scansioneInCorso ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Lettura dati OCR...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Estrai dati da foto
                    </>
                  )}
                </button>

                {messaggioSmart && (
                  <div className="mt-3 flex items-start gap-2 text-[11px] leading-tight font-medium text-green-800 bg-green-100/60 border border-green-200 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
                    <span>{messaggioSmart}</span>
                  </div>
                )}
                {errore && (
                  <div className="mt-3 flex items-start gap-2 text-[11px] leading-tight font-medium text-red-800 bg-red-100/60 border border-red-200 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <span>{errore}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLONNA DESTRA: Modulo scorrevole (occupa il 65% dello spazio) */}
          <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
            <form id="manifesto-form" onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
              
              {/* Scelta Agenzia (Admin) */}
              {agenzieDisponibili && agenzieDisponibili.length > 0 && (
                <div className="rounded-xl border border-bronze-200 bg-orange-50/30 p-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Assegna all'Agenzia Funebre *
                  </label>
                  <select
                    value={agenziaSelezionata}
                    onChange={(e) => setAgenziaSelezionata(e.target.value)}
                    className="w-full px-4 py-2 border border-bronze-300 rounded-lg bg-white focus:ring-2 focus:ring-bronze-500 shadow-sm"
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

              {/* SEZIONE 1: Dati Anagrafici */}
              <section>
                <h4 className="text-sm font-bold uppercase tracking-widest text-bronze-600 mb-4 flex items-center gap-2">
                  <span className="w-6 h-px bg-bronze-300" /> Dati Anagrafici
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Nome e Cognome *
                    </label>
                    <input
                      type="text"
                      value={formData.nome_defunto}
                      onChange={(e) => setFormData({ ...formData, nome_defunto: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500 text-lg font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Età</label>
                    <input
                      type="number"
                      value={formData.anni}
                      onChange={(e) => setFormData({ ...formData, anni: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Morte *</label>
                    <input
                      type="text"
                      value={formData.data_morte}
                      onChange={(e) => setFormData({ ...formData, data_morte: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500 font-semibold text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comune *</label>
                    <select
                      value={formData.comune}
                      onChange={(e) => setFormData({ ...formData, comune: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                    >
                      {COMUNI.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rito *</label>
                    <select
                      value={formData.rito}
                      onChange={(e) => setFormData({ ...formData, rito: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bronze-500"
                    >
                      {RITI.map((r) => (<option key={r} value={r}>{r}</option>))}
                    </select>
                  </div>
                </div>
              </section>

              {/* SEZIONE 2: Camera Ardente */}
              <section className="p-5 rounded-xl border border-gray-100 bg-gray-50/60">
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gray-800">Camera Ardente</h4>
                  <div className="flex gap-1">
                    {CAMERE_ARDENTI_RAPIDE.slice(0,3).map((ca) => (
                      <button
                        key={ca.etichetta}
                        type="button"
                        onClick={() => setFormData({ ...formData, camera_ardente_luogo: ca.luogo, camera_ardente_indirizzo: ca.indirizzo || formData.camera_ardente_indirizzo, camera_ardente_orari: ca.orari })}
                        className="px-2 py-1 text-[10px] font-semibold rounded bg-white border border-gray-200 text-gray-600 hover:border-bronze-400 hover:text-bronze-700"
                      >
                        {ca.etichetta}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Luogo / Struttura</label>
                    <input
                      type="text"
                      value={formData.camera_ardente_luogo}
                      onChange={(e) => setFormData({ ...formData, camera_ardente_luogo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-bronze-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Indirizzo</label>
                    <input
                      type="text"
                      value={formData.camera_ardente_indirizzo}
                      onChange={(e) => setFormData({ ...formData, camera_ardente_indirizzo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Orari visite</label>
                    <input
                      type="text"
                      value={formData.camera_ardente_orari}
                      onChange={(e) => setFormData({ ...formData, camera_ardente_orari: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* SEZIONE 3: Funerale */}
              <section className="p-5 rounded-xl border border-gray-100 bg-gray-50/60">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-4">Cerimonia Funebre</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Data Cerimonia</label>
                    <input
                      type="text"
                      value={formData.funerale_giorno}
                      onChange={(e) => setFormData({ ...formData, funerale_giorno: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Ora esatta</label>
                    <input
                      type="text"
                      value={formData.funerale_ora}
                      onChange={(e) => setFormData({ ...formData, funerale_ora: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Chiesa / Sala del Commiato</label>
                    <input
                      type="text"
                      value={formData.funerale_luogo}
                      onChange={(e) => setFormData({ ...formData, funerale_luogo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-bronze-500"
                    />
                  </div>
                </div>
              </section>

              {/* SEZIONE 4: Destinazione */}
              <section className="p-5 rounded-xl border border-gray-100 bg-gray-50/60">
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gray-800">Commiato</h4>
                  <div className="flex gap-1">
                    {CIMITERI_RAPIDI.slice(0,2).map((ci) => (
                      <button
                        key={ci.etichetta}
                        type="button"
                        onClick={() => setFormData({ ...formData, commiato_tipo: ci.tipo, commiato_luogo: ci.luogo, commiato_cimitero: ci.cimitero })}
                        className="px-2 py-1 text-[10px] font-semibold rounded bg-white border border-gray-200 text-gray-600 hover:border-bronze-400"
                      >
                        {ci.etichetta}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
                    <select
                      value={formData.commiato_tipo}
                      onChange={(e) => setFormData({ ...formData, commiato_tipo: e.target.value as TipoCommiato })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    >
                      <option value="Tumulazione">Tumulazione</option>
                      <option value="Cremazione">Cremazione</option>
                      <option value="Inumazione">Inumazione</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cimitero / Tempio</label>
                    <input
                      type="text"
                      value={formData.commiato_cimitero}
                      onChange={(e) => setFormData({ ...formData, commiato_cimitero: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </section>

            </form>
          </div>
        </div>

        {/* Footer Fisso per il Salvataggio */}
        <div className="flex-none bg-stone-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between z-20">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-5 h-5 flex items-center justify-center rounded border ${formData.pubblicato ? 'bg-bronze-500 border-bronze-500 text-white' : 'bg-white border-gray-300'}`}>
               {formData.pubblicato && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
            <input
              type="checkbox"
              checked={formData.pubblicato}
              onChange={(e) => setFormData({ ...formData, pubblicato: e.target.checked })}
              className="hidden"
            />
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
              Rendi visibile al pubblico
            </span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAnnullato}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              form="manifesto-form"
              disabled={caricamento}
              className="px-6 py-2.5 bg-bronze-500 text-white rounded-lg font-bold hover:bg-bronze-600 disabled:opacity-50 flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              {caricamento ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Salvataggio...
                </>
              ) : (
                'Salva Manifesto'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}