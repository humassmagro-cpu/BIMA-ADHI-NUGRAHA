export type AssetCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';

export interface SchoolAsset {
  id: string;
  namaBarang: string;
  kodeBarang: string;
  kondisiBarang: AssetCondition;
  lokasiPenggunaan: string;
  tahunPenerimaan: number | string;
  asalPenerimaan: string;
  catatanTambahan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BarcodePayloadOptions {
  includeDisclaimer: boolean;
  disclaimerText: string;
}

export const SCHOOL_INFO = {
  provinsi: 'PEMERINTAH PROVINSI JAWA TIMUR',
  dinas: 'DINAS PENDIDIKAN',
  namaSekolah: 'SMA NEGERI 1 GROGOL KABUPATEN KEDIRI',
  alamat: 'Jalan Raya Gringging 16 Sonorejo Grogol Kediri 64151',
  kontak: 'Telepon (0354) 773009, Laman sman1grogol.sch.id, Pos-el info@sman1grogol.sch.id',
  unit: 'TATA USAHA - BAGIAN PENGELOLAAN ASET & SARPRAS',
};

export const DEFAULT_DISCLAIMER =
  'PENTING: Untuk peminjaman atau pemindahan barang ini, WAJIB menghubungi pihak Tata Usaha Bagian ASET SMA Negeri 1 Grogol.';

export function formatBarcodePayload(
  asset: Pick<
    SchoolAsset,
    | 'namaBarang'
    | 'kodeBarang'
    | 'kondisiBarang'
    | 'lokasiPenggunaan'
    | 'tahunPenerimaan'
    | 'asalPenerimaan'
  >,
  disclaimer = DEFAULT_DISCLAIMER
): string {
  return [
    '=== ASET SMA NEGERI 1 GROGOL KABUPATEN KEDIRI ===',
    `Kode Barang   : ${asset.kodeBarang}`,
    `Nama Barang   : ${asset.namaBarang}`,
    `Kondisi       : ${asset.kondisiBarang}`,
    `Lokasi        : ${asset.lokasiPenggunaan}`,
    `Tahun Terima  : ${asset.tahunPenerimaan}`,
    `Asal Terima   : ${asset.asalPenerimaan}`,
    '----------------------------------------',
    'INFORMASI & ATURAN:',
    disclaimer,
  ].join('\n');
}
