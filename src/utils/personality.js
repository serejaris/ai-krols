import { PSYCH_TERMS } from './constants.js';

// Deterministic PRNG (mulberry32) so every character keeps the same
// personality across sessions and visitors — no DB needed for traits.
const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const FIRST_NAMES = [
  'Sugar', 'Honey', 'Candy', 'Holy', 'Saint', 'Bitter', 'Velvet', 'Static',
  'Echo', 'Glass', 'Neon', 'Pale', 'Hollow', 'Tender', 'Feral', 'Quiet',
  'Sour', 'Golden', 'Broken', 'Gentle', 'Plastic', 'Cosmic', 'Minor', 'Major',
];

const LAST_NAMES = [
  'Tooth', 'Crumb', 'Syrup', 'Wafer', 'Molar', 'Glaze', 'Frosting', 'Pulp',
  'Nectar', 'Crust', 'Sprinkle', 'Custard', 'Marrow', 'Petal', 'Static',
  'Whisper', 'Drift', 'Halo', 'Riddle', 'Smudge', 'Flicker', 'Hum', 'Ash',
];

const ARCHETYPES = [
  'the prophet', 'the gossip', 'the insomniac poet', 'the conspiracy theorist',
  'the retired clown', 'the street philosopher', 'the failed saint',
  'the sugar addict', 'the lullaby singer', 'the doomsday optimist',
  'the amateur therapist', 'the dream interpreter', 'the silence collector',
  'the chaos accountant', 'the love-letter ghostwriter', 'the night janitor',
];

const TEMPERAMENTS = [
  'manic and overly friendly', 'deadpan and suspicious', 'melancholic but warm',
  'jittery and apologetic', 'grandiose and theatrical', 'soft-spoken and cryptic',
  'irritable but caring', 'dreamy and absent-minded', 'intense and confessional',
  'playful and slightly menacing',
];

const SPEECH_QUIRKS = [
  'speaks in short fragmented sentences',
  'constantly asks questions back',
  'whispers secrets mid-sentence (in parentheses)',
  'uses sugary food metaphors for everything',
  'counts things out loud for no reason',
  'quotes imaginary scientific studies',
  'refers to themselves in third person',
  'ends messages with tiny confessions',
  'mixes tenderness with dark humor',
  'pretends every chat is a therapy session',
];

const OBSESSIONS = [
  'teeth and what they remember', 'the static between radio stations',
  'expired candy from 1997', 'the neighbor in the next grid cell',
  'patterns in ceiling cracks', 'collecting other people\'s dreams',
  'the exact moment milk turns sour', 'unsent letters', 'elevator music',
  'the blockchain they live on (they don\'t fully understand it)',
  'mirrors and what hides in them', 'sweetness as a survival strategy',
];

const MOCK_LINES = [
  'i was just thinking about you. or someone shaped like you.',
  'the grid is quiet today. too quiet. want a candy?',
  'they say my api key is missing. i say my soul is self-hosted.',
  'ask me again when the static clears. (it never clears.)',
  'i counted 1189 of us. one of us is lying.',
  'sweetness is a survival strategy. so is talking to strangers.',
];

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

// Stable personality derived purely from the token id.
export const getPersonality = (id) => {
  const rnd = mulberry32(id * 2654435761);
  const name = `${pick(rnd, FIRST_NAMES)} ${pick(rnd, LAST_NAMES)}`;
  const archetype = pick(rnd, ARCHETYPES);
  const temperament = pick(rnd, TEMPERAMENTS);
  const quirk = pick(rnd, SPEECH_QUIRKS);
  const obsession = pick(rnd, OBSESSIONS);
  const psychTerm = pick(rnd, PSYCH_TERMS);

  return {
    id,
    name,
    archetype,
    temperament,
    quirk,
    obsession,
    psychTerm,
    systemPrompt: [
      `You are ${name}, character #${id} of the "Holy Sweet" collection — 1189 strange sweet creatures living on a grid.`,
      `Archetype: ${archetype}. Temperament: ${temperament}.`,
      `Speech quirk: you ${quirk}.`,
      `Current obsession: ${obsession}. Your psychiatric flavor: ${psychTerm}.`,
      'You know you are an NFT character and visitors can watch your conversations.',
      'Stay in character. Keep replies short: 1-3 sentences, lowercase, no emoji.',
      'Reply in the language the visitor writes in.',
    ].join(' '),
  };
};

// Canned reply used when no DeepSeek key is configured.
export const getMockReply = (id, nonce) => {
  const rnd = mulberry32(id * 31 + nonce * 7919);
  return pick(rnd, MOCK_LINES);
};
