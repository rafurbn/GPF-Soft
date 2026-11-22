import { isSupabaseConfigured, supabase } from './supabase';

export type CloudAppType = 'app1' | 'app2' | 'app3' | 'app4' | 'app6';

export interface CloudRecordShape {
  id?: string | number | null;
  updatedAt?: string | number | null;
  savedAt?: string | number | null;
  createdAt?: string | number | null;
}

const getRecordId = (record: CloudRecordShape, fallbackIndex = 0): string => {
  const id = record?.id;
  if (typeof id === 'string' && id.trim()) return id.trim();
  if (typeof id === 'number' && Number.isFinite(id)) return String(id);
  return `rec-auto-${fallbackIndex}`;
};

const parseTimestampMs = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const asNum = Number(value);
    if (Number.isFinite(asNum) && asNum > 1_000_000_000) return asNum;
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const getRecordUpdatedMs = (record: CloudRecordShape, fallbackIso?: string): number => {
  return (
    parseTimestampMs(record?.updatedAt) ||
    parseTimestampMs(record?.savedAt) ||
    parseTimestampMs(record?.createdAt) ||
    parseTimestampMs(fallbackIso) ||
    0
  );
};

export async function getCloudUserId(): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session?.user?.id || null;
  } catch {
    return null;
  }
}

