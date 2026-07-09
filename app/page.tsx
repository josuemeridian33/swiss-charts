import Link from "next/link";

const HOTMART_URL = process.env.NEXT_PUBLIC_HOTMART_URL || "/analizador";

const BENEFITS = [
  {
    icon: "📈",
    t: "Macro + Micro a la vez",
    d: "Subes tu chart en temporalidad alta y baja. Dos análisis en paralelo: Código Suizo + SMC/ICT.",
  },
  {
    icon: "🎯",
    t: "3 metodologías con %",
    d: "Cada análisis te da un score en SMC, ICT y Scalping, más veredicto y plan de entrada.",
  },
  {
    icon: "📊",
    t: "Con análisis fundamental",
    d: "Pegas el contexto macro (tasas, DXY, noticias) y la IA lo cruza con tu sesgo técnico.",
  },
];

const STEPS = [
  { n: "1", t: "Sube tus 2 charts", d: "Una captura macro y una micro del activo que operes." },
  { n: "2", t: "La IA los analiza", d: "Código Suizo + SMC + ICT + fundamental, en segundos." },
  { n: "3", t: "Opera tu plan", d: "Entrada, stop, take profit y qué hacer ahora." },
];

const FAQ = [
  { q: "¿Necesito crear una cuenta?", a: "No. Compras y entras con tu email de compra. Sin contraseñas." },
  { q: "¿Caduca el acceso?", a: "No. Pagas $11.99 una vez y tienes 30 análisis. Sin mensualidad." },
  { q: "¿Qué activos analiza?", a: "Oro, Bitcoin, NASDAQ, US30, forex y cualquier chart de trading." },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-20">
      {/* Hero + Oferta */}
      <header className="text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/60 px-3 py-1 text-xs text-sage-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
          Análisis de gráficos con IA · SMC · ICT · Código Suizo
        </div>
        <h1 className="text-4xl font-bold leading-tight text-fg sm:text-5xl">
          Analiza tu gráfico como <span className="text-sage-bright">un profesional</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-fg-muted">
          Sube tu chart en macro y micro y recibe en segundos estructura, zonas,
          plan de entrada y análisis fundamental. Como lo haría un trader experto.
        </p>

        {/* Oferta */}
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-sage-bright/30 bg-gradient-to-b from-sage-bright/10 to-transparent p-5">
          <div className="flex items-end justify-center gap-2">
            <span className="text-5xl font-bold text-fg">$11.99</span>
            <span className="mb-1.5 text-sm text-fg-muted">una vez · 30 análisis</span>
          </div>
          <div className="mt-1 text-xs text-fg-muted">
            macro + micro · sin suscripción · sin tarjeta guardada
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/analizador"
              className="rounded-xl bg-sage-bright px-6 py-3 text-base font-semibold text-ink-deep transition hover:bg-sage-light"
            >
              Probar gratis →
            </Link>
            <a
              href={HOTMART_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-line bg-surface/60 px-6 py-3 text-base font-semibold text-fg transition hover:border-sage/60"
            >
              Comprar $11.99
            </a>
          </div>
          <p className="mt-3 text-xs text-fg-muted">Prueba 2 análisis gratis antes de comprar.</p>
        </div>
      </header>

      {/* Beneficios */}
      <section className="mt-16">
        <div className="grid gap-3 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.t} className="rounded-xl border border-line bg-surface/50 p-5">
              <div className="text-2xl">{b.icon}</div>
              <div className="mt-2 font-semibold text-fg">{b.t}</div>
              <p className="mt-1 text-sm text-fg-muted">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mt-16">
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

      {/* FAQ */}
      <section className="mt-16">
        <div className="space-y-3">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-xl border border-line bg-surface/50 p-4">
              <div className="font-medium text-fg">{f.q}</div>
              <p className="mt-1 text-sm text-fg-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-fg">Empieza ahora</h2>
        <p className="mt-2 text-sm text-fg-muted">2 análisis gratis. Sin tarjeta.</p>
        <Link
          href="/analizador"
          className="mt-4 inline-block rounded-xl bg-sage-bright px-6 py-3 text-base font-semibold text-ink-deep transition hover:bg-sage-light"
        >
          Probar Swiss Charts →
        </Link>
      </section>

      <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-fg-muted">
        <p>🇨🇭 Swiss Charts · Herramienta educativa de análisis técnico. No es asesoría financiera.</p>
      </footer>
    </main>
  );
}
