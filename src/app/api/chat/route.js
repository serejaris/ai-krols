import { NextResponse } from 'next/server';
import { readState, mutateState } from '@/lib/store';
import { getPersonality } from '@/utils/personality';
import { complete } from '@/lib/deepseek';

const HISTORY_WINDOW = 12; // messages sent to the model per turn

export async function GET(request) {
  const id = Number(new URL(request.url).searchParams.get('id'));
  const state = readState();
  return NextResponse.json({ messages: state.chats[id] || [] });
}

export async function POST(request) {
  const { id, message, visitor } = await request.json();
  const tokenId = Number(id);
  const text = String(message || '').trim().slice(0, 500);

  if (!Number.isInteger(tokenId) || !text) {
    return NextResponse.json({ error: 'id and message are required' }, { status: 400 });
  }

  const personality = getPersonality(tokenId);
  const state = readState();
  const history = state.chats[tokenId] || [];

  const messages = [
    { role: 'system', content: personality.systemPrompt },
    ...history.slice(-HISTORY_WINDOW).map((m) => ({
      role: m.from === 'agent' ? 'assistant' : 'user',
      content: m.text,
    })),
    { role: 'user', content: text },
  ];

  let reply;
  try {
    reply = await complete(messages, { agentId: tokenId, nonce: history.length });
  } catch (err) {
    console.error('chat completion failed:', err);
    return NextResponse.json({ error: 'agent is unreachable' }, { status: 502 });
  }

  const now = new Date().toISOString();
  const visitorMsg = { from: 'visitor', visitor: visitor || 'anon', text, at: now };
  const agentMsg = { from: 'agent', text: reply.text, mock: reply.mock, at: now };

  mutateState((s) => {
    s.chats[tokenId] = [...(s.chats[tokenId] || []), visitorMsg, agentMsg];
  });

  return NextResponse.json({ reply: agentMsg });
}
