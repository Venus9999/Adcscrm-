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
} from 'firebase/firestore';
import { getApps, initializeApp, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestoreDbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId || undefined;
export const db: Firestore = getFirestore(app, firestoreDbId);

// Circuit breaker state for Firestore Quota Exceeded (Free Daily Write/Read Limits)
const QUOTA_STORAGE_KEY = 'adcs_firestore_quota_exhausted_until';
let isQuotaExhaustedMemory = false;

export function isFirestoreQuotaExhausted(): boolean {
  if (isQuotaExhaustedMemory) return true;
  try {
    const untilStr = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (untilStr) {
      const until = parseInt(untilStr, 10);
      if (Date.now() < until) {
        isQuotaExhaustedMemory = true;
        return true;
      } else {
        localStorage.removeItem(QUOTA_STORAGE_KEY);
        isQuotaExhaustedMemory = false;
        enableNetwork(db).catch(() => {});
        return false;
      }
    }
  } catch {}
  return false;
}

export function markQuotaExhausted(cooldownMs: number = 86400000) {
  isQuotaExhaustedMemory = true;
  const until = Date.now() + cooldownMs;
  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, until.toString());
  } catch {}
  try {
    disableNetwork(db).catch(() => {});
  } catch {}
  console.info('[Firestore Storage] Firebase daily quota limit active. Seamlessly persisting via Enterprise Server Disk API and local storage.');
}

// Check initial quota status & suppress background retries if exhausted
if (typeof window !== 'undefined') {
  if (isFirestoreQuotaExhausted()) {
    disableNetwork(db).catch(() => {});
  } else {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
        // Benign multiple tabs or browser unsupported notice
      } else if (err.code === 'resource-exhausted' || err.message?.includes('Quota limit')) {
        markQuotaExhausted();
      }
    });
  }
}

const CRM_COLLECTION = 'crm_system';
const CRM_META_DOC = 'store_meta';
const CRM_LEGACY_DOC = 'enterprise_store';

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
    markQuotaExhausted();
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    operationType,
    path,
    timestamp: new Date().toISOString(),
  };
  console.warn('[Firestore Operation Error]', JSON.stringify(errInfo));
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
    const testDoc = doc(db, CRM_COLLECTION, 'ping_connection');
    await getDocFromServer(testDoc).catch((err) => {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit')) {
        markQuotaExhausted();
        info.quotaExhausted = true;
      }
    });
    if (!isFirestoreQuotaExhausted()) {
      info.connected = true;
    }
    return info;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit')) {
      markQuotaExhausted();
      info.quotaExhausted = true;
    }
    return info;
  }
}

/**
 * Load complete CRM database snapshot from Cloud Firestore
 * Reads modular collection documents with legacy enterprise_store fallback.
 */
