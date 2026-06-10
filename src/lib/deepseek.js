import { getMockReply } from '@/utils/personality';

const API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

export const hasApiKey = () => Boolean(process.env.DEEPSEEK_API_KEY);

// messages: [{role, content}] including the system prompt.
// Falls back to canned in-character lines when no key is configured,
// so the whole flow stays demoable without credentials.
export const complete = async (messages, { agentId = 0, nonce = 0 } = {}) => {
  if (!hasApiKey()) {
    return { text: getMockReply(agentId, nonce), mock: true };
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 200,
      temperature: 1.1,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  return { text: data.choices[0].message.content.trim(), mock: false };
};
