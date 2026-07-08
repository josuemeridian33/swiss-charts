import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { analysisSchema, dayTradingSchema, type Strategy } from "@/lib/schema";
import { getStrategySystem, USER_INSTRUCTION } from "@/lib/prompt";
import {
  FREE_LIMIT,
  FREE_COOKIE,
  LICENSE_COOKIE,
  licenseStatus,
  consumeLicense,
} from "@/lib/usage";

export const runtime = "nodejs";
// Dos análisis de visión en paralelo: damos margen para que no corte Vercel.
export const maxDuration = 120;

const MAX_CHARS = 7_000_000; // ~5MB de imagen en base64

type Hints = { asset?: string; bias?: string };

/** Ejecuta un análisis individual (Código Suizo o Day Trading). */
async function runAnalysis(
  image: string,
  strategy: Strategy,
  hints: Hints
) {
  const mediaType = image.slice(5, image.indexOf(";")) || "image/jpeg";
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-5"),
    schema: strategy === "daytrading" ? dayTradingSchema : analysisSchema,
    maxOutputTokens: 4000,
    system: getStrategySystem(strategy),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: USER_INSTRUCTION(hints, strategy) },
          { type: "file", data: image, mediaType },
        ],
      },
    ],
  });
  return object;
}

/**
 * Análisis DUAL: macro (Código Suizo) + micro (Day Trading) en paralelo.
 * Cuenta como 1 solo uso.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "El servidor no tiene configurada la API de Claude." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const macro: unknown = body?.macro;
    const micro: unknown = body?.micro;
    const asset: string | undefined = body?.asset;
    const bias: string | undefined = body?.bias;

    if (typeof macro !== "string" || !macro.startsWith("data:image")) {
      return NextResponse.json(
        { error: "Falta la captura MACRO del gráfico." },
        { status: 400 }
      );
    }
    if (typeof micro !== "string" || !micro.startsWith("data:image")) {
      return NextResponse.json(
        { error: "Falta la captura MICRO del gráfico." },
        { status: 400 }
      );
    }
    if (macro.length > MAX_CHARS || micro.length > MAX_CHARS) {
      return NextResponse.json(
        { error: "Una imagen es demasiado grande. Reduce la resolución." },
        { status: 413 }
      );
    }

    // ---------- Control de acceso ----------
    const licenseCode = req.cookies.get(LICENSE_COOKIE)?.value;
    const freeUsed =
      parseInt(req.cookies.get(FREE_COOKIE)?.value ?? "0", 10) || 0;

    let mode: "free" | "license" = "free";
    let hasUses = false;

    if (licenseCode) {
      const status = await licenseStatus(licenseCode);
      if (status && status.remaining > 0) {
        mode = "license";
        hasUses = true;
      }
    }

    if (!hasUses && freeUsed >= FREE_LIMIT) {
      return NextResponse.json(
        {
          error: licenseCode
            ? "Tu licencia se agotó. Compra un paquete nuevo para seguir."
            : "Usaste tus análisis gratis. Desbloquea 50 análisis para continuar.",
          code: "limit",
        },
        { status: 402 }
      );
    }

    // ---------- Ambos análisis en paralelo ----------
    const hints: Hints = { asset, bias };
    const [suizo, daytrading] = await Promise.all([
      runAnalysis(macro, "codigo_suizo", hints),
      runAnalysis(micro, "daytrading", hints),
    ]);

    // ---------- Descontar 1 uso (el dual cuenta como 1) ----------
    let remaining: number;
    let newFree: number | null = null;

    if (mode === "license" && licenseCode) {
      remaining = await consumeLicense(licenseCode);
      if (remaining < 0) remaining = 0;
    } else {
      newFree = freeUsed + 1;
      remaining = Math.max(0, FREE_LIMIT - newFree);
    }

    const response = NextResponse.json({ suizo, daytrading, mode, remaining });
    if (newFree !== null) {
      response.cookies.set(FREE_COOKIE, String(newFree), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  } catch (err) {
    console.error("[analyze-both]", err);
    return NextResponse.json(
      { error: "No se pudo analizar. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
