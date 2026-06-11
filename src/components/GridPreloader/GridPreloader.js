'use client';

import { useState, useEffect } from 'react';
import Curtain from '@/components/Curtain/Curtain';

// Grid-specific curtain driver: waits until the eager above-the-fold
// tiles have actually loaded so tiles never pop in one by one.
const GridPreloader = () => {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const imgs = Array.from(document.querySelectorAll('img[loading="eager"]'));
    if (imgs.length === 0) {
      setReady(true);
      return;
    }

    let done = 0;
    const onOne = () => {
      done++;
      setProgress(Math.round((done / imgs.length) * 100));
      if (done >= imgs.length) setReady(true);
    };

    for (const img of imgs) {
      if (img.complete) {
        onOne();
      } else {
        img.addEventListener('load', onOne, { once: true });
        img.addEventListener('error', onOne, { once: true });
      }
    }
  }, []);

  return <Curtain ready={ready} caption={`waking 1189 sleepers… ${progress}%`} />;
};

export default GridPreloader;
