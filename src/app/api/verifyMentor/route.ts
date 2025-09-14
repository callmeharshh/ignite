import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  getYoutubeChannelIdFromUrl,
  searchYoutubeChannelId,
  getYoutubeStats,
  getGithubStars,
  getTwitterFollowers,
  getLinkedinSignal,
} from '@/lib/verification';
import { getCalendlyAuthUrl } from '@/lib/calendly';

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
  connectCalendly?: boolean; // Optional flag to trigger Calendly OAuth
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
    console.log('🚀 Starting mentor verification process...');

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

    // Check required environment variables
    const missingEnvVars = [];
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingEnvVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingEnvVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingEnvVars.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!process.env.YOUTUBE_API_KEY) missingEnvVars.push('YOUTUBE_API_KEY');

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          reason: 'Missing required environment variables', 
          missing: missingEnvVars 
        },
        { status: 500 }
      );
    }

    console.log('✅ Environment variables validated');

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
    const threshold = 50; // Adjusted since we removed Instagram (was 60)
    const isApproved = totalScore >= threshold;

    console.log(`🔍 Score ${totalScore} ${isApproved ? 'meets' : 'does not meet'} threshold of ${threshold}`);

    if (isApproved) {
      console.log('✅ Mentor approved! Inserting into database...');

      // Insert mentor into Supabase
      const mentorData = {
        name: body.name,
        bio: body.bio,
        expertise: body.expertise,
        profile_pic: body.profilePicUrl,
        calendly_link: body.calendlyLink,
        youtube_channel_url: body.youtubeChannelUrl,
        youtube_subscribers: breakdown.youtube.subscribers,
        github_url: body.githubUrl,
        github_stars: breakdown.github.stars,
        twitter_url: body.twitterUrl,
        twitter_followers: breakdown.twitter.followers,
        linkedin_url: body.linkedinUrl,
        video_links: body.videoLinks,
        is_verified: true,
        verification_score: totalScore,
        created_at: new Date().toISOString(),
        // Calendly fields will be populated when OAuth is completed
        calendly_access_token: null,
        calendly_refresh_token: null,
        calendly_user: null,
        calendly_connected_at: null,
        calendly_token_expires_at: null,
      };

      const { data: mentor, error } = await supabaseAdmin
        .from('mentors')
        .insert([mentorData])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        return NextResponse.json(
          { 
            success: false, 
            reason: 'Database error', 
            error: error.message 
          },
          { status: 500 }
        );
      }

      console.log('🎉 Mentor successfully added to database!');
      return NextResponse.json({
        success: true,
        mentor,
        score,
        breakdown,
        calendly_auth_url: body.connectCalendly ? getCalendlyAuthUrl() : null,
      });
    } else {
      console.log('❌ Mentor not approved - score too low');
      return NextResponse.json(
        {
          success: false,
          reason: 'Score too low',
          score: totalScore,
          breakdown,
          threshold,
        },
        { status: 403 }
      );
    }
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
