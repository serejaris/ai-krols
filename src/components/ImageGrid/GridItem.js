import styles from './GridItem.module.css';

const GridItem = ({ image, minted = false, onClick }) => {
  const handleClick = () => {
    onClick(image);
  };

  const handleImageError = (e) => {
    // Handle missing images gracefully
    console.log(`Image ${image.id} failed to load`);
    // Hide the broken image by setting display to none
    if (e.target) {
      e.target.style.display = 'none';
    }
  };

  return (
    <div
      className={`${styles.gridItem} ${minted ? styles.minted : styles.dormant}`}
      onClick={handleClick}
    >
      <div className={styles.gridNumber}>{image.id}</div>
      <div className={styles.imageWrapper}>
        {/* plain <img>: 1189 tiles through the next/image optimizer
            is exactly what made the grid crawl */}
        <img
          src={image.thumbSrc}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className={styles.image}
        />
      </div>
      <div className={styles.psychTerm}>{image.psychTerm}</div>
    </div>
  );
};

export default GridItem;
