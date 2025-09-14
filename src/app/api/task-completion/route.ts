import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      task_id, 
      task_name, 
      xp_earned, 
      total_xp, 
      level, 
      career_goal, 
      user_email 
    } = body;

    // Validate required fields
    if (!user_id || !task_id || !task_name || !xp_earned || !career_goal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Make.com webhook URL from environment variables
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    
    console.log('Environment variables:', {
      MAKE_WEBHOOK_URL: makeWebhookUrl,
      NODE_ENV: process.env.NODE_ENV
    });
    
    if (!makeWebhookUrl) {
      console.error('MAKE_WEBHOOK_URL not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Prepare data for Make.com webhook
    const webhookData = {
      user_id,
      task_id,
      task_name,
      xp_earned,
      total_xp,
      level,
      career_goal,
      user_email: user_email || 'noreply@ignite.com',
      completion_time: new Date().toISOString()
    };

    // Send data to Make.com webhook
    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      console.error('Make.com webhook failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to trigger notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Task completion notification sent successfully' 
    });

  } catch (error) {
    console.error('Error in task completion API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
