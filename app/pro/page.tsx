import Link from "next/link";

const HOTMART_URL = process.env.NEXT_PUBLIC_HOTMART_URL || "/analizador?src=pro";

const PAINS = [
  "¿Entras sin saber dónde está realmente la zona?",
  "¿Persigues el precio en vez de esperarlo en confluencia?",
  "¿No entiendes qué hace el dinero inteligente en tu gráfico?",
];

const SOLUTION = [
  { t: "Lee lo que el precio esconde", d: "Order blocks, liquidez (buy/sell side), FVG y barridos — la huella del dinero inteligente." },
  { t: "Donde confluye, operas", d: "SMC + ICT + Código Suizo alineados en una zona de alta probabilidad." },
  { t: "Plan claro, no emociones", d: "Entrada, stop, take profit y qué hacer ahora. Más disciplina, menos dudas." },
];

export default function Pro() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-20">
      <header className="text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sell/30 bg-sell/5 px-3 py-1 text-xs text-sell">
          <span className="h-1.5 w-1.5 rounded-full bg-sell" />
          Operar a ciegas te hace perder dinero
        </div>
        <h1 className="text-4xl font-bold leading-tight text-fg sm:text-5xl">
          Deja de adivinar.<br className="hidden sm:block" />{" "}
          <span className="text-sage-bright">Analiza como los pro.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-fg-muted">
          La mayoría de traders pierde porque entra sin leer la estructura ni la
          liquidez. Swiss Charts lee tu gráfico con SMC, ICT y Código Suizo y te
          dice exactamente dónde operar.
        </p>
      </header>

      {/* Dolor */}
      <section className="mt-12">
        <div className="space-y-2">
          {PAINS.map((p) => (
            <div key={p} className="flex items-start gap-3 rounded-xl border border-line bg-surface/40 px-4 py-3 text-sm text-fg/90">
              <span className="mt-0.5 text-sell">✗</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Solución */}
      <section className="mt-12">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-sage-muted">
          Con Swiss Charts
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {SOLUTION.map((s) => (
            <div key={s.t} className="rounded-xl border border-sage-bright/25 bg-sage-bright/5 p-5">
              <div className="font-semibold text-sage-light">{s.t}</div>
              <p className="mt-1 text-sm text-fg-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Oferta + CTA */}
      <section className="mt-12">
        <div className="mx-auto max-w-md rounded-2xl border border-sage-bright/30 bg-gradient-to-b from-sage-bright/10 to-transparent p-6 text-center">
          <div className="text-sm font-medium uppercase tracking-wider text-sage-muted">Acceso completo</div>
          <div className="mt-2 flex items-end justify-center gap-2">
            <span className="text-5xl font-bold text-fg">$11.99</span>
            <span className="mb-1.5 text-sm text-fg-muted">una vez · 30 análisis</span>
          </div>
          <p className="mt-1 text-xs text-fg-muted">macro + micro · sin suscripción</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link href="/analizador?src=pro" className="rounded-xl bg-sage-bright px-6 py-3 text-base font-semibold text-ink-deep transition hover:bg-sage-light">
              Probar gratis →
            </Link>
            <a href={HOTMART_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-line bg-surface/60 px-6 py-3 text-base font-semibold text-fg transition hover:border-sage/60">
              Comprar $11.99
            </a>
          </div>
          <p className="mt-3 text-xs text-fg-muted">2 análisis gratis antes de decidir.</p>
        </div>
      </section>

      <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-fg-muted">
        🇨🇭 Swiss Charts · SMC · ICT · Código Suizo · No es asesoría financiera.
      </footer>
    </main>
  );
}
