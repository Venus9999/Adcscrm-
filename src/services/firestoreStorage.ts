import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Firestore,
  serverTimestamp,
  getDocFromServer,
  enableIndexedDbPersistence,
  disableNetwork,
  enableNetwork,
  setLogLevel,
} from 'firebase/firestore';
import { getApps, initializeApp, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress verbose SDK logs for expected network limits
try {
  setLogLevel('silent');
} catch {}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestoreDbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId || undefined;
export const db: Firestore = getFirestore(app, firestoreDbId);

const QUOTA_COOLDOWN_KEY = 'crm_firestore_quota_until';

export function isFirestoreQuotaExhausted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const rawUntil = localStorage.getItem(QUOTA_COOLDOWN_KEY);
    if (!rawUntil) {
      if ((window as any).__firestore_quota_exhausted) return true;
      return false;
    }
    const until = parseInt(rawUntil, 10);
    if (isNaN(until) || Date.now() > until) {
      localStorage.removeItem(QUOTA_COOLDOWN_KEY);
      (window as any).__firestore_quota_exhausted = false;
      enableNetwork(db).catch(() => {});
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function markQuotaExhausted(cooldownMs: number = 30000) {
  if (typeof window === 'undefined') return;
  try {
    (window as any).__firestore_quota_exhausted = true;
    const until = Date.now() + cooldownMs;
    localStorage.setItem(QUOTA_COOLDOWN_KEY, String(until));
    disableNetwork(db).catch(() => {});
  } catch {}
}

export function clearQuotaExhausted() {
  if (typeof window === 'undefined') return;
  try {
    (window as any).__firestore_quota_exhausted = false;
    localStorage.removeItem(QUOTA_COOLDOWN_KEY);
    enableNetwork(db).catch(() => {});
  } catch {}
}

// Flag indicating if cloud storage is configured and ready
export function isCloudAvailable(): boolean {
  return Boolean(firebaseConfig?.projectId && firebaseConfig?.apiKey);
}

// Check initial quota status & enable network persistence
if (typeof window !== 'undefined') {
  // Clear any historical long-term quota locks to ensure live domain can sync
  const rawUntil = localStorage.getItem(QUOTA_COOLDOWN_KEY);
  if (rawUntil) {
    const until = parseInt(rawUntil, 10);
    if (isNaN(until) || Date.now() > until || until - Date.now() > 3600000) {
      localStorage.removeItem(QUOTA_COOLDOWN_KEY);
    }
  }

  if (isFirestoreQuotaExhausted()) {
    disableNetwork(db).catch(() => {});
  } else {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
        // Benign multiple tabs or browser unsupported notice
      } else if (err.code === 'resource-exhausted' || err.message?.includes('Quota limit')) {
        markQuotaExhausted(30000);
      }
    });
  }
}

const CRM_COLLECTION = 'crm_system';
const CRM_STORE_DOC = 'enterprise_store';
const CRM_META_DOC = 'store_meta';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  timestamp: string;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isQuota =
    errMsg.includes('resource-exhausted') ||
    errMsg.includes('Quota limit exceeded') ||
    errMsg.includes('Free daily write units') ||
    errMsg.includes('quota') ||
    (error as any)?.code === 'resource-exhausted';

  if (isQuota) {
    markQuotaExhausted(30000); // 30s brief cooldown instead of 24h
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    operationType,
    path,
    timestamp: new Date().toISOString(),
  };
  console.warn('[Firestore Operation Notice]', JSON.stringify(errInfo));
}

// Test connectivity on initialization
export async function testFirestoreConnection(): Promise<{ connected: boolean; databaseId: string; projectId: string; quotaExhausted?: boolean }> {
  const info = {
    connected: false,
    databaseId: (firebaseConfig as Record<string, any>).firestoreDatabaseId || '(default)',
    projectId: firebaseConfig.projectId || '',
    quotaExhausted: isFirestoreQuotaExhausted(),
  };

  if (isFirestoreQuotaExhausted()) {
    return info;
  }

  try {
    const testDoc = doc(db, CRM_COLLECTION, CRM_STORE_DOC);
    await getDocFromServer(testDoc).catch((err) => {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit')) {
        markQuotaExhausted(30000);
        info.quotaExhausted = true;
      }
    });
    if (!isFirestoreQuotaExhausted()) {
      info.connected = true;
    }
    return info;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit')) {
      markQuotaExhausted(30000);
      info.quotaExhausted = true;
    }
    return info;
  }
}

/**
 * Load complete CRM database snapshot from Cloud Firestore
 * Reads the unified enterprise_store document (1 single read unit for ultra efficiency)
 */
