import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";

const BodySchema = z.object({
  session_id: z.string().min(8).max(128),
  path: z.string().min(1).max(512),
  referrer: z.string().max(1024).optional().nullable(),
  duration_seconds: z.number().int().min(0).max(86400).optional().default(0),
});

// --- User-Agent parsing (lightweight, no external deps) ---
function parseUserAgent(ua: string) {
  const u = ua || "";

  let device_type = "desktop";
  if (/Mobi|Android|iPhone|iPod/i.test(u) && !/iPad|Tablet/i.test(u)) {
    device_type = "mobile";
  } else if (/iPad|Tablet/i.test(u)) {
    device_type = "tablet";
  }

  let os = "Desconhecido";
  if (/Windows NT/i.test(u)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(u)) os = "macOS";
  else if (/Android/i.test(u)) os = "Android";
  else if (/(iPhone|iPad|iPod)/i.test(u)) os = "iOS";
  else if (/Linux/i.test(u)) os = "Linux";

  let browser = "Desconhecido";
  if (/Edg\//i.test(u)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(u)) browser = "Opera";
  else if (/Chrome\//i.test(u) && !/Chromium/i.test(u)) browser = "Chrome";
  else if (/Firefox\//i.test(u)) browser = "Firefox";
  else if (/Safari\//i.test(u) && !/Chrome/i.test(u)) browser = "Safari";

  return { device_type, os, browser };
}

// --- Geo lookup from IP (server-side only; IP is never stored) ---
async function lookupGeo(ip: string | null) {
  const empty = { country: null, region: null, city: null };
  if (!ip || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return empty;
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`,
    );
    if (!res.ok) return empty;
    const data = await res.json();
    if (data?.status !== "success") return empty;
    return {
      country: data.country ?? null,
      region: data.regionName ?? null,
      city: data.city ?? null,
    };
  } catch (_e) {
    return empty;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);

    if (!parsed.success) {
      // Evento inválido = erro esperado, responde 200 com success:false
      return new Response(
        JSON.stringify({ success: false, error: "INVALID_INPUT" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { session_id, path, referrer, duration_seconds } = parsed.data;

    const userAgent = req.headers.get("user-agent") ?? "";
    const { device_type, os, browser } = parseUserAgent(userAgent);

    // Extrai o primeiro IP da cadeia x-forwarded-for (usado só para geo, não armazenado)
    const fwd = req.headers.get("x-forwarded-for") ?? "";
    const ip = fwd.split(",")[0]?.trim() || null;
    const geo = await lookupGeo(ip);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("page_views").insert({
      session_id,
      path,
      referrer: referrer ?? null,
      duration_seconds,
      device_type,
      os,
      browser,
      country: geo.country,
      region: geo.region,
      city: geo.city,
    });

    if (error) {
      console.error("Erro ao inserir page_view:", error.message);
      return new Response(
        JSON.stringify({ success: false, error: "DB_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("Falha inesperada em track-visit:", e);
    return new Response(
      JSON.stringify({ success: false, error: "SERVER_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
