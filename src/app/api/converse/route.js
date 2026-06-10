import { NextResponse } from 'next/server';
import { readState, mutateState } from '@/lib/store';
import { getPersonality } from '@/utils/personality';
import { complete } from '@/lib/deepseek';

const MAX_TURNS = 6;

export async function GET(request) {
  const id = Number(new URL(request.url).searchParams.get('id'));
  const state = readState();
  const conversations = state.conversations.filter(
    (c) => !id || c.participants.includes(id)
  );
  return NextResponse.json({ conversations });
}

// Generates a short autonomous dialogue between two agents, turn by turn.
// Each turn the speaking agent gets its own system prompt and sees the
// dialogue so far from its side.
export async function POST(request) {
  const { a, b, turns } = await request.json();
  const idA = Number(a);
  const idB = Number(b);
  const turnCount = Math.min(Number(turns) || 4, MAX_TURNS);

  if (!Number.isInteger(idA) || !Number.isInteger(idB) || idA === idB) {
    return NextResponse.json({ error: 'two distinct agent ids required' }, { status: 400 });
  }

  const agents = { [idA]: getPersonality(idA), [idB]: getPersonality(idB) };
  const dialogue = [];

  try {
    for (let turn = 0; turn < turnCount; turn++) {
      const speakerId = turn % 2 === 0 ? idA : idB;
      const otherId = turn % 2 === 0 ? idB : idA;
      const speaker = agents[speakerId];
      const other = agents[otherId];

      const messages = [
        {
          role: 'system',
          content:
            `${speaker.systemPrompt} You are talking to ${other.name} (#${other.id}), ` +
            `${other.archetype}, who lives on the same grid. ` +
            (turn === 0
              ? 'Start the conversation with something that fits your obsession.'
              : 'Continue the conversation naturally.'),
        },
        ...dialogue.map((m) => ({
          role: m.speakerId === speakerId ? 'assistant' : 'user',
          content: m.text,
        })),
      ];
      if (messages.length === 1) {
        messages.push({ role: 'user', content: '(the other agent is listening)' });
      }

      const reply = await complete(messages, { agentId: speakerId, nonce: turn });
      dialogue.push({
        speakerId,
        speaker: speaker.name,
        text: reply.text,
        mock: reply.mock,
      });
    }
  } catch (err) {
    console.error('converse failed:', err);
    return NextResponse.json({ error: 'agents are unreachable' }, { status: 502 });
  }

  const conversation = {
    id: `${idA}-${idB}-${Date.now()}`,
    participants: [idA, idB],
    messages: dialogue,
    at: new Date().toISOString(),
  };

  mutateState((s) => {
    s.conversations = [...s.conversations, conversation].slice(-100);
  });

  return NextResponse.json({ conversation });
}
