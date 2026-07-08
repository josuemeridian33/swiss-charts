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

  // Análisis fundamental / macro
  fundamental: z.object({
    macroBias: z.enum(["alcista", "bajista", "neutro", "mixto"]).describe("Sesgo macro/fundamental del activo."),
    drivers: z.array(z.string()).describe("2-4 drivers macro clave que mueven este activo (tasas, DXY, datos económicos, geopolítica)."),
    contextNote: z.string().describe("Cómo encaja el contexto macro (dado por el usuario o el general) con el sesgo técnico del chart."),
    events: z.array(z.string()).describe("Eventos/datos de alto impacto a vigilar (NFP, CPI, decisión de banco central, etc.)."),
    note: z.string().describe("Resumen fundamental en una frase corta."),
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

/**
 * Modo de análisis elegido por el usuario.
 * - codigo_suizo: temporalidades ALTAS (diaria/semanal/mensual)
 * - daytrading: temporalidades bajas (intradía/scalping) — lentes SMC + ICT + Scalping
 */
export type Strategy = "codigo_suizo" | "daytrading";

/**
 * Esquema del análisis "Day Trading / Scalping".
 * Estructura de 3 lentes (SMC, ICT, Scalping) con % cada uno + plan conjunto.
 * Cubre a fondo SMC concepts e ICT.
 */
export const dayTradingSchema = z.object({
  // Contexto
  asset: z.string().describe("Activo detectado, ej. 'XAUUSD','NAS100','BTCUSD'. Si no se distingue: 'No identificado'."),
  timeframe: z
    .string()
    .describe("Temporalidad visible (intradía/scalping), ej. '15m','5m','1H','4H'. Si no se distingue: 'No identificada'."),
  session: z
    .enum(["asiatica", "londres", "nueva_york", "mixta", "no_clara"])
    .describe("Sesión de trading inferida del gráfico o la hora."),

  bias: z.enum(["alcista", "bajista", "rango", "indefinido"]),

  // Base estructural (común a SMC/ICT)
  structure: z.object({
    type: z
      .enum([
        "bos_alcista",
        "bos_bajista",
        "choch_alcista",
        "choch_bajista",
        "rango",
        "sin_estructura",
      ])
      .describe("Tipo de estructura de mercado visible: BOS/CHoCH/MSS, rango o nada claro."),
    note: z.string().describe("Explica brevemente el estado de la estructura."),
  }),

  // Dealing range / premium-discount
  dealingRange: z.object({
    high: z.string().describe("Techo del dealing range actual."),
    low: z.string().describe("Suelo del dealing range actual."),
    equilibrium: z.string().describe("50% / equilibrio del rango."),
    currentZone: z
      .enum(["premium", "descuento", "equilibrio"])
      .describe("Dónde está el precio respecto al dealing range."),
  }),

  // LENTE 1 — SMC concepts
  smc: z.object({
    score: z.number().min(0).max(100).describe("Calidad del setup desde la lente SMC concepts (0-100)."),
    orderBlocks: z.object({
      found: z.boolean(),
      type: z
        .enum(["bullish", "bearish", "breaker", "mitigation_block"])
        .describe("Tipo de order block más relevante."),
      location: z.string().describe("Nivel/ubicación del order block."),
      note: z.string(),
    }),
    liquidity: z.object({
      buyside: z.string().describe("Zona de liquidez buyside (stops por encima / máximos relevantes)."),
      sellside: z.string().describe("Zona de liquidez sellside (stops por debajo / mínimos relevantes)."),
      sweep: z.boolean().describe("¿Hubo barrido/cacería de liquidez (liquidity sweep / grab)?"),
      sweepNote: z.string(),
    }),
    imbalance: z.object({
      found: z.boolean(),
      zone: z.string().describe("Zona del fair value gap / imbalance."),
      note: z.string(),
    }),
    note: z.string().describe("Resumen SMC en una frase corta."),
  }),

  // LENTE 2 — ICT
  ict: z.object({
    score: z.number().min(0).max(100).describe("Calidad del setup desde la lente ICT (0-100)."),
    fvg: z.object({
      found: z.boolean(),
      variant: z
        .enum(["breakaway", "displacement_runaway", "exhaustion"])
        .describe("Variante del fair value gap."),
      zone: z.string(),
      note: z.string(),
    }),
    liquidityGrab: z.object({
      found: z.boolean().describe("¿Se tomó liquidez (stop hunt) antes del movimiento direccional?"),
      note: z.string(),
    }),
    killzone: z.object({
      relevant: z.boolean().describe("¿El movimiento ocurre dentro de una killzone ICT relevante?"),
      which: z.string().describe("Killzone: 'Asiática', 'Londres', 'Nueva York' o 'N/A'."),
      note: z.string(),
    }),
    note: z.string().describe("Resumen ICT en una frase corta."),
  }),

  // LENTE 3 — Scalping / Intradía
  scalping: z.object({
    score: z.number().min(0).max(100).describe("Calidad del setup para scalping/intradía (0-100)."),
    entryTrigger: z
      .string()
      .describe("Disparador de entrada en TF menor (1m/5m), ej. 'cierre de vela de rechazo sobre el OB'."),
    momentum: z.string().describe("Condición de momento/precio que confirma la entrada."),
    note: z.string().describe("Resumen scalping en una frase corta."),
  }),

  // Síntesis
  confluenceNote: z.string().describe("Dónde coinciden los 3 lentes (SMC/ICT/scalping). Si no coinciden, dilo."),
  setupScore: z.number().min(0).max(100).describe("Score global blended del setup (0-100)."),
  action: z.enum(["buscar_entrada", "poner_alerta", "esperar", "evitar"]),
  actionExplanation: z.string(),

  // Plan conjunto
  tradePlan: z.object({
    direction: z.enum(["compra", "venta", "ninguna"]),
    entryZone: z.string(),
    stopLoss: z.string(),
    takeProfit: z.string(),
    riskReward: z.string().describe("Ratio estimado, ej. '1:3'. En scalping se busca ~1:2 a 1:5."),
  }),

  // Análisis fundamental / macro
  fundamental: z.object({
    macroBias: z.enum(["alcista", "bajista", "neutro", "mixto"]).describe("Sesgo macro/fundamental del activo."),
    drivers: z.array(z.string()).describe("2-4 drivers macro clave que mueven este activo (tasas, DXY, datos económicos, geopolítica)."),
    contextNote: z.string().describe("Cómo encaja el contexto macro (dado por el usuario o el general) con el sesgo técnico y los lentes."),
    events: z.array(z.string()).describe("Eventos/datos de alto impacto a vigilar (NFP, CPI, decisión de banco central, etc.)."),
    note: z.string().describe("Resumen fundamental en una frase corta."),
  }),

  sessionTip: z.string().describe("Recordatorio de sesión/killzone para operar."),
  newsReminder: z.string().describe("Recordatorio de revisar noticias de alto impacto antes de operar."),

  verdict: z.string().describe("Veredicto en una frase corta y directa."),
  confidence: z.enum(["alta", "media", "baja"]),
});

export type DayTradingAnalysis = z.infer<typeof dayTradingSchema>;
