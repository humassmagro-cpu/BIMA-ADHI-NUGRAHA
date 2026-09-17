import React, { useState, useEffect } from 'react';
import { PlusCircle, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { SchoolAsset, AssetCondition } from '../types';
import { COMMON_LOCATIONS, COMMON_SOURCES } from '../utils/storage';

interface AssetFormProps {
  initialAsset?: SchoolAsset | null;
  onSave: (asset: Omit<SchoolAsset, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  initialAsset,
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const currentYear = new Date().getFullYear();

  const [namaBarang, setNamaBarang] = useState('');
  const [kodeBarang, setKodeBarang] = useState('');
  const [kondisiBarang, setKondisiBarang] = useState<AssetCondition>('Baik');
  const [lokasiPenggunaan, setLokasiPenggunaan] = useState('');
  const [tahunPenerimaan, setTahunPenerimaan] = useState<number | string>(currentYear);
  const [asalPenerimaan, setAsalPenerimaan] = useState('');
  const [catatanTambahan, setCatatanTambahan] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialAsset) {
      setNamaBarang(initialAsset.namaBarang);
      setKodeBarang(initialAsset.kodeBarang);
      setKondisiBarang(initialAsset.kondisiBarang);
      setLokasiPenggunaan(initialAsset.lokasiPenggunaan);
      setTahunPenerimaan(initialAsset.tahunPenerimaan);
      setAsalPenerimaan(initialAsset.asalPenerimaan);
      setCatatanTambahan(initialAsset.catatanTambahan || '');
    } else {
      resetForm();
    }
  }, [initialAsset]);

  const resetForm = () => {
    setNamaBarang('');
    generateSampleCode();
    setKondisiBarang('Baik');
    setLokasiPenggunaan('');
    setTahunPenerimaan(currentYear);
    setAsalPenerimaan('');
    setCatatanTambahan('');
    setErrors({});
  };

  const generateSampleCode = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const yr = tahunPenerimaan || currentYear;
    setKodeBarang(`AST-${yr}-${randomNum}`);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!namaBarang.trim()) newErrors.namaBarang = 'Nama barang wajib diisi';
    if (!kodeBarang.trim()) newErrors.kodeBarang = 'Kode barang wajib diisi';
    if (!lokasiPenggunaan.trim()) newErrors.lokasiPenggunaan = 'Lokasi penggunaan wajib diisi';
    if (!tahunPenerimaan) newErrors.tahunPenerimaan = 'Tahun penerimaan wajib diisi';
    if (!asalPenerimaan.trim()) newErrors.asalPenerimaan = 'Asal penerimaan wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(
      {
        namaBarang: namaBarang.trim(),
        kodeBarang: kodeBarang.trim().toUpperCase(),
        kondisiBarang,
        lokasiPenggunaan: lokasiPenggunaan.trim(),
        tahunPenerimaan,
        asalPenerimaan: asalPenerimaan.trim(),
        catatanTambahan: catatanTambahan.trim() || undefined,
      },
      initialAsset ? initialAsset.id : undefined
    );

    if (!isEditing) {
      resetForm();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {isEditing ? 'Edit Data Aset Sekolah' : 'Input Pencatatan Aset Baru'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Petugas Tata Usaha / Bagian Aset menginput data barang untuk cetak barcode
          </p>
        </div>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-300 hover:text-white p-1 rounded-md transition-colors"
            title="Batal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nama Barang */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              placeholder="Contoh: Proyektor LCD Epson EB-E500 / Meja Guru Kayu Jati"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.namaBarang
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            {errors.namaBarang && (
              <p className="text-xs text-red-500">{errors.namaBarang}</p>
            )}
          </div>

          {/* Kode Barang */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-800">
                Kode Barang / Inventaris <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateSampleCode}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Buat Otomatis
              </button>
            </div>
            <input
              type="text"
              value={kodeBarang}
              onChange={(e) => setKodeBarang(e.target.value)}
              placeholder="Contoh: AST-LAB-2024-001"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 transition-all ${
                errors.kodeBarang
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            {errors.kodeBarang && (
              <p className="text-xs text-red-500">{errors.kodeBarang}</p>
            )}
          </div>

          {/* Kondisi Barang */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-800">
              Kondisi Barang <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Baik', 'Rusak Ringan', 'Rusak Berat'] as AssetCondition[]).map((cond) => {
                const isSelected = kondisiBarang === cond;
                let colorClass = 'border-slate-200 text-slate-700 hover:bg-slate-50';
                if (isSelected) {
                  if (cond === 'Baik') colorClass = 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500';
                  if (cond === 'Rusak Ringan') colorClass = 'border-amber-600 bg-amber-50 text-amber-800 font-semibold ring-1 ring-amber-500';
                  if (cond === 'Rusak Berat') colorClass = 'border-red-600 bg-red-50 text-red-800 font-semibold ring-1 ring-red-500';
                }
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setKondisiBarang(cond)}
                    className={`py-2 px-2 text-xs rounded-lg border text-center transition-all ${colorClass}`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lokasi Penggunaan */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-800">
              Lokasi Penggunaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="lokasi-presets"
              value={lokasiPenggunaan}
              onChange={(e) => setLokasiPenggunaan(e.target.value)}
              placeholder="Contoh: Lab Komputer 1 / Ruang Tata Usaha"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.lokasiPenggunaan
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            <datalist id="lokasi-presets">
              {COMMON_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
            {errors.lokasiPenggunaan && (
              <p className="text-xs text-red-500">{errors.lokasiPenggunaan}</p>
            )}
          </div>

          {/* Tahun Penerimaan */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-800">
              Tahun Penerimaan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1990"
              max="2035"
              value={tahunPenerimaan}
              onChange={(e) => setTahunPenerimaan(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="2024"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.tahunPenerimaan
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            {errors.tahunPenerimaan && (
              <p className="text-xs text-red-500">{errors.tahunPenerimaan}</p>
            )}
          </div>

          {/* Asal Penerimaan */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Asal Penerimaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="asal-presets"
              value={asalPenerimaan}
              onChange={(e) => setAsalPenerimaan(e.target.value)}
              placeholder="Contoh: Dana BOS Reguler / Bantuan Kemendikbud / Hibah Komite"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.asalPenerimaan
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            <datalist id="asal-presets">
              {COMMON_SOURCES.map((src) => (
                <option key={src} value={src} />
              ))}
            </datalist>
            {errors.asalPenerimaan && (
              <p className="text-xs text-red-500">{errors.asalPenerimaan}</p>
            )}
          </div>

          {/* Catatan Tambahan (Opsional) */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Catatan Spesifikasi / Nomor Seri (Opsional)
            </label>
            <input
              type="text"
              value={catatanTambahan}
              onChange={(e) => setCatatanTambahan(e.target.value)}
              placeholder="Contoh: No Seri SN-8821903, Kelengkapan Charger + Kabel HDMI"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Informasi Peringatan yang akan dimasukkan ke Barcode */}
        <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
          <div>
            <span className="font-semibold text-amber-950">
              Otomatis disertakan pada isi Barcode:
            </span>{' '}
            Setiap barcode yang dihasilkan akan memuat data aset di atas disertai catatan resmi:{' '}
            <em className="font-medium text-amber-950">
              "Untuk peminjaman atau pemindahan barang harus menghubungi pihak Tata Usaha Bagian ASET"
            </em>
            .
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
          >
            {isEditing ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Simpan Perubahan & Perbarui Barcode
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Simpan Aset & Buat Barcode
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
