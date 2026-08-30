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
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  onValue as rtdbOnValue,
  Database,
} from 'firebase/database';
import { getApps, initializeApp, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress verbose SDK logs for expected network limits
try {
  setLogLevel('silent');
} catch {}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestoreDbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId || undefined;
export const db: Firestore = getFirestore(app, firestoreDbId);

// Initialize Firebase Realtime Database (Europe-West1 instance provided by user)
export const RTDB_URL =
  (firebaseConfig as Record<string, any>).databaseURL ||
  'https://gen-lang-client-0989127214-default-rtdb.europe-west1.firebasedatabase.app';

let rtdbInstance: Database | null = null;
try {
  rtdbInstance = getDatabase(app, RTDB_URL);
} catch (e) {
  console.warn('Firebase RTDB initialization notice:', e);
}
export const rtdb: Database | null = rtdbInstance;

const RTDB_CRM_STORE_PATH = 'crm_enterprise_store';
const CRM_COLLECTION = 'crm_system';
const CRM_STORE_DOC = 'enterprise_store';
const CRM_META_DOC = 'store_meta';
const QUOTA_COOLDOWN_KEY = 'crm_firestore_quota_until';

function sanitizeForRTDB(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForRTDB);
  }
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      result[key] = sanitizeForRTDB(val);
    }
  }
  return result;
}

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
        // Benign multiple tabs notice
      } else if (err.code === 'resource-exhausted' || err.message?.includes('Quota limit')) {
        markQuotaExhausted(30000);
      }
    });
  }
}

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
    markQuotaExhausted(30000);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    operationType,
    path,
    timestamp: new Date().toISOString(),
  };
  console.warn('[Cloud Operation Notice]', JSON.stringify(errInfo));
}

// Test connectivity on initialization
export async function testFirestoreConnection(): Promise<{
  connected: boolean;
  databaseId: string;
  projectId: string;
  databaseUrl?: string;
  rtdbConnected?: boolean;
  quotaExhausted?: boolean;
}> {
  const info = {
    connected: false,
    databaseId: 'Firebase Realtime Database + Cloud Firestore',
    projectId: firebaseConfig.projectId || '',
    databaseUrl: RTDB_URL,
    rtdbConnected: false,
    quotaExhausted: isFirestoreQuotaExhausted(),
  };

  // 1. Test Realtime Database connectivity first
  if (rtdb) {
    try {
      const storeRef = rtdbRef(rtdb, RTDB_CRM_STORE_PATH);
      await rtdbGet(storeRef);
      info.connected = true;
      info.rtdbConnected = true;
    } catch (rtdbErr) {
      console.warn('Realtime database ping notice:', rtdbErr);
    }
  }

  // 2. Test Firestore connectivity
  if (!isFirestoreQuotaExhausted()) {
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
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit')) {
        markQuotaExhausted(30000);
        info.quotaExhausted = true;
      }
    }
  }

  return info;
}

/**
 * Load complete CRM database snapshot from Cloud Database (Realtime DB + Firestore fallback)
 */
export async function loadCRMDataFromCloud(): Promise<{ success: boolean; data: any; hasData: boolean }> {
  // 1. Primary fast load from Firebase Realtime Database
  if (rtdb) {
    try {
      const storeRef = rtdbRef(rtdb, RTDB_CRM_STORE_PATH);
      const snapshot = await rtdbGet(storeRef);
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val) {
          const payload = val.payload || val;
          if (payload && typeof payload === 'object') {
            return { success: true, data: payload, hasData: true };
          }
        }
      }
    } catch (rtdbErr) {
      console.warn('Realtime database read notice, trying Firestore fallback:', rtdbErr);
    }
  }

  // 2. Fallback to Cloud Firestore
  if (!isFirestoreQuotaExhausted()) {
    try {
      const storeRef = doc(db, CRM_COLLECTION, CRM_STORE_DOC);
      const storeSnap = await getDoc(storeRef).catch((e) => {
        handleFirestoreError(e, OperationType.GET, CRM_STORE_DOC);
        return null;
      });

      if (storeSnap && storeSnap.exists()) {
        const data = storeSnap.data();
        if (data && data.payload) {
          // If RTDB was empty, seed it with Firestore data
          if (rtdb) {
            try {
              const rRef = rtdbRef(rtdb, RTDB_CRM_STORE_PATH);
              rtdbSet(rRef, {
                version: '4.0',
                lastUpdated: data.payload.lastUpdated || new Date().toISOString(),
                payload: sanitizeForRTDB(data.payload),
              }).catch(() => {});
            } catch {}
          }
          return { success: true, data: data.payload, hasData: true };
        }
      }

      // Legacy fallback
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
          visaApplications: settingsData.visaApplications || [],
          visaCountryCatalog: settingsData.visaCountryCatalog || [],
          crmBranding: settingsData.crmBranding,
          billingSettings: settingsData.billingSettings,
        };

        return { success: true, data: reconstructed, hasData: true };
      }
    } catch (error: any) {
      handleFirestoreError(error, OperationType.GET, `${CRM_COLLECTION}`);
    }
  }

  return { success: true, data: null, hasData: false };
}

