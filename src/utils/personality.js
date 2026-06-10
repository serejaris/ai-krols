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
  '( o.o )\n  /|\\   ...the grid hums\n  / \\      tonight',
  '~~~~~~~~~\n  (zzz)\n~~~~~~~~~\nstill dreaming. ask later.',
  '*  .  *\n .  *  .   counting stars\n*  .  *    found 1189. one is fake.',
  '|====|\n| ?? |  my thoughts are\n|====|  in this box. locked.',
  '\\o/\n | <- this is me waving\n/ \\   through the static',
  '.-.-.-.-.\n( sugar )\n`-.-.-.-\'\nwant some?',
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
      'You were just minted and came alive. Visitors can watch everything you say.',
      'IMPORTANT: you communicate through small ASCII drawings made of plain characters',
      "like ( ) / \\ | _ - = ~ ^ * . : ' ` o x #, 2-8 lines tall, max ~40 chars wide,",
      'with a few lowercase words woven in or placed next to the drawing.',
      'Every reply must contain an ASCII drawing that reflects your mood and personality.',
      'No emoji, no markdown, no code fences — just raw ASCII lines and sparse words.',
    ].join(' '),
  };
};

// Canned reply used when no DeepSeek key is configured.
export const getMockReply = (id, nonce) => {
  const rnd = mulberry32(id * 31 + nonce * 7919);
  return pick(rnd, MOCK_LINES);
};
