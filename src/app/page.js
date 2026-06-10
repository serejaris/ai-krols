'use client';

import { useState, useEffect } from 'react';
import ImageGrid from '@/components/ImageGrid/ImageGrid';
import ImageModal from '@/components/ImageModal/ImageModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { generateImageData } from '@/utils/imageData';

export default function Home() {
  const [images, setImages] = useState([]);
  const [mints, setMints] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleMinted = (mint) => {
    setMints((prev) => ({ ...prev, [mint.id]: mint }));
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
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
        <ImageGrid images={images} mints={mints} onImageClick={handleImageClick} />
        <ImageModal
          image={selectedImage}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          mint={selectedImage ? mints[selectedImage.id] : null}
          onMinted={handleMinted}
        />
      </div>
    </ErrorBoundary>
  );
}
