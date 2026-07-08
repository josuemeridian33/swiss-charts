"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { DayTradingAnalysis } from "@/lib/schema";
import { Badge, Card, ScoreRing } from "./AnalysisResult";
import {
  actionMeta,
  biasMeta,
  dealingZoneMeta,
  directionMeta,
  dtStructureMeta,
  fvgVariantMeta,
  orderBlockTypeMeta,
  sessionMeta,
} from "@/lib/labels";

export default function DayTradingResult({
  analysis,
}: {
  analysis: DayTradingAnalysis;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const a = analysis;
  const act = actionMeta[a.action];
  const zone = dealingZoneMeta[a.dealingRange.currentZone];

  async function download() {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        backgroundColor: "#0d0f0f",
      });
      const link = document.createElement("a");
      link.download = `swiss-charts-dt-${a.asset.replace(/\s+/g, "")}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  const lenses = [
    { label: "SMC", score: a.smc.score },
    { label: "ICT", score: a.ict.score },
    { label: "Scalping", score: a.scalping.score },
  ];

  return (
    <div className="w-full">
      <div ref={ref} className="rounded-2xl border border-line bg-ink p-5 sm:p-6">
        {/* Encabezado */}
        <div className="flex flex-wrap items-center gap-4 border-b border-line pb-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-lg font-bold text-sage-light">{a.asset}</span>
              <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-fg-muted">
                {a.timeframe}
              </span>
              <Badge tone={sessionMeta[a.session].tone}>{sessionMeta[a.session].label}</Badge>
              <Badge tone={biasMeta[a.bias].tone}>{biasMeta[a.bias].label}</Badge>
            </div>
            <p className="mt-1.5 text-sm text-fg/90">{a.verdict}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge tone={act.tone}>{act.icon} {act.label}</Badge>
              <Badge tone={zone.tone}>Precio en {zone.label.toLowerCase()}</Badge>
              <Badge tone={dtStructureMeta[a.structure.type].tone}>
                {dtStructureMeta[a.structure.type].label}
              </Badge>
              <span className="text-xs text-fg-muted">Confianza: {a.confidence}</span>
            </div>
          </div>
        </div>

        {/* 3 lentes con % */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
          {lenses.map((l) => (
            <div
              key={l.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface/50 p-3"
            >
              <ScoreRing score={l.score} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sage-muted">
                {l.label}
              </span>
            </div>
          ))}
        </div>

        {/* Qué hacer */}
        <div className="mt-4 rounded-xl border border-sage-bright/25 bg-sage-bright/5 p-4">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-sage-bright">
            Qué hacer ahora
          </div>
          <p className="text-sm text-fg/90">{a.actionExplanation}</p>
          <p className="mt-2 text-xs text-fg-muted">
            <span className="text-sage-muted">Confluencia de lentes:</span> {a.confluenceNote}
          </p>
        </div>

        {/* Dealing range */}
        <div className="mt-4 rounded-xl border border-line bg-surface/70 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sage-muted">
              Dealing range · premium / descuento
            </span>
            <Badge tone={zone.tone}>{zone.label}</Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-muted">
              Suelo <span className="font-mono text-sell">{a.dealingRange.low}</span>
            </span>
            <span className="text-fg-muted">
              Eq. <span className="font-mono text-sage-light">{a.dealingRange.equilibrium}</span>
            </span>
            <span className="text-fg-muted">
              Techo <span className="font-mono text-buy">{a.dealingRange.high}</span>
            </span>
          </div>
          <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-gradient-to-r from-buy/45 via-sage/25 to-sell/45">
            <div className="absolute left-1/2 top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-fg/40" />
          </div>
        </div>

        {/* Tarjetas por lente */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Card title={`SMC concepts · ${a.smc.score}%`} active={a.smc.orderBlocks.found}>
            <div className="mb-1.5">
              <Badge tone={orderBlockTypeMeta[a.smc.orderBlocks.type].tone}>
                {orderBlockTypeMeta[a.smc.orderBlocks.type].label}
              </Badge>
            </div>
            <div>{a.smc.orderBlocks.found ? a.smc.orderBlocks.location : a.smc.orderBlocks.note}</div>
            <div className="mt-1.5 text-xs text-fg-muted">
              Liquidez: {a.smc.liquidity.sweep ? "barrido ✓ " : "sin barrido · "}
              {a.smc.imbalance.found ? `FVG ${a.smc.imbalance.zone}` : "sin FVG"}
            </div>
            <div className="mt-1 text-xs text-fg-muted">{a.smc.note}</div>
          </Card>

          <Card title={`ICT · ${a.ict.score}%`} active={a.ict.fvg.found || a.ict.liquidityGrab.found}>
            <div className="mb-1.5">
              {a.ict.fvg.found ? (
                <Badge tone={fvgVariantMeta[a.ict.fvg.variant].tone}>
                  {fvgVariantMeta[a.ict.fvg.variant].label}
                </Badge>
              ) : (
                <Badge tone="muted">Sin FVG</Badge>
              )}
            </div>
            <div className="text-xs text-fg/90">
              {a.ict.fvg.found ? a.ict.fvg.zone : "Sin fair value gap claro."}
            </div>
            <div className="mt-1.5 text-xs text-fg-muted">
              Grab: {a.ict.liquidityGrab.found ? "sí ✓" : "no"} · Killzone: {a.ict.killzone.which}
            </div>
            <div className="mt-1 text-xs text-fg-muted">{a.ict.note}</div>
          </Card>

          <Card title={`Scalping · ${a.scalping.score}%`} active={a.scalping.score >= 50}>
            <div className="text-sm text-fg/90">{a.scalping.entryTrigger}</div>
            <div className="mt-1.5 text-xs text-fg-muted">Momento: {a.scalping.momentum}</div>
            <div className="mt-1 text-xs text-fg-muted">{a.scalping.note}</div>
          </Card>
        </div>

        {/* Plan conjunto */}
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

        {/* Sesión + noticias */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface/40 p-3 text-xs text-fg-muted">
            🕐 {a.sessionTip}
          </div>
          <div className="rounded-lg border border-line bg-surface/40 p-3 text-xs text-fg-muted">
            📰 {a.newsReminder}
          </div>
        </div>

        {/* Marca de agua */}
        <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
          <span className="font-mono text-xs font-semibold text-sage-bright">
            🇨🇭 Swiss Charts · Day Trading
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
