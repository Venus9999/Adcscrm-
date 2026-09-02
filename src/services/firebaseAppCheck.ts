import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let appCheckInstance: AppCheck | null = null;
let isInitialized = false;

export function initFirebaseAppCheck(): AppCheck | null {
  if (isInitialized) return appCheckInstance;
  isInitialized = true;

  if (typeof window === 'undefined') return null;

  const siteKey =
    (import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY as string | undefined)?.trim() ||
    (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined)?.trim() ||
    (firebaseConfig as Record<string, any>).recaptchaSiteKey?.trim();

  // In development mode or if a debug token is provided in env, enable Firebase App Check debug token
  const debugToken =
    (import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN as string | undefined)?.trim() ||
    (import.meta.env.DEV ? true : undefined);

  if (debugToken !== undefined) {
    try {
      // @ts-expect-error Firebase App Check global debug token flag
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === 'true' ? true : debugToken;
    } catch {
      // Ignore if self is inaccessible
    }
  }

  if (!siteKey) {
    if (import.meta.env.DEV) {
      console.info(
        '[Firebase App Check] reCAPTCHA Enterprise site key is not configured. Set VITE_RECAPTCHA_ENTERPRISE_SITE_KEY in your environment to activate App Check on production.'
      );
    }
    return null;
  }

  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    console.info('[Firebase App Check] reCAPTCHA Enterprise successfully initialized for web.');
    return appCheckInstance;
  } catch (error) {
    console.warn('[Firebase App Check] Notice during reCAPTCHA Enterprise initialization:', error);
    return null;
  }
}

export function getAppCheck(): AppCheck | null {
  if (!isInitialized) {
    return initFirebaseAppCheck();
  }
  return appCheckInstance;
}
