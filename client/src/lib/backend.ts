export type CreatePostRequest = {
  id: string;
  content: string;
  image_url: string | null;
  tags: string[];
  community_id: string | null;
  poll_options: string[] | null;
  poll_votes: number[] | null;
  poll_duration: string | null;
  poll_multiple: boolean;
};

export async function createPostOnServer(input: CreatePostRequest, accessToken: string) {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });
  const result = (await response.json().catch(() => ({}))) as {
    post?: { id: string };
    error?: string;
  };
  if (!response.ok || !result.post) {
    throw new Error(result.error ?? 'The Chatra server could not save this post.');
  }
  return result.post;
}
