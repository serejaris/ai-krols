import Link from 'next/link';
import styles from './GridItem.module.css';

// Server component on purpose: a plain <Link> instead of onClick means
// none of the 1189 tiles ship hydration JS. prefetch={false} — otherwise
// the viewport would trigger hundreds of /agent/[id] prefetches.
const GridItem = ({ image, minted = false, eager = false }) => {
  return (
    <Link
      href={`/agent/${image.id}`}
      prefetch={false}
      className={`${styles.gridItem} ${minted ? styles.minted : styles.dormant}`}
    >
      <div className={styles.gridNumber}>{image.id}</div>
      <div className={styles.imageWrapper}>
        <img
          src={image.thumbSrc}
          alt={image.alt}
          width={256}
          height={256}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
          className={styles.image}
        />
      </div>
      <div className={styles.psychTerm}>{image.psychTerm}</div>
    </Link>
  );
};

export default GridItem;
