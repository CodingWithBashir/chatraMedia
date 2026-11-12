import { serverSupabaseConfigured } from '@/lib/server-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ service: 'chatra-api', status: 'ok', supabaseConfigured: serverSupabaseConfigured });
}
