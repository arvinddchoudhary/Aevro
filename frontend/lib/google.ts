const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      type: 'standard';
      theme: 'outline';
      size: 'large';
      text: 'continue_with';
      shape: 'rectangular';
      width: number;
      logo_alignment: 'left';
    },
  ) => void;
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

export async function renderGoogleSignInButton({
  clientId,
  container,
  onCredential,
}: {
  clientId: string;
  container: HTMLElement;
  onCredential: (idToken: string) => void;
}) {
  await loadGoogleIdentityScript();

  const googleId = window.google?.accounts?.id;

  if (!googleId) {
    throw new Error('Google login is not available.');
  }

  googleId.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response.credential) {
        onCredential(response.credential);
      }
    },
  });

  container.replaceChildren();
  googleId.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    width: Math.max(280, Math.floor(container.getBoundingClientRect().width)),
    logo_alignment: 'left',
  });
}
