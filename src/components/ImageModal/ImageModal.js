'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ImageModal.module.css';

// Fake wallet kept in localStorage — gives the mint simulation an "owner"
// without any real blockchain.
const getWallet = () => {
  const stored = localStorage.getItem('fake-wallet');
  if (stored) return stored;
  const wallet =
    '0x' +
    Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  localStorage.setItem('fake-wallet', wallet);
  return wallet;
};

const MINT_STAGES = ['signing transaction…', 'broadcasting to network…', 'waiting for confirmation…'];

const ImageModal = ({ image, isOpen, onClose, mint, onMinted }) => {
  const [stage, setStage] = useState(null); // null | 0..2 | 'done' | 'error'
  const [txHash, setTxHash] = useState(null);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      window.scrollTo(0, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    // Reset mint progress when switching characters
    setStage(null);
    setTxHash(null);
  }, [image?.id]);

  if (!isOpen || !image) {
    return null;
  }

  const personality = image.personality;
  const minted = mint || stage === 'done';

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleMint = async () => {
    if (stage !== null) return;

    // Walk through fake tx stages for the demo feel
    for (let i = 0; i < MINT_STAGES.length; i++) {
      setStage(i);
      await new Promise((r) => setTimeout(r, 700));
    }

    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: image.id, owner: getWallet() }),
      });
      const data = await res.json();
      setTxHash(data.mint.txHash);
      setStage('done');
      onMinted?.(data.mint);
    } catch {
      setStage('error');
    }
  };

  return (
    <div className={styles.singleView} onClick={handleOverlayClick}>
      <div className={styles.panel}>
        <div className={styles.imageContainer}>
          <Image
            src={image.src}
            alt={image.alt}
            width={500}
            height={500}
            quality={100}
            className={styles.image}
          />
        </div>

        <div className={styles.info}>
          <div className={styles.name}>
            {personality.name} <span className={styles.tokenId}>#{image.id}</span>
          </div>
          <div className={styles.trait}><span>archetype</span>{personality.archetype}</div>
          <div className={styles.trait}><span>temperament</span>{personality.temperament}</div>
          <div className={styles.trait}><span>obsession</span>{personality.obsession}</div>
          <div className={styles.trait}><span>diagnosis</span>{personality.psychTerm}</div>

          <div className={styles.actions}>
            {!minted && stage === null && (
              <button className={styles.mintButton} onClick={handleMint}>
                mint — free (testnet of the soul)
              </button>
            )}
            {typeof stage === 'number' && (
              <div className={styles.mintProgress}>{MINT_STAGES[stage]}</div>
            )}
            {stage === 'error' && (
              <div className={styles.mintProgress}>mint failed. try again.</div>
            )}
            {minted && (
              <>
                <div className={styles.mintedLabel}>
                  ✓ minted
                  {(txHash || mint?.txHash) && (
                    <span className={styles.tx}> tx {(txHash || mint.txHash).slice(0, 18)}…</span>
                  )}
                </div>
                <Link href={`/agent/${image.id}`} className={styles.agentLink}>
                  enter the agent&apos;s room →
                </Link>
              </>
            )}
            {!minted && stage === null && (
              <Link href={`/agent/${image.id}`} className={styles.agentLinkGhost}>
                or just watch them talk →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
