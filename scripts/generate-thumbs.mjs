// One-off: pre-generate small webp thumbnails for the grid so the page
// never goes through the next/image optimizer (1189 on-the-fly resizes
// of 1.2MB PNGs is what made the frontend crawl).
// Usage: node scripts/generate-thumbs.mjs
import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import path from 'path';

const SRC = path.resolve('public/img');
const OUT = path.resolve('public/thumbs');
const SIZE = 256; // 2x retina for ~128px grid tiles
const CONCURRENCY = 8;

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => f.endsWith('.png'));

let done = 0;
const queue = [...files];

const worker = async () => {
  while (queue.length) {
    const file = queue.pop();
    const id = path.basename(file, '.png');
    await sharp(path.join(SRC, file))
      .resize(SIZE, SIZE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 70 })
      .toFile(path.join(OUT, `${id}.webp`));
    done++;
    if (done % 200 === 0) console.log(`${done}/${files.length}`);
  }
};

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`done: ${done} thumbnails in public/thumbs`);
