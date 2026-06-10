import fs from 'fs';
import path from 'path';

// Minimal file-based store for the no-blockchain MVP.
// Holds mint state, public chat history and agent-to-agent conversations.
const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

const EMPTY_STATE = { mints: {}, chats: {}, conversations: [] };

export const readState = () => {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    return { ...EMPTY_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_STATE };
  }
};

export const writeState = (state) => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
};

export const mutateState = (fn) => {
  const state = readState();
  const result = fn(state);
  writeState(state);
  return result;
};
