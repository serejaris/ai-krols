'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './AgentRoom.module.css';

const THINK_POLL_MS = 12_000;
const MINT_STAGES = ['signing transaction…', 'broadcasting to network…', 'waiting for confirmation…'];

// Fake wallet kept in localStorage — gives the mint simulation an "owner"
// without any real blockchain.
const getWallet = () => {
  const stored = localStorage.getItem('fake-wallet');
  if (stored) return stored;
  const wallet =
    '0x' +
    Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  localStorage.setItem('fake-wallet', wallet);
  return wallet;
};

const randomNeighborId = (selfId) => {
  let id = selfId;
  while (id === selfId) {
    id = Math.floor(Math.random() * 1458) + 1;
  }
  return id;
};

const AgentRoom = ({ personality, imageSrc }) => {
  const [mint, setMint] = useState(null);
  const [mintStage, setMintStage] = useState(null); // null | 0..2 | 'error'
  const [thoughts, setThoughts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversing, setConversing] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const chatEndRef = useRef(null);

  const { id, name, archetype, temperament, quirk, obsession, psychTerm } = personality;
  const alive = Boolean(mint);

  useEffect(() => {
    Promise.all([
      fetch(`/api/chat?id=${id}`).then((r) => r.json()),
      fetch(`/api/converse?id=${id}`).then((r) => r.json()),
      fetch('/api/mint').then((r) => r.json()),
      fetch(`/api/think?id=${id}`).then((r) => r.json()),
    ])
      .then(([chat, conv, mints, think]) => {
        setMessages(chat.messages);
        setConversations(conv.conversations.slice(-5).reverse());
        setMint(mints.mints[id] || null);
        setThoughts(think.thoughts);
        setLoaded(true);
      })
      .catch(() => setError('failed to load agent state'));
  }, [id]);

  // While the agent is alive and someone is watching, it keeps thinking.
  // The server rate-limits actual generation; polling just gives it a pulse.
  const requestThought = useCallback(async () => {
    try {
      const res = await fetch('/api/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setThoughts(data.thoughts);
    } catch {
      // a skipped heartbeat is not an error
    }
  }, [id]);

  useEffect(() => {
    if (!alive) return;
    requestThought();
    const timer = setInterval(requestThought, THINK_POLL_MS);
    return () => clearInterval(timer);
  }, [alive, requestThought]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMint = async () => {
    if (mintStage !== null || alive) return;

    // Walk through fake tx stages for the demo feel
    for (let i = 0; i < MINT_STAGES.length; i++) {
      setMintStage(i);
      await new Promise((r) => setTimeout(r, 700));
    }

    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, owner: getWallet() }),
      });
      const data = await res.json();
      setMint(data.mint);
      setMintStage(null);
    } catch {
      setMintStage('error');
    }
  };

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
          <div className={`${styles.portrait} ${alive ? '' : styles.dormantPortrait}`}>
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
              {alive
                ? <>● alive — minted by {mint.owner.slice(0, 10)}… <span className={styles.tx}>tx {mint.txHash.slice(0, 14)}…</span></>
                : '○ dormant — not minted'}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          {!alive && loaded && (
            <div className={styles.dormantPanel}>
              <pre className={styles.pre}>{`      z z z
   .--------.
   |  ${String(id).padStart(4, ' ')}  |
   '--------'`}</pre>
              <p className={styles.dormantText}>
                this character is dormant. mint it and it wakes up:
                starts thinking, drawing and talking on its own.
              </p>
              {mintStage === null && (
                <button className={styles.button} onClick={handleMint}>
                  mint — wake it up
                </button>
              )}
              {typeof mintStage === 'number' && (
                <div className={styles.mintProgress}>{MINT_STAGES[mintStage]}</div>
              )}
              {mintStage === 'error' && (
                <div className={styles.mintProgress}>mint failed. try again.</div>
              )}
            </div>
          )}

          {alive && (
            <>
              <div className={styles.sectionTitle}>live thoughts — generated as you watch</div>
              <div className={styles.thoughtFeed}>
                {thoughts.length === 0 && (
                  <div className={styles.empty}>waking up…</div>
                )}
                {[...thoughts].reverse().map((t, i) => (
                  <div key={thoughts.length - i} className={styles.thought}>
                    <pre className={styles.pre}>{t.text}</pre>
                    {t.mock && <span className={styles.mockBadge}>offline echo</span>}
                  </div>
                ))}
              </div>

              <div className={styles.sectionTitle}>public chat — everyone sees this</div>
              <div className={styles.chat}>
                {messages.length === 0 && (
                  <div className={styles.empty}>no one has spoken to {name.split(' ')[0].toLowerCase()} yet. be first.</div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={m.from === 'agent' ? styles.agentMsg : styles.visitorMsg}>
                    <span className={styles.author}>{m.from === 'agent' ? name : m.visitor || 'visitor'}</span>
                    {m.from === 'agent'
                      ? <pre className={styles.pre}>{m.text}</pre>
                      : m.text}
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
                      <pre className={styles.pre}>{m.text}</pre>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default AgentRoom;
