import { getSupabaseAdmin } from "./supabase";

export const FREE_LIMIT = 2;
export const FREE_COOKIE = "sc_free";
export const LICENSE_COOKIE = "sc_lic";
export const ADMIN_COOKIE = "sc_admin";

/** ¿La petición viene de un administrador (cookie sc_admin == ADMIN_TOKEN)? */
export function isAdmin(req: {
  cookies: { get(name: string): { value: string } | undefined };
}): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const c = req.cookies.get(ADMIN_COOKIE)?.value;
  return !!c && c === token;
}

export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

/** Estado de una licencia sin consumir usos. */
export async function licenseStatus(code: string) {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data } = await sb
    .from("sc_licenses")
    .select("code,max_uses,used,email")
    .eq("code", normalizeCode(code))
    .maybeSingle();
  if (!data) return null;
  return {
    code: data.code as string,
    remaining: (data.max_uses as number) - (data.used as number),
    max: data.max_uses as number,
  };
}

/** Busca una licencia por email de compra (para redimir sin código). */
export async function licenseByEmail(email: string) {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data } = await sb
    .from("sc_licenses")
    .select("code,max_uses,used")
    .eq("email", email.trim().toLowerCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    code: data.code as string,
    remaining: (data.max_uses as number) - (data.used as number),
    max: data.max_uses as number,
  };
}

/**
 * Consume 1 uso de forma atómica (RPC consume_license).
 * Devuelve usos restantes, o -1 (inexistente) / -2 (agotada).
 */
export async function consumeLicense(code: string): Promise<number> {
  const sb = getSupabaseAdmin();
  if (!sb) return -1;
  const { data, error } = await sb.rpc("sc_consume_license", {
    p_code: normalizeCode(code),
  });
  if (error || typeof data !== "number") return -1;
  return data;
}