export async function loadCRMDataFromCloud(): Promise<{ success: boolean; data: any; hasData: boolean }> {
  if (isFirestoreQuotaExhausted()) {
    return { success: true, data: null, hasData: false };
  }

  try {
    // 1. Read primary enterprise store document (1 read unit)
    const storeRef = doc(db, CRM_COLLECTION, CRM_STORE_DOC);
    const storeSnap = await getDoc(storeRef).catch((e) => {
      handleFirestoreError(e, OperationType.GET, CRM_STORE_DOC);
      return null;
    });

    if (storeSnap && storeSnap.exists()) {
      const data = storeSnap.data();
      if (data && data.payload) {
        return { success: true, data: data.payload, hasData: true };
      }
    }

    // 2. Legacy fallback to meta partition if enterprise_store was not yet initialized
    const metaRef = doc(db, CRM_COLLECTION, CRM_META_DOC);
    const metaSnap = await getDoc(metaRef).catch((e) => {
      handleFirestoreError(e, OperationType.GET, CRM_META_DOC);
      return null;
    });

    if (metaSnap && metaSnap.exists()) {
      const metaData = metaSnap.data() || {};
      const clientsRef = doc(db, CRM_COLLECTION, 'clients_data');
      const leadsRef = doc(db, CRM_COLLECTION, 'leads_data');
      const usersRef = doc(db, CRM_COLLECTION, 'users_data');
      const settingsRef = doc(db, CRM_COLLECTION, 'settings_data');

      const [clientsSnap, leadsSnap, usersSnap, settingsSnap] = await Promise.all([
        getDoc(clientsRef).catch(() => null),
        getDoc(leadsRef).catch(() => null),
        getDoc(usersRef).catch(() => null),
        getDoc(settingsRef).catch(() => null),
      ]);

      const settingsData = settingsSnap?.exists() ? settingsSnap.data() : {};
      const reconstructed: any = {
        lastUpdated: metaData.lastUpdated || new Date().toISOString(),
        hasCustomModifications: metaData.hasCustomModifications ?? true,
        currentUserId: metaData.currentUserId || 'user-master',
        clients: clientsSnap?.exists() ? clientsSnap.data()?.clients || [] : [],
        leads: leadsSnap?.exists() ? leadsSnap.data()?.leads || [] : [],
        users: usersSnap?.exists() ? usersSnap.data()?.users || [] : [],
        roles: settingsData.roles || [],
        stages: settingsData.stages || [],
        workflows: settingsData.workflows || [],
        serviceCategories: settingsData.serviceCategories || [],
        vendors: settingsData.vendors || [],
        leadCategories: settingsData.leadCategories || [],
        leadSources: settingsData.leadSources || [],
        leadStages: settingsData.leadStages || [],
        crmBranding: settingsData.crmBranding,
        billingSettings: settingsData.billingSettings,
      };

      return { success: true, data: reconstructed, hasData: true };
    }

    return { success: true, data: null, hasData: false };
  } catch (error: any) {
    handleFirestoreError(error, OperationType.GET, `${CRM_COLLECTION}`);
    return { success: false, data: null, hasData: false };
  }
}

/**
 * Save complete CRM database snapshot to Cloud Firestore.
 * Saves in 1 single unified document to minimize write operations by 90%+.
 */
let lastCloudSaveTime = 0;
const CLOUD_SAVE_THROTTLE_MS = 2500; // Save at most every 2.5s for fast multi-device responsiveness

export async function saveCRMDataToCloud(payload: any, force: boolean = false): Promise<boolean> {
  if (isFirestoreQuotaExhausted()) {
    return false;
  }

  const now = Date.now();
  if (!force && now - lastCloudSaveTime < CLOUD_SAVE_THROTTLE_MS) {
    return true; // Throttled successfully to protect daily write units
  }

  try {
    if (!payload || typeof payload !== 'object') return false;

    const nowIso = new Date().toISOString();

    // 1. Single unified store document containing the entire payload (1 write unit)
    const storeDoc = {
      version: '3.1',
      lastUpdated: payload.lastUpdated || nowIso,
      updatedAt: serverTimestamp(),
      payload: payload,
    };

    const storeRef = doc(db, CRM_COLLECTION, CRM_STORE_DOC);
    await setDoc(storeRef, storeDoc, { merge: true });

    lastCloudSaveTime = Date.now();
    return true;
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, `${CRM_COLLECTION}/${CRM_STORE_DOC}`);
    return false;
  }
}

/**
 * Real-time subscription to cloud CRM updates across multiple devices/tabs and domains
 */
export function subscribeToCloudCRMData(
  onData: (data: any) => void,
  onError?: (err: any) => void
): () => void {
  if (isFirestoreQuotaExhausted()) {
    return () => {};
  }

  try {
    const storeRef = doc(db, CRM_COLLECTION, CRM_STORE_DOC);
    let isInitial = true;

    const unsubscribe = onSnapshot(
      storeRef,
      (docSnap) => {
        if (isInitial) {
          isInitial = false;
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data.payload) {
              onData(data.payload);
            }
          }
          return;
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.payload) {
            onData(data.payload);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `${CRM_COLLECTION}/${CRM_STORE_DOC}`);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
}

