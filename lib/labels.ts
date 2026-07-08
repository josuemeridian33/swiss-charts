import type { Analysis } from "./schema";

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
