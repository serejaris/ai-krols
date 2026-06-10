'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './AgentRoom.module.css';

const randomNeighborId = (selfId) => {
  let id = selfId;
  while (id === selfId) {
    id = Math.floor(Math.random() * 1458) + 1;
  }
  return id;
};

const AgentRoom = ({ personality, imageSrc }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [mint, setMint] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversing, setConversing] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  const { id, name, archetype, temperament, quirk, obsession, psychTerm } = personality;

  const refresh = useCallback(async () => {
    const [chatRes, convRes, mintRes] = await Promise.all([
      fetch(`/api/chat?id=${id}`),
      fetch(`/api/converse?id=${id}`),
      fetch('/api/mint'),
    ]);
    const chat = await chatRes.json();
    const conv = await convRes.json();
    const mints = await mintRes.json();
    setMessages(chat.messages);
    setConversations(conv.conversations.slice(-5).reverse());
    setMint(mints.mints[id] || null);
  }, [id]);

  useEffect(() => {
    refresh().catch(() => setError('failed to load agent state'));
  }, [refresh]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);
    setInput('');
    setMessages((prev) => [...prev, { from: 'visitor', visitor: 'you', text }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, message: text }),
      });
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      setMessages((prev) => [...prev, data.reply]);
    } catch {
      setError('agent is unreachable, try again');
    } finally {
      setSending(false);
    }
  };

  const startConversation = async () => {
    if (conversing) return;
    setConversing(true);
    setError(null);
    try {
      const res = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: id, b: randomNeighborId(id), turns: 4 }),
      });
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      setConversations((prev) => [data.conversation, ...prev].slice(0, 5));
    } catch {
      setError('neighbor did not answer');
    } finally {
      setConversing(false);
    }
  };

  return (
    <div className={styles.room}>
      <Link href="/" className={styles.back}>← back to grid</Link>

      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.portrait}>
            <Image src={imageSrc} alt={name} width={300} height={300} quality={90} />
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>{name} <span className={styles.tokenId}>#{id}</span></div>
            <div className={styles.trait}><span>archetype</span>{archetype}</div>
            <div className={styles.trait}><span>temperament</span>{temperament}</div>
            <div className={styles.trait}><span>quirk</span>{quirk}</div>
            <div className={styles.trait}><span>obsession</span>{obsession}</div>
            <div className={styles.trait}><span>diagnosis</span>{psychTerm}</div>
            <div className={styles.mintStatus}>
              {mint
                ? <>minted by {mint.owner.slice(0, 10)}… <span className={styles.tx}>tx {mint.txHash.slice(0, 14)}…</span></>
                : 'not minted yet'}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.sectionTitle}>public chat — everyone sees this</div>
          <div className={styles.chat}>
            {messages.length === 0 && (
              <div className={styles.empty}>no one has spoken to {name.split(' ')[0].toLowerCase()} yet. be first.</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'agent' ? styles.agentMsg : styles.visitorMsg}>
                <span className={styles.author}>{m.from === 'agent' ? name : m.visitor || 'visitor'}</span>
                {m.text}
                {m.mock && <span className={styles.mockBadge}>offline echo</span>}
              </div>
            ))}
            {sending && <div className={styles.agentMsg}><span className={styles.author}>{name}</span>…</div>}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={send} className={styles.inputRow}>
            <input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`say something to ${name.split(' ')[0].toLowerCase()}…`}
              maxLength={500}
            />
            <button className={styles.button} disabled={sending || !input.trim()}>send</button>
          </form>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.sectionTitle}>
            overheard conversations
            <button className={styles.buttonSmall} onClick={startConversation} disabled={conversing}>
              {conversing ? 'agents talking…' : 'talk to a random neighbor'}
            </button>
          </div>

          {conversations.length === 0 && (
            <div className={styles.empty}>no conversations overheard yet.</div>
          )}
          {conversations.map((c) => (
            <div key={c.id} className={styles.conversation}>
              <div className={styles.convHeader}>
                {c.participants.map((p, i) => (
                  <span key={p}>
                    {i > 0 && ' × '}
                    {p === id ? `#${p}` : <Link href={`/agent/${p}`}>#{p}</Link>}
                  </span>
                ))}
              </div>
              {c.messages.map((m, i) => (
                <div key={i} className={m.speakerId === id ? styles.agentMsg : styles.visitorMsg}>
                  <span className={styles.author}>{m.speaker}</span>
                  {m.text}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentRoom;
