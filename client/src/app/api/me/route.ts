import { createServerSupabaseClient, readBearerToken, upstreamErrorResponse } from '@/lib/server-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const token = readBearerToken(request);
  if (!token) return Response.json({ error: 'Sign in to continue.' }, { status: 401 });
  const client = createServerSupabaseClient(token);
  if (!client) return Response.json({ error: 'Supabase is not configured.' }, { status: 503 });
  try {
    const { data: authData, error: authError } = await client.auth.getUser(token);
    if (authError || !authData.user) return Response.json({ error: 'Your session is invalid or has expired.' }, { status: 401 });
    const { data: profile, error } = await client
      .from('profiles')
      .select('id,username,display_name,avatar_url,role')
      .eq('id', authData.user.id)
      .maybeSingle();
    if (error) throw error;
    return Response.json({ user: authData.user, profile });
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
