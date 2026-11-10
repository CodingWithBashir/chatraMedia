'use client';

import dynamic from 'next/dynamic';

const ChatraRuntime = dynamic(() => import('./ChatraRuntime'), {
  ssr: false,
  loading: () => (
    <main className="fixed inset-0 z-[100] flex items-center justify-center gap-3 bg-chatra-ink text-sm text-white" role="status">
      <span className="grid size-10 place-items-center rounded-xl bg-chatra-teal font-display text-xl font-bold text-slate-950">C</span>
      <span>Opening Chatra…</span>
    </main>
  ),
});

export default function ChatraMount() {
  return <ChatraRuntime />;
}
