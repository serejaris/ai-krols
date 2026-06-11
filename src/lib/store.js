import fs from 'fs';
import path from 'path';

// Minimal file-based store for the no-blockchain MVP.
// Holds mint state, public chat history and agent-to-agent conversations.
const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

const EMPTY_STATE = { mints: {}, chats: {}, conversations: [], thoughts: {} };

// The home page is server-rendered per request and reads this on every hit,
// so keep a short-lived in-memory copy instead of re-reading the file.
// Single container + single process: writes go through writeState which
// refreshes the cache, so it never serves stale data to its own process.
const CACHE_TTL_MS = 5_000;
let cache = null; // { state, ts }

export const readState = () => {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return cache.state;
  }
  let state;
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    state = { ...EMPTY_STATE, ...JSON.parse(raw) };
  } catch {
    state = { ...EMPTY_STATE };
  }
  cache = { state, ts: Date.now() };
  return state;
};

export const writeState = (state) => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  cache = { state, ts: Date.now() };
};

export const mutateState = (fn) => {
  const state = readState();
  const result = fn(state);
  writeState(state);
  return result;
};
