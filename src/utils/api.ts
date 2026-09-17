import { SchoolAsset } from '../types';
import { getStoredAssets, saveStoredAssets } from './storage';

export async function fetchAssetsFromCloudSql(): Promise<SchoolAsset[]> {
  try {
    const res = await fetch('/api/assets');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      saveStoredAssets(data);
      return data;
    }
  } catch (error) {
    console.warn('Could not fetch from Cloud SQL API, using local backup:', error);
  }
  return getStoredAssets();
}

export async function saveAssetToCloudSql(
  assetData: Omit<SchoolAsset, 'createdAt' | 'updatedAt'>
): Promise<SchoolAsset> {
  try {
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData),
    });
    if (res.ok) {
      const created = await res.json();
      return created;
    }
  } catch (error) {
    console.warn('Could not save to Cloud SQL API, saved locally:', error);
  }

  const now = new Date().toISOString();
  return {
    ...assetData,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateAssetInCloudSql(
  id: string,
  assetData: Partial<Omit<SchoolAsset, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    await fetch(`/api/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData),
    });
  } catch (error) {
    console.warn('Could not update in Cloud SQL API:', error);
  }
}

export async function deleteAssetInCloudSql(id: string): Promise<void> {
  try {
    await fetch(`/api/assets/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('Could not delete from Cloud SQL API:', error);
  }
}
