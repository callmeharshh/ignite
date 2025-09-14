import { NextRequest, NextResponse } from 'next/server';
import {
  getYoutubeChannelIdFromUrl,
  searchYoutubeChannelId,
  getYoutubeStats,
  getGithubStars,
  getTwitterFollowers,
  getLinkedinSignal,
} from '@/lib/verification';

interface MentorVerificationRequest {
  name: string;
  bio: string;
  expertise: string;
  profilePicUrl: string;
  calendlyLink: string;
  youtubeChannelUrl: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  videoLinks: string[];
}

interface VerificationScore {
  youtube: number;
  github: number;
  twitter: number;
  linkedin: number;
  total: number;
}

interface VerificationBreakdown {
  youtube: {
    subscribers: number;
    score: number;
  };
  github: {
    stars: number;
    score: number;
  };
  twitter: {
    followers: number | null;
    score: number;
  };
  linkedin: {
    presence: number | null;
    score: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting mentor verification test (without database)...');

    // Parse and validate request body
    const body: MentorVerificationRequest = await request.json();
    console.log('📝 Received mentor data:', { name: body.name, expertise: body.expertise });

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, reason: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if at least one social link is provided
    const hasSocialLinks = body.youtubeChannelUrl || body.githubUrl || body.twitterUrl || body.linkedinUrl;
    if (!hasSocialLinks) {
      return NextResponse.json(
        { success: false, reason: 'At least one social media link is required' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');

    // Initialize verification breakdown
    const breakdown: VerificationBreakdown = {
      youtube: { subscribers: 0, score: 0 },
      github: { stars: 0, score: 0 },
      twitter: { followers: null, score: 0 },
      linkedin: { presence: null, score: 0 },
    };

    // YouTube verification
    let youtubeChannelId: string | null = null;
    let youtubeStats = null;

    if (body.youtubeChannelUrl) {
      console.log('📺 Processing YouTube channel...');
      
      // Try to extract channel ID from URL
      youtubeChannelId = getYoutubeChannelIdFromUrl(body.youtubeChannelUrl);
      
      // If extraction failed, try searching by name
      if (!youtubeChannelId) {
        console.log('🔍 Searching YouTube channel by name...');
        youtubeChannelId = await searchYoutubeChannelId(body.name);
      }

      if (youtubeChannelId) {
        console.log('✅ Found YouTube channel ID:', youtubeChannelId);
        youtubeStats = await getYoutubeStats(youtubeChannelId);
        
        if (youtubeStats) {
          breakdown.youtube.subscribers = youtubeStats.subscriberCount;
          breakdown.youtube.score = youtubeStats.subscriberCount >= 10000 ? 50 : 0;
          console.log(`📊 YouTube: ${youtubeStats.subscriberCount} subscribers, score: ${breakdown.youtube.score}`);
        }
      } else {
        console.log('❌ Could not find YouTube channel');
      }
    }

    // GitHub verification
    if (body.githubUrl) {
      console.log('💻 Processing GitHub profile...');
      const githubStars = await getGithubStars(body.githubUrl);
      breakdown.github.stars = githubStars;
      breakdown.github.score = githubStars >= 50 ? 20 : 0;
      console.log(`📊 GitHub: ${githubStars} total stars, score: ${breakdown.github.score}`);
    }

    // Twitter verification
    if (body.twitterUrl) {
      console.log('🐦 Processing Twitter profile...');
      const twitterFollowers = await getTwitterFollowers(body.twitterUrl);
      breakdown.twitter.followers = twitterFollowers;
      breakdown.twitter.score = twitterFollowers && twitterFollowers >= 3000 ? 20 : 0;
      console.log(`📊 Twitter: ${twitterFollowers || 0} followers, score: ${breakdown.twitter.score}`);
    }

    // LinkedIn verification
    if (body.linkedinUrl) {
      console.log('💼 Processing LinkedIn profile...');
      const linkedinPresence = await getLinkedinSignal(body.linkedinUrl);
      breakdown.linkedin.presence = linkedinPresence;
      breakdown.linkedin.score = linkedinPresence || 0;
      console.log(`📊 LinkedIn: presence score ${linkedinPresence || 0}, score: ${breakdown.linkedin.score}`);
    }

    // Calculate total score
    const totalScore = breakdown.youtube.score + breakdown.github.score + breakdown.twitter.score + breakdown.linkedin.score;
    console.log(`🎯 Total verification score: ${totalScore}`);

    const score: VerificationScore = {
      youtube: breakdown.youtube.score,
      github: breakdown.github.score,
      twitter: breakdown.twitter.score,
      linkedin: breakdown.linkedin.score,
      total: totalScore,
    };

    // Check if score meets threshold for auto-approval
    const threshold = 50;
    const isApproved = totalScore >= threshold;

    console.log(`🔍 Score ${totalScore} ${isApproved ? 'meets' : 'does not meet'} threshold of ${threshold}`);

    // Return verification results (without database insertion)
    return NextResponse.json({
      success: true,
      approved: isApproved,
      score,
      breakdown,
      threshold,
      message: isApproved 
        ? 'Mentor would be approved!' 
        : 'Mentor needs more social proof to be approved.',
      mentor: {
        name: body.name,
        bio: body.bio,
        expertise: body.expertise,
        profilePicUrl: body.profilePicUrl,
        calendlyLink: body.calendlyLink,
        youtubeChannelUrl: body.youtubeChannelUrl,
        youtubeSubscribers: breakdown.youtube.subscribers,
        githubUrl: body.githubUrl,
        githubStars: breakdown.github.stars,
        twitterUrl: body.twitterUrl,
        twitterFollowers: breakdown.twitter.followers,
        linkedinUrl: body.linkedinUrl,
        videoLinks: body.videoLinks,
      }
    });

  } catch (error) {
    console.error('💥 Verification process error:', error);
    return NextResponse.json(
      {
        success: false,
        reason: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

