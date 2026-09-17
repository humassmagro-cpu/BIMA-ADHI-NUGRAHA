import React, { useState, useEffect } from 'react';
import {
  School,
  QrCode,
  PlusCircle,
  ListFilter,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Building,
  RotateCcw,
  Sparkles,
  LogIn,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { SchoolAsset } from './types';
import {
  getStoredAssets,
  saveStoredAssets,
  INITIAL_ASSETS,
} from './utils/storage';
import {
  fetchAssetsFromCloudSql,
  saveAssetToCloudSql,
  updateAssetInCloudSql,
  deleteAssetInCloudSql,
} from './utils/api';
import { useAuth } from './context/AuthContext';
import { AssetForm } from './components/AssetForm';
import { AssetTable } from './components/AssetTable';
import { BarcodeOutputModal } from './components/BarcodeOutputModal';
import { BatchPrintModal } from './components/BatchPrintModal';

export default function App() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [assets, setAssets] = useState<SchoolAsset[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'list'>('input');
  const [selectedAssetForBarcode, setSelectedAssetForBarcode] = useState<SchoolAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<SchoolAsset | null>(null);
  const [showBatchPrint, setShowBatchPrint] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info';
    asset?: SchoolAsset;
  } | null>(null);

  // Load data from Cloud SQL (with local fallback)
  useEffect(() => {
    fetchAssetsFromCloudSql().then((data) => {
      if (data && data.length > 0) {
        setAssets(data);
      }
    });
  }, []);

  // Save changes locally and keep state in sync
  const updateAssets = (newAssets: SchoolAsset[]) => {
    setAssets(newAssets);
    saveStoredAssets(newAssets);
  };

  // Handle saving new or edited asset
  const handleSaveAsset = async (
    assetData: Omit<SchoolAsset, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    const now = new Date().toISOString();

    if (id) {
      // Edit existing
      const updated = assets.map((a) =>
        a.id === id ? { ...a, ...assetData, updatedAt: now } : a
      );
      updateAssets(updated);
      setEditingAsset(null);

      updateAssetInCloudSql(id, assetData);

      const savedItem = updated.find((a) => a.id === id);
      setNotification({
        message: `Data aset "${assetData.namaBarang}" berhasil diperbarui!`,
        type: 'success',
        asset: savedItem,
      });
    } else {
      // Create new
      const newId = 'asset-' + Date.now();
      const newAssetData: Omit<SchoolAsset, 'createdAt' | 'updatedAt'> = {
        ...assetData,
        id: newId,
      };

      const savedCloudAsset = await saveAssetToCloudSql(newAssetData);
      const updated = [savedCloudAsset, ...assets];
      updateAssets(updated);

      setNotification({
        message: `Aset "${assetData.namaBarang}" berhasil dicatat! Barcode siap dicetak.`,
        type: 'success',
        asset: savedCloudAsset,
      });

      // Automatically open barcode output modal for instant satisfaction
      setSelectedAssetForBarcode(savedCloudAsset);
    }
  };

  const handleDeleteAsset = (id: string) => {
    const updated = assets.filter((a) => a.id !== id);
    updateAssets(updated);
    deleteAssetInCloudSql(id);
    if (editingAsset && editingAsset.id === id) {
      setEditingAsset(null);
    }
  };

  const handleStartEdit = (asset: SchoolAsset) => {
    setEditingAsset(asset);
    setActiveTab('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Kembalikan ke data contoh bawaan sekolah? Data saat ini akan di-reset.'
      )
    ) {
      updateAssets(INITIAL_ASSETS);
      setNotification({
        message: 'Data aset berhasil di-reset ke data bawaan.',
        type: 'info',
      });
    }
  };

  // Statistics
  const totalAssets = assets.length;
  const countBaik = assets.filter((a) => a.kondisiBarang === 'Baik').length;
  const countRusakRingan = assets.filter(
    (a) => a.kondisiBarang === 'Rusak Ringan'
  ).length;
  const countRusakBerat = assets.filter(
    (a) => a.kondisiBarang === 'Rusak Berat'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Bar / Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Pencatatan Aset SMAN 1 Grogol
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    TU Bagian Aset
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  SMA Negeri 1 Grogol Kabupaten Kediri • Sistem Inventaris & Label Barcode Resmi
                </p>
              </div>
            </div>

            {/* Quick Action / Notice & Auth */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'Petugas'} className="w-full h-full object-cover" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-white font-medium truncate max-w-[120px]">
                      {user.displayName || 'Petugas'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={signOut}
                    className="text-slate-400 hover:text-rose-300 ml-1 p-1 hover:bg-slate-700 rounded transition-colors"
                    title="Keluar"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-200 bg-blue-900/40 hover:bg-blue-800/60 rounded-lg transition-colors border border-blue-500/40"
                  title="Masuk sebagai Petugas Tata Usaha"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Masuk Petugas
                </button>
              )}

              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
                title="Muat Ulang Data Contoh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Official TU Warning Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-950 px-4 py-2.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 px-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-semibold text-amber-900">Ketentuan Penting Tata Usaha:</span>
          <span>
            Setiap barcode yang dihasilkan secara otomatis menyertakan mandat resmi:{' '}
            <strong>
              "Untuk peminjaman atau pemindahan barang harus menghubungi pihak Tata Usaha Bagian ASET"
            </strong>
            .
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {notification.asset && (
                <button
                  type="button"
                  onClick={() => setSelectedAssetForBarcode(notification.asset!)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-2xs transition-colors"
                >
                  Buka Barcode
                </button>
              )}
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold px-1"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Total Aset Tercatat</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalAssets}</div>
            <span className="text-[10px] text-slate-400">Barang inventaris</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-emerald-600 font-medium">Kondisi Baik</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{countBaik}</div>
            <span className="text-[10px] text-slate-400">Siap digunakan</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-amber-600 font-medium">Rusak Ringan</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">{countRusakRingan}</div>
            <span className="text-[10px] text-slate-400">Perlu perbaikan</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-red-600 font-medium">Rusak Berat</span>
            <div className="text-2xl font-bold text-red-700 mt-1">{countRusakBerat}</div>
            <span className="text-[10px] text-slate-400">Rekomendasi afkir/ganti</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-slate-300 gap-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('input');
            }}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'input'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {editingAsset ? 'Formulir Edit Aset' : 'Input Pencatatan Aset'}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('list');
              setEditingAsset(null);
            }}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            Daftar Inventaris & Cetak Barcode ({assets.length})
          </button>
        </div>

        {/* Dynamic View Sections */}
        {activeTab === 'input' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Main Column: Form */}
            <div className="lg:col-span-8">
              <AssetForm
                initialAsset={editingAsset}
                onSave={handleSaveAsset}
                onCancel={() => setEditingAsset(null)}
                isEditing={!!editingAsset}
              />
            </div>

            {/* Right Column: Quick Guidance / Barcode Information */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  Output Barcode Otomatis
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setelah petugas mengisi formulir (Nama, Kode, Kondisi, Lokasi, Tahun, dan Asal Penerimaan), sistem langsung menggenerate:
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong className="text-slate-800">Barcode Saja:</strong> Gambar kode batang 2D beresolusi tinggi (PNG/SVG).
                  </li>
                  <li>
                    <strong className="text-slate-800">Label Stiker Fisik:</strong> Format siap cetak untuk ditempelkan ke unit barang.
                  </li>
                  <li>
                    <strong className="text-slate-800">Peringatan Tata Usaha:</strong> Menyematkan pesan bahwa peminjaman/pemindahan barang wajib seizin TU Bagian Aset.
                  </li>
                </ul>
              </div>

              {/* Latest Assets Quick Access */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Aset Terakhir Dicatat
                </h4>
                {assets.length === 0 ? (
                  <p className="text-xs text-slate-400">Belum ada aset.</p>
                ) : (
                  <div className="space-y-2.5">
                    {assets.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between"
                      >
                        <div className="overflow-hidden pr-2">
                          <span className="font-mono text-[10px] font-bold text-blue-600">
                            {item.kodeBarang}
                          </span>
                          <div className="text-xs font-semibold text-slate-800 truncate">
                            {item.namaBarang}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {item.lokasiPenggunaan}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedAssetForBarcode(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors shrink-0"
                          title="Lihat Barcode"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {assets.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="w-full mt-3 text-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Lihat semua {assets.length} aset →
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <AssetTable
            assets={assets}
            onViewBarcode={(asset) => setSelectedAssetForBarcode(asset)}
            onEdit={handleStartEdit}
            onDelete={handleDeleteAsset}
            onBatchPrint={() => setShowBatchPrint(true)}
          />
        )}
      </main>

      {/* Single Asset Barcode Modal ("output dapat barcode saja") */}
      {selectedAssetForBarcode && (
        <BarcodeOutputModal
          asset={selectedAssetForBarcode}
          onClose={() => setSelectedAssetForBarcode(null)}
        />
      )}

      {/* Batch Print Modal */}
      {showBatchPrint && (
        <BatchPrintModal
          assets={assets}
          onClose={() => setShowBatchPrint(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            SMA Negeri 1 Grogol Kabupaten Kediri • Tata Usaha Bagian Pengelolaan Aset & Sarpras
          </div>
          <div className="text-slate-400">
            Jalan Raya Gringging 16 Sonorejo Grogol Kediri 64151 • Telp (0354) 773009
          </div>
        </div>
      </footer>
    </div>
  );
}
