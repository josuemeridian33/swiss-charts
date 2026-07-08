"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { Analysis } from "@/lib/schema";
import {
  actionMeta,
  biasMeta,
  directionMeta,
  priceZoneMeta,
  scoreColor,
  strengthMeta,
  structureLabel,
  toneClasses,
} from "@/lib/labels";

function Badge({ children, tone }: { children: React.ReactNode; tone: keyof typeof toneClasses }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = scoreColor(score);
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#232928" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-fg-muted">score</span>
      </div>
    </div>
  );
}

function Card({
  title,
  active = true,
  children,
}: {
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface/70 p-4 ${
        active ? "" : "opacity-60"
      }`}
    >
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sage-muted">
        {title}
      </div>
      <div className="text-sm text-fg/90">{children}</div>
    </div>
  );
}

export default function AnalysisResult({ analysis }: { analysis: Analysis }) {
  const ref = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const a = analysis;
  const act = actionMeta[a.action];

  async function download() {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        backgroundColor: "#0d0f0f",
      });
      const link = document.createElement("a");
      link.download = `swiss-charts-${a.asset.replace(/\s+/g, "")}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full">
      <div ref={ref} className="rounded-2xl border border-line bg-ink p-5 sm:p-6">
        {/* Encabezado */}
        <div className="flex flex-wrap items-center gap-4 border-b border-line pb-5">
          <ScoreRing score={a.setupScore} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-lg font-bold text-sage-light">{a.asset}</span>
              <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-fg-muted">
                {a.timeframe}
              </span>
              <Badge tone={biasMeta[a.bias].tone}>{biasMeta[a.bias].label}</Badge>
            </div>
            <p className="mt-1.5 text-sm text-fg/90">{a.verdict}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge tone={act.tone}>
                {act.icon} {act.label}
              </Badge>
              <Badge tone={priceZoneMeta[a.priceInZone].tone}>
                {priceZoneMeta[a.priceInZone].label}
              </Badge>
              <span className="text-xs text-fg-muted">Confianza: {a.confidence}</span>
            </div>
          </div>
        </div>

        {!a.timeframeAdequate && (
          <div className="mt-4 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
            ⚠️ {a.timeframeNote}
          </div>
        )}

        {/* Qué hacer */}
        <div className="mt-4 rounded-xl border border-sage-bright/25 bg-sage-bright/5 p-4">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-sage-bright">
            Qué hacer ahora
          </div>
          <p className="text-sm text-fg/90">{a.actionExplanation}</p>
        </div>

        {/* Tarjetas de la metodología */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Card title="Estructura">
            <div className="mb-1 font-medium text-sage-light">
              {structureLabel[a.structure.status]}
            </div>
            {a.structure.explanation}
          </Card>

          <Card title="Order Block de origen" active={a.orderBlock.found}>
            {a.orderBlock.found ? a.orderBlock.location : a.orderBlock.note}
          </Card>

          <Card title="Vela de rompimiento · 50%" active={a.breakCandle.identified}>
            {a.breakCandle.identified ? (
              <>
                <span className="font-mono text-sage-light">{a.breakCandle.fiftyPercentLevel}</span>
                {a.breakCandle.note ? <div className="mt-1">{a.breakCandle.note}</div> : null}
              </>
            ) : (
              a.breakCandle.note
            )}
          </Card>

          <Card title="Fibonacci 78.6%">
            <span className="font-mono text-sage-light">{a.fib786.level}</span>
            {a.fib786.note ? <div className="mt-1">{a.fib786.note}</div> : null}
          </Card>

          <Card title="Imbalance / FVG" active={a.imbalance.found}>
            {a.imbalance.found ? a.imbalance.zone : a.imbalance.note}
          </Card>

          <Card title="Zona de confluencia" active={a.confluenceZone.exists}>
            <div className="mb-1.5">
              <Badge tone={strengthMeta[a.confluenceZone.strength].tone}>
                {strengthMeta[a.confluenceZone.strength].label}
              </Badge>
            </div>
            {a.confluenceZone.exists && (
              <div className="font-mono text-sage-light">{a.confluenceZone.priceZone}</div>
            )}
            {a.confluenceZone.factors?.length ? (
              <div className="mt-1 text-xs text-fg-muted">
                Coincide: {a.confluenceZone.factors.join(" · ")}
              </div>
            ) : null}
          </Card>
        </div>

        {/* Plan */}
        <div className="mt-4 rounded-xl border border-line bg-surface/70 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sage-muted">
              Plan de operación
            </span>
            <Badge tone={directionMeta[a.tradePlan.direction].tone}>
              {directionMeta[a.tradePlan.direction].label}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Entrada", a.tradePlan.entryZone],
              ["Stop loss", a.tradePlan.stopLoss],
              ["Take profit", a.tradePlan.takeProfit],
              ["Riesgo/Beneficio", a.tradePlan.riskReward],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[10px] uppercase tracking-wide text-fg-muted">{k}</div>
                <div className="font-mono text-sm text-sage-light">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface/40 p-3 text-xs text-fg-muted">
            🕐 {a.sessionTip}
          </div>
          <div className="rounded-lg border border-line bg-surface/40 p-3 text-xs text-fg-muted">
            📰 {a.fundamentalReminder}
          </div>
        </div>

        {/* Marca de agua para compartir */}
        <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
          <span className="font-mono text-xs font-semibold text-sage-bright">
            🇨🇭 Swiss Charts
          </span>
          <span className="text-[10px] text-fg-muted">
            Análisis educativo · No es asesoría financiera
          </span>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={download}
          disabled={downloading}
          className="rounded-lg border border-sage-bright/40 bg-sage-bright/10 px-4 py-2 text-sm font-medium text-sage-light transition hover:bg-sage-bright/20 disabled:opacity-50"
        >
          {downloading ? "Generando…" : "↓ Descargar análisis"}
        </button>
      </div>
    </div>
  );
}