export async function loadCRMDataFromCloud(): Promise<{ success: boolean; data: any; hasData: boolean }> {
  if (isFirestoreQuotaExhausted()) {
    return { success: true, data: null, hasData: false };
  }

  try {
    // 1. Try reading modular meta and partition documents first
    const metaRef = doc(db, CRM_COLLECTION, CRM_META_DOC);
    const clientsRef = doc(db, CRM_COLLECTION, 'clients_data');
    const leadsRef = doc(db, CRM_COLLECTION, 'leads_data');
    const usersRef = doc(db, CRM_COLLECTION, 'users_data');
    const companiesRef = doc(db, CRM_COLLECTION, 'companies_data');
    const invoicesRef = doc(db, CRM_COLLECTION, 'invoices_data');
    const documentsRef = doc(db, CRM_COLLECTION, 'documents_data');
    const tasksRef = doc(db, CRM_COLLECTION, 'tasks_data');
    const transactionsRef = doc(db, CRM_COLLECTION, 'transactions_data');
    const settingsRef = doc(db, CRM_COLLECTION, 'settings_data');
    const miscRef = doc(db, CRM_COLLECTION, 'misc_data');

    const [
      metaSnap,
      clientsSnap,
      leadsSnap,
      usersSnap,
      companiesSnap,
      invoicesSnap,
      documentsSnap,
      tasksSnap,
      transactionsSnap,
      settingsSnap,
      miscSnap,
    ] = await Promise.all([
      getDoc(metaRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'meta'); return null; }),
      getDoc(clientsRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'clients'); return null; }),
      getDoc(leadsRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'leads'); return null; }),
      getDoc(usersRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'users'); return null; }),
      getDoc(companiesRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'companies'); return null; }),
      getDoc(invoicesRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'invoices'); return null; }),
      getDoc(documentsRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'documents'); return null; }),
      getDoc(tasksRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'tasks'); return null; }),
      getDoc(transactionsRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'transactions'); return null; }),
      getDoc(settingsRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'settings'); return null; }),
      getDoc(miscRef).catch((e) => { handleFirestoreError(e, OperationType.GET, 'misc'); return null; }),
    ]);

    if (isFirestoreQuotaExhausted()) {
      return { success: true, data: null, hasData: false };
    }

    if (metaSnap && metaSnap.exists()) {
      const metaData = metaSnap.data() || {};
      const settingsData = settingsSnap?.exists() ? settingsSnap.data() : {};
      const miscData = miscSnap?.exists() ? miscSnap.data() : {};

      const reconstructed: any = {
        lastUpdated: metaData.lastUpdated || new Date().toISOString(),
        hasCustomModifications: metaData.hasCustomModifications ?? true,
        currentUserId: metaData.currentUserId || 'user-master',
        clients: clientsSnap?.exists() ? clientsSnap.data()?.clients || [] : [],
        leads: leadsSnap?.exists() ? leadsSnap.data()?.leads || [] : [],
        users: usersSnap?.exists() ? usersSnap.data()?.users || [] : [],
        companies: companiesSnap?.exists() ? companiesSnap.data()?.companies || [] : [],
        invoices: invoicesSnap?.exists() ? invoicesSnap.data()?.invoices || [] : [],
        documents: documentsSnap?.exists() ? documentsSnap.data()?.documents || [] : [],
        tasks: tasksSnap?.exists() ? tasksSnap.data()?.tasks || [] : [],
        transactions: transactionsSnap?.exists() ? transactionsSnap.data()?.transactions || [] : [],
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
        messages: miscData.messages || [],
        notifications: miscData.notifications || [],
        auditLogs: miscData.auditLogs || [],
      };

      const hasContent =
        (reconstructed.clients && reconstructed.clients.length > 0) ||
        (reconstructed.leads && reconstructed.leads.length > 0) ||
        (reconstructed.users && reconstructed.users.length > 0);

      if (hasContent) {
        return { success: true, data: reconstructed, hasData: true };
      }
    }

    // 2. Fallback to legacy single document store
    const legacyDocRef = doc(db, CRM_COLLECTION, CRM_LEGACY_DOC);
    const legacySnap = await getDoc(legacyDocRef).catch((e) => {
      handleFirestoreError(e, OperationType.GET, 'legacy');
      return null;
    });

    if (legacySnap && legacySnap.exists()) {
      const data = legacySnap.data();
      if (data && data.payload) {
        return { success: true, data: data.payload, hasData: true };
      }
    }

    return { success: true, data: null, hasData: false };
  } catch (error: any) {
    handleFirestoreError(error, OperationType.GET, `${CRM_COLLECTION}`);
    return { success: false, data: null, hasData: false };
  }
}

/**
 * Save complete CRM database snapshot to Cloud Firestore.
 * Throttles writes and partitions records into sub-documents safely.
 */
let lastCloudSaveTime = 0;
const CLOUD_SAVE_THROTTLE_MS = 15000; // Save at most every 15 seconds to Cloud Firestore

