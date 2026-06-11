'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Curtain.module.css';

// Full-screen loading curtain. Rendered in SSR HTML so it shows from the
// first byte; fades out once `ready` flips true (or after the safety
// timeout). MIN_SHOW prevents an ugly single-frame flash on cached loads.
const GLYPHS = ['░', '▒', '▓', '█', '▓', '▒', '░', '▒', '▓', '█', '▒', '░', '▓', '█', '░', '▒'];
const MAX_WAIT_MS = 4000;
const MIN_SHOW_MS = 350;
const FADE_MS = 600;

const Curtain = ({ ready, caption }) => {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const startedAt = useRef(null);

  useEffect(() => {
    startedAt.current ??= Date.now();
    let cancelled = false;

    const hide = () => {
      const elapsed = Date.now() - startedAt.current;
      setTimeout(() => {
        if (cancelled) return;
        setLeaving(true);
        setTimeout(() => !cancelled && setGone(true), FADE_MS);
      }, Math.max(0, MIN_SHOW_MS - elapsed));
    };

    if (ready) {
      hide();
      return () => { cancelled = true; };
    }

    const timer = setTimeout(hide, MAX_WAIT_MS); // never trap the user
    return () => { cancelled = true; clearTimeout(timer); };
  }, [ready]);

  if (gone) return null;

  return (
    <div className={`${styles.curtain} ${leaving ? styles.leaving : ''}`}>
      <div className={styles.inner}>
        <div className={styles.glyphGrid}>
          {GLYPHS.map((g, i) => (
            <span key={i} className={styles.glyph}>{g}</span>
          ))}
        </div>
        <div className={styles.caption}>{caption}</div>
      </div>
    </div>
  );
};

export default Curtain;
