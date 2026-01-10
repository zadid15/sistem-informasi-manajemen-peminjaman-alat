import { useState } from 'react';
import { Search, Package, User, CheckCircle, Clock } from 'lucide-react';
import { mockBorrowings } from '../../lib/mock-data';
import type { Borrowing } from '../../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/shared/EmptyState';
import { QRCodeModal } from '../../components/shared/QRCodeModal';

export function DataReturns() {
  const [borrowings] = useState<Borrowing[]>(mockBorrowings);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'returned' | 'overdue'>('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);

  // Filter data pengembalian (hanya yang sudah dikembalikan atau terlambat)
  const returnedBorrowings = borrowings.filter(b => 
    b.status === 'returned' || b.status === 'overdue'
  );

  const filteredBorrowings = returnedBorrowings.filter((borrowing) => {
    const matchesSearch =
      borrowing.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrowing.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrowing.toolCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      borrowing.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleViewQR = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowQRModal(true);
  };

  const statusColors = {
    returned: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    returned: 'Dikembalikan',
    overdue: 'Terlambat',
  };

  const stats = {
    total: returnedBorrowings.length,
    returned: returnedBorrowings.filter(b => b.status === 'returned').length,
    overdue: returnedBorrowings.filter(b => b.status === 'overdue').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Pengembalian</h1>
        <p className="text-gray-600 mt-1">Kelola dan monitor data pengembalian alat</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pengembalian</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tepat Waktu</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.returned}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
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
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengembalian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Cari peminjam, alat, atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                Semua
              </Button>
              <Button
                variant={filterStatus === 'returned' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('returned')}
              >
                Dikembalikan
              </Button>
              <Button
                variant={filterStatus === 'overdue' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('overdue')}
              >
                Terlambat
              </Button>
            </div>
          </div>

          {filteredBorrowings.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Tidak ada data pengembalian"
              description="Data pengembalian akan muncul di sini"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Peminjam</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Alat</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tgl Pinjam</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jatuh Tempo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tgl Kembali</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBorrowings.map((borrowing) => {
                    const isOverdue = borrowing.status === 'overdue';
                    const daysLate = borrowing.returnDate
                      ? Math.floor(
                          (new Date(borrowing.returnDate).getTime() - new Date(borrowing.dueDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0;

                    return (
                      <tr key={borrowing.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{borrowing.borrowerName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{borrowing.toolName}</p>
                            <p className="text-xs text-gray-500">{borrowing.toolCode}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-700">
                            {new Date(borrowing.borrowDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-700">
                            {new Date(borrowing.dueDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-gray-700">
                              {borrowing.returnDate
                                ? new Date(borrowing.returnDate).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '-'}
                            </p>
                            {isOverdue && daysLate > 0 && (
                              <p className="text-xs text-red-600 mt-1">Terlambat {daysLate} hari</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[borrowing.status as 'returned' | 'overdue']}>
                            {statusLabels[borrowing.status as 'returned' | 'overdue']}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewQR(borrowing)}
                          >
                            Lihat QR
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
            { label: 'Peminjam', value: selectedBorrowing.borrowerName },
            { label: 'Alat', value: selectedBorrowing.toolName },
            { label: 'Kode Alat', value: selectedBorrowing.toolCode },
            { label: 'Tanggal Pinjam', value: new Date(selectedBorrowing.borrowDate).toLocaleDateString('id-ID') },
            { label: 'Tanggal Kembali', value: selectedBorrowing.returnDate ? new Date(selectedBorrowing.returnDate).toLocaleDateString('id-ID') : '-' },
          ]}
        />
      )}
    </div>
  );
}
