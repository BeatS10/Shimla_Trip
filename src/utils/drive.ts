/**
 * Utility to extract Google Drive Folder ID from a shareable link or raw string.
 * Supports format:
 * - https://drive.google.com/drive/folders/1a2b3c...
 * - https://drive.google.com/drive/u/0/folders/1a2b3c...
 * - Raw folder ID (e.g., 1a2b3c...)
 */
export function getFolderIdFromUrl(urlOrId: string): string | null {
  if (!urlOrId) return null;
  
  const trimmed = urlOrId.trim();
  
  // Check if it's already a clean alphanumeric ID (Google Drive IDs are usually 33 chars, alphanumeric, dashes, underscores)
  // We check if it does not contain slashes, dots, or colons
  if (!trimmed.includes('/') && !trimmed.includes('.') && trimmed.length >= 15) {
    return trimmed;
  }

  try {
    const urlObj = new URL(trimmed);
    if (urlObj.hostname.includes('drive.google.com')) {
      const paths = urlObj.pathname.split('/');
      // The folder ID is usually the segment following "folders"
      const foldersIndex = paths.indexOf('folders');
      if (foldersIndex !== -1 && foldersIndex + 1 < paths.length) {
        return paths[foldersIndex + 1];
      }
    }
  } catch (e) {
    // URL parsing failed, fall back to regex match
  }

  // Regex fallback for "/folders/([a-zA-Z0-9-_]+)"
  const regex = /\/folders\/([a-zA-Z0-9-_]+)/;
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Format file sizes in bytes to readable string (e.g. 2.4 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
