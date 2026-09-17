import React, { useState } from 'react';
import {
  Search,
  Filter,
  QrCode,
  Edit3,
  Trash2,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  Tag,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { SchoolAsset, AssetCondition } from '../types';

interface AssetTableProps {
  assets: SchoolAsset[];
  onViewBarcode: (asset: SchoolAsset) => void;
  onEdit: (asset: SchoolAsset) => void;
  onDelete: (id: string) => void;
  onBatchPrint: () => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  onViewBarcode,
  onEdit,
  onDelete,
  onBatchPrint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKondisi, setFilterKondisi] = useState<string>('all');
  const [filterLokasi, setFilterLokasi] = useState<string>('all');

  // Unique locations for dropdown
  const uniqueLocations = Array.from(new Set(assets.map((a) => a.lokasiPenggunaan))).filter(Boolean);

  const filteredAssets = assets.filter((asset) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      asset.namaBarang.toLowerCase().includes(q) ||
      asset.kodeBarang.toLowerCase().includes(q) ||
      asset.lokasiPenggunaan.toLowerCase().includes(q) ||
      asset.asalPenerimaan.toLowerCase().includes(q);

    const matchKondisi =
      filterKondisi === 'all' || asset.kondisiBarang === filterKondisi;

    const matchLokasi =
      filterLokasi === 'all' || asset.lokasiPenggunaan === filterLokasi;

    return matchSearch && matchKondisi && matchLokasi;
  });

  const getKondisiBadge = (kondisi: AssetCondition) => {
    switch (kondisi) {
      case 'Baik':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            Baik
          </span>
        );
      case 'Rusak Ringan':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            Rusak Ringan
          </span>
        );
      case 'Rusak Berat':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            Rusak Berat
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
            {kondisi}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Daftar Inventaris Aset Sekolah
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {assets.length} Total Aset
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola barang inventaris sekolah dan cetak barcode label aset
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onBatchPrint}
            disabled={assets.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Lembar Barcode (Semua)
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama barang, kode, lokasi, atau sumber dana..."
            className="w-full pl-9 pr-3.5 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Filter Kondisi */}
        <div className="sm:col-span-3">
          <select
            value={filterKondisi}
            onChange={(e) => setFilterKondisi(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
          >
            <option value="all">Semua Kondisi</option>
            <option value="Baik">Kondisi: Baik</option>
            <option value="Rusak Ringan">Kondisi: Rusak Ringan</option>
            <option value="Rusak Berat">Kondisi: Rusak Berat</option>
          </select>
        </div>

        {/* Filter Lokasi */}
        <div className="sm:col-span-3">
          <select
            value={filterLokasi}
            onChange={(e) => setFilterLokasi(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
          >
            <option value="all">Semua Lokasi</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            Tidak ada data aset yang cocok
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {assets.length === 0
              ? 'Belum ada aset sekolah yang diinput. Silakan gunakan formulir input di atas untuk mendaftarkan barang.'
              : 'Coba ubah kata kunci pencarian atau setelan filter kondisi/lokasi.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Kode & Nama Barang</th>
                <th className="py-3 px-4">Kondisi</th>
                <th className="py-3 px-4">Lokasi Penggunaan</th>
                <th className="py-3 px-4">Tahun / Asal Penerimaan</th>
                <th className="py-3 px-4 text-center">Output Barcode</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Kode & Nama Barang */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded inline-block mb-1">
                      {asset.kodeBarang}
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {asset.namaBarang}
                    </div>
                    {asset.catatanTambahan && (
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        {asset.catatanTambahan}
                      </div>
                    )}
                  </td>

                  {/* Kondisi */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getKondisiBadge(asset.kondisiBarang)}
                  </td>

                  {/* Lokasi */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{asset.lokasiPenggunaan}</span>
                    </div>
                  </td>

                  {/* Tahun & Asal */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-800 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Tahun {asset.tahunPenerimaan}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {asset.asalPenerimaan}
                    </div>
                  </td>

                  {/* Output Barcode */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewBarcode(asset)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Lihat Barcode
                    </button>
                  </td>

                  {/* Aksi */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(asset)}
                        title="Edit data aset"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Apakah Anda yakin ingin menghapus data aset "${asset.namaBarang}" (${asset.kodeBarang})?`
                            )
                          ) {
                            onDelete(asset.id);
                          }
                        }}
                        title="Hapus aset"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
