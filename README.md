# 🇨🇭 Swiss Charts

Analizador de gráficos con IA basado en la metodología **El Código Suizo**.
El usuario sube una captura de su chart → Claude Vision devuelve estructura,
order block de origen, 50% de la vela de rompimiento, Fib 78.6%, imbalance,
zona de confluencia y plan de entrada.

- **Framework:** Next.js 16 + React 19 + Tailwind v4
- **IA:** Claude Sonnet 5 (visión) vía Vercel AI SDK (`generateObject`)
- **Licencias/pagos:** Supabase + Hotmart (pago único $11.99 = 30 análisis)
- **Costo:** ~$0.02 por análisis, sin costos fijos mensuales

## Puesta en marcha (local)

1. Copia `.env.example` a `.env.local` y pon al menos `ANTHROPIC_API_KEY`.
2. `npm install`
3. `npm run dev` → http://localhost:3006

Sin Supabase configurado, la app funciona en **modo demo** (2 análisis gratis
por navegador). El sistema de licencias se activa al poner las variables de Supabase.

## Activar pagos (Hotmart + Supabase)

1. **Supabase:** crea un proyecto y ejecuta `docs/supabase.sql` en el SQL Editor.
   Copia `SUPABASE_URL` y la `service_role key` al `.env.local`.
2. **Hotmart:** crea el producto de $11.99. En *Herramientas → Webhook (Postback)*
   apunta a `https://TU-DOMINIO/api/hotmart` y copia el `HOTTOK` a `HOTMART_HOTTOK`.
3. Pon la URL de checkout en `NEXT_PUBLIC_HOTMART_URL`.
4. Al comprar, Hotmart llama al webhook → se crea una licencia de 30 usos.
   El comprador la activa con su **código** o el **email de compra** en el muro de pago.

## Flujo de acceso

- `GET /` → landing + analizador
- `POST /api/analyze` → valida usos (licencia o gratis) y analiza la imagen
- `POST /api/redeem` → activa una licencia por código o email (setea cookie)
- `POST /api/hotmart` → webhook que crea licencias al comprar

## Dónde editar la estrategia

Todo el conocimiento de trading vive en **`lib/prompt.ts`**. Editar ese texto
cambia cómo analiza la IA. El formato de salida se define en `lib/schema.ts`.

## Deploy

`vercel` (o conecta el repo). Pon las mismas variables de entorno en el dashboard
de Vercel. Las rutas ya usan Node.js runtime.

---
Herramienta educativa de análisis técnico. No es asesoría financiera.
