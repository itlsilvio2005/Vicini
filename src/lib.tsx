export function PageMast({
  kicker,
  title,
  sub,
  meta,
  bgImage,
}: {
  kicker: React.ReactNode;
  title: React.ReactNode;
  sub: React.ReactNode;
  meta?: React.ReactNode;
  bgImage?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-night-900 text-paper border-b border-night-800">
      {bgImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: `url(${bgImage})` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(97deg, #0b1424 0%, rgba(11,20,36,0.92) 45%, rgba(11,20,36,0.65) 72%, rgba(16,29,51,0.8) 100%), linear-gradient(to top, #0b1424 6%, transparent 50%)",
            }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bronze-500/70 to-transparent" />
        </>
      )}
      
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-bronze-300">
          {kicker}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.03] sm:text-5xl lg:text-[54px]">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-mist">
          {sub}
        </p>
        {meta && (
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-mist/90">
            {meta}
          </p>
        )}
      </div>
    </div>
  );
}