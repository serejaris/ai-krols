// Psychiatric terms array from the original implementation
export const PSYCH_TERMS = [
  'anxiety', 'depression', 'bipolar', 'schizo', 'trauma', 'ocd', 'adhd',
  'ptsd', 'panic', 'phobia', 'insomnia', 'mania', 'psychosis', 'disorder',
  'stress', 'compulsion', 'dissociation', 'paranoia', 'neurosis', 'dementia'
];

// Helper function to get a random psychiatric term
export const getRandomPsychTerm = () => {
  return PSYCH_TERMS[Math.floor(Math.random() * PSYCH_TERMS.length)];
};

// Helper function to construct image path.
// NEXT_PUBLIC_IMG_BASE lets deployments serve art from a CDN
// instead of bundling 1.5GB of PNGs into the build.
const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || '';

export const getImagePath = (imageId) => {
  return `${IMG_BASE}/img/${imageId}.png`;
};

// Total number of images (based on the original implementation)
export const TOTAL_IMAGES = 1189;