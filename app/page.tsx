import Analyzer from "@/components/Analyzer";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <header className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/60 px-3 py-1 text-xs text-sage-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
          SMC · ICT · Código Suizo
        </div>
        <h1 className="text-3xl font-bold leading-tight text-fg sm:text-4xl">
          Sube tu gráfico y <span className="text-sage-bright">analízalo gratis</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-fg-muted">
          En segundos: estructura, order blocks, liquidez, plan de entrada y
          análisis fundamental. Pruébalo ahora, sin tarjeta. Tienes 2 análisis gratis.
        </p>
      </header>

      <section className="mt-8">
        <Analyzer />
      </section>

      <section className="mt-12 rounded-2xl border border-sage-bright/25 bg-gradient-to-b from-sage-bright/8 to-transparent p-5 text-center">
        <p className="text-sm text-fg-muted">
          ¿Quieres seguir analizando?{" "}
          <span className="font-semibold text-fg">30 análisis por $11.99</span> · pago
          único, sin suscripción.
        </p>
      </section>

      <footer className="mt-10 border-t border-line pt-6 text-center text-xs text-fg-muted">
        🇨🇭 Swiss Charts · Herramienta educativa de análisis técnico. No es asesoría financiera.
      </footer>
    </main>
  );
}
