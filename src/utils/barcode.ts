import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { formatBarcodePayload, SchoolAsset, DEFAULT_DISCLAIMER } from '../types';

/**
 * Generate 2D QR Barcode Data URL containing full asset specification & TU disclaimer
 */
export async function generateQrDataUrl(
  asset: SchoolAsset,
  disclaimer: string = DEFAULT_DISCLAIMER
): Promise<string> {
  const payload = formatBarcodePayload(asset, disclaimer);
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 512,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}

/**
 * Generate 2D QR Barcode SVG String
 */
export async function generateQrSvgString(
  asset: SchoolAsset,
  disclaimer: string = DEFAULT_DISCLAIMER
): Promise<string> {
  const payload = formatBarcodePayload(asset, disclaimer);
  return QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}

/**
 * Render 1D Barcode (Code128) for the asset code onto a canvas element
 */
export function renderCode128Barcode(
  canvas: HTMLCanvasElement,
  code: string
): void {
  try {
    JsBarcode(canvas, code, {
      format: 'CODE128',
      lineColor: '#0f172a',
      width: 2,
      height: 48,
      displayValue: true,
      fontSize: 13,
      font: 'monospace',
      margin: 8,
      background: '#ffffff',
    });
  } catch (error) {
    console.error('Failed to generate Code128 barcode:', error);
  }
}
