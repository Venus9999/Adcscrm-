/**
 * IndexedDB Persistent Vault Storage
 * Provides an unevictable browser persistence layer that survives version upgrades,
 * browser cache evictions, and localStorage size quota limits (~5MB).
 */

const DB_NAME = 'adcs_crm_vault_db';
const DB_VERSION = 1;
const STORE_VAULT = 'crm_vault';
const STORE_SNAPSHOTS = 'crm_snapshots';

function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_VAULT)) {
          db.createObjectStore(STORE_VAULT, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
          const snapStore = db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'id' });
          snapStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('IndexedDB open notice:', request.error);
        resolve(null);
      };
    } catch (e) {
      console.warn('IndexedDB initialization notice:', e);
      resolve(null);
    }
  });
}

/**
 * Save current working state to IndexedDB vault
 */
export async function saveToIndexedDbVault(key: string, data: any): Promise<boolean> {
  try {
    const db = await openDatabase();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_VAULT, 'readwrite');
        const store = tx.objectStore(STORE_VAULT);
        const record = {
          id: key,
          updatedAt: new Date().toISOString(),
          data,
        };
        const putReq = store.put(record);

        putReq.onsuccess = () => resolve(true);
        putReq.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

/**
 * Retrieve data from IndexedDB vault
 */
export async function getFromIndexedDbVault(key: string): Promise<any | null> {
  try {
    const db = await openDatabase();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_VAULT, 'readonly');
        const store = tx.objectStore(STORE_VAULT);
        const getReq = store.get(key);

        getReq.onsuccess = () => {
          if (getReq.result && getReq.result.data) {
            resolve(getReq.result.data);
          } else {
            resolve(null);
          }
        };
        getReq.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Save an immutable point-in-time snapshot to IndexedDB (e.g. pre-version-upgrade)
 */
export async function saveSnapshotToIndexedDb(
  snapshot: any,
  reason: string = 'Version Upgrade Safety Snapshot',
  triggerType: string = 'version_upgrade'
): Promise<boolean> {
  try {
    const db = await openDatabase();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_SNAPSHOTS, 'readwrite');
        const store = tx.objectStore(STORE_SNAPSHOTS);
        const id = `snap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const record = {
          id,
          timestamp: Date.now(),
          createdAt: new Date().toISOString(),
          reason,
          triggerType,
          data: snapshot,
        };
        const putReq = store.put(record);

        putReq.onsuccess = () => resolve(true);
        putReq.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

/**
 * Retrieve the most recent snapshot from IndexedDB
 */
export async function getLatestIndexedDbSnapshot(): Promise<any | null> {
  try {
    const db = await openDatabase();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_SNAPSHOTS, 'readonly');
        const store = tx.objectStore(STORE_SNAPSHOTS);
        const index = store.index('timestamp');
        const cursorReq = index.openCursor(null, 'prev'); // Most recent first

        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor && cursor.value && cursor.value.data) {
            resolve(cursor.value.data);
          } else {
            resolve(null);
          }
        };
        cursorReq.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}