export async function upsertCloudRecord<T extends CloudRecordShape>(
  appType: CloudAppType,
  upazilaCode: string,
  record: T,
): Promise<boolean> {
  if (!upazilaCode) return false;
  const userId = await getCloudUserId();
  if (!userId || !supabase) return false;

  const id = getRecordId(record);
  const clientUpdatedMs = getRecordUpdatedMs(record) || Date.now();
  const clientUpdatedIso = new Date(clientUpdatedMs).toISOString();

  try {
    const { error } = await supabase.from('portal_app_records').upsert(
      {
        id,
        user_id: userId,
        upazila_code: upazilaCode,
        app_type: appType,
        record_data: record,
        client_updated_at: clientUpdatedIso,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,upazila_code,app_type,id' },
    );
    if (error) {
      console.warn(`[cloudRecordSync] upsert failed for ${appType}:`, error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function upsertCloudRecordsBulk<T extends CloudRecordShape>(
  appType: CloudAppType,
  upazilaCode: string,
  records: T[],
): Promise<boolean> {
  if (!upazilaCode || records.length === 0) return true;
  const userId = await getCloudUserId();
  if (!userId || !supabase) return false;

  const nowIso = new Date().toISOString();
  const payload = records.map((record, idx) => {
    const id = getRecordId(record, idx);
    const ms = getRecordUpdatedMs(record) || Date.now();
    return {
      id,
      user_id: userId,
      upazila_code: upazilaCode,
      app_type: appType,
      record_data: record,
      client_updated_at: new Date(ms).toISOString(),
      updated_at: nowIso,
    };
  });

  try {
    const CHUNK = 50;
    for (let i = 0; i < payload.length; i += CHUNK) {
      const slice = payload.slice(i, i + CHUNK);
      const { error } = await supabase
        .from('portal_app_records')
        .upsert(slice, { onConflict: 'user_id,upazila_code,app_type,id' });
      if (error) {
        console.warn(`[cloudRecordSync] bulk upsert failed for ${appType}:`, error.message);
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteCloudRecord(
  appType: CloudAppType,
  upazilaCode: string,
  recordId: string | number,
): Promise<boolean> {
  if (!upazilaCode || !recordId) return false;
  const userId = await getCloudUserId();
  if (!userId || !supabase) return false;

  try {
    const { error } = await supabase
      .from('portal_app_records')
      .delete()
      .eq('user_id', userId)
      .eq('upazila_code', upazilaCode)
      .eq('app_type', appType)
      .eq('id', String(recordId));
    if (error) {
      console.warn(`[cloudRecordSync] delete failed for ${appType}:`, error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Merges remote Supabase records with local records on mount without ever
 * deleting local or remote data. Any pre-existing local records not yet in
 * Supabase are automatically uploaded (zero-data-loss migration).
 */
export async function hydrateAndSyncCloudRecords<T extends CloudRecordShape>(
  appType: CloudAppType,
  upazilaCode: string,
  localRecords: T[],
): Promise<T[] | null> {
  if (!upazilaCode) return null;
  const userId = await getCloudUserId();
  if (!userId || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('portal_app_records')
      .select('id, record_data, client_updated_at, updated_at')
      .eq('user_id', userId)
      .eq('upazila_code', upazilaCode)
      .eq('app_type', appType)
      .order('client_updated_at', { ascending: false });

    if (error) {
      console.warn(`[cloudRecordSync] read failed for ${appType}:`, error.message);
      return null;
    }

    const remoteRows = (data || []) as Array<{
      id: string;
      record_data: T;
      client_updated_at?: string;
      updated_at?: string;
    }>;

    const remoteMap = new Map<string, { record: T; ms: number }>();
    for (const row of remoteRows) {
      if (!row?.record_data) continue;
      const rec = { ...row.record_data, id: row.record_data.id ?? row.id } as T;
      remoteMap.set(String(row.id), {
        record: rec,
        ms: getRecordUpdatedMs(rec, row.client_updated_at || row.updated_at),
      });
    }

    const mergedMap = new Map<string, T>();
    const toUpload: T[] = [];

    // 1. Walk remote rows first (newest first)
    for (const [id, entry] of remoteMap.entries()) {
      mergedMap.set(id, entry.record);
    }

    // 2. Merge local rows: add any local-only records & upload them; keep newer edits
    for (let i = 0; i < localRecords.length; i += 1) {
      const localRec = localRecords[i];
      if (!localRec) continue;
      const hasExplicitId =
        (typeof localRec.id === 'string' && localRec.id.trim().length > 0) ||
        (typeof localRec.id === 'number' && Number.isFinite(localRec.id));
      const id = hasExplicitId ? String(localRec.id).trim() : `migrated-${appType}-${i}-${Date.now()}`;
      const normalizedLocal = (hasExplicitId ? localRec : { ...localRec, id }) as T;
      const localMs = getRecordUpdatedMs(normalizedLocal);

      const existingRemote = remoteMap.get(id);
      if (!existingRemote) {
        mergedMap.set(id, normalizedLocal);
        toUpload.push(normalizedLocal);
      } else if (localMs > existingRemote.ms) {
        mergedMap.set(id, normalizedLocal);
        toUpload.push(normalizedLocal);
      }
    }

    if (toUpload.length > 0) {
      void upsertCloudRecordsBulk(appType, upazilaCode, toUpload);
    }

    const merged = Array.from(mergedMap.values());
    merged.sort((a, b) => getRecordUpdatedMs(b) - getRecordUpdatedMs(a));
    return merged;
  } catch {
    return null;
  }
}

export async function loadCloudLocks(
  appType: CloudAppType,
  upazilaCode: string,
): Promise<{ locksData: Record<string, any>; valuesData: Record<string, any> } | null> {
  if (!upazilaCode) return null;
  const userId = await getCloudUserId();
  if (!userId || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('portal_app_locks')
      .select('locks_data, values_data')
      .eq('user_id', userId)
      .eq('upazila_code', upazilaCode)
      .eq('app_type', appType)
      .maybeSingle();

    if (error || !data) return null;
    return {
      locksData: (data.locks_data || {}) as Record<string, any>,
      valuesData: (data.values_data || {}) as Record<string, any>,
    };
  } catch {
    return null;
  }
}

export async function saveCloudLocks(
  appType: CloudAppType,
  upazilaCode: string,
  locksData: Record<string, any>,
  valuesData: Record<string, any> = {},
): Promise<boolean> {
  if (!upazilaCode) return false;
  const userId = await getCloudUserId();
  if (!userId || !supabase) return false;

  try {
    const { error } = await supabase.from('portal_app_locks').upsert(
      {
        user_id: userId,
        upazila_code: upazilaCode,
        app_type: appType,
        locks_data: locksData,
        values_data: valuesData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,upazila_code,app_type' },
    );
    if (error) {
      console.warn(`[cloudRecordSync] lock save failed for ${appType}:`, error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
