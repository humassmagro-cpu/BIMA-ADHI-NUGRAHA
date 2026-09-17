import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  X,
  QrCode,
  AlertTriangle,
  Eye,
  FileText,
} from 'lucide-react';
import { SchoolAsset, formatBarcodePayload, SCHOOL_INFO } from '../types';
import {
  generateQrDataUrl,
  generateQrSvgString,
  renderCode128Barcode,
} from '../utils/barcode';
import { OfficialKopSurat } from './OfficialKopSurat';

interface BarcodeOutputModalProps {
  asset: SchoolAsset | null;
  onClose: () => void;
}

export const BarcodeOutputModal: React.FC<BarcodeOutputModalProps> = ({
  asset,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'barcode-only' | 'sticker' | 'raw-payload'>('barcode-only');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [barcodeType, setBarcodeType] = useState<'2D-QR' | '1D-Code128'>('2D-QR');
  const canvas1DRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!asset) return;

    let isMounted = true;
    generateQrDataUrl(asset).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });

    return () => {
      isMounted = false;
    };
  }, [asset]);

  useEffect(() => {
    if (asset && canvas1DRef.current && barcodeType === '1D-Code128') {
      renderCode128Barcode(canvas1DRef.current, asset.kodeBarang);
    }
  }, [asset, barcodeType, activeTab]);

  if (!asset) return null;

  const rawPayload = formatBarcodePayload(asset);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(rawPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Barcode-${asset.kodeBarang}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSvg = async () => {
    const svgStr = await generateQrSvgString(asset);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Barcode-${asset.kodeBarang}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Label Aset - ${asset.kodeBarang}</title>
          <style>
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              font-family: Arial, "Times New Roman", sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              background-color: #fff;
            }
            .sticker-card {
              width: 420px;
              border: 2px solid #0f172a;
              border-radius: 8px;
              padding: 14px 16px;
              box-sizing: border-box;
              background: #ffffff;
            }
            .kop-header {
              text-align: center;
              margin-bottom: 8px;
            }
            .kop-pemerintah {
              font-size: 11px;
              font-weight: bold;
              letter-spacing: 0.8px;
              text-transform: uppercase;
              color: #0f172a;
              line-height: 1.25;
            }
            .kop-dinas {
              font-size: 11px;
              font-weight: bold;
              letter-spacing: 0.8px;
              text-transform: uppercase;
              color: #0f172a;
              line-height: 1.25;
            }
            .kop-sekolah {
              font-size: 13px;
              font-weight: 900;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              color: #000000;
              margin-top: 2px;
              line-height: 1.3;
            }
            .kop-alamat {
              font-size: 9px;
              color: #334155;
              margin-top: 3px;
              line-height: 1.2;
            }
            .kop-kontak {
              font-size: 8.5px;
              color: #475569;
              line-height: 1.2;
            }
            .kop-divider {
              border-top: 2px solid #0f172a;
              border-bottom: 1px solid #0f172a;
              height: 2px;
              margin: 6px 0 10px 0;
            }
            .body-content {
              display: flex;
              gap: 12px;
              align-items: center;
            }
            .qr-img {
              width: 115px;
              height: 115px;
              border: 1px solid #e2e8f0;
              padding: 2px;
            }
            .details {
              font-size: 11px;
              line-height: 1.45;
              font-family: Arial, sans-serif;
            }
            .details strong {
              display: block;
              font-size: 12.5px;
              color: #0f172a;
              margin-bottom: 2px;
            }
            .code-badge {
              display: inline-block;
              background: #f1f5f9;
              padding: 2px 7px;
              font-family: monospace;
              font-weight: bold;
              font-size: 11.5px;
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              margin-bottom: 4px;
            }
            .disclaimer-box {
              margin-top: 10px;
              padding: 6px 8px;
              font-size: 9.5px;
              color: #991b1b;
              font-weight: bold;
              text-align: center;
              background: #fef2f2;
              border: 1px dashed #ef4444;
              border-radius: 4px;
              line-height: 1.35;
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="sticker-card">
            <div class="kop-header">
              <div class="kop-pemerintah">${SCHOOL_INFO.provinsi}</div>
              <div class="kop-dinas">${SCHOOL_INFO.dinas}</div>
              <div class="kop-sekolah">${SCHOOL_INFO.namaSekolah}</div>
              <div class="kop-alamat">${SCHOOL_INFO.alamat}</div>
              <div class="kop-kontak">${SCHOOL_INFO.kontak}</div>
            </div>
            <div class="kop-divider"></div>
            <div class="body-content">
              <img src="${qrDataUrl}" class="qr-img" alt="Barcode" />
              <div class="details">
                <div class="code-badge">${asset.kodeBarang}</div>
                <strong>${asset.namaBarang}</strong>
                <div>Lokasi: <b>${asset.lokasiPenggunaan}</b></div>
                <div>Kondisi: <b>${asset.kondisiBarang}</b></div>
                <div>Tahun: ${asset.tahunPenerimaan} | Asal: ${asset.asalPenerimaan}</div>
              </div>
            </div>
            <div class="disclaimer-box">
              ⚠️ PENTING: Untuk peminjaman atau pemindahan barang WAJIB menghubungi pihak Tata Usaha Bagian ASET.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">
                Output Barcode Aset Sekolah
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                {asset.kodeBarang} — {asset.namaBarang}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('barcode-only')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'barcode-only'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Barcode Saja
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sticker')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'sticker'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            Format Stiker Label
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw-payload')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'raw-payload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            Hasil Baca / Isi Barcode
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: BARCODE SAJA */}
          {activeTab === 'barcode-only' && (
            <div className="flex flex-col items-center text-center">
              {/* Type Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-lg mb-4 text-xs font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => setBarcodeType('2D-QR')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    barcodeType === '2D-QR'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  2D Barcode (QR Code Lengkap)
                </button>
                <button
                  type="button"
                  onClick={() => setBarcodeType('1D-Code128')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    barcodeType === '1D-Code128'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  1D Barcode (Garis Kode 128)
                </button>
              </div>

              {/* Barcode Canvas / Image Container */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-inner flex flex-col items-center justify-center min-w-[260px] min-h-[260px]">
                {barcodeType === '2D-QR' ? (
                  qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code ${asset.kodeBarang}`}
                      className="w-56 h-56 object-contain"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                      Memuat barcode...
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-2">
                    <canvas ref={canvas1DRef} />
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {asset.namaBarang}
                    </p>
                  </div>
                )}
              </div>

              {/* Info text */}
              <div className="mt-4 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-lg text-left w-full text-xs text-blue-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Isi Barcode Terenkripsi Lengkap:</span> Saat dipindai kamera HP / barcode scanner, barcode 2D ini langsung memunculkan rincian inventaris serta arahan:{' '}
                  <strong className="underline">
                    wajib menghubungi pihak Tata Usaha Bagian ASET untuk peminjaman/pemindahan
                  </strong>.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-5 w-full">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Unduh PNG
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Unduh SVG
                </button>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Salin Teks Barcode
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FORMAT STIKER LABEL ASET */}
          {activeTab === 'sticker' && (
            <div className="flex flex-col items-center">
              <p className="text-xs text-slate-500 mb-3 text-center">
                Desain label stiker resmi siap cetak untuk ditempelkan pada fisik barang inventaris sekolah.
              </p>

              {/* Physical sticker mockup */}
              <div className="w-full max-w-md p-4 bg-white rounded-lg border-2 border-slate-900 shadow-md text-slate-900 font-sans">
                {/* Header Kop Surat Resmi SMAN 1 Grogol */}
                <OfficialKopSurat />

                {/* Body: Barcode + Details */}
                <div className="flex items-center gap-3">
                  <div className="shrink-0 bg-white p-1 rounded border border-slate-200">
                    {qrDataUrl && (
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="w-24 h-24 object-contain"
                      />
                    )}
                  </div>
                  <div className="text-xs space-y-1 overflow-hidden">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-300 font-mono font-bold text-[11px] rounded">
                      {asset.kodeBarang}
                    </span>
                    <h4 className="font-bold text-slate-900 leading-snug line-clamp-2">
                      {asset.namaBarang}
                    </h4>
                    <div className="text-[11px] text-slate-600">
                      Lokasi: <span className="font-semibold text-slate-800">{asset.lokasiPenggunaan}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Tahun: <span className="font-semibold">{asset.tahunPenerimaan}</span> | Kondisi: <span className="font-semibold">{asset.kondisiBarang}</span>
                    </div>
                  </div>
                </div>

                {/* TU Disclaimer Note */}
                <div className="mt-3 pt-2 border-t border-dashed border-slate-300 bg-amber-50/90 border border-amber-200 rounded p-2 text-center">
                  <p className="text-[10.5px] font-bold text-red-900 leading-tight">
                    ⚠️ PEMBERITAHUAN: Untuk peminjaman atau pemindahan barang WAJIB menghubungi pihak Tata Usaha Bagian ASET.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-3 mt-5 w-full">
                <button
                  type="button"
                  onClick={handlePrintLabel}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Stiker Label Ini
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: HASIL BACA / SIMULASI SCAN */}
          {activeTab === 'raw-payload' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Isi Teks Barcode (Hasil Pemindaian)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Berikut adalah data riil yang tertanam langsung di dalam kode batang.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Tersalin' : 'Salin Semua'}
                </button>
              </div>

              <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner max-h-72 overflow-y-auto">
                {rawPayload}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Verifikasi Data Sesuai Permintaan:
                </div>
                <p>• Nama Barang: {asset.namaBarang}</p>
                <p>• Kode Barang: {asset.kodeBarang}</p>
                <p>• Kondisi Barang: {asset.kondisiBarang}</p>
                <p>• Lokasi Penggunaan: {asset.lokasiPenggunaan}</p>
                <p>• Tahun Penerimaan: {asset.tahunPenerimaan}</p>
                <p>• Asal Penerimaan: {asset.asalPenerimaan}</p>
                <p className="text-amber-800 font-medium">
                  • Peringatan Tata Usaha: Termasuk dalam teks barcode
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Bagian Pengelolaan Inventaris & Aset Sekolah</span>
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
