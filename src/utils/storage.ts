import { SchoolAsset } from '../types';

const STORAGE_KEY = 'si_aset_sekolah_data_v1';

export const INITIAL_ASSETS: SchoolAsset[] = [
  {
    id: 'asset-1',
    namaBarang: 'Proyektor Epson EB-E500 (3300 Lumens)',
    kodeBarang: 'AST-LABKOM-2023-014',
    kondisiBarang: 'Baik',
    lokasiPenggunaan: 'Lab Komputer 1',
    tahunPenerimaan: 2023,
    asalPenerimaan: 'Dana BOS Reguler',
    catatanTambahan: 'Kelengkapan: Kabel HDMI, Remote, Kabel Power',
    createdAt: '2023-08-12T08:30:00.000Z',
    updatedAt: '2023-08-12T08:30:00.000Z',
  },
  {
    id: 'asset-2',
    namaBarang: 'Laptop ASUS ExpertBook B1400 (Core i5)',
    kodeBarang: 'AST-TU-2024-003',
    kondisiBarang: 'Baik',
    lokasiPenggunaan: 'Ruang Tata Usaha (Meja Inventaris)',
    tahunPenerimaan: 2024,
    asalPenerimaan: 'Bantuan DAK Kemendikbud',
    catatanTambahan: 'Serial: EXPB14-998213. Digunakan administrasi aset.',
    createdAt: '2024-02-10T10:15:00.000Z',
    updatedAt: '2024-02-10T10:15:00.000Z',
  },
  {
    id: 'asset-3',
    namaBarang: 'Mikroskop Binokuler Olympus CX23',
    kodeBarang: 'AST-LABIPA-2022-008',
    kondisiBarang: 'Rusak Ringan',
    lokasiPenggunaan: 'Laboratorium Biologi',
    tahunPenerimaan: 2022,
    asalPenerimaan: 'Hibah Komite Sekolah',
    catatanTambahan: 'Lensa okuler kanan sedikit buram, perlu pembersihan teknis.',
    createdAt: '2022-10-05T09:00:00.000Z',
    updatedAt: '2023-01-15T14:20:00.000Z',
  },
];

export function getStoredAssets(): SchoolAsset[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ASSETS));
      return INITIAL_ASSETS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_ASSETS;
  } catch (err) {
    console.error('Error reading localStorage assets:', err);
    return INITIAL_ASSETS;
  }
}

export function saveStoredAssets(assets: SchoolAsset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch (err) {
    console.error('Error saving assets to localStorage:', err);
  }
}

export const COMMON_LOCATIONS = [
  'Ruang Tata Usaha',
  'Lab Komputer 1',
  'Lab Komputer 2',
  'Laboratorium IPA / Biologi',
  'Laboratorium Fisika',
  'Perpustakaan Sekolah',
  'Ruang Guru',
  'Ruang Kepala Sekolah',
  'Ruang Kelas 10-A',
  'Ruang Kelas 11-MIPA',
  'Ruang Kelas 12-IPS',
  'Aula Utama / Serbaguna',
  'Ruang UKS',
  'Ruang BP / BK',
  'Gudang Sarana Prasarana',
];

export const COMMON_SOURCES = [
  'Dana BOS Reguler',
  'Dana BOS Kinerja',
  'Bantuan DAK Kemendikbud',
  'Hibah Komite Sekolah',
  'Bantuan APBD Provinsi / Kabupaten',
  'Bantuan Alumni Sekolah',
  'Yayasan Pendidikan',
  'Sumbangan Pihak Ketiga',
];
