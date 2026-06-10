import { NextResponse } from 'next/server';
import { readState, mutateState } from '@/lib/store';
import { getPersonality } from '@/utils/personality';
import { complete } from '@/lib/deepseek';

// A minted agent emits a new "thought" at most once per TTL while someone
// is watching (clients poll this endpoint). No cron needed: the agent is
// alive exactly when it has an audience.
const THOUGHT_TTL_MS = 25_000;
const FEED_LIMIT = 50;

const inFlight = new Set();

export async function GET(request) {
  const id = Number(new URL(request.url).searchParams.get('id'));
  const state = readState();
  return NextResponse.json({ thoughts: state.thoughts?.[id] || [] });
}

export async function POST(request) {
  const { id } = await request.json();
  const tokenId = Number(id);

  if (!Number.isInteger(tokenId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const state = readState();

  if (!state.mints[tokenId]) {
    return NextResponse.json({ error: 'agent is not minted yet' }, { status: 403 });
  }

  const feed = state.thoughts?.[tokenId] || [];
  const last = feed[feed.length - 1];
  const fresh = last && Date.now() - new Date(last.at).getTime() < THOUGHT_TTL_MS;

  if (fresh || inFlight.has(tokenId)) {
    return NextResponse.json({ thoughts: feed });
  }

  inFlight.add(tokenId);
  try {
    const personality = getPersonality(tokenId);
    const recent = feed.slice(-3).map((t) => t.text).join('\n---\n');

    const messages = [
      { role: 'system', content: personality.systemPrompt },
      {
        role: 'user',
        content:
          'No one asked you anything. You are simply alive on the grid, thinking out loud. ' +
          'Emit your next public thought as an ASCII drawing with a few words. ' +
          (recent
            ? `Do not repeat your recent thoughts:\n${recent}`
            : 'This is your very first thought after being minted — waking up.'),
      },
    ];

    const reply = await complete(messages, { agentId: tokenId, nonce: feed.length + 1 });
    const thought = { text: reply.text, mock: reply.mock, at: new Date().toISOString() };

    const thoughts = mutateState((s) => {
      s.thoughts = s.thoughts || {};
      s.thoughts[tokenId] = [...(s.thoughts[tokenId] || []), thought].slice(-FEED_LIMIT);
      return s.thoughts[tokenId];
    });

    return NextResponse.json({ thoughts });
  } catch (err) {
    console.error('think failed:', err);
    return NextResponse.json({ thoughts: feed, error: 'thought interrupted' }, { status: 502 });
  } finally {
    inFlight.delete(tokenId);
  }
}
