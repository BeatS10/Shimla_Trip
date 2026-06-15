'use client';

import React, { useState } from 'react';
import { MountainSnow, Link2, FolderOpen, X, Check } from 'lucide-react';
import { getFolderIdFromUrl } from '@/utils/drive';
import styles from './Header.module.css';

interface HeaderProps {
  currentFolderId: string;
  isMock: boolean;
  onFolderChange: (folderId: string) => void;
}

export default function Header({ currentFolderId, isMock, onFolderChange }: HeaderProps) {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const folderId = getFolderIdFromUrl(inputValue);
    
    if (folderId) {
      onFolderChange(folderId);
      setInputValue('');
      setIsInputOpen(false);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <div className={styles.iconWrapper}>
            <MountainSnow size={22} />
          </div>
          <div className={styles.logoText}>
            <h1>The Shimla Trip</h1>
            <span>Shared Media Portal</span>
          </div>
        </div>

        <div className={styles.controls}>
          {isMock ? (
            <span className={`${styles.badge} ${styles.mockBadge}`}>
              Demo Mode
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.liveBadge}`}>
              Live Drive Connected
            </span>
          )}

          {isInputOpen ? (
            <form onSubmit={handleSubmit} className={styles.inputForm} style={error ? { borderColor: '#ef4444' } : {}}>
              <input
                type="text"
                placeholder={error ? "Invalid Google Drive link!" : "Paste Google Drive folder link..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
              />
              <button type="submit" className={styles.submitBtn}>
                Load
              </button>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => {
                  setIsInputOpen(false);
                  setInputValue('');
                }}
              >
                <X size={16} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsInputOpen(true)}
              className={styles.folderBtn}
              title="Load another Google Drive folder"
            >
              <Link2 size={16} />
              <span>Connect Folder</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
