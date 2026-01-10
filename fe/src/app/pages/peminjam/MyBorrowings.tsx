import { useState } from 'react';
import { Search, QrCode, Calendar, AlertCircle, Package } from 'lucide-react';
import { useApp } from '../../lib/context';
import type { Borrowing } from '../../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/shared/EmptyState';
import { QRCodeModal } from '../../components/shared/QRCodeModal';

export function MyBorrowings() {
  const { currentUser, borrowings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'returned' | 'rejected' | 'overdue'>('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);

  // Filter peminjaman milik user saat ini
  const myBorrowings = borrowings.filter(b => b.borrowerId === currentUser.id);

  const filteredBorrowings = myBorrowings.filter((borrowing) => {
    const matchesSearch =
      borrowing.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrowing.toolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrowing.purpose.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || borrowing.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleViewQR = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowQRModal(true);
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    returned: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
    overdue: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    active: 'Aktif',
    returned: 'Dikembalikan',
    rejected: 'Ditolak',
    overdue: 'Terlambat',
  };

  const stats = {
    pending: myBorrowings.filter(b => b.status === 'pending').length,
    active: myBorrowings.filter(b => b.status === 'active').length,
    overdue: myBorrowings.filter(b => b.status === 'overdue').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Peminjaman Saya</h1>
        <p className="text-gray-600 mt-1">Lihat riwayat dan status peminjaman Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu Persetujuan</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sedang Dipinjam</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terlambat</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Borrowings List */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Peminjaman</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Cari alat atau keperluan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Semua
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Menunggu
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Aktif
              </Button>
              <Button
                variant={filterStatus === 'returned' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('returned')}
                size="sm"
              >
                Selesai
              </Button>
            </div>
          </div>

          {filteredBorrowings.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Belum ada peminjaman"
              description="Peminjaman Anda akan muncul di sini"
            />
          ) : (
            <div className="space-y-4">
              {filteredBorrowings.map((borrowing) => (
                <div
                  key={borrowing.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{borrowing.toolName}</h3>
                          <p className="text-sm text-gray-500">{borrowing.toolCode}</p>
                        </div>
                        <Badge className={statusColors[borrowing.status]}>
                          {statusLabels[borrowing.status]}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(borrowing.borrowDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                            {' - '}
                            {new Date(borrowing.dueDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">Keperluan:</span> {borrowing.purpose}
                        </p>

                        {borrowing.status === 'rejected' && borrowing.rejectedReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-900 mb-1">Alasan Ditolak:</p>
                            <p className="text-sm text-red-800">{borrowing.rejectedReason}</p>
                          </div>
                        )}

                        {borrowing.status === 'active' && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                              <span className="font-medium">Disetujui oleh:</span> {borrowing.approvedBy}
                            </p>
                          </div>
                        )}

                        {borrowing.status === 'overdue' && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <p className="text-sm text-red-800">
                              Peminjaman Anda sudah melewati batas waktu pengembalian. Segera kembalikan alat!
                            </p>
                          </div>
                        )}

                        {borrowing.returnDate && (
                          <p className="text-sm">
                            <span className="font-medium">Dikembalikan:</span>{' '}
                            {new Date(borrowing.returnDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {(borrowing.status === 'active' || borrowing.status === 'approved') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewQR(borrowing)}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Lihat QR
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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
            { label: 'Keperluan', value: selectedBorrowing.purpose },
          ]}
        />
      )}
    </div>
  );
}
