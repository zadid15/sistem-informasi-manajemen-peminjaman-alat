import { useState } from 'react';
import { Package, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../lib/context';
import type { Borrowing } from '../../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/shared/EmptyState';
import { QRCodeModal } from '../../components/shared/QRCodeModal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { toast } from 'sonner';

export function PeminjamReturns() {
  const { currentUser, borrowings, updateBorrowingStatus } = useApp();
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [showConfirmReturn, setShowConfirmReturn] = useState(false);
  const [borrowingToReturn, setBorrowingToReturn] = useState<Borrowing | null>(null);

  // Filter peminjaman yang sedang aktif atau terlambat (bisa dikembalikan)
  const activeBorrowings = borrowings.filter(
    b => b.borrowerId === currentUser.id && (b.status === 'active' || b.status === 'overdue')
  );

  const handleViewQR = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowQRModal(true);
  };

  const handleReturnClick = (borrowing: Borrowing) => {
    setBorrowingToReturn(borrowing);
    setShowConfirmReturn(true);
  };

  const handleConfirmReturn = () => {
    if (borrowingToReturn) {
      updateBorrowingStatus(borrowingToReturn.id, 'returned');
      toast.success('Pengembalian berhasil dicatat', {
        description: `${borrowingToReturn.toolName} telah dikembalikan`,
      });
      setShowConfirmReturn(false);
      setBorrowingToReturn(null);
    }
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengembalian Alat</h1>
        <p className="text-gray-600 mt-1">Kembalikan alat yang telah dipinjam</p>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Petunjuk Pengembalian</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pastikan alat dalam kondisi baik sebelum dikembalikan</li>
                <li>• Tunjukkan QR Code peminjaman kepada petugas</li>
                <li>• Petugas akan melakukan pemindaian dan verifikasi kondisi alat</li>
                <li>• Anda akan menerima notifikasi setelah pengembalian dikonfirmasi</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Borrowings to Return */}
      <Card>
        <CardHeader>
          <CardTitle>Alat yang Sedang Dipinjam</CardTitle>
        </CardHeader>
        <CardContent>
          {activeBorrowings.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Tidak ada alat yang dipinjam"
              description="Anda tidak memiliki peminjaman aktif saat ini"
            />
          ) : (
            <div className="space-y-4">
              {activeBorrowings.map((borrowing) => {
                const daysRemaining = calculateDaysRemaining(borrowing.dueDate);
                const isOverdue = borrowing.status === 'overdue';

                return (
                  <div
                    key={borrowing.id}
                    className={`border rounded-lg p-4 ${
                      isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:shadow-md transition-shadow'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{borrowing.toolName}</h3>
                            <p className="text-sm text-gray-500">{borrowing.toolCode}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">Tanggal Pinjam</p>
                            <p className="font-medium text-gray-900">
                              {new Date(borrowing.borrowDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Jatuh Tempo</p>
                            <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(borrowing.dueDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        {isOverdue ? (
                          <div className="p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-900">Terlambat!</p>
                              <p className="text-sm text-red-800">
                                Alat sudah melewati batas waktu pengembalian. Segera kembalikan!
                              </p>
                            </div>
                          </div>
                        ) : daysRemaining <= 2 ? (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <p className="text-sm text-yellow-800">
                              <span className="font-medium">Perhatian:</span> Jatuh tempo dalam {daysRemaining} hari
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                              Sisa waktu: {daysRemaining} hari
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewQR(borrowing)}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Lihat QR
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleReturnClick(borrowing)}
                          className={isOverdue ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Kembalikan
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      {selectedBorrowing && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedBorrowing(null);
          }}
          title={`QR Code - ${selectedBorrowing.toolName}`}
          qrCodeUrl={selectedBorrowing.qrCode}
          data={[
            { label: 'ID Peminjaman', value: selectedBorrowing.id },
            { label: 'Alat', value: selectedBorrowing.toolName },
            { label: 'Kode Alat', value: selectedBorrowing.toolCode },
            { label: 'Tanggal Pinjam', value: new Date(selectedBorrowing.borrowDate).toLocaleDateString('id-ID') },
            { label: 'Jatuh Tempo', value: new Date(selectedBorrowing.dueDate).toLocaleDateString('id-ID') },
          ]}
        />
      )}

      {/* Confirm Return Dialog */}
      {borrowingToReturn && (
        <ConfirmDialog
          isOpen={showConfirmReturn}
          onClose={() => {
            setShowConfirmReturn(false);
            setBorrowingToReturn(null);
          }}
          onConfirm={handleConfirmReturn}
          title="Konfirmasi Pengembalian"
          description={`Apakah Anda yakin ingin mengembalikan ${borrowingToReturn.toolName}? Pastikan alat dalam kondisi baik sebelum melanjutkan.`}
          confirmText="Ya, Kembalikan"
          cancelText="Batal"
        />
      )}
    </div>
  );
}
