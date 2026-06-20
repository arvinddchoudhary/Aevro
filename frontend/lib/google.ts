const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  prompt: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

export function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google login can only load in the browser.'));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Google login.'));
    document.body.appendChild(script);
  });

  return googleScriptPromise;
}

export async function requestGoogleIdToken(clientId: string) {
  await loadGoogleIdentityScript();

  return new Promise<string>((resolve, reject) => {
    const googleId = window.google?.accounts?.id;

    if (!googleId) {
      reject(new Error('Google login is not available.'));
      return;
    }

    googleId.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          resolve(response.credential);
          return;
        }

        reject(new Error('Google did not return an ID token.'));
      },
    });
    googleId.prompt();
  });
}
