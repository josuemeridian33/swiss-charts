import { z } from "zod";

/**
 * Esquema del análisis "El Código Suizo".
 * Cada campo mapea un paso de la metodología para que la IA
 * devuelva SIEMPRE la misma estructura y la UI la renderice en tarjetas.
 */
export const analysisSchema = z.object({
  // Contexto
  asset: z
    .string()
    .describe("Activo detectado en el gráfico, ej. 'XAUUSD', 'BTCUSD', 'NAS100'. Si no se distingue: 'No identificado'."),
  timeframe: z
    .string()
    .describe("Temporalidad visible, ej. '1D', '1W', '1M', '4H'. Si no se distingue: 'No identificada'."),
  timeframeAdequate: z
    .boolean()
    .describe("true si la temporalidad es alta (diaria, semanal o mensual), adecuada para la estrategia."),
  timeframeNote: z
    .string()
    .describe("Si la temporalidad es baja, recomienda subir a diaria/semanal/mensual. Si es adecuada, confírmalo brevemente."),

  bias: z.enum(["alcista", "bajista", "rango", "indefinido"]),

  // 1. Estructura
  structure: z.object({
    status: z.enum([
      "rompimiento_confirmado",
      "rompimiento_en_proceso",
      "sin_rompimiento",
      "rango",
    ]),
    explanation: z.string().describe("Explica el estado de la estructura (BOS/CHoCH) que se ve en el gráfico."),
  }),

  // 2. Order Block de origen
  orderBlock: z.object({
    found: z.boolean(),
    location: z.string().describe("Dónde está el OB de origen (el que inició el movimiento que rompió estructura)."),
    note: z.string().describe("Si no se ve, indica subir de temporalidad (semanal→mensual→diaria) para encontrarlo."),
  }),

  // 3. Vela de rompimiento (50%)
  breakCandle: z.object({
    identified: z.boolean(),
    fiftyPercentLevel: z.string().describe("Nivel aproximado del 50% de la vela que confirmó la estructura."),
    note: z.string(),
  }),

  // 4. Fibonacci 78.6%
  fib786: z.object({
    level: z.string().describe("Nivel del 78.6% del Fibonacci trazado del OB al extremo del movimiento."),
    note: z.string(),
  }),

  // 5. Imbalance / FVG
  imbalance: z.object({
    found: z.boolean(),
    zone: z.string().describe("Zona del imbalance/FVG del movimiento de rompimiento."),
    note: z.string(),
  }),

  // 6. Zona de confluencia
  confluenceZone: z.object({
    exists: z.boolean(),
    strength: z.enum(["alta", "media", "baja"]),
    priceZone: z.string().describe("Rango de precio de la zona de confluencia."),
    factors: z
      .array(z.string())
      .describe("Qué elementos coinciden: 'Fib 78.6%', '50% vela', 'imbalance'."),
  }),

  // 7. Estado del precio
  priceInZone: z
    .enum(["dentro", "cerca", "lejos"])
    .describe("¿El precio ya está en la zona operativa, cerca, o lejos?"),

  // 8. Acción
  action: z.enum(["buscar_entrada", "poner_alerta", "esperar", "evitar"]),
  actionExplanation: z.string(),

  // 9. Plan
  tradePlan: z.object({
    direction: z.enum(["compra", "venta", "ninguna"]),
    entryZone: z.string(),
    stopLoss: z.string(),
    takeProfit: z.string(),
    riskReward: z.string().describe("Ratio estimado, ej. '1:10'. La estrategia busca mínimo 1:10."),
  }),

  sessionTip: z.string().describe("Recordatorio de operar en aperturas de Londres o Nueva York."),
  fundamentalReminder: z
    .string()
    .describe("Recuerda revisar Forex Factory por noticias de alto impacto que afecten este activo."),

  // Resumen
  setupScore: z.number().min(0).max(100).describe("Calidad del setup 0-100 según la metodología."),
  verdict: z.string().describe("Veredicto en una frase corta y directa."),
  confidence: z.enum(["alta", "media", "baja"]),
});

export type Analysis = z.infer<typeof analysisSchema>;
