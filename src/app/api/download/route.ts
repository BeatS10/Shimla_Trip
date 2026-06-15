import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');
  const isVideo = searchParams.get('isVideo') === 'true';
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!fileId) {
    return new NextResponse('File ID is required', { status: 400 });
  }

  // If no API key is set, we are in mock mode. We shouldn't need this proxy since
  // mock Unsplash images and Mixkit videos have CORS headers enabled by default.
  if (!apiKey) {
    return new NextResponse('API Key is missing', { status: 400 });
  }

  try {
    // For images, we fetch the high-res thumbnail (sz=w1600).
    // This is extremely fast, avoids virus warnings, and stays safely under Vercel's 4.5MB payload limit.
    // For videos, we fetch the Google Drive download URL. Note that if a video is larger than 4.5MB,
    // Vercel serverless functions will throw a payload size limit error. We handle this in the client.
    const driveUrl = isVideo
      ? `https://drive.google.com/uc?export=download&id=${fileId}&key=${apiKey}`
      : `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;

    const response = await fetch(driveUrl);

    if (!response.ok) {
      console.error(`Error downloading file ${fileId} from Drive:`, response.statusText);
      return new NextResponse(`Drive download failed: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = await response.blob();

    // Return the file stream with CORS headers enabled so JSZip can read it in the browser
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': `attachment; filename="drive-file-${fileId}"`,
      },
    });
  } catch (error: any) {
    console.error('Error in download proxy:', error);
    return new NextResponse(`Download proxy error: ${error.message || error}`, { status: 500 });
  }
}
