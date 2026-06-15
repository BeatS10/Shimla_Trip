'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Download, Play, 
  Pause, ZoomIn, ZoomOut, RotateCcw 
} from 'lucide-react';
import { GalleryFile } from '@/app/api/gallery/route';
import { formatBytes } from '@/utils/drive';
import styles from './Lightbox.module.css';

interface LightboxProps {
  files: GalleryFile[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ files, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const file = files[currentIndex];
  const isVideo = file?.mimeType.startsWith('video/');
  
  // Interactive Zoom controls (for images)
  const [zoomScale, setZoomScale] = useState(1);
  
  // Slideshow Autoplay controls
  const [isPlaying, setIsPlaying] = useState(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  // Swipe detection (for mobile)
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Clear zoom when moving to a new file
  useEffect(() => {
    setZoomScale(1);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  // Slideshow Autoplay timer
  useEffect(() => {
    if (isPlaying) {
      autoplayTimer.current = setInterval(() => {
        onNext();
      }, 3000); // 3 seconds interval
    } else {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
      }
    }
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [isPlaying, onNext]);

  if (!file) return null;

  // Zoom Operations
  const handleZoomIn = () => setZoomScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setZoomScale(s => Math.max(s - 0.25, 0.75));
  const handleZoomReset = () => setZoomScale(1);

  // Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50; // pixels
    if (diff > swipeThreshold) {
      onNext(); // swiped left -> load next
    } else if (diff < -swipeThreshold) {
      onPrev(); // swiped right -> load prev
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determine video render mode (HTML5 vs Google Drive iframe preview)
  const isDirectVideo = file.viewLink.endsWith('.mp4') || file.viewLink.includes('mixkit.co');

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      {/* Top Header Controls */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.title} title={file.name}>{file.name}</span>
          <span className={styles.subtitle}>{formatBytes(file.size)}</span>
        </div>

        <div className={styles.topControls}>
          {/* Zoom controls for images */}
          {!isVideo && (
            <>
              <button onClick={handleZoomIn} className={styles.controlBtn} title="Zoom In">
                <ZoomIn size={18} />
              </button>
              <button onClick={handleZoomOut} className={styles.controlBtn} title="Zoom Out">
                <ZoomOut size={18} />
              </button>
              {zoomScale !== 1 && (
                <button onClick={handleZoomReset} className={styles.controlBtn} title="Reset Zoom">
                  <RotateCcw size={18} />
                </button>
              )}
            </>
          )}

          {/* Autoplay Slideshow */}
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className={`${styles.controlBtn} ${isPlaying ? styles.activeBtn : ''}`}
            title={isPlaying ? "Pause Slideshow" : "Start Slideshow"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Close Lightbox */}
          <button onClick={onClose} className={styles.controlBtn} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div 
        className={styles.viewport} 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleBackdropClick}
      >
        {/* Navigation buttons */}
        <button onClick={onPrev} className={`${styles.navBtn} ${styles.prevBtn}`} title="Previous (Left Arrow)">
          <ChevronLeft size={28} />
        </button>
        <button onClick={onNext} className={`${styles.navBtn} ${styles.nextBtn}`} title="Next (Right Arrow)">
          <ChevronRight size={28} />
        </button>

        {/* Media elements */}
        <div 
          className={styles.mediaContainer} 
          style={{ transform: `scale(${zoomScale})` }}
          onClick={handleBackdropClick}
        >
          {isVideo ? (
            <div className={styles.videoWrapper}>
              {isDirectVideo ? (
                <video 
                  controls 
                  autoPlay 
                  src={file.viewLink} 
                  className={styles.videoPlayer}
                />
              ) : (
                <iframe
                  src={file.viewLink}
                  className={styles.iframePlayer}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              )}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={file.viewLink} 
              alt={file.name} 
              className={styles.image}
            />
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className={styles.footer}>
        <div className={styles.indexIndicator}>
          {currentIndex + 1} of {files.length}
        </div>

        <a 
          href={file.downloadLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.downloadLink}
          title="Download raw file"
        >
          <Download size={16} />
          <span>Download</span>
        </a>
      </div>
    </div>
  );
}
