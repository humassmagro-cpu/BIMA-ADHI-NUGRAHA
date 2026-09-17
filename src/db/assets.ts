import { db } from './index.ts';
import { assets } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { SchoolAsset, AssetCondition } from '../types';

export async function getAllAssets(): Promise<SchoolAsset[]> {
  try {
    const rows = await db
      .select()
      .from(assets)
      .orderBy(desc(assets.createdAt));

    return rows.map((r) => ({
      id: r.uuid,
      namaBarang: r.namaBarang,
      kodeBarang: r.kodeBarang,
      kondisiBarang: r.kondisiBarang as AssetCondition,
      lokasiPenggunaan: r.lokasiPenggunaan,
      tahunPenerimaan: r.tahunPenerimaan,
      asalPenerimaan: r.asalPenerimaan,
      catatanTambahan: r.catatanTambahan || undefined,
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to get assets from Cloud SQL:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function insertAsset(
  assetData: Omit<SchoolAsset, 'createdAt' | 'updatedAt'>,
  userId?: number
): Promise<SchoolAsset> {
  try {
    const now = new Date();
    const rows = await db
      .insert(assets)
      .values({
        uuid: assetData.id,
        userId: userId || null,
        namaBarang: assetData.namaBarang,
        kodeBarang: assetData.kodeBarang,
        kondisiBarang: assetData.kondisiBarang,
        lokasiPenggunaan: assetData.lokasiPenggunaan,
        tahunPenerimaan: String(assetData.tahunPenerimaan),
        asalPenerimaan: assetData.asalPenerimaan,
        catatanTambahan: assetData.catatanTambahan || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const r = rows[0];
    return {
      id: r.uuid,
      namaBarang: r.namaBarang,
      kodeBarang: r.kodeBarang,
      kondisiBarang: r.kondisiBarang as AssetCondition,
      lokasiPenggunaan: r.lokasiPenggunaan,
      tahunPenerimaan: r.tahunPenerimaan,
      asalPenerimaan: r.asalPenerimaan,
      catatanTambahan: r.catatanTambahan || undefined,
      createdAt: r.createdAt ? r.createdAt.toISOString() : now.toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : now.toISOString(),
    };
  } catch (error) {
    console.error('Failed to insert asset into Cloud SQL:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function updateAssetByUuid(
  uuid: string,
  assetData: Partial<Omit<SchoolAsset, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<SchoolAsset | null> {
  try {
    const now = new Date();
    const updatePayload: Record<string, any> = {
      updatedAt: now,
    };

    if (assetData.namaBarang !== undefined) updatePayload.namaBarang = assetData.namaBarang;
    if (assetData.kodeBarang !== undefined) updatePayload.kodeBarang = assetData.kodeBarang;
    if (assetData.kondisiBarang !== undefined) updatePayload.kondisiBarang = assetData.kondisiBarang;
    if (assetData.lokasiPenggunaan !== undefined) updatePayload.lokasiPenggunaan = assetData.lokasiPenggunaan;
    if (assetData.tahunPenerimaan !== undefined) updatePayload.tahunPenerimaan = String(assetData.tahunPenerimaan);
    if (assetData.asalPenerimaan !== undefined) updatePayload.asalPenerimaan = assetData.asalPenerimaan;
    if (assetData.catatanTambahan !== undefined) updatePayload.catatanTambahan = assetData.catatanTambahan || null;

    const rows = await db
      .update(assets)
      .set(updatePayload)
      .where(eq(assets.uuid, uuid))
      .returning();

    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.uuid,
      namaBarang: r.namaBarang,
      kodeBarang: r.kodeBarang,
      kondisiBarang: r.kondisiBarang as AssetCondition,
      lokasiPenggunaan: r.lokasiPenggunaan,
      tahunPenerimaan: r.tahunPenerimaan,
      asalPenerimaan: r.asalPenerimaan,
      catatanTambahan: r.catatanTambahan || undefined,
      createdAt: r.createdAt ? r.createdAt.toISOString() : now.toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : now.toISOString(),
    };
  } catch (error) {
    console.error('Failed to update asset in Cloud SQL:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function deleteAssetByUuid(uuid: string): Promise<boolean> {
  try {
    const result = await db.delete(assets).where(eq(assets.uuid, uuid)).returning();
    return result.length > 0;
  } catch (error) {
    console.error('Failed to delete asset from Cloud SQL:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}
