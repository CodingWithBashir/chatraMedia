import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const serverSupabaseConfigured = Boolean(url && publishableKey);

export function createServerSupabaseClient(accessToken?: string) {
  if (!url || !publishableKey) return null;
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
  });
}

export function readBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  return authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim() || null
    : null;
}

export function upstreamErrorResponse(error: unknown) {
  console.error('Chatra Supabase route error:', error);
  const message = error instanceof Error ? error.message : String(error);
  const unreachable = message.includes('fetch failed');
  return Response.json(
    {
      error: unreachable
        ? 'Supabase could not be reached. Check the deployment network and project configuration.'
        : message || 'Unexpected server error.',
    },
    { status: unreachable ? 502 : 500 },
  );
}
