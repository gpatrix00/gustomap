import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const urlCache = new Map<string, { url: string; expiresAt: number }>();

async function resolveUrl(path: string): Promise<string> {
  if (!path || path.startsWith("http")) return path;

  const cached = urlCache.get(path);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const { data, error } = await supabase.storage
    .from("review-images")
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) return path;

  urlCache.set(path, { url: data.signedUrl, expiresAt: Date.now() + 3500000 });
  return data.signedUrl;
}

export function useSignedUrls(paths: string[]): string[] {
  const [urls, setUrls] = useState<string[]>(paths);

  useEffect(() => {
    let cancelled = false;
    if (paths.length === 0) { setUrls([]); return; }

    Promise.all(paths.map(resolveUrl)).then((resolved) => {
      if (!cancelled) setUrls(resolved);
    });

    return () => { cancelled = true; };
  }, [paths.join(",")]);

  return urls;
}
