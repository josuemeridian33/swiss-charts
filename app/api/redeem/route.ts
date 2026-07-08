import { NextRequest, NextResponse } from "next/server";
import { LICENSE_COOKIE, licenseStatus, licenseByEmail } from "@/lib/usage";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!getSupabaseAdmin()) {
    return NextResponse.json(
      { error: "El sistema de licencias aún no está configurado." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const code: string | undefined = body?.code;
  const email: string | undefined = body?.email;

  let found = null;
  if (code && code.trim()) {
    found = await licenseStatus(code);
  } else if (email && email.trim()) {
    found = await licenseByEmail(email);
  } else {
    return NextResponse.json(
      { error: "Ingresa tu código de licencia o el email de tu compra." },
      { status: 400 }
    );
  }

  if (!found) {
    return NextResponse.json(
      { error: "No encontramos ninguna licencia. Revisa el dato e intenta de nuevo." },
      { status: 404 }
    );
  }
  if (found.remaining <= 0) {
    return NextResponse.json(
      { error: "Esa licencia ya no tiene análisis disponibles." },
      { status: 402 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    remaining: found.remaining,
    max: found.max,
  });
  response.cookies.set(LICENSE_COOKIE, found.code, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
