import React, { useEffect, useState } from 'react';
import { X, Printer, CheckSquare, Square } from 'lucide-react';
import { SchoolAsset, DEFAULT_DISCLAIMER } from '../types';
import { generateQrDataUrl } from '../utils/barcode';
import { OfficialKopSurat } from './OfficialKopSurat';

interface BatchPrintModalProps {
  assets: SchoolAsset[];
  onClose: () => void;
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  assets,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(assets.map((a) => a.id))
  );
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    const generateAll = async () => {
      const map: Record<string, string> = {};
      for (const asset of assets) {
        map[asset.id] = await generateQrDataUrl(asset);
      }
      if (isMounted) {
        setQrMap(map);
        setIsGenerating(false);
      }
    };

    generateAll();

    return () => {
      isMounted = false;
    };
  }, [assets]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === assets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(assets.map((a) => a.id)));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const printableAssets = assets.filter((a) => selectedIds.has(a.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Container - hide during window.print so only print area is active */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-6">
        {/* Header - Screen only */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-base">
                Cetak Lembar Barcode Stiker Aset (Batch)
              </h3>
              <p className="text-xs text-slate-300">
                Format stiker label inventaris resmi sekolah dengan barcode & peringatan TU
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar - Screen only */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs"
            >
              {selectedIds.size === assets.length ? (
                <>
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  Batal Pilih Semua
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" />
                  Pilih Semua ({assets.length})
                </>
              )}
            </button>
            <span className="text-xs text-slate-500">
              Terpilih: <strong>{selectedIds.size}</strong> dari {assets.length} aset
            </span>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            disabled={printableAssets.length === 0 || isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            {isGenerating ? 'Menyiapkan Barcode...' : 'Cetak Sekarang (Print)'}
          </button>
        </div>

        {/* Content Area - Scrollable on Screen, standard page flow on print */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/50">
          {isGenerating ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Sedang memproses seluruh barcode data aset...
            </div>
          ) : printableAssets.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Silakan centang minimal satu aset untuk mencetak label.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
              {printableAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-lg border-2 border-slate-900 p-3 shadow-xs flex flex-col justify-between break-inside-avoid"
                >
                  {/* Kop Surat Resmi SMAN 1 Grogol */}
                  <OfficialKopSurat compact />

                  {/* Body: Barcode + Info */}
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {qrMap[asset.id] ? (
                        <img
                          src={qrMap[asset.id]}
                          alt={asset.kodeBarang}
                          className="w-20 h-20 object-contain"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-[9px] text-slate-400">
                          QR
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] space-y-0.5 overflow-hidden">
                      <div className="font-mono font-bold text-[11px] text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 inline-block mb-0.5">
                        {asset.kodeBarang}
                      </div>
                      <div className="font-bold text-slate-900 leading-snug line-clamp-2">
                        {asset.namaBarang}
                      </div>
                      <div className="text-slate-600 text-[10px]">
                        Lokasi: <span className="font-semibold">{asset.lokasiPenggunaan}</span>
                      </div>
                      <div className="text-slate-500 text-[9px]">
                        Th: {asset.tahunPenerimaan} | Kondisi: {asset.kondisiBarang}
                      </div>
                    </div>
                  </div>

                  {/* Peringatan Tata Usaha */}
                  <div className="mt-2 pt-1 border-t border-dashed border-slate-400 text-center bg-amber-50 border border-amber-200 rounded p-1.5">
                    <p className="text-[9px] font-bold text-red-900 leading-tight">
                      ⚠️ Untuk peminjaman/pemindahan barang harus menghubungi TU Bagian ASET.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Screen only */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500 shrink-0 print:hidden">
          <span>Tip: Gunakan stiker label tahan air untuk hasil inventaris tahan lama.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
