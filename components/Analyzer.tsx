"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Analysis, DayTradingAnalysis } from "@/lib/schema";
import dynamic from "next/dynamic";

// Carga diferida de los resultados: saca html-to-image (lib pesada) del JS inicial.
const AnalysisResult = dynamic(() => import("./AnalysisResult"), {
  ssr: false,
  loading: () => <div className="mt-6 h-44 animate-pulse rounded-xl bg-surface/60" />,
});
const DayTradingResult = dynamic(() => import("./DayTradingResult"), {
  ssr: false,
  loading: () => <div className="mt-6 h-44 animate-pulse rounded-xl bg-surface/60" />,
});

const HOTMART_URL = process.env.NEXT_PUBLIC_HOTMART_URL || "#";
const INPUT_CLS =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-sage-bright focus:outline-none";
const LAST_RESULT_KEY = "sc_last_result";

type Slot = "macro" | "micro";
type DualResult = {
  suizo: Analysis | null;
  daytrading: DayTradingAnalysis | null;
};

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

/** Slot de subida para macro o micro. */
function Dropzone({
  slot,
  preview,
  onFile,
  onClear,
}: {
  slot: Slot;
  preview: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const isMacro = slot === "macro";

  const handle = (files?: FileList | null) => {
    const f = files?.[0];
    if (f) onFile(f);
  };

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-x-2 text-xs">
        <span className={`font-semibold ${isMacro ? "text-sage-bright" : "text-terracotta-soft"}`}>
          {isMacro ? "📈 Macro · Código Suizo" : "🔬 Micro · Day Trading"}
        </span>
        <span className="text-fg-subtle">
          {isMacro ? "Diaria / semanal / mensual" : "Intradía / scalping · 15m, 1H…"}
        </span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handle(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition ${
          over
            ? "border-sage-bright bg-sage-bright/10"
            : "border-line bg-surface/40 hover:border-sage/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handle(e.target.files)}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={`Gráfico ${slot}`}
            className="mx-auto max-h-64 rounded-lg border border-line"
          />
        ) : (
          <div className="py-6">
            <div className="text-3xl">{isMacro ? "📈" : "🔬"}</div>
            <p className="mt-2 text-sm font-medium text-fg">
              Sube tu gráfico {slot === "macro" ? "macro" : "micro"}
            </p>
            <p className="mt-1 text-xs text-fg-muted">
              {isMacro ? "Diaria / semanal / mensual" : "Intradía / scalping · 15m, 1H…"}
            </p>
          </div>
        )}
      </div>
      {preview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="mt-1.5 text-xs text-fg-muted hover:text-sell"
        >
          Quitar imagen {slot}
        </button>
      )}
    </div>
  );
}

