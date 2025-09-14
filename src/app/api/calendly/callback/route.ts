import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  try {
    console.log('🔄 Processing Calendly OAuth callback...');

    if (error) {
      console.error('❌ Calendly OAuth error:', error);
      return NextResponse.redirect(new URL('/mentor/dashboard?error=oauth_failed', request.url));
    }

    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.redirect(new URL('/mentor/dashboard?error=no_code', request.url));
    }

    // Check required environment variables
    if (!process.env.CALENDLY_CLIENT_ID || !process.env.CALENDLY_CLIENT_SECRET || !process.env.CALENDLY_REDIRECT_URI) {
      console.error('❌ Missing Calendly environment variables');
      return NextResponse.redirect(new URL('/mentor/dashboard?error=missing_config', request.url));
    }

    console.log('✅ Environment variables validated');

    // Exchange code for access token
    console.log('🔑 Exchanging authorization code for access token...');
    const tokenRes = await axios.post('https://auth.calendly.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.CALENDLY_CLIENT_ID,
      client_secret: process.env.CALENDLY_CLIENT_SECRET,
      redirect_uri: process.env.CALENDLY_REDIRECT_URI,
      code,
    });

    const { access_token, refresh_token, expires_in } = tokenRes.data;
    console.log('✅ Access token obtained');

    // Fetch user info from Calendly
    console.log('👤 Fetching Calendly user information...');
    const userRes = await axios.get('https://api.calendly.com/users/me', {
      headers: { 
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const calendlyUser = userRes.data.resource;
    console.log('✅ Calendly user info retrieved:', { 
      name: calendlyUser.name, 
      email: calendlyUser.email 
    });

    // Prepare mentor data for database update
    const mentorData = {
      calendly_access_token: access_token,
      calendly_refresh_token: refresh_token,
      calendly_user: calendlyUser,
      calendly_connected_at: new Date().toISOString(),
      calendly_token_expires_at: new Date(Date.now() + (expires_in * 1000)).toISOString(),
    };

    // Update mentor in Supabase (you'll need to identify which mentor to update)
    // For now, we'll log the data - in a real app, you'd store the mentor ID in session/state
    console.log('💾 Mentor Calendly data prepared:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      userEmail: calendlyUser.email,
    });

    // TODO: In a real implementation, you would:
    // 1. Get the mentor ID from session/state
    // 2. Update the specific mentor record in Supabase
    // 3. Store the tokens securely

    // For now, we'll just redirect to success
    return NextResponse.redirect(new URL('/mentor/dashboard?success=calendly_connected', request.url));

  } catch (err: any) {
    console.error('💥 Calendly OAuth callback error:', err.response?.data || err.message);
    
    const errorMessage = err.response?.data?.error_description || err.message || 'Unknown error';
    return NextResponse.redirect(new URL(`/mentor/dashboard?error=oauth_failed&details=${encodeURIComponent(errorMessage)}`, request.url));
  }
}

