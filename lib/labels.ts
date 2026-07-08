import type { Analysis } from "./schema";
import type { DayTradingAnalysis } from "./schema";

type Tone = "buy" | "sell" | "sage" | "muted" | "warn";

export const toneClasses: Record<Tone, string> = {
  buy: "bg-buy/15 text-buy border-buy/30",
  sell: "bg-sell/15 text-sell border-sell/40",
  sage: "bg-sage/15 text-sage-light border-sage/30",
  muted: "bg-surface-2 text-fg-muted border-line-strong",
  warn: "bg-warn/15 text-warn border-warn/40",
};

export const actionMeta: Record<
  Analysis["action"],
  { label: string; tone: Tone; icon: string }
> = {
  buscar_entrada: { label: "Buscar entrada", tone: "buy", icon: "🎯" },
  poner_alerta: { label: "Poner alerta", tone: "sage", icon: "🔔" },
  esperar: { label: "Esperar", tone: "muted", icon: "⏳" },
  evitar: { label: "Evitar", tone: "sell", icon: "🚫" },
};

export const biasMeta: Record<Analysis["bias"], { label: string; tone: Tone }> = {
  alcista: { label: "Alcista", tone: "buy" },
  bajista: { label: "Bajista", tone: "sell" },
  rango: { label: "Rango", tone: "muted" },
  indefinido: { label: "Indefinido", tone: "muted" },
};

export const structureLabel: Record<Analysis["structure"]["status"], string> = {
  rompimiento_confirmado: "Rompimiento confirmado",
  rompimiento_en_proceso: "Rompimiento en proceso",
  sin_rompimiento: "Sin rompimiento",
  rango: "En rango",
};

export const priceZoneMeta: Record<
  Analysis["priceInZone"],
  { label: string; tone: Tone }
> = {
  dentro: { label: "Precio dentro de zona", tone: "buy" },
  cerca: { label: "Precio cerca de zona", tone: "sage" },
  lejos: { label: "Precio lejos de zona", tone: "muted" },
};

export const directionMeta: Record<
  Analysis["tradePlan"]["direction"],
  { label: string; tone: Tone }
> = {
  compra: { label: "Compra", tone: "buy" },
  venta: { label: "Venta", tone: "sell" },
  ninguna: { label: "Sin operación", tone: "muted" },
};

export const strengthMeta: Record<
  Analysis["confluenceZone"]["strength"],
  { label: string; tone: Tone }
> = {
  alta: { label: "Confluencia alta", tone: "buy" },
  media: { label: "Confluencia media", tone: "sage" },
  baja: { label: "Confluencia baja", tone: "muted" },
};

export function scoreColor(score: number): string {
  if (score >= 70) return "#24a759"; // buy
  if (score >= 45) return "#f0980b"; // warn
  return "#ef4533"; // sell
}

// ---------- Day Trading / Scalping ----------

export const sessionMeta: Record<
  DayTradingAnalysis["session"],
  { label: string; tone: Tone }
> = {
  asiatica: { label: "Sesión asiática", tone: "muted" },
  londres: { label: "Sesión Londres", tone: "sage" },
  nueva_york: { label: "Sesión Nueva York", tone: "buy" },
  mixta: { label: "Sesión mixta", tone: "sage" },
  no_clara: { label: "Sesión no clara", tone: "muted" },
};

export const dtStructureMeta: Record<
  DayTradingAnalysis["structure"]["type"],
  { label: string; tone: Tone }
> = {
  bos_alcista: { label: "BOS alcista", tone: "buy" },
  bos_bajista: { label: "BOS bajista", tone: "sell" },
  choch_alcista: { label: "CHoCH alcista", tone: "buy" },
  choch_bajista: { label: "CHoCH bajista", tone: "sell" },
  rango: { label: "En rango", tone: "muted" },
  sin_estructura: { label: "Sin estructura clara", tone: "muted" },
};

export const dealingZoneMeta: Record<
  DayTradingAnalysis["dealingRange"]["currentZone"],
  { label: string; tone: Tone }
> = {
  premium: { label: "Premium", tone: "sell" },
  descuento: { label: "Descuento", tone: "buy" },
  equilibrio: { label: "Equilibrio", tone: "sage" },
};

export const orderBlockTypeMeta: Record<
  DayTradingAnalysis["smc"]["orderBlocks"]["type"],
  { label: string; tone: Tone }
> = {
  bullish: { label: "OB bullish", tone: "buy" },
  bearish: { label: "OB bearish", tone: "sell" },
  breaker: { label: "Breaker block", tone: "warn" },
  mitigation_block: { label: "Mitigation block", tone: "sage" },
};

export const fvgVariantMeta: Record<
  DayTradingAnalysis["ict"]["fvg"]["variant"],
  { label: string; tone: Tone }
> = {
  breakaway: { label: "Breakaway FVG", tone: "sage" },
  displacement_runaway: { label: "Displacement / Runaway", tone: "buy" },
  exhaustion: { label: "Exhaustion FVG", tone: "warn" },
};

export const macroBiasMeta: Record<
  Analysis["fundamental"]["macroBias"],
  { label: string; tone: Tone }
> = {
  alcista: { label: "Macro alcista", tone: "buy" },
  bajista: { label: "Macro bajista", tone: "sell" },
  neutro: { label: "Macro neutra", tone: "muted" },
  mixto: { label: "Macro mixta", tone: "warn" },
};
