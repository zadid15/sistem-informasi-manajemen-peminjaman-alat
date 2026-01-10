import React, { useState } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
}

export function QRScanner({ isOpen, onClose, onScan, title = 'Scan QR Code' }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulasi scanning (karena kita tidak bisa akses kamera secara real)
  const handleSimulateScan = () => {
    setIsScanning(true);
    setError(null);
    
    // Simulasi delay scanning
    setTimeout(() => {
      const mockScanData = `TOOL-LAP-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      setScanResult(mockScanData);
      setIsScanning(false);
      
      // Auto close setelah 1.5 detik
      setTimeout(() => {
        onScan(mockScanData);
        handleClose();
      }, 1500);
    }, 2000);
  };

  const handleClose = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Preview Area */}
          <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
            {/* Simulated Camera View */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!isScanning && !scanResult && (
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-75">Arahkan kamera ke QR Code</p>
                </div>
              )}

              {isScanning && (
                <div className="text-center text-white">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm opacity-75">Scanning...</p>
                </div>
              )}

              {scanResult && (
                <div className="text-center text-white">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <p className="text-sm opacity-75 mb-2">Berhasil!</p>
                  <p className="text-xs font-mono bg-black/30 px-3 py-2 rounded">
                    {scanResult}
                  </p>
                </div>
              )}

              {error && (
                <div className="text-center text-white">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                  <p className="text-sm opacity-75">{error}</p>
                </div>
              )}
            </div>

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-lg">
                  <div className="w-full h-0.5 bg-red-500 animate-pulse" style={{
                    animation: 'scan 2s ease-in-out infinite',
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Petunjuk Scan:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Pastikan QR Code terlihat jelas</li>
              <li>• Jaga jarak yang cukup dari QR Code</li>
              <li>• Pastikan pencahayaan memadai</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isScanning && !scanResult && (
              <>
                <Button onClick={handleSimulateScan} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Mulai Scan (Demo)
                </Button>
                <Button onClick={handleClose} variant="outline">
                  Batal
                </Button>
              </>
            )}

            {(isScanning || scanResult) && (
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Tutup
              </Button>
            )}
          </div>
        </div>

        <style>{`
          @keyframes scan {
            0% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(192px);
            }
            100% {
              transform: translateY(0);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
