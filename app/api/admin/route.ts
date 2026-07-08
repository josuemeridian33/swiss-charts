import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/usage";

export const runtime = "nodejs";

/**
 * Link de administrador: /api/admin?token=<ADMIN_TOKEN>
 * Si el token es correcto, setea una cookie httpOnly (1 año) que da acceso
 * ilimitado (bypass de usos y pago). Luego redirige a /.
 */
export async function GET(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  const provided = req.nextUrl.searchParams.get("token");
  if (!token || !provided || provided !== token) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
