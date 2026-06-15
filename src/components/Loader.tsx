import React from 'react';
import styles from './Loader.module.css';

interface LoaderProps {
  type?: 'spinner' | 'skeleton';
  count?: number;
}

export default function Loader({ type = 'spinner', count = 8 }: LoaderProps) {
  if (type === 'skeleton') {
    return (
      <div className={styles.skeletonGrid}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={`${styles.skeletonCard} shimmer`}>
            <div className={`${styles.skeletonTextLine1} shimmer`} style={{ filter: 'brightness(1.2)' }}></div>
            <div className={`${styles.skeletonTextLine2} shimmer`} style={{ filter: 'brightness(1.2)' }}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <p>Loading your adventure gallery...</p>
    </div>
  );
}