export default function Analyzer() {
  const [macroPreview, setMacroPreview] = useState<string | null>(null);
  const [microPreview, setMicroPreview] = useState<string | null>(null);
  const [asset, setAsset] = useState("");
  const [bias, setBias] = useState("");
  const [macroContext, setMacroContext] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState<DualResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  const handleFile = useCallback(async (file: File, slot: Slot) => {
    if (!file.type.startsWith("image/")) {
      setError("Sube una imagen (captura de tu gráfico).");
      return;
    }
    setError(null);
    setResult(null);
    const dataUrl = await fileToDataUrl(file);
    if (slot === "macro") setMacroPreview(dataUrl);
    else setMicroPreview(dataUrl);
  }, []);

  // Pegar con Ctrl+V → va al primer slot vacío.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/")
      );
      const file = item?.getAsFile();
      if (file) handleFile(file, !macroPreview ? "macro" : "micro");
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile, macroPreview]);

  // Persistir / restaurar el último análisis (sobrevive al reload).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_RESULT_KEY);
      if (saved) setResult(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      if (result?.suizo || result?.daytrading)
        localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
      else localStorage.removeItem(LAST_RESULT_KEY);
    } catch {
      /* ignore */
    }
  }, [result]);

  async function analyze() {
    if (!macroPreview || !microPreview) return;
    setLoading(true);
    setError(null);
    setPhase("Iniciando análisis…");
    setResult({ suizo: null, daytrading: null });
    try {
      const res = await fetch("/api/analyze-both", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          macro: macroPreview,
          micro: microPreview,
          asset,
          bias,
          macroContext,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.code === "limit") setPaywall(true);
        else setError(data.error || "Error al analizar.");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("Error de conexión.");
        return;
      }
      const dec = new TextDecoder();
      let buf = "";
      let suizoReady = false;
      let dtReady = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() || "";
        for (const ev of events) {
          const line = ev.trim();
          if (!line.startsWith("data: ")) continue;
          let evt: { type: string; data?: unknown; remaining?: number | null };
          try {
            evt = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          switch (evt.type) {
            case "meta":
              setRemaining(typeof evt.remaining === "number" ? evt.remaining : null);
              break;
            case "suizo":
              if (!suizoReady) setPhase("Leyendo macro · Código Suizo…");
              break;
            case "daytrading":
              if (!dtReady) setPhase("Leyendo micro · SMC · ICT · Scalping…");
              break;
            case "suizo-done":
              suizoReady = true;
              setResult((r) => ({ suizo: evt.data as Analysis, daytrading: r?.daytrading ?? null }));
              setPhase(dtReady ? "" : "Macro listo · terminando micro…");
              break;
            case "daytrading-done":
              dtReady = true;
              setResult((r) => ({ suizo: r?.suizo ?? null, daytrading: evt.data as DayTradingAnalysis }));
              setPhase(suizoReady ? "" : "Micro listo · terminando macro…");
              break;
            case "error":
              setError("No se pudo completar uno de los análisis. Intenta de nuevo.");
              break;
          }
        }
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
      setPhase("");
    }
  }

  return (
    <div className="w-full">
      <p className="mb-2 text-xs text-fg-muted">
        Sube tu gráfico en <span className="text-sage-bright">macro</span> y en{" "}
        <span className="text-terracotta-soft">micro</span>. Se analizan los dos a la vez
        (Código Suizo + SMC/ICT) y van apareciendo en vivo.
        <span className="hidden sm:inline"> Puedes pegar con Ctrl+V.</span>
      </p>

      {/* Doble subida */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Dropzone
          slot="macro"
          preview={macroPreview}
          onFile={(f) => handleFile(f, "macro")}
          onClear={() => {
            setMacroPreview(null);
            setResult(null);
          }}
        />
        <Dropzone
          slot="micro"
          preview={microPreview}
          onFile={(f) => handleFile(f, "micro")}
          onClear={() => {
            setMicroPreview(null);
            setResult(null);
          }}
        />
      </div>

      {/* Opciones */}
      <div className="mt-3">
        <button
          onClick={() => setShowOptions((s) => !s)}
          className="text-xs text-sage-muted hover:text-sage-light"
        >
          {showOptions ? "− Ocultar" : "+ Datos opcionales"} (activo, sesgo, macro)
        </button>
        {showOptions && (
          <div className="mt-2 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                placeholder="Activo (ej. XAUUSD)"
                className={INPUT_CLS}
              />
              <input
                value={bias}
                onChange={(e) => setBias(e.target.value)}
                placeholder="Tu sesgo (opcional)"
                className={INPUT_CLS}
              />
            </div>
            <textarea
              value={macroContext}
              onChange={(e) => setMacroContext(e.target.value)}
              placeholder="Contexto macro/fundamental (opcional): tasas, DXY, datos próximos, noticias…"
              rows={2}
              className={`${INPUT_CLS} resize-none`}
            />
          </div>
        )}
      </div>

      {/* Botón analizar */}
      <button
        onClick={analyze}
        disabled={!macroPreview || !microPreview || loading}
        className="mt-4 w-full rounded-xl bg-sage-bright px-6 py-3.5 text-base font-semibold text-ink-deep transition hover:bg-sage-light disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Analizando…" : "Analizar ambos gráficos"}
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

      {/* Resultados (aparecen en vivo a medida que termina cada uno) */}
      {(result?.suizo || result?.daytrading || loading) && (
        <div className="mt-6 space-y-8">
          {result?.suizo ? (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-sage-muted">
                📈 Código Suizo · macro
              </div>
              <AnalysisResult analysis={result.suizo} />
            </div>
          ) : loading ? (
            <div className="animate-pulse rounded-xl border border-line bg-surface/40 p-4 text-sm text-fg-muted">
              {phase || "Leyendo macro…"}
            </div>
          ) : null}

          {result?.daytrading ? (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-sage-muted">
                🔬 Day Trading / Scalping · micro
              </div>
              <DayTradingResult analysis={result.daytrading} />
            </div>
          ) : loading ? (
            <div className="animate-pulse rounded-xl border border-line bg-surface/40 p-4 text-sm text-fg-muted">
              {phase || "Leyendo micro…"}
            </div>
          ) : null}
        </div>
      )}

      {paywall && (
        <Paywall
          onClose={() => setPaywall(false)}
          onRedeemed={(r) => {
            setPaywall(false);
            setRemaining(r);
            setError(null);
          }}
        />
      )}
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
          <h3 className="mt-2 text-xl font-bold text-fg">Desbloquea 30 análisis</h3>
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
              <div className="text-4xl font-bold text-sage-light">$11.99</div>
              <div className="mt-1 text-sm text-fg-muted">30 análisis · pago único</div>
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
