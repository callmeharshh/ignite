import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // Check if verification codes exist
    if (!global.verificationCodes) {
      return NextResponse.json({ error: 'No verification codes found' }, { status: 400 });
    }

    const verificationData = global.verificationCodes.get(email);
    
    if (!verificationData) {
      return NextResponse.json({ error: 'No verification code found for this email' }, { status: 400 });
    }

    // Check if code has expired (10 minutes)
    const now = Date.now();
    const codeAge = now - verificationData.timestamp;
    const tenMinutes = 10 * 60 * 1000;

    if (codeAge > tenMinutes) {
      global.verificationCodes.delete(email);
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Check attempt limit (max 5 attempts)
    if (verificationData.attempts >= 5) {
      global.verificationCodes.delete(email);
      return NextResponse.json({ error: 'Too many failed attempts. Please request a new code.' }, { status: 400 });
    }

    // Verify the code
    if (verificationData.code !== code) {
      verificationData.attempts += 1;
      global.verificationCodes.set(email, verificationData);
      
      return NextResponse.json({ 
        error: 'Invalid verification code',
        attemptsLeft: 5 - verificationData.attempts
      }, { status: 400 });
    }

    // Code is valid - create user session
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email,
      name: email.split('@')[0], // Use email prefix as name
      verified: true,
      loginTime: new Date().toISOString(),
    };

    // Clean up verification data
    global.verificationCodes.delete(email);

    return NextResponse.json({ 
      success: true, 
      user,
      message: 'Email verified successfully!'
    });

  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Declare global types
declare global {
  var verificationCodes: Map<string, {
    email: string;
    code: string;
    timestamp: number;
    attempts: number;
  }>;
}

