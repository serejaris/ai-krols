import ImageGrid from '@/components/ImageGrid/ImageGrid';
import GridPreloader from '@/components/GridPreloader/GridPreloader';
import ErrorBoundary from '@/components/ErrorBoundary';
import { generateImageData } from '@/utils/imageData';
import { readState } from '@/lib/store';

// Mint state lives in the file store and changes at runtime —
// render per request (readState is memory-cached, so this stays cheap).
export const dynamic = 'force-dynamic';

export default function Home() {
  const images = generateImageData();
  const { mints } = readState();

  // Minted (alive) characters move to the front of the grid regardless
  // of token number; dormant ones keep their original order behind them.
  const minted = [];
  const dormant = [];
  for (const image of images) {
    (mints[image.id] ? minted : dormant).push(image);
  }
  minted.sort(
    (a, b) => new Date(mints[a.id].mintedAt) - new Date(mints[b.id].mintedAt)
  );

  return (
    <ErrorBoundary>
      <div className="container">
        <GridPreloader />
        <ImageGrid images={[...minted, ...dormant]} mints={mints} />
      </div>
    </ErrorBoundary>
  );
}
