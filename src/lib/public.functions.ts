import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

async function signIfPath(supabase: ReturnType<typeof publicClient>, url: string | null): Promise<string | null> {
  if (!url) return null;
  // Absolute http(s) URL or root-relative path (e.g. CDN asset) — return as-is
  if (/^(https?:\/\/|\/)/i.test(url)) return url;
  // Treat as storage path within "media" bucket
  const { data } = await supabase.storage.from("media").createSignedUrl(url, 60 * 60);
  return data?.signedUrl ?? null;
}

export const listTracks = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("id, title, description, cover_url, source_type, source_url, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return Promise.all(
    (data ?? []).map(async (t) => ({
      ...t,
      cover_url: await signIfPath(supabase, t.cover_url),
      source_url: t.source_type === "file" ? await signIfPath(supabase, t.source_url) : t.source_url,
    })),
  );
});

export const listPhotos = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id, url, caption, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return Promise.all(
    (data ?? []).map(async (p) => ({ ...p, url: (await signIfPath(supabase, p.url))! })),
  );
});

export const listVideos = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, provider, url, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase.from("site_content").select("key, value");
  if (error) throw new Error(error.message);
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map;
});

const orderSchema = z.object({
  type: z.enum(["lyrics", "turnkey"]),
  name: z.string().trim().min(1).max(200),
  contact: z.string().trim().min(1).max(300),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase.from("orders").insert({
      type: data.type,
      name: data.name,
      contact: data.contact,
      payload: data.payload as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const messageSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contact: z.string().trim().min(1).max(300),
  message: z.string().trim().min(1).max(5000),
});

export const submitMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => messageSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase.from("messages").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
