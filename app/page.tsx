import Analyzer from "@/components/Analyzer";

const MODES = [
  {
    tag: "Código Suizo",
    title: "Operar en MACRO",
    accent: "text-sage-bright",
    desc: "Temporalidades altas: diaria, semanal y mensual. Buscamos zonas de altísima probabilidad donde coinciden varios factores, para entrar con stop corto y beneficio grande. Pocas operaciones, mucha paciencia.",
    checks: [
      "Estructura y rompimiento (BOS)",
      "Order block de origen",
      "50% de la vela de rompimiento",
      "Fibonacci 78.6%",
      "Imbalance / FVG",
      "Zona de confluencia",
    ],
  },
  {
    tag: "Day Trading / Scalping",
    title: "Operar en MICRO",
    accent: "text-terracotta-soft",
    desc: "Temporalidades bajas (intradía y scalping). Leemos tu gráfico con 3 lentes y te damos un % en cada uno, más un plan conjunto. Pensado para entrar y salir en la sesión.",
    checks: [
      "SMC: order blocks y liquidez",
      "ICT: FVG y sus variantes",
      "Liquidity sweeps / grabs",
      "Premium / descuento (dealing range)",
      "Killzones (Londres / Nueva York)",
      "Gatillo de scalping en 1m / 5m",
    ],
  },
];

const STEPS = [
  {
    n: "1",
    t: "Sube tu gráfico",
    d: "Captura tu chart y súbelo. Funciona en cualquier activo y temporalidad.",
  },
  {
    n: "2",
    t: "Elige cómo operas",
    d: "Código Suizo (macro) o Day Trading / Scalping con SMC + ICT (micro).",
  },
  {
    n: "3",
    t: "Recibe tu plan",
    d: "Veredicto, zonas, entrada, stop, take profit y qué hacer ahora.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      {/* Hero */}
      <header className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/60 px-3 py-1 text-xs text-sage-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
          Análisis con IA · SMC · ICT · Código Suizo
        </div>
        <h1 className="text-3xl font-bold leading-tight text-fg sm:text-4xl">
          Tu gráfico, leído como{" "}
          <span className="text-sage-bright">un profesional</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-fg-muted">
          Sube la captura de tu chart y recibe en segundos un análisis técnico
          completo. Tú eliges: <span className="text-fg">Código Suizo</span> en
          macro, o <span className="text-fg">Day Trading / Scalping</span> con
          SMC + ICT en micro. Sin conectar tu cuenta.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-fg-muted">
          <span>✓ 2 análisis gratis</span>
          <span>✓ Oro, BTC, NASDAQ, US30, forex</span>
          <span>✓ % por metodología</span>
        </div>
      </header>

      {/* Analizador */}
      <section className="mt-10">
        <Analyzer />
      </section>

      {/* Dos formas de operar */}
      <section className="mt-14">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-sage-muted">
          Dos formas de operar
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {MODES.map((m) => (
            <div
              key={m.tag}
              className="rounded-xl border border-line bg-surface/50 p-5"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-sage-muted">
                {m.tag}
              </div>
              <div className={`mt-1 text-lg font-bold ${m.accent}`}>{m.title}</div>
              <p className="mt-2 text-sm text-fg-muted">{m.desc}</p>
              <ul className="mt-3 space-y-1.5">
                {m.checks.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-fg/90">
                    <span className={`mt-0.5 ${m.accent}`}>✓</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Instructivo: ¿qué es El Código Suizo? */}
      <section className="mt-8">
        <div className="rounded-2xl border border-sage-bright/25 bg-gradient-to-b from-sage-bright/8 to-transparent p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-sage-bright">
            ¿Qué es El Código Suizo?
          </h2>
          <p className="mt-2 text-sm text-fg/90">
            Es una metodología de precisión para{" "}
            <span className="text-fg">temporalidades altas</span> (diaria,
            semanal, mensual). La idea es operar poco y solo donde varios
            factores coinciden en una misma zona: el order block que originó el
            movimiento, el 50% de la vela de rompimiento, el Fibonacci 78.6% y el
            imbalance. Cuando 2 o 3 coinciden, es una{" "}
            <span className="text-sage-light">zona de alta probabilidad</span>.
          </p>
          <p className="mt-2 text-sm text-fg-muted">
            Si recién empiezas, prueba primero el modo{" "}
            <span className="text-fg">Day Trading / Scalping</span> (más
            familiar) y usa Código Suizo para ver el panorama grande.
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mt-14">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-sage-muted">
          Cómo funciona
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-xl border border-line bg-surface/50 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-bright/15 font-mono text-sm font-bold text-sage-bright">
                {s.n}
              </div>
              <div className="mt-3 font-semibold text-fg">{s.t}</div>
              <p className="mt-1 text-sm text-fg-muted">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg border border-line bg-surface/40 px-4 py-3 text-center text-sm text-fg-muted">
          💡 <span className="text-fg">Recomendación:</span> analiza en{" "}
          <span className="text-sage-light">macro</span> (Código Suizo){" "}
          <span className="text-fg">y en micro</span> (Day Trading) para ver el
          panorama completo. Si solo quieres micro, también puedes.
        </p>
      </section>

      {/* Precio */}
      <section className="mt-14">
        <div className="mx-auto max-w-sm rounded-2xl border border-sage-bright/30 bg-gradient-to-b from-sage-bright/10 to-transparent p-6 text-center">
          <div className="text-sm font-medium uppercase tracking-wider text-sage-muted">
            Pago único
          </div>
          <div className="mt-2 text-5xl font-bold text-fg">$10</div>
          <div className="mt-1 text-sm text-fg-muted">50 análisis · sin suscripción</div>
          <ul className="mt-4 space-y-1.5 text-left text-sm text-fg/90">
            <li>✓ Análisis ilimitados hasta agotar tus 50</li>
            <li>✓ Descarga y comparte cada análisis</li>
            <li>✓ Sin mensualidad, sin tarjeta guardada</li>
          </ul>
          <p className="mt-4 text-xs text-fg-muted">
            Empieza con 2 análisis gratis arriba ↑
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-14 border-t border-line pt-6 text-center text-xs text-fg-muted">
        <p>
          Swiss Charts es una herramienta educativa de análisis técnico. No es
          asesoría financiera ni garantiza resultados. Opera bajo tu propio riesgo.
        </p>
        <p className="mt-2">🇨🇭 Swiss Charts · SMC · ICT · Código Suizo</p>
      </footer>
    </main>
  );
}
