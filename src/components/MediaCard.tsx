'use client';

import React from 'react';
import { Play, Download, Eye, Check, Video, Image as ImageIcon } from 'lucide-react';
import { GalleryFile } from '@/app/api/gallery/route';
import { formatBytes } from '@/utils/drive';
import styles from './MediaCard.module.css';

interface MediaCardProps {
  file: GalleryFile;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onClick: () => void;
  onDownload: (e: React.MouseEvent) => void;
}

export default function MediaCard({ file, isSelected, onSelect, onClick, onDownload }: MediaCardProps) {
  const isVideo = file.mimeType.startsWith('video/');

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(e);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking on the selection wrapper, don't open the lightbox
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.selectWrapper}`)) {
      return;
    }
    onClick();
  };

  return (
    <div 
      className={`${styles.card} ${isSelected ? styles.isSelected : ''}`}
      onClick={handleCardClick}
    >
      {/* Checkbox selector */}
      <div className={styles.selectWrapper} onClick={handleSelectClick}>
        <div className={styles.checkbox}>
          <Check size={10} className={styles.checkIcon} strokeWidth={3} />
        </div>
      </div>

      <div className={styles.imageWrapper}>
        {/* Standard img tag avoids next.config domain restriction errors */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.thumbnailLink}
          alt={file.name}
          className={styles.image}
          loading="lazy"
        />

        {isVideo && (
          <div className={styles.videoOverlayIcon}>
            <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
          </div>
        )}
      </div>

      {/* Static corner badges */}
      <div className={styles.badge}>
        {isVideo ? (
          <>
            <Video size={12} />
            {file.duration && <span className={styles.videoDuration}>{file.duration}</span>}
          </>
        ) : (
          <ImageIcon size={12} />
        )}
      </div>

      {/* Media detail overlay shown on hover */}
      <div className={styles.overlay}>
        <p className={styles.cardTitle} title={file.name}>
          {file.name}
        </p>
        <div className={styles.cardMeta}>
          <span>{formatBytes(file.size)}</span>
        </div>
        
        <div className={styles.actions}>
          <button 
            onClick={onClick}
            className={styles.actionBtn}
            title="Preview media"
          >
            <Eye size={14} />
          </button>
          <button 
            onClick={handleDownloadClick}
            className={styles.actionBtn}
            title="Download media"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
