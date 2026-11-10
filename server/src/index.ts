import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createSupabaseClient, supabaseConfigured } from './supabase.js';

const here = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(here, '../../.env.local') });
dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4001);
const allowedOrigin = process.env.CHATRA_CLIENT_ORIGIN ?? 'http://localhost:3000';

app.disable('x-powered-by');
app.use(cors({ origin: [allowedOrigin, 'http://127.0.0.1:3000'] }));
app.use(express.json({ limit: '1mb' }));

function bearerToken(request: Request): string | null {
  const header = request.header('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

async function requireUser(request: Request, response: Response) {
  const token = bearerToken(request);
  if (!token) {
    response.status(401).json({ error: 'Sign in to continue.' });
    return null;
  }
  const client = createSupabaseClient(token);
  if (!client) {
    response.status(503).json({ error: 'Supabase is not configured on the server.' });
    return null;
  }
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    response.status(401).json({ error: 'Your session is invalid or has expired.' });
    return null;
  }
  return { client, user: data.user };
}

app.get('/api/health', (_request, response) => {
  response.json({ service: 'chatra-api', status: 'ok', supabaseConfigured: supabaseConfigured() });
});

app.get('/api/me', async (request, response, next) => {
  try {
    const auth = await requireUser(request, response);
    if (!auth) return;
    const { data, error } = await auth.client
      .from('profiles')
      .select('id,username,display_name,avatar_url,role')
      .eq('id', auth.user.id)
      .maybeSingle();
    if (error) throw error;
    response.json({ user: auth.user, profile: data });
  } catch (error) {
    next(error);
  }
});

app.get('/api/posts', async (_request, response, next) => {
  try {
    const client = createSupabaseClient();
    if (!client) {
      response.status(503).json({ error: 'Supabase is not configured on the server.' });
      return;
    }
    const { data, error } = await client
      .from('posts')
      .select('id,user_id,content,image_url,tags,created_at')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    response.json({ posts: data ?? [] });
  } catch (error) {
    next(error);
  }
});

app.post('/api/posts', async (request, response, next) => {
  try {
    const auth = await requireUser(request, response);
    if (!auth) return;

    const body = request.body as {
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
      response.status(400).json({ error: 'A post needs text, an image, or a poll.' });
      return;
    }
    if (content.length > 500) {
      response.status(400).json({ error: 'Post text must be 500 characters or fewer.' });
      return;
    }
    if (typeof body.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id)) {
      response.status(400).json({ error: 'A valid post ID is required.' });
      return;
    }
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 10)
      : [];

    const { data, error } = await auth.client
      .from('posts')
      .insert({
        id: body.id,
        user_id: auth.user.id,
        content,
        image_url: typeof body.image_url === 'string' ? body.image_url : null,
        tags,
        community_id: typeof body.community_id === 'string' ? body.community_id : null,
        poll_options: Array.isArray(body.poll_options) ? body.poll_options : null,
        poll_votes: Array.isArray(body.poll_votes) ? body.poll_votes : null,
        poll_duration: typeof body.poll_duration === 'string' ? body.poll_duration : null,
        poll_multiple: body.poll_multiple === true,
      })
      .select('id,user_id,content,image_url,tags,created_at')
      .single();
    if (error) throw error;
    response.status(201).json({ post: data });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  console.error('Chatra API error:', error);
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : 'Unexpected server error.';
  const upstreamUnavailable = rawMessage.includes('fetch failed');
  const message = upstreamUnavailable
    ? 'Supabase could not be reached from the API server. Check server network access and configuration.'
    : rawMessage;
  response.status(upstreamUnavailable ? 502 : 500).json({ error: message });
});

app.listen(port, '0.0.0.0', () => {
  console.info(`Chatra API listening on 0.0.0.0:${port}`);
});
