import { useState } from 'react';
import { QrCode, Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { QRScanner } from '../../components/shared/QRScanner';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

export function ScanQR() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanType, setScanType] = useState<'borrow' | 'return'>('borrow');
  const [recentScans, setRecentScans] = useState<
    Array<{ id: string; type: string; data: string; time: string }>
  >([]);

  const handleStartScan = (type: 'borrow' | 'return') => {
    setScanType(type);
    setShowScanner(true);
  };

  const handleScan = (data: string) => {
    const newScan = {
      id: `${Date.now()}`,
      type: scanType === 'borrow' ? 'Peminjaman' : 'Pengembalian',
      data: data,
      time: new Date().toISOString(),
    };

    setRecentScans([newScan, ...recentScans.slice(0, 9)]);

    if (scanType === 'borrow') {
      toast.success('QR Code berhasil dipindai - Data peminjaman terekam');
    } else {
      toast.success('QR Code berhasil dipindai - Pengembalian dicatat');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
        <p className="text-gray-600 mt-1">Scan QR untuk peminjaman dan pengembalian</p>
      </div>

      {/* Scan Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan Peminjaman</h3>
              <p className="text-sm text-gray-600 mb-6">
                Scan QR Code alat untuk mencatat peminjaman baru
              </p>
              <Button
                onClick={() => handleStartScan('borrow')}
                className="w-full"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Mulai Scan Peminjaman
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan Pengembalian</h3>
              <p className="text-sm text-gray-600 mb-6">
                Scan QR Code untuk mencatat pengembalian alat
              </p>
              <Button
                onClick={() => handleStartScan('return')}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Mulai Scan Pengembalian
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Petunjuk Penggunaan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">Scan Peminjaman</h4>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Klik tombol "Mulai Scan Peminjaman"</li>
                <li>Arahkan kamera ke QR Code alat</li>
                <li>Sistem akan otomatis membaca dan mencatat data</li>
                <li>Konfirmasi data peminjaman</li>
                <li>Serahkan alat kepada peminjam</li>
              </ol>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-900 mb-2">Scan Pengembalian</h4>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Terima alat dari peminjam</li>
                <li>Klik tombol "Mulai Scan Pengembalian"</li>
                <li>Scan QR Code pada peminjaman atau alat</li>
                <li>Sistem akan mencatat pengembalian</li>
                <li>Cek kondisi alat dan simpan kembali</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Riwayat Scan Terbaru</h3>
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        scan.type === 'Peminjaman' ? 'bg-blue-100' : 'bg-green-100'
                      }`}
                    >
                      <QrCode
                        className={`w-5 h-5 ${
                          scan.type === 'Peminjaman' ? 'text-blue-600' : 'text-green-600'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={
                            scan.type === 'Peminjaman'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {scan.type}
                        </Badge>
                        <span className="text-sm font-mono text-gray-900">{scan.data}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {new Date(scan.time).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title={scanType === 'borrow' ? 'Scan QR Peminjaman' : 'Scan QR Pengembalian'}
      />
    </div>
  );
}
