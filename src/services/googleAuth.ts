import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider for standard CRM Authentication (Email, Profile)
const basicLoginProvider = new GoogleAuthProvider();
basicLoginProvider.addScope('profile');
basicLoginProvider.addScope('email');
basicLoginProvider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedGoogleUser: FirebaseUser | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    cachedGoogleUser = user;
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, 'crm-google-session');
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Standard Google Sign-In for CRM Login (Email & Profile - No restricted Gmail API required)
export const signInWithGoogleAccount = async (): Promise<{ user: FirebaseUser } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, basicLoginProvider);
    cachedGoogleUser = result.user;
    return { user: result.user };
  } catch (error: any) {
    console.error('Google CRM Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Backwards-compatible Google sign-in without requiring restricted Gmail scopes
export const googleSignIn = async (): Promise<{ user: FirebaseUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, basicLoginProvider);
    cachedGoogleUser = result.user;
    cachedAccessToken = 'crm-session-token';
    return { user: result.user, accessToken: 'crm-session-token' };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCachedGoogleUser = (): FirebaseUser | null => {
  return cachedGoogleUser;
};

export const logoutGoogle = async (): Promise<void> => {
  await auth.signOut();
  cachedAccessToken = null;
  cachedGoogleUser = null;
};
