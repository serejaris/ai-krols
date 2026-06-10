import Image from 'next/image';
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
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 10px, (max-width: 1200px) 50px, 50px"
          quality={60}
          loading="lazy"
          onError={handleImageError}
          className={styles.image}
        />
      </div>
      <div className={styles.psychTerm}>{image.psychTerm}</div>
    </div>
  );
};

export default GridItem;
