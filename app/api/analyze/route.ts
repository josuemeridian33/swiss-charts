import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { analysisSchema } from "@/lib/schema";
import { SYSTEM_PROMPT, USER_INSTRUCTION } from "@/lib/prompt";
import {
  FREE_LIMIT,
  FREE_COOKIE,
  LICENSE_COOKIE,
  licenseStatus,
  consumeLicense,
} from "@/lib/usage";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARS = 7_000_000; // ~5MB de imagen en base64

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "El servidor no tiene configurada la API de Claude." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const image: unknown = body?.image;
    const asset: string | undefined = body?.asset;
    const timeframe: string | undefined = body?.timeframe;
    const bias: string | undefined = body?.bias;

    if (typeof image !== "string" || !image.startsWith("data:image")) {
      return NextResponse.json({ error: "Imagen inválida." }, { status: 400 });
    }
    if (image.length > MAX_CHARS) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande. Reduce la resolución." },
        { status: 413 }
      );
    }

    // ---------- Control de acceso ----------
    const licenseCode = req.cookies.get(LICENSE_COOKIE)?.value;
    const freeUsed =
      parseInt(req.cookies.get(FREE_COOKIE)?.value ?? "0", 10) || 0;

    let mode: "free" | "license" = "free";
    let hasLicenseWithUses = false;

    if (licenseCode) {
      const status = await licenseStatus(licenseCode);
      if (status && status.remaining > 0) {
        mode = "license";
        hasLicenseWithUses = true;
      }
    }

    if (!hasLicenseWithUses && freeUsed >= FREE_LIMIT) {
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

    // ---------- Análisis ----------
    const mediaType =
      image.slice(5, image.indexOf(";")) || "image/jpeg";

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-5"),
      schema: analysisSchema,
      maxOutputTokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: USER_INSTRUCTION({ asset, timeframe, bias }) },
            { type: "file", data: image, mediaType },
          ],
        },
      ],
    });

    // ---------- Descontar uso (tras éxito) ----------
    let remaining: number;
    let newFree: number | null = null;

    if (mode === "license" && licenseCode) {
      remaining = await consumeLicense(licenseCode);
      if (remaining < 0) remaining = 0;
    } else {
      newFree = freeUsed + 1;
      remaining = Math.max(0, FREE_LIMIT - newFree);
    }

    const response = NextResponse.json({ analysis: object, mode, remaining });
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
    console.error("[analyze]", err);
    return NextResponse.json(
      { error: "No se pudo analizar la imagen. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
