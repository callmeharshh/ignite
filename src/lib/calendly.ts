/**
 * Calendly integration helper functions
 */

export const connectCalendly = () => {
  const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error('Missing Calendly environment variables');
    return;
  }

  const calendlyAuthUrl = `https://auth.calendly.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  console.log('🔗 Redirecting to Calendly OAuth...');
  window.location.href = calendlyAuthUrl;
};

export const getCalendlyAuthUrl = (): string => {
  const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('Missing Calendly environment variables');
  }

  return `https://auth.calendly.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
};