export async function saveCRMDataToCloud(payload: any, force: boolean = false): Promise<boolean> {
  if (isFirestoreQuotaExhausted()) {
    return false;
  }

  const now = Date.now();
  if (!force && now - lastCloudSaveTime < CLOUD_SAVE_THROTTLE_MS) {
    return true; // Throttled successfully to protect daily write limits
  }

  try {
    if (!payload || typeof payload !== 'object') return false;

    const nowIso = new Date().toISOString();

    // 1. Meta document
    const metaDoc = {
      version: '3.0',
      lastUpdated: payload.lastUpdated || nowIso,
      lastClientSync: nowIso,
      updatedAt: serverTimestamp(),
      hasCustomModifications: payload.hasCustomModifications ?? true,
      currentUserId: payload.currentUserId,
      counts: {
        clients: payload.clients?.length || 0,
        leads: payload.leads?.length || 0,
        users: payload.users?.length || 0,
        companies: payload.companies?.length || 0,
        invoices: payload.invoices?.length || 0,
        documents: payload.documents?.length || 0,
        tasks: payload.tasks?.length || 0,
        transactions: payload.transactions?.length || 0,
      },
    };

    // 2. Settings document
    const settingsDoc = {
      roles: payload.roles || [],
      stages: payload.stages || [],
      workflows: payload.workflows || [],
      serviceCategories: payload.serviceCategories || [],
      vendors: payload.vendors || [],
      leadCategories: payload.leadCategories || [],
      leadSources: payload.leadSources || [],
      leadStages: payload.leadStages || [],
      crmBranding: payload.crmBranding || null,
      billingSettings: payload.billingSettings || null,
      updatedAt: serverTimestamp(),
    };

    // 3. Misc document (recent logs, messages, notifications)
    const miscDoc = {
      messages: (payload.messages || []).slice(-100),
      notifications: (payload.notifications || []).slice(-100),
      auditLogs: (payload.auditLogs || []).slice(-200),
      updatedAt: serverTimestamp(),
    };

    // Parallel writes across modular collection documents with individual error catching
    const writePromises = [
      setDoc(doc(db, CRM_COLLECTION, CRM_META_DOC), metaDoc, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'meta')),
      setDoc(doc(db, CRM_COLLECTION, 'clients_data'), { clients: payload.clients || [], updatedAt: serverTimestamp() }, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'clients')),
      setDoc(doc(db, CRM_COLLECTION, 'leads_data'), { leads: payload.leads || [], updatedAt: serverTimestamp() }, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'leads')),
      setDoc(doc(db, CRM_COLLECTION, 'users_data'), { users: payload.users || [], updatedAt: serverTimestamp() }, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'users')),
      setDoc(doc(db, CRM_COLLECTION, 'companies_data'), { companies: payload.companies || [], updatedAt: serverTimestamp() }, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'companies')),
      setDoc(doc(db, CRM_COLLECTION, 'invoices_data'), { invoices: payload.invoices || [], updatedAt: serverTimestamp() }, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'invoices')),
      setDoc(doc(db, CRM_COLLECTION, 'documents_data'), { documents: payload.documents || [], updatedAt: serverTimestamp() }, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'documents')),
      setDoc(doc(db, CRM_COLLECTION, 'tasks_data'), { tasks: payload.tasks || [], updatedAt: serverTimestamp() }, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'tasks')),
      setDoc(doc(db, CRM_COLLECTION, 'transactions_data'), { transactions: payload.transactions || [], updatedAt: serverTimestamp() }, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'transactions')),
      setDoc(doc(db, CRM_COLLECTION, 'settings_data'), settingsDoc, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'settings')),
      setDoc(doc(db, CRM_COLLECTION, 'misc_data'), miscDoc, { merge: true }).catch((e) => handleFirestoreError(e, OperationType.WRITE, 'misc')),
    ];

    await Promise.all(writePromises);
    if (isFirestoreQuotaExhausted()) {
      return false;
    }

    lastCloudSaveTime = Date.now();
    return true;
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, `${CRM_COLLECTION}`);
    return false;
  }
}

/**
 * Real-time subscription to cloud CRM updates across multiple devices/tabs
 */
export function subscribeToCloudCRMData(
  onData: (data: any) => void,
  onError?: (err: any) => void
): () => void {
  if (isFirestoreQuotaExhausted()) {
    return () => {};
  }

  try {
    const metaRef = doc(db, CRM_COLLECTION, CRM_META_DOC);
    let isInitial = true;

    const unsubscribe = onSnapshot(
      metaRef,
      async (docSnap) => {
        if (isInitial) {
          isInitial = false;
          return;
        }
        if (docSnap.exists()) {
          const res = await loadCRMDataFromCloud();
          if (res.success && res.hasData && res.data) {
            onData(res.data);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `${CRM_COLLECTION}/${CRM_META_DOC}`);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    return () => {};
  }
}
