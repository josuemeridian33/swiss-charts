import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const LICENSE_USES = parseInt(process.env.LICENSE_USES ?? "50", 10);

function generateCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos
  const chunk = (arr: Uint8Array) =>
    Array.from(arr, (b) => alphabet[b % alphabet.length]).join("");
  return `SC-${chunk(bytes.slice(0, 3))}-${chunk(bytes.slice(3, 6))}`;
}

/** Webhook (Postback 2.0) de Hotmart. Crea una licencia al aprobarse la compra. */
export async function POST(req: NextRequest) {
  // Validación del token de Hotmart
  const hottok =
    req.headers.get("x-hotmart-hottok") ?? req.nextUrl.searchParams.get("hottok");
  if (process.env.HOTMART_HOTTOK && hottok !== process.env.HOTMART_HOTTOK) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ error: "DB no configurada." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const event: string = body?.event ?? "";
  const status: string = (body?.data?.purchase?.status ?? "").toUpperCase();
  const email: string | undefined = body?.data?.buyer?.email?.toLowerCase();
  const transaction: string | undefined = body?.data?.purchase?.transaction;

  const approved =
    status.includes("APPROVED") ||
    status.includes("COMPLETE") ||
    event.toUpperCase().includes("APPROVED");

  if (!approved) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  if (!email) {
    return NextResponse.json({ error: "Sin email de comprador." }, { status: 400 });
  }

  // Idempotencia por transacción
  if (transaction) {
    const { data: existing } = await sb
      .from("sc_licenses")
      .select("code")
      .eq("transaction", transaction)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: true, code: existing.code, duplicate: true });
    }
  }

  const code = generateCode();
  const { error } = await sb.from("sc_licenses").insert({
    code,
    email,
    max_uses: LICENSE_USES,
    used: 0,
    source: "hotmart",
    transaction: transaction ?? null,
  });

  if (error) {
    console.error("[hotmart] insert", error);
    return NextResponse.json({ error: "No se pudo crear la licencia." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, code });
}
