import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("Warning: NEXT_PUBLIC_SUPABASE_URL is undefined at runtime. Supabase Storage functionality may fail.");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined at runtime. Supabase Storage functionality may fail.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Resolves a given file path or full URL from the Supabase bucket 'portfolio-assets'
 * to a fresh public URL. Logs the queried bucket and path to the console.
 */
export function getSupabaseUrl(pathOrUrl: string | undefined | null): string {
  if (!pathOrUrl) return "";

  const bucketName = 'portfolio-assets';

  try {
    // If it's a full URL, extract the path if it belongs to our bucket
    if (pathOrUrl.startsWith("http")) {
      const bucketMarker = `/${bucketName}/`;
      if (pathOrUrl.includes(bucketMarker)) {
        const parts = pathOrUrl.split(bucketMarker);
        if (parts.length === 2) {
          const filePath = decodeURIComponent(parts[1].split('?')[0]);
          console.log(`[Supabase Storage Query] Bucket: "${bucketName}", Folder/Path: "${filePath}"`);
          const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
          if (!data || !data.publicUrl) {
            console.error(`[Supabase Error] Failed to generate public URL for: ${filePath}`);
            return pathOrUrl;
          }
          return data.publicUrl;
        }
      }
      // If it doesn't belong to our bucket but is a URL, return it as is
      return pathOrUrl;
    }

    // Otherwise, treat it as a direct relative file path in the bucket
    console.log(`[Supabase Storage Query] Bucket: "${bucketName}", Folder/Path: "${pathOrUrl}"`);
    const { data } = supabase.storage.from(bucketName).getPublicUrl(pathOrUrl);
    if (!data || !data.publicUrl) {
      console.error(`[Supabase Error] Failed to generate public URL for: ${pathOrUrl}`);
      return "";
    }
    return data.publicUrl;
  } catch (error) {
    console.error(`[Supabase Exception] Error resolving public URL for "${pathOrUrl}":`, error);
    return pathOrUrl.startsWith("http") ? pathOrUrl : "";
  }
}
