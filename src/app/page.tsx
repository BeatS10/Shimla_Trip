'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, SlidersHorizontal, Image, Video, CheckSquare, 
  Square, Download, Trash2, FolderSync, Info, AlertCircle, Lock
} from 'lucide-react';
import Header from '@/components/Header';
import MediaCard from '@/components/MediaCard';
import Lightbox from '@/components/Lightbox';
import Loader from '@/components/Loader';
import { GalleryFile } from './api/gallery/route';
import styles from './page.module.css';

export default function GalleryPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [authError, setAuthError] = useState<boolean>(false);

  // Gallery state
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [folderId, setFolderId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(true);

  // Filters, search & sorting
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name-asc');

  // Multi-select & Lightbox
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // ZIP Download progress state
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);

  // Load Folder ID & check passcode on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFolder = params.get('folder') || params.get('folderId');
    const defaultFolder = urlFolder || process.env.NEXT_PUBLIC_DEFAULT_FOLDER_ID || '';
    setFolderId(defaultFolder);

    // Check if passcode is saved
    const savedPasscode = localStorage.getItem('shimla_passcode');
    if (savedPasscode === "Ashu's_First_trip") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch files when folderId changes
  useEffect(() => {
    if (!isAuthenticated) return; // Wait until authenticated

    const fetchGallery = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedIds(new Set()); // Reset selections when folder changes
      
      try {
        const savedPasscode = localStorage.getItem('shimla_passcode') || '';
        const res = await fetch(`/api/gallery?folderId=${folderId}`, {
          headers: {
            'Authorization': `Passcode ${savedPasscode}`
          }
        });

        if (res.status === 401) {
          localStorage.removeItem('shimla_passcode');
          setIsAuthenticated(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Server returned code ${res.status}`);
        }
        const data = await res.json();
        setFiles(data.files || []);
        setIsMock(data.isMock ?? true);
        if (data.error && !data.isMock) {
          setError(data.error);
        }
      } catch (err: any) {
        console.error('Failed to load gallery files:', err);
        setError('Connection failed. Displaying simulated trip photos.');
        setIsMock(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, [folderId, isAuthenticated]);

  // Handle Passcode verification
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError(false);
    
    try {
      const res = await fetch(`/api/gallery?folderId=${folderId}`, {
        headers: {
          'Authorization': `Passcode ${passcode}`
        }
      });
      
      if (res.ok) {
        localStorage.setItem('shimla_passcode', passcode);
        setIsAuthenticated(true);
      } else {
        setAuthError(true);
        setTimeout(() => setAuthError(false), 800);
      }
    } catch (err) {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 800);
    } finally {
      setIsVerifying(false);
    }
  };

  // Synchronize folder change in URL to make sharing seamless
  const handleFolderChange = (newFolderId: string) => {
    setFolderId(newFolderId);
    const params = new URLSearchParams(window.location.search);
    params.set('folder', newFolderId);
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  // Filter & Sort list using useMemo
  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];

    // Filter by type
    if (filter === 'image') {
      result = result.filter(f => f.mimeType.startsWith('image/'));
    } else if (filter === 'video') {
      result = result.filter(f => f.mimeType.startsWith('video/'));
    }

    // Filter by search query
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(query));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
      }
      if (sortBy === 'date-desc') {
        return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime();
      }
      return 0;
    });

    return result;
  }, [files, filter, search, sortBy]);

  // Gallery Statistics (based on total loaded files, not filtered ones)
  const stats = useMemo(() => {
    const totalCount = files.length;
    const photoCount = files.filter(f => f.mimeType.startsWith('image/')).length;
    const videoCount = files.filter(f => f.mimeType.startsWith('video/')).length;
    const totalSizeBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
    
    // Formatting total size
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    let i = 0;
    let sizeNum = totalSizeBytes;
    while (sizeNum > 1024 && i < sizes.length - 1) {
      sizeNum /= 1024;
      i++;
    }
    const totalSizeStr = `${sizeNum.toFixed(1)} ${sizes[i]}`;

    return { totalCount, photoCount, videoCount, totalSizeStr };
  }, [files]);

  // Selection handlers
  const handleSelectFile = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    // Select all currently visible (filtered) items
    const visibleIds = filteredAndSortedFiles.map(f => f.id);
    const allSelected = visibleIds.every(id => selectedIds.has(id));
    
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        // Deselect visible files
        visibleIds.forEach(id => next.delete(id));
      } else {
        // Select visible files
        visibleIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // ZIP compilation & download
  const handleDownloadSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDownloadingZip(true);
    setZipProgress(0);

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const selectedFiles = files.filter(f => selectedIds.has(f.id));
      
      let downloaded = 0;
      
      for (const file of selectedFiles) {
        const isVideo = file.mimeType.startsWith('video/');
        
        try {
          // If mock data, fetch Unsplash directly (which supports CORS).
          // If Google Drive data, proxy through our API to bypass CORS blocks.
          const downloadUrl = file.id.startsWith('mock-')
            ? file.viewLink
            : `/api/download?id=${file.id}&isVideo=${isVideo}`;
            
          const savedPasscode = localStorage.getItem('shimla_passcode') || '';
          const fetchHeaders: HeadersInit = {};
          if (!file.id.startsWith('mock-')) {
            fetchHeaders['Authorization'] = `Passcode ${savedPasscode}`;
          }

          const res = await fetch(downloadUrl, { headers: fetchHeaders });
          if (!res.ok) {
            throw new Error(`HTTP status ${res.status}`);
          }
          const blob = await res.blob();
          
          // Add to zip folder
          zip.file(file.name, blob);
        } catch (err) {
          console.error(`Skipped ${file.name} due to fetch error:`, err);
        }
        
        downloaded++;
        setZipProgress(Math.round((downloaded / selectedFiles.length) * 100));
      }

      // Compile and download ZIP file
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipContent);
      link.download = `shimla_trip_media_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      // Clear selection
      setSelectedIds(new Set());
    } catch (err) {
      console.error('ZIP compilation error:', err);
      alert('Failed to pack files. Please try downloading them individually.');
    } finally {
      setIsDownloadingZip(false);
      setZipProgress(0);
    }
  };

  // Individual file download trigger
  const handleDownloadSingle = (file: GalleryFile) => {
    const link = document.createElement('a');
    link.href = file.downloadLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lightbox index navigations
  const handleOpenLightbox = (fileId: string) => {
    const idx = filteredAndSortedFiles.findIndex(f => f.id === fileId);
    if (idx !== -1) setLightboxIndex(idx);
  };

  const handlePrevLightbox = () => {
    if (lightboxIndex === null || filteredAndSortedFiles.length === 0) return;
    setLightboxIndex(prev => (prev === 0 ? filteredAndSortedFiles.length - 1 : prev! - 1));
  };

  const handleNextLightbox = () => {
    if (lightboxIndex === null || filteredAndSortedFiles.length === 0) return;
    setLightboxIndex(prev => (prev === filteredAndSortedFiles.length - 1 ? 0 : prev! + 1));
  };

  // Determine if all visible items are selected
  const isAllVisibleSelected = useMemo(() => {
    if (filteredAndSortedFiles.length === 0) return false;
    return filteredAndSortedFiles.every(f => selectedIds.has(f.id));
  }, [filteredAndSortedFiles, selectedIds]);

  if (!isAuthenticated) {
    return (
      <div className={styles.lockScreen}>
        <div className={`${styles.lockCard} ${authError ? styles.shake : ''}`}>
          <div className={styles.lockIconWrapper}>
            <Lock size={24} />
          </div>
          <h2 className={styles.lockTitle}>Private Gallery Portal</h2>
          <p className={styles.lockSubtitle}>
            Please enter the access code to view the Shimla Trip photos & videos.
          </p>
          <form onSubmit={handleAuthSubmit} className={styles.lockForm}>
            <input
              type="password"
              placeholder="Enter passcode..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className={styles.lockInput}
              disabled={isVerifying}
              autoFocus
            />
            <button type="submit" className={styles.lockBtn} disabled={isVerifying || !passcode.trim()}>
              {isVerifying ? 'Verifying...' : 'Access Gallery'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      {/* Header with search/load capabilities */}
      <Header 
        currentFolderId={folderId} 
        isMock={isMock} 
        onFolderChange={handleFolderChange} 
      />

      <div className={styles.content}>
        {/* API warning banner */}
        {error && (
          <div className={styles.alertBanner}>
            <AlertCircle size={18} className={styles.alertIcon} />
            <div>
              <strong>Connection Warning:</strong> {error}
            </div>
          </div>
        )}

        {/* Dynamic Hero section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.locationBadge}>
              <span>Shimla, Himachal Pradesh</span>
            </div>
            <h2 className={styles.title}>The Shimla Trip</h2>
            <p className={styles.description}>
              Relive the magical snowy streets, misty mountains, and cozy toy train rides.
              Connect your Google Drive folder to upload new files instantly.
            </p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.photoCount}</div>
              <div className={styles.statLabel}>Photos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.videoCount}</div>
              <div className={styles.statLabel}>Videos</div>
            </div>
            <div className={styles.statCard} style={{ gridColumn: 'span 2' }}>
              <div className={styles.statValue} style={{ fontSize: '1.25rem' }}>{stats.totalSizeStr}</div>
              <div className={styles.statLabel}>Total Size</div>
            </div>
          </div>
        </section>

        {/* Toolbar with Search, Filters, and Sorting */}
        <section className={styles.toolbar}>
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.tab} ${filter === 'all' ? styles.activeTab : ''}`}
              onClick={() => setFilter('all')}
            >
              All Media
            </button>
            <button 
              className={`${styles.tab} ${filter === 'image' ? styles.activeTab : ''}`}
              onClick={() => setFilter('image')}
            >
              Photos
            </button>
            <button 
              className={`${styles.tab} ${filter === 'video' ? styles.activeTab : ''}`}
              onClick={() => setFilter('video')}
            >
              Videos
            </button>
          </div>

          <div className={styles.searchSortGroup}>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search file name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className={styles.sortSelect}
            >
              <option value="name-asc">Sort: A to Z</option>
              <option value="name-desc">Sort: Z to A</option>
              <option value="date-desc">Sort: Newest First</option>
              <option value="date-asc">Sort: Oldest First</option>
            </select>
          </div>
        </section>

        {/* Main Content Grid */}
        {isLoading ? (
          <Loader type="skeleton" count={8} />
        ) : filteredAndSortedFiles.length > 0 ? (
          <div className={styles.grid}>
            {filteredAndSortedFiles.map((file) => (
              <MediaCard
                key={file.id}
                file={file}
                isSelected={selectedIds.has(file.id)}
                onSelect={() => handleSelectFile(file.id)}
                onClick={() => handleOpenLightbox(file.id)}
                onDownload={() => handleDownloadSingle(file)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <AlertCircle size={48} strokeWidth={1.5} />
            </div>
            <h3>No Media Found</h3>
            <p>
              {search 
                ? "Try checking your search spelling or clearing filters." 
                : "No images or videos found in this Google Drive folder."}
            </p>
            {(search || filter !== 'all') && (
              <button 
                onClick={() => { setSearch(''); setFilter('all'); }} 
                className={styles.clearBtn}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Multi-Select Action Bar */}
      <div className={`${styles.selectionBar} ${selectedIds.size > 0 ? styles.selectionBarActive : ''}`}>
        <span className={styles.selectionInfo}>
          {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'} selected
        </span>
        <div className={styles.selectionActions}>
          <button 
            onClick={handleSelectAll} 
            className={`${styles.barBtn} ${styles.barBtnSecondary}`}
          >
            {isAllVisibleSelected ? <Square size={14} /> : <CheckSquare size={14} />}
            <span>{isAllVisibleSelected ? 'Deselect All' : 'Select All'}</span>
          </button>
          <button 
            onClick={handleClearSelection} 
            className={`${styles.barBtn} ${styles.barBtnSecondary}`}
            disabled={isDownloadingZip}
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
          <button 
            onClick={handleDownloadSelected} 
            className={`${styles.barBtn} ${styles.barBtnPrimary}`}
            disabled={isDownloadingZip}
          >
            <Download size={14} />
            <span>
              {isDownloadingZip 
                ? `Packing ZIP (${zipProgress}%)` 
                : `Download Selected (ZIP)`}
            </span>
          </button>
        </div>
      </div>

      {/* Full-Screen Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          files={filteredAndSortedFiles}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={handlePrevLightbox}
          onNext={handleNextLightbox}
        />
      )}
    </main>
  );
}
