'use client';

import { useState, useEffect } from 'react';
import styles from './GridPreloader.module.css';

// Full-screen curtain over the server-rendered grid. It is part of the
// SSR HTML (so it shows from the first byte), waits until the eager
// above-the-fold tiles have actually loaded, then fades away — the user
// never sees tiles popping in one by one.
const GLYPHS = ['░', '▒', '▓', '█', '▓', '▒', '░', '▒', '▓', '█', '▒', '░', '▓', '█', '░', '▒'];
const MAX_WAIT_MS = 4000;
const MIN_SHOW_MS = 350;

const GridPreloader = () => {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    let hidden = false;
    let timer;

    const hide = () => {
      if (hidden) return;
      hidden = true;
      const elapsed = Date.now() - startedAt;
      setTimeout(() => {
        setLeaving(true);
        setTimeout(() => setGone(true), 600);
      }, Math.max(0, MIN_SHOW_MS - elapsed));
    };

    const imgs = Array.from(document.querySelectorAll('img[loading="eager"]'));
    if (imgs.length === 0) {
      hide();
      return;
    }

    let done = 0;
    const onOne = () => {
      done++;
      setProgress(Math.round((done / imgs.length) * 100));
      if (done >= imgs.length) hide();
    };

    for (const img of imgs) {
      if (img.complete) {
        onOne();
      } else {
        img.addEventListener('load', onOne, { once: true });
        img.addEventListener('error', onOne, { once: true });
      }
    }

    // never trap the user behind the curtain
    timer = setTimeout(hide, MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (gone) return null;

  return (
    <div className={`${styles.curtain} ${leaving ? styles.leaving : ''}`}>
      <div className={styles.inner}>
        <div className={styles.glyphGrid}>
          {GLYPHS.map((g, i) => (
            <span key={i} className={styles.glyph}>{g}</span>
          ))}
        </div>
        <div className={styles.caption}>waking 1189 sleepers… {progress}%</div>
      </div>
    </div>
  );
};

export default GridPreloader;
