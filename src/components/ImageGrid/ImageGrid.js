import GridItem from './GridItem';
import styles from './ImageGrid.module.css';

// First viewport row(s): fetched eagerly with high priority.
// Desktop at ~1200px renders ~24 columns, so 48 covers two rows.
const EAGER_COUNT = 48;

const ImageGrid = ({ images, mints = {} }) => {
  return (
    <div className={styles.gridView}>
      {images.map((image, index) => (
        <GridItem
          key={image.id}
          image={image}
          minted={Boolean(mints[image.id])}
          eager={index < EAGER_COUNT}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
