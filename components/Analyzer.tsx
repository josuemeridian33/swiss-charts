"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Analysis } from "@/lib/schema";
import dynamic from "next/dynamic";

// Carga diferida del resultado: saca html-to-image (lib pesada) del JS inicial.
// El panel de resultado solo se monta tras analizar, así no penaliza la primera carga.
const AnalysisResult = dynamic(() => import("./AnalysisResult"), {
  ssr: false,
  loading: () => <div className="mt-6 h-44 animate-pulse rounded-xl bg-surface/60" />,
});

const HOTMART_URL = process.env.NEXT_PUBLIC_HOTMART_URL || "#";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function fileToDataUrl(file: File, maxDim = 1568, quality = 0.85): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function Analyzer() {
  const [preview, setPreview] = useState<string | null>(null);
  const [asset, setAsset] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [bias, setBias] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Sube una imagen (captura de tu gráfico).");
      return;
    }
    setError(null);
    setAnalysis(null);
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
  }, []);

  // Pegar con Ctrl+V
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/")
      );
      const file = item?.getAsFile();
      if (file) handleFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  async function analyze() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview, asset, timeframe, bias }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "limit") {
          setPaywall(true);
        } else {
          setError(data.error || "Error al analizar.");
        }
        return;
      }
      setAnalysis(data.analysis);
      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition ${
          dragOver
            ? "border-sage-bright bg-sage-bright/10"
            : "border-line bg-surface/40 hover:border-sage/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Gráfico"
            className="mx-auto max-h-80 rounded-lg border border-line"
          />
        ) : (
          <div className="py-8">
            <div className="text-4xl">📸</div>
            <p className="mt-3 font-medium text-fg">
              Arrastra tu gráfico o haz clic
              <span className="hidden sm:inline">
                {" "}
                o pega con{" "}
                <kbd className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">Ctrl+V</kbd>
              </span>
            </p>
            <p className="mt-1 text-sm text-fg-muted">
              Captura de tu gráfico en temporalidad alta (diaria, semanal, mensual)
            </p>
          </div>
        )}
      </div>

      {preview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            setAnalysis(null);
          }}
          className="mt-2 text-xs text-fg-muted hover:text-sell"
        >
          Quitar imagen
        </button>
      )}

      {/* Opciones */}
      <div className="mt-3">
        <button
          onClick={() => setShowOptions((s) => !s)}
          className="text-xs text-sage-muted hover:text-sage-light"
        >
          {showOptions ? "− Ocultar" : "+ Datos opcionales"} (activo, temporalidad)
        </button>
        {showOptions && (
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <input
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="Activo (ej. XAUUSD)"
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-sage-bright focus:outline-none"
            />
            <input
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="Temporalidad (ej. 1D)"
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-sage-bright focus:outline-none"
            />
            <input
              value={bias}
              onChange={(e) => setBias(e.target.value)}
              placeholder="Tu sesgo (opcional)"
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-sage-bright focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Botón analizar */}
      <button
        onClick={analyze}
        disabled={!preview || loading}
        className="mt-4 w-full rounded-xl bg-sage-bright px-6 py-3.5 text-base font-semibold text-ink-deep transition hover:bg-sage-light disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Analizando tu gráfico…" : "Analizar gráfico"}
      </button>

      {remaining !== null && (
        <p className="mt-2 text-center text-xs text-fg-muted">
          Análisis restantes: <span className="text-sage-light">{remaining}</span>
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-sell/40 bg-sell/10 px-4 py-3 text-sm text-sell">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 animate-pulse space-y-3">
          <div className="h-24 rounded-xl bg-surface/60" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-20 rounded-xl bg-surface/60" />
            <div className="h-20 rounded-xl bg-surface/60" />
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="mt-6">
          <AnalysisResult analysis={analysis} />
        </div>
      )}

      {paywall && <Paywall onClose={() => setPaywall(false)} onRedeemed={(r) => {
        setPaywall(false);
        setRemaining(r);
        setError(null);
      }} />}
    </div>
  );
}

function Paywall({
  onClose,
  onRedeemed,
}: {
  onClose: () => void;
  onRedeemed: (remaining: number) => void;
}) {
  const [tab, setTab] = useState<"buy" | "redeem">("buy");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function redeem() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "No se pudo validar.");
        return;
      }
      onRedeemed(data.remaining);
    } catch {
      setMsg("Error de conexión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-8 sm:items-center sm:py-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-ink p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-center">
          <div className="text-3xl">🔓</div>
          <h3 className="mt-2 text-xl font-bold text-fg">Desbloquea 50 análisis</h3>
          <p className="mt-1 text-sm text-fg-muted">
            Usaste tus análisis gratis. Un solo pago, sin suscripción.
          </p>
        </div>

        <div className="mb-4 flex rounded-lg border border-line p-1">
          <button
            onClick={() => setTab("buy")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              tab === "buy" ? "bg-sage-bright/15 text-sage-light" : "text-fg-muted"
            }`}
          >
            Comprar
          </button>
          <button
            onClick={() => setTab("redeem")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              tab === "redeem" ? "bg-sage-bright/15 text-sage-light" : "text-fg-muted"
            }`}
          >
            Ya compré
          </button>
        </div>

        {tab === "buy" ? (
          <div className="text-center">
            <div className="rounded-xl border border-sage-bright/30 bg-sage-bright/5 p-5">
              <div className="text-4xl font-bold text-sage-light">$10</div>
              <div className="mt-1 text-sm text-fg-muted">50 análisis · pago único</div>
            </div>
            <a
              href={HOTMART_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block w-full rounded-xl bg-sage-bright px-6 py-3 text-base font-semibold text-ink-deep transition hover:bg-sage-light"
            >
              Comprar ahora
            </a>
            <p className="mt-2 text-xs text-fg-muted">
              Pago seguro por Hotmart. Recibes tu acceso al instante.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de licencia (SC-XXX-XXX)"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-sage-bright focus:outline-none"
            />
            <div className="text-center text-xs text-fg-muted">— o —</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email de tu compra"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-sage-bright focus:outline-none"
            />
            <button
              onClick={redeem}
              disabled={busy}
              className="w-full rounded-xl bg-sage-bright px-6 py-3 text-base font-semibold text-ink-deep transition hover:bg-sage-light disabled:opacity-50"
            >
              {busy ? "Validando…" : "Activar mis análisis"}
            </button>
          </div>
        )}

        {msg && <p className="mt-3 text-center text-sm text-sell">{msg}</p>}

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-xs text-fg-muted hover:text-fg"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
