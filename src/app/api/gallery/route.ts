import { NextResponse } from 'next/server';

// Interface matching the custom format we'll send to our client
export interface GalleryFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  thumbnailLink: string; // w400 thumbnail
  viewLink: string;      // w1600 image or stream link
  downloadLink: string;  // direct download link
  duration?: string;     // for video files
}

// Premium mock data for Shimla trip when no API key is provided
const MOCK_FILES: GalleryFile[] = [
  {
    id: 'mock-img-1',
    name: 'Misty Mountains - Shimla Valley.jpg',
    mimeType: 'image/jpeg',
    size: 2450000,
    createdTime: '2026-01-10T08:30:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
    viewLink: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=90',
    downloadLink: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=90',
  },
  {
    id: 'mock-vid-1',
    name: 'Snowy Peaks Drone Footage.mp4',
    mimeType: 'video/mp4',
    size: 18400000,
    createdTime: '2026-01-10T10:15:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=400&q=80',
    viewLink: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-aerial-view-of-snowy-mountains-41656-large.mp4',
    downloadLink: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-aerial-view-of-snowy-mountains-41656-large.mp4',
    duration: '0:14',
  },
  {
    id: 'mock-img-2',
    name: 'Toy Train Track - Kalka Shimla Route.jpg',
    mimeType: 'image/jpeg',
    size: 3100000,
    createdTime: '2026-01-11T09:00:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=400&q=80',
    viewLink: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=1600&q=90',
    downloadLink: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=1600&q=90',
  },
  {
    id: 'mock-img-3',
    name: 'Pine Trees Covered in Snow.jpg',
    mimeType: 'image/jpeg',
    size: 1980000,
    createdTime: '2026-01-11T14:45:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
    viewLink: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=90',
    downloadLink: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=90',
  },
  {
    id: 'mock-vid-2',
    name: 'Strolling in Winter Forest.mp4',
    mimeType: 'video/mp4',
    size: 22100000,
    createdTime: '2026-01-12T11:20:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?auto=format&fit=crop&w=400&q=80',
    viewLink: 'https://assets.mixkit.co/videos/preview/mixkit-winter-forest-under-heavy-snow-41673-large.mp4',
    downloadLink: 'https://assets.mixkit.co/videos/preview/mixkit-winter-forest-under-heavy-snow-41673-large.mp4',
    duration: '0:22',
  },
  {
    id: 'mock-img-4',
    name: 'Spectacular Ridge Sunset.jpg',
    mimeType: 'image/jpeg',
    size: 4200000,
    createdTime: '2026-01-12T17:30:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
    viewLink: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=90',
    downloadLink: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=90',
  },
  {
    id: 'mock-img-5',
    name: 'Jakhoo Temple Monkey God Statue.jpg',
    mimeType: 'image/jpeg',
    size: 2800000,
    createdTime: '2026-01-13T10:00:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80',
    viewLink: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=90',
    downloadLink: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=90',
  },
  {
    id: 'mock-img-6',
    name: 'Hot Steaming Momos - Shimla Street Food.jpg',
    mimeType: 'image/jpeg',
    size: 1500000,
    createdTime: '2026-01-13T19:15:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    viewLink: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1600&q=90',
    downloadLink: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1600&q=90',
  },
  {
    id: 'mock-img-7',
    name: 'Shimla Mall Road Evening Lights.jpg',
    mimeType: 'image/jpeg',
    size: 3400000,
    createdTime: '2026-01-14T18:45:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=400&q=80',
    viewLink: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1600&q=90',
    downloadLink: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1600&q=90',
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId') || process.env.NEXT_PUBLIC_DEFAULT_FOLDER_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  // If there's no API Key config, or no folder ID, return mock Shimla data so user gets a working preview
  if (!apiKey || !folderId) {
    return NextResponse.json({
      files: MOCK_FILES,
      isMock: true,
      error: !apiKey ? 'GOOGLE_API_KEY env variable is missing.' : 'Folder ID is missing.'
    });
  }

  try {
    // 1. Fetch any subfolders directly inside the root folder
    const subfolderQuery = `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents and trashed = false`;
    const subfolderUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(subfolderQuery)}&fields=files(id)&key=${apiKey}&pageSize=100`;
    
    let parentIds = [folderId];
    try {
      const subfolderRes = await fetch(subfolderUrl);
      if (subfolderRes.ok) {
        const subfolderData = await subfolderRes.json();
        const subfolders = subfolderData.files || [];
        parentIds = [folderId, ...subfolders.map((f: any) => f.id)];
      }
    } catch (err) {
      console.error('Failed to fetch subfolders, falling back to root folder only:', err);
    }

    // 2. Query all images and videos belonging to any of these parent folders in parallel
    const fetchPromises = parentIds.map(async (pId) => {
      const q = `'${pId}' in parents and trashed = false and (mimeType starts with 'image/' or mimeType starts with 'video/')`;
      const fields = 'files(id, name, mimeType, size, createdTime, videoMediaMetadata(durationMillis))';
      const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&key=${apiKey}&pageSize=1000`;
      
      const res = await fetch(driveUrl);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Google API error for folder ${pId}: ${res.statusText || res.status}. Details: ${JSON.stringify(errData)}`);
      }
      const data = await res.json();
      return data.files || [];
    });

    const results = await Promise.all(fetchPromises);
    const driveFiles = results.flat();

    const mappedFiles: GalleryFile[] = driveFiles.map((file: any) => {
      const isVideo = file.mimeType.startsWith('video/');
      
      // Standardize duration for videos (Google Drive returns duration in milliseconds)
      let durationStr: string | undefined;
      if (isVideo && file.videoMediaMetadata?.durationMillis) {
        const totalSecs = Math.floor(file.videoMediaMetadata.durationMillis / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;
      }

      // Thumbnail links format: sz=w400 for standard previews, sz=w1600 for large previews.
      // For images, we can fetch high resolution thumbnails which bypass download and virus scanner warnings.
      // For videos, we use thumbnailLink as cover image and fall back to Google Drive's stream or preview interface.
      const thumbnailLink = `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`;
      const viewLink = isVideo 
        ? `https://drive.google.com/file/d/${file.id}/preview` // Use preview iframe for videos
        : `https://drive.google.com/thumbnail?id=${file.id}&sz=w1600`; // Use high-res thumbnail for images

      const downloadLink = `https://drive.google.com/uc?export=download&id=${file.id}`;

      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? parseInt(file.size, 10) : 0,
        createdTime: file.createdTime || new Date().toISOString(),
        thumbnailLink,
        viewLink,
        downloadLink,
        duration: durationStr,
      };
    });

    return NextResponse.json({
      files: mappedFiles,
      isMock: false
    });
  } catch (error: any) {
    console.error('Internal server error in gallery API:', error);
    return NextResponse.json({
      files: MOCK_FILES,
      isMock: true,
      error: `Internal server error: ${error.message || error}. Displaying mock trip photos instead.`
    });
  }
}
