// Google OAuth configuration and utilities
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

// Load Google OAuth script
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: () => {}, // We'll handle this in components
        });
        resolve();
      } else {
        reject(new Error('Google script failed to load'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google script'));
    };
    
    document.head.appendChild(script);
  });
};

// Initialize Google OAuth
export const initializeGoogleAuth = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    await loadGoogleScript();
    
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: () => {}, // We'll handle this in components
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  } catch (error) {
    console.error('Failed to initialize Google Auth:', error);
  }
};

// Sign in with Google
export const signInWithGoogle = (): Promise<GoogleUser> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.google) {
      reject(new Error('Google Auth not initialized'));
      return;
    }

    window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: async (response: any) => {
        try {
          // Get user info from Google
          const userInfoResponse = await fetch(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`
          );
          
          if (!userInfoResponse.ok) {
            throw new Error('Failed to fetch user info');
          }
          
          const userInfo = await userInfoResponse.json();
          
          const googleUser: GoogleUser = {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            given_name: userInfo.given_name,
            family_name: userInfo.family_name,
          };
          
          resolve(googleUser);
        } catch (error) {
          reject(error);
        }
      },
    }).requestAccessToken();
  });
};

// Sign out
export const signOutFromGoogle = (): void => {
  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.disableAutoSelect();
  }
};

// Declare global Google types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

