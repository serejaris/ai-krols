'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ImageGrid from '@/components/ImageGrid/ImageGrid';
import ErrorBoundary from '@/components/ErrorBoundary';
import { generateImageData } from '@/utils/imageData';

export default function Home() {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [mints, setMints] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Generate complete image data array on component mount
      const imageData = generateImageData();
      setImages(imageData);
      setLoading(false);
    } catch (err) {
      console.error('Error generating image data:', err);
      setError('Failed to load image data');
      setLoading(false);
    }

    // Mint state is shared across visitors via the API
    fetch('/api/mint')
      .then((res) => res.json())
      .then((data) => setMints(data.mints || {}))
      .catch(() => {});
  }, []);

  // Minted (alive) characters move to the front of the grid regardless
  // of token number; dormant ones keep their original order behind them.
  const sortedImages = useMemo(() => {
    const minted = [];
    const dormant = [];
    for (const image of images) {
      (mints[image.id] ? minted : dormant).push(image);
    }
    minted.sort(
      (a, b) => new Date(mints[a.id].mintedAt) - new Date(mints[b.id].mintedAt)
    );
    return [...minted, ...dormant];
  }, [images, mints]);

  const handleImageClick = (image) => {
    router.push(`/agent/${image.id}`);
  };

  if (loading) {
    return (
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'black',
        fontFamily: 'Courier New, Courier, monospace'
      }}>
        Loading NFT grid...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'black',
        fontFamily: 'Courier New, Courier, monospace'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container">
        <ImageGrid images={sortedImages} mints={mints} onImageClick={handleImageClick} />
      </div>
    </ErrorBoundary>
  );
}
