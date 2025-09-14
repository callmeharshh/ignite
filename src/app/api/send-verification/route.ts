import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log('📧 Email credentials not configured. Using fallback mode.');
      console.log('🔐 ===========================================');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Verification Code: ${code}`);
      console.log('🔐 ===========================================');
      console.log('💡 Copy this code and paste it in the app!');
      return true; // Return true for testing without email setup
    }

    // Create transporter (using Gmail SMTP)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🚀 Ignite - Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 40px; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="background: linear-gradient(45deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;">
              Ignite
            </h1>
            <p style="color: #94a3b8; font-size: 18px; margin: 10px 0 0 0;">Level up skills. Redefine college.</p>
          </div>
          
          <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 15px; padding: 30px; margin: 30px 0;">
            <h2 style="color: #3b82f6; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
              🔐 Your Verification Code
            </h2>
            <div style="background: #1e293b; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #3b82f6; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            <p style="color: #94a3b8; text-align: center; margin: 20px 0 0 0; font-size: 16px;">
              Enter this code in the app to verify your email and start your learning journey!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This code will expire in 10 minutes for security reasons.
            </p>
            <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.log('💡 Make sure you have:');
    console.log('   1. Created .env.local file');
    console.log('   2. Set EMAIL_USER and EMAIL_APP_PASSWORD');
    console.log('   3. Enabled 2FA and generated App Password');
    console.log('   4. Restarted the server');
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Store code in memory (in production, use Redis or database)
    const verificationData = {
      email,
      code: verificationCode,
      timestamp: Date.now(),
      attempts: 0,
    };
    
    // Store in a simple in-memory store (replace with Redis in production)
    if (!global.verificationCodes) {
      global.verificationCodes = new Map();
    }
    global.verificationCodes.set(email, verificationData);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent to your email',
      expiresIn: 600 // 10 minutes
    });

  } catch (error) {
    console.error('Error in send-verification:', error);
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
