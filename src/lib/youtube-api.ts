const YOUTUBE_API_KEY = 'AIzaSyASZ-W8pzfHkyLIqRMDAE0DjzeTJ0ARB68';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: string;
  publishedAt: string;
  category: string;
  youtubeId: string;
  mentor: string;
}

export async function getIshanSharmaVideos(): Promise<YouTubeVideo[]> {
  try {
    // First, get the channel ID from the username
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=IshanSharma7390&key=${YOUTUBE_API_KEY}`
    );
    
    if (!channelResponse.ok) {
      throw new Error('Failed to fetch channel');
    }
    
    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      // Fallback: try to get channel by search
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=IshanSharma7390&key=${YOUTUBE_API_KEY}`
      );
      
      if (!searchResponse.ok) {
        throw new Error('Failed to search channel');
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        throw new Error('Channel not found');
      }
      
      const channelId = searchData.items[0].snippet.channelId;
      
      // Now get videos from this channel
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=6&key=${YOUTUBE_API_KEY}`
      );
      
      if (!videosResponse.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const videosData = await videosResponse.json();
      
      return videosData.items.map((item: any, index: number) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description.substring(0, 150) + '...',
        thumbnail: item.snippet.thumbnails.high.url,
        duration: '15:30', // YouTube API doesn't provide duration in search results
        views: '10K', // Placeholder - would need video details API for real views
        publishedAt: formatPublishedAt(item.snippet.publishedAt),
        category: getCategoryFromTitle(item.snippet.title),
        youtubeId: item.id.videoId,
        mentor: 'Ishan Sharma'
      }));
    }
    
    const channelId = channelData.items[0].id;
    
    // Get videos from the channel
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=6&key=${YOUTUBE_API_KEY}`
    );
    
    if (!videosResponse.ok) {
      throw new Error('Failed to fetch videos');
    }
    
    const videosData = await videosResponse.json();
    
    return videosData.items.map((item: any, index: number) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description.substring(0, 150) + '...',
      thumbnail: item.snippet.thumbnails.high.url,
      duration: '15:30', // YouTube API doesn't provide duration in search results
      views: '10K', // Placeholder - would need video details API for real views
      publishedAt: formatPublishedAt(item.snippet.publishedAt),
      category: getCategoryFromTitle(item.snippet.title),
      youtubeId: item.id.videoId,
      mentor: 'Ishan Sharma'
    }));
    
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    // Return fallback videos if API fails
    return getFallbackVideos();
  }
}

function formatPublishedAt(publishedAt: string): string {
  const date = new Date(publishedAt);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function getCategoryFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('ai') || titleLower.includes('agent') || titleLower.includes('artificial intelligence')) {
    return 'AI Agents';
  }
  if (titleLower.includes('startup') || titleLower.includes('business') || titleLower.includes('entrepreneur')) {
    return 'Startup Strategy';
  }
  if (titleLower.includes('career') || titleLower.includes('job') || titleLower.includes('interview')) {
    return 'Career Growth';
  }
  if (titleLower.includes('leadership') || titleLower.includes('team') || titleLower.includes('management')) {
    return 'Tech Leadership';
  }
  if (titleLower.includes('product') || titleLower.includes('feature') || titleLower.includes('development')) {
    return 'Product Management';
  }
  
  return 'Tech Leadership'; // Default category
}

function getFallbackVideos(): YouTubeVideo[] {
  return [
    {
      id: '1',
      title: 'How to Build AI Agents That Actually Work - Complete Guide 2024',
      description: 'Learn the fundamentals of building AI agents that can automate complex tasks. From basic concepts to advanced implementations.',
      thumbnail: 'https://img.youtube.com/vi/8Xwq35cPwYg/maxresdefault.jpg',
      duration: '15:32',
      views: '125K',
      publishedAt: '2 weeks ago',
      category: 'AI Agents',
      youtubeId: '8Xwq35cPwYg',
      mentor: 'Ishan Sharma'
    },
    {
      id: '2',
      title: 'Startup Strategy: From Idea to $1M Revenue in 12 Months',
      description: 'Real strategies from building multiple startups. Learn how to validate ideas, find product-market fit, and scale efficiently.',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      duration: '22:18',
      views: '89K',
      publishedAt: '1 month ago',
      category: 'Startup Strategy',
      youtubeId: '9bZkp7q19f0',
      mentor: 'Ishan Sharma'
    },
    {
      id: '3',
      title: 'Career Growth: How to Land Your Dream Tech Job in 2024',
      description: 'Complete roadmap for transitioning into tech. Resume tips, interview prep, and networking strategies that actually work.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '18:45',
      views: '156K',
      publishedAt: '3 weeks ago',
      category: 'Career Growth',
      youtubeId: 'dQw4w9WgXcQ',
      mentor: 'Ishan Sharma'
    },
    {
      id: '4',
      title: 'Tech Leadership: Managing Remote Teams Like a Pro',
      description: 'Essential skills for tech leaders. Learn how to build, manage, and scale remote development teams effectively.',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      duration: '20:12',
      views: '67K',
      publishedAt: '1 week ago',
      category: 'Tech Leadership',
      youtubeId: 'jNQXAC9IVRw',
      mentor: 'Ishan Sharma'
    },
    {
      id: '5',
      title: 'AI Agents in Production: Real-World Case Studies',
      description: 'Deep dive into production AI agents. Learn from real implementations and avoid common pitfalls.',
      thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg',
      duration: '25:30',
      views: '43K',
      publishedAt: '5 days ago',
      category: 'AI Agents',
      youtubeId: 'M7lc1UVf-VE',
      mentor: 'Ishan Sharma'
    },
    {
      id: '6',
      title: 'Product Management: Building Features Users Actually Want',
      description: 'Master the art of product management. Learn how to prioritize features, conduct user research, and drive product growth.',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      duration: '19:55',
      views: '78K',
      publishedAt: '2 weeks ago',
      category: 'Product Management',
      youtubeId: '9bZkp7q19f0',
      mentor: 'Ishan Sharma'
    }
  ];
}
