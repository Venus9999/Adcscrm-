import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let appCheckInstance: AppCheck | null = null;
let isInitialized = false;

export function initFirebaseAppCheck(): AppCheck | null {
  if (isInitialized) return appCheckInstance;
  isInitialized = true;

  if (typeof window === 'undefined') return null;

  const enterpriseKey = (import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY as string | undefined)?.trim();
  const v3Key = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined)?.trim();
  const configKey = (firebaseConfig as Record<string, any>).recaptchaSiteKey?.trim();

  const siteKey = enterpriseKey || v3Key || configKey;

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
    return null;
  }

  try {
    const isV3 = !enterpriseKey && Boolean(v3Key);
    const provider = isV3 
      ? new ReCaptchaV3Provider(siteKey) 
      : new ReCaptchaEnterpriseProvider(siteKey);

    appCheckInstance = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });
    console.info(`[Firebase App Check] ${isV3 ? 'reCAPTCHA v3' : 'reCAPTCHA Enterprise'} initialized successfully.`);
    return appCheckInstance;
  } catch (error) {
    console.warn('[Firebase App Check] Notice during reCAPTCHA initialization (app will continue normally):', error);
    return null;
  }
}

export function getAppCheck(): AppCheck | null {
  if (!isInitialized) {
    return initFirebaseAppCheck();
  }
  return appCheckInstance;
}