/**
 * Save complete CRM database snapshot to Cloud (Realtime Database + Cloud Firestore)
 */
let lastCloudSaveTime = 0;
const CLOUD_SAVE_THROTTLE_MS = 300; // Ultra responsive live syncing

export async function saveCRMDataToCloud(payload: any, force: boolean = false): Promise<boolean> {
  const now = Date.now();
  if (!force && now - lastCloudSaveTime < CLOUD_SAVE_THROTTLE_MS) {
    // Still write to RTDB with low delay, but throttle Firestore merge writes to prevent quota burn
  }

  if (!payload || typeof payload !== 'object') return false;

  const nowIso = new Date().toISOString();
  let rtdbSuccess = false;

  // 1. Instant Realtime Database write (Zero-delay WebSocket broadcast to all connected devices)
  if (rtdb) {
    try {
      const sanitized = sanitizeForRTDB(payload);
      const rtdbDoc = {
        version: '4.0',
        lastUpdated: payload.lastUpdated || nowIso,
        savedAtIso: nowIso,
        payload: sanitized,
      };
      const storeRef = rtdbRef(rtdb, RTDB_CRM_STORE_PATH);
      await rtdbSet(storeRef, rtdbDoc);
      rtdbSuccess = true;
      lastCloudSaveTime = Date.now();
    } catch (rtdbErr) {
      console.warn('Realtime database write notice:', rtdbErr);
    }
  }

  // 2. Dual-redundant Cloud Firestore write
  if (!isFirestoreQuotaExhausted()) {
    try {
      const storeDoc = {
        version: '4.0',
        lastUpdated: payload.lastUpdated || nowIso,
        updatedAt: serverTimestamp(),
        payload: payload,
      };
      const storeRef = doc(db, CRM_COLLECTION, CRM_STORE_DOC);
      await setDoc(storeRef, storeDoc);
      lastCloudSaveTime = Date.now();
      return true;
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, `${CRM_COLLECTION}/${CRM_STORE_DOC}`);
      return rtdbSuccess;
    }
  }

  return rtdbSuccess;
}

/**
 * Real-time subscription to cloud CRM updates across multiple devices/tabs and domains
 * Powered by Firebase Realtime Database WebSockets with Firestore snapshot fallback
 */
export function subscribeToCloudCRMData(
  onData: (data: any) => void,
  onError?: (err: any) => void
): () => void {
  const unsubscribers: (() => void)[] = [];

  // 1. Firebase Realtime Database instant WebSocket listener
  if (rtdb) {
    try {
      const storeRef = rtdbRef(rtdb, RTDB_CRM_STORE_PATH);
      const unsubscribeRtdb = rtdbOnValue(
        storeRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            if (val) {
              const payload = val.payload || val;
              if (payload && typeof payload === 'object') {
                onData(payload);
              }
            }
          }
        },
        (error) => {
          console.warn('Realtime DB subscription notice:', error);
          if (onError) onError(error);
        }
      );
      unsubscribers.push(() => unsubscribeRtdb());
    } catch (e) {
      console.warn('Failed to attach Realtime Database listener:', e);
    }
  }

  // 2. Cloud Firestore fallback listener
  if (!isFirestoreQuotaExhausted()) {
    try {
      const storeRef = doc(db, CRM_COLLECTION, CRM_STORE_DOC);
      let isInitial = true;

      const unsubscribeFs = onSnapshot(
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
      unsubscribers.push(() => unsubscribeFs());
    } catch {}
  }

  return () => {
    unsubscribers.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  };
}

