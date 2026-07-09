import { NextRequest, NextResponse } from "next/server";
import { streamObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { analysisSchema, dayTradingSchema, type Strategy } from "@/lib/schema";
import { getStrategySystem, USER_INSTRUCTION } from "@/lib/prompt";
import {
  FREE_LIMIT,
  FREE_COOKIE,
  LICENSE_COOKIE,
  licenseStatus,
  consumeLicense,
  isAdmin,
} from "@/lib/usage";

export const runtime = "nodejs";
// Dos análisis de visión en paralelo + streaming: margen amplio.
export const maxDuration = 120;

const MAX_CHARS = 7_000_000; // ~5MB de imagen en base64

type Hints = { asset?: string; bias?: string; macro?: string };

/** Inicia un análisis individual en streaming (Código Suizo o Day Trading). */
function runStream(image: string, strategy: Strategy, hints: Hints) {
  const mediaType = image.slice(5, image.indexOf(";")) || "image/jpeg";
  return streamObject({
    model: anthropic("claude-sonnet-5"),
    schema: strategy === "daytrading" ? dayTradingSchema : analysisSchema,
    maxOutputTokens: 8000,
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
}

/**
 * Análisis DUAL en STREAMING: macro (Código Suizo) + micro (Day Trading) en
 * paralelo, emitidos como Server-Sent Events a medida que se generan.
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
    const macroContext: string | undefined = body?.macroContext;

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
    const admin = isAdmin(req);
    const licenseCode = req.cookies.get(LICENSE_COOKIE)?.value;
    const freeUsed =
      parseInt(req.cookies.get(FREE_COOKIE)?.value ?? "0", 10) || 0;

    let mode: "free" | "license" | "admin" = "free";
    let hasUses = false;

    if (admin) {
      mode = "admin";
      hasUses = true;
    } else if (licenseCode) {
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
            : "Usaste tus análisis gratis. Desbloquea 30 análisis para continuar.",
          code: "limit",
        },
        { status: 402 }
      );
    }

    // ---------- Consumo (antes de emitir el stream) ----------
    let remaining: number | null = null;
    let cookieHeader: string | null = null;

    if (mode === "admin") {
      remaining = null;
    } else if (mode === "license" && licenseCode) {
      remaining = await consumeLicense(licenseCode);
      if (remaining < 0) remaining = 0;
    } else {
      const newFree = freeUsed + 1;
      remaining = Math.max(0, FREE_LIMIT - newFree);
      cookieHeader = `${FREE_COOKIE}=${newFree}; Path=/; Max-Age=${60 * 60 * 24 * 365}; HttpOnly; SameSite=Lax`;
    }

    // ---------- Streaming de ambos análisis ----------
    const hints: Hints = { asset, bias, macro: macroContext };
    const macroStream = runStream(macro, "codigo_suizo", hints);
    const microStream = runStream(micro, "daytrading", hints);

    const enc = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const emit = (o: unknown) => {
          try {
            controller.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
          } catch {
            /* controlador cerrado */
          }
        };
        emit({ type: "meta", remaining, mode });

        const run = async (
          s: ReturnType<typeof runStream>,
          tag: "suizo" | "daytrading"
        ) => {
          let last: unknown = null;
          try {
            for await (const part of s.partialObjectStream) {
              last = part;
              emit({ type: tag, data: part });
            }
            emit({ type: `${tag}-done`, data: last });
          } catch {
            emit({ type: "error", tag });
          }
        };

        await Promise.all([
          run(macroStream, "suizo"),
          run(microStream, "daytrading"),
        ]);
        emit({ type: "done" });
        controller.close();
      },
    });

    const headers: Record<string, string> = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    };
    if (cookieHeader) headers["Set-Cookie"] = cookieHeader;

    return new Response(stream, { headers });
  } catch (err) {
    console.error("[analyze-both]", err);
    return NextResponse.json(
      { error: "No se pudo analizar. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
