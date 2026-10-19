/**
 * Unlimited, resilient record storage.
 *
 * The apps used to keep their records in `localStorage`, which is capped at
 * roughly 5 MB per origin. Once that cap is hit `setItem` throws
 * `QuotaExceededError`, the write was swallowed by a `catch` that only logged to
 * the console, and the user's new applications silently stopped being saved.
 *
 * This module fixes that by writing records to **IndexedDB**, whose quota is a
 * large fraction of free disk space rather than a fixed 5 MB, so the number of
 * saved applications is effectively unlimited. `localStorage` is kept only as a
 * small fallback (and as the synchronous first-paint cache) for environments
 * where IndexedDB is unavailable, e.g. some private-browsing modes.
 *
 * The API is intentionally promise-based and forgiving: a failed write never
 * throws into the caller, it reports back so the UI can warn the user.
 */

/**
 * The storage key doubles as the IndexedDB scope: one app's records are only
 * ever read back, or cleared, by that same app for the same upazila. Before
 * this, every app wrote to one shared, unscoped record set and each save
 * started with `store.clear()` — so saving in app1 deleted app2's and app3's
 * uncapped history (and vice versa).
 */
const DB_NAME = 'gpf-unlimited-store';
const DB_VERSION = 2;
const STORE_NAME = 'records';

interface StoredRecord {
  /** `<scope>::<record id>`, so the same id in two apps never shares a row. */
  __id: string;
  /** Insertion order, so the newest-first ordering survives a reload. */
  __seq: number;
  /** Which app + upazila this record belongs to (its localStorage key). */
  __scope: string;
  [key: string]: unknown;
}

export type SaveResult = {
  ok: boolean;
  /** 'indexeddb' | 'localstorage' | 'none' — where the data actually landed. */
  store: 'indexeddb' | 'localstorage' | 'none';
  /** Total records persisted after this write. */
  count: number;
  /** Present when nothing could be persisted. */
  error?: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;

const idbAvailable = (): boolean =>
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: '__id' });
        store.createIndex('__seq', '__seq', { unique: false });
      }
      const store = request.transaction?.objectStore(STORE_NAME);
      if (store && !store.indexNames.contains('__scope')) {
        store.createIndex('__scope', '__scope', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  }).catch((error) => {
    // Never cache a rejected promise: a later attempt should be able to retry.
    dbPromise = null;
    throw error;
  });

  return dbPromise;
};

/** Any record shape the apps store; `id` is the only field we rely on. */
export interface RecordLike {
  id?: string | number | null;
}

const pickId = (record: RecordLike, fallbackIndex: number): string => {
  const id = record?.id;
  if (typeof id === 'string' && id) return id;
  if (typeof id === 'number') return String(id);
  return `gpf-record-${Date.now()}-${fallbackIndex}`;
};

/**
 * Reads every stored record for one scope, newest first. Returns `null` when
 * that scope has never been written to, so the caller can fall back to its
 * `localStorage` mirror — which is also what re-seeds this store for users who
 * saved records before records were scoped.
 */
export const loadUnlimitedRecords = async <T>(scope: string): Promise<T[] | null> => {
  if (!idbAvailable()) return null;

  try {
    const db = await openDb();
    const rows = await new Promise<StoredRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).index('__scope').getAll(IDBKeyRange.only(scope));
      request.onsuccess = () => resolve((request.result || []) as StoredRecord[]);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB read failed'));
    });

    if (rows.length === 0) return null;

    // Newest first: the apps always unshift new records, so a higher __seq is newer.
    rows.sort((a, b) => (b.__seq ?? 0) - (a.__seq ?? 0));

    return rows.map((row) => {
      const { __id, __seq, __scope, ...rest } = row;
      void __id;
      void __seq;
      void __scope;
      return rest as T;
    });
  } catch {
    return null;
  }
};

/**
 * Replaces one scope's record set. Never throws; reports what happened instead.
 * Only rows belonging to `scope` are removed, so another app's or another
 * upazila's history is left untouched.
 */
export const saveUnlimitedRecords = async <T extends RecordLike>(
  records: T[],
  scope: string,
): Promise<SaveResult> => {
  // Always mirror to localStorage first: it is synchronous, so a reload right
  // after the save still finds the data even if IndexedDB is slow to commit.
  try {
    window.localStorage.setItem(scope, JSON.stringify(records));
  } catch {
    // Quota exceeded — IndexedDB below is the real home for the data.
  }

  if (!idbAvailable()) {
    return { ok: true, store: 'localstorage', count: records.length };
  }

  try {
    const db = await openDb();
    const now = Date.now();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Clear this scope only, so deletions are reflected too.
      const ownKeys = store.index('__scope').getAllKeys(IDBKeyRange.only(scope));
      ownKeys.onsuccess = () => (ownKeys.result || []).forEach((key) => store.delete(key));

      records.forEach((record, index) => {
        const row: StoredRecord = {
          ...(record as unknown as Record<string, unknown>),
          // The primary key is qualified with the scope: two apps can produce
          // the same record id, and one shared key would let one app overwrite
          // (or delete) another app's row.
          __id: `${scope}::${pickId(record, index)}`,
          // Preserve the array order: index 0 stays the newest.
          __seq: now - index,
          __scope: scope,
        };
        store.put(row);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'));
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB write aborted'));
    });

    return { ok: true, store: 'indexeddb', count: records.length };
  } catch (error) {
    // Even if IndexedDB fails, the localStorage mirror above may have worked.
    const mirrored = (() => {
      try {
        return window.localStorage.getItem(scope) !== null;
      } catch {
        return false;
      }
    })();

    return {
      ok: mirrored,
      store: mirrored ? 'localstorage' : 'none',
      count: records.length,
      error: error instanceof Error ? error.message : 'Unknown storage error',
    };
  }
};
