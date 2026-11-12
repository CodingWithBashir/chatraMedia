import { createServerSupabaseClient, readBearerToken, upstreamErrorResponse } from '@/lib/server-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET() {
  const client = createServerSupabaseClient();
  if (!client) return Response.json({ error: 'Supabase is not configured.' }, { status: 503 });
  try {
    const { data, error } = await client
      .from('posts')
      .select('id,user_id,content,image_url,tags,created_at')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return Response.json({ posts: data ?? [] });
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const token = readBearerToken(request);
  if (!token) return Response.json({ error: 'Sign in to continue.' }, { status: 401 });
  const client = createServerSupabaseClient(token);
  if (!client) return Response.json({ error: 'Supabase is not configured.' }, { status: 503 });

  try {
    const { data: authData, error: authError } = await client.auth.getUser(token);
    if (authError || !authData.user) return Response.json({ error: 'Your session is invalid or has expired.' }, { status: 401 });
    const body = (await request.json()) as {
      id?: unknown;
      content?: unknown;
      image_url?: unknown;
      tags?: unknown;
      community_id?: unknown;
      poll_options?: unknown;
      poll_votes?: unknown;
      poll_duration?: unknown;
      poll_multiple?: unknown;
    };
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!content && !body.image_url && !body.poll_options) {
      return Response.json({ error: 'A post needs text, an image, or a poll.' }, { status: 400 });
    }
    if (content.length > 500) return Response.json({ error: 'Post text must be 500 characters or fewer.' }, { status: 400 });
    if (typeof body.id !== 'string' || !uuidPattern.test(body.id)) {
      return Response.json({ error: 'A valid post ID is required.' }, { status: 400 });
    }
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 10)
      : [];
    const communityId = typeof body.community_id === 'string' && uuidPattern.test(body.community_id)
      ? body.community_id
      : null;
    const { data: post, error } = await client
      .from('posts')
      .insert({
        id: body.id,
        user_id: authData.user.id,
        content,
        image_url: typeof body.image_url === 'string' ? body.image_url : null,
        tags,
        community_id: communityId,
        poll_options: Array.isArray(body.poll_options) ? body.poll_options : null,
        poll_votes: Array.isArray(body.poll_votes) ? body.poll_votes : null,
        poll_duration: typeof body.poll_duration === 'string' ? body.poll_duration : null,
        poll_multiple: body.poll_multiple === true,
      })
      .select('id,user_id,content,image_url,tags,created_at')
      .single();
    if (error) throw error;
    return Response.json({ post }, { status: 201 });
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
