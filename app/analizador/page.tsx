import Analyzer from "@/components/Analyzer";
import Link from "next/link";

export default function Analizador() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-xs text-fg-muted transition hover:text-fg">
          ← Volver al inicio
        </Link>
        <span className="font-mono text-xs font-semibold text-sage-bright">🇨🇭 Swiss Charts</span>
      </div>
      <Analyzer />
      <footer className="mt-14 border-t border-line pt-6 text-center text-xs text-fg-muted">
        Swiss Charts es una herramienta educativa de análisis técnico. No es
        asesoría financiera ni garantiza resultados. Opera bajo tu propio riesgo.
      </footer>
    </main>
  );
}
