import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';

// Read configuration from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/**
 * Checks whether Firebase configuration keys have been provided
 */
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'YOUR_FIREBASE_PROJECT_ID'
  );
};

// Initialize Firebase App singleton safely
let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (err) {
    console.error('Failed to initialize Firebase Auth:', err);
  }
}

/**
 * Sign in using Google OAuth Popup via Firebase
 * @returns {Promise<{ user: any, idToken: string }>}
 */
export const signInWithGooglePopup = async () => {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not yet configured. Please add your Firebase credentials to client/.env (see client/.env.example for details).'
    );
  }

  if (!auth) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }

  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();

  return {
    user: result.user,
    idToken,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL
  };
};

/**
 * Sign out of Firebase Auth
 */
export const signOutFirebase = async () => {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
  }
};

/**
 * Translate common Firebase Auth error codes to user-friendly messages
 */
export const mapFirebaseAuthError = (error) => {
  if (!error) return 'Google sign-in failed.';
  const code = error.code || '';
  const msg = error.message || '';

  if (code === 'auth/popup-closed-by-user') {
    return 'Sign-in cancelled. The Google sign-in window was closed.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Unauthorized domain: Ensure "localhost" is added to Authorized Domains in your Firebase Console (Authentication > Settings > Authorized domains).';
  }
  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup blocked by browser. Please enable popups for this site and try again.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google provider is not enabled. Enable "Google" under Firebase Console > Authentication > Sign-in method.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection issue. Please check your internet connection.';
  }

  return msg || 'Failed to authenticate with Google. Please try again.';
};

export { app, auth, googleProvider };
