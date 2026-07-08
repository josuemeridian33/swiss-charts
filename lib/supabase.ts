import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente admin (solo servidor). Devuelve null si aún no configuras Supabase,
 * para que la app funcione en modo demo (2 gratis) sin base de datos.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
