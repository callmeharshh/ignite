import { NextResponse } from 'next/server';
import { getIshanSharmaVideos } from '@/lib/youtube-api';

export async function GET() {
  try {
    const videos = await getIshanSharmaVideos();
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
