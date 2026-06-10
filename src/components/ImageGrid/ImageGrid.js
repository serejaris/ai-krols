import GridItem from './GridItem';
import styles from './ImageGrid.module.css';

const ImageGrid = ({ images, mints = {}, onImageClick }) => {
  return (
    <div className={styles.gridView}>
      {images.map((image) => (
        <GridItem
          key={image.id}
          image={image}
          minted={Boolean(mints[image.id])}
          onClick={onImageClick}
        />
      ))}
    </div>
  );
};

export default ImageGrid;