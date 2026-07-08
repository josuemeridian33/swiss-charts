import Analyzer from "@/components/Analyzer";

const STEPS = [
  {
    n: "1",
    t: "Sube tu gráfico",
    d: "Captura tu chart en temporalidad alta (diaria, semanal o mensual) y súbela.",
  },
  {
    n: "2",
    t: "La IA lo lee",
    d: "Detecta estructura, order block de origen, la vela de rompimiento, Fib 78.6% e imbalance.",
  },
  {
    n: "3",
    t: "Recibe tu plan",
    d: "Zona operativa, entrada, stop, take profit y qué hacer: entrar, alertar o esperar.",
  },
];

const CHECKS = [
  "Estructura y rompimiento (BOS)",
  "Order block de origen",
  "50% de la vela de rompimiento",
  "Fibonacci 78.6%",
  "Imbalance / FVG",
  "Zona de confluencia",
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      {/* Hero */}
      <header className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/60 px-3 py-1 text-xs text-sage-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
          Metodología El Código Suizo
        </div>
        <h1 className="text-3xl font-bold leading-tight text-fg sm:text-4xl">
          Analiza tu gráfico como{" "}
          <span className="text-sage-bright">El Código Suizo</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-fg-muted">
          Sube la captura de tu gráfico y recibe en segundos un análisis técnico
          completo: zonas operativas, plan de entrada y qué hacer. Sin conectar tu
          cuenta.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-fg-muted">
          <span>✓ 2 análisis gratis</span>
          <span>✓ Oro, BTC, NASDAQ, US30, tech</span>
          <span>✓ Temporalidades altas</span>
        </div>
      </header>

      {/* Analizador */}
      <section className="mt-10">
        <Analyzer />
      </section>

      {/* Qué detecta */}
      <section className="mt-14">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-sage-muted">
          Qué detecta en tu gráfico
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CHECKS.map((c) => (
            <div
              key={c}
              className="rounded-lg border border-line bg-surface/50 px-3 py-2.5 text-sm text-fg/90"
            >
              <span className="text-sage-bright">✓</span> {c}
            </div>
          ))}
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
        <p className="mt-2">🇨🇭 Swiss Charts · Metodología El Código Suizo</p>
      </footer>
    </main>
  );
}
