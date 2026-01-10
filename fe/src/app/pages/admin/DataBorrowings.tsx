import { useState } from 'react';
import { Search, Eye, FileText, Download, QrCode } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockBorrowings } from '../../lib/mock-data';
import type { Borrowing } from '../../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { QRCodeModal } from '../../components/shared/QRCodeModal';
import { EmptyState } from '../../components/shared/EmptyState';

export function DataBorrowings() {
  const [borrowings] = useState<Borrowing[]>(mockBorrowings);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);

  // Filter borrowings
  const filteredBorrowings = borrowings.filter((borrowing) => {
    const matchesSearch =
      borrowing.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrowing.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrowing.toolCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || borrowing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetailModal = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowDetailModal(true);
  };

  const openQRModal = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowQRModal(true);
  };

  const handleExport = () => {
    // Simulate export
    const csvData = filteredBorrowings
      .map((b) =>
        [
          b.id,
          b.borrowerName,
          b.toolName,
          b.toolCode,
          new Date(b.borrowDate).toLocaleDateString('id-ID'),
          new Date(b.dueDate).toLocaleDateString('id-ID'),
          b.returnDate ? new Date(b.returnDate).toLocaleDateString('id-ID') : '-',
          b.status,
        ].join(',')
      )
      .join('\n');

    const header = 'ID,Peminjam,Alat,Kode,Tgl Pinjam,Jatuh Tempo,Tgl Kembali,Status\n';
    const blob = new Blob([header + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-peminjaman-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Peminjaman</h1>
          <p className="text-gray-600 mt-1">Riwayat dan data peminjaman alat</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari peminjam, alat, atau kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="returned">Dikembalikan</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
              <SelectItem value="overdue">Terlambat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Borrowings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredBorrowings.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Tidak ada data peminjaman"
            description="Belum ada peminjaman atau coba ubah filter pencarian"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Peminjam</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Alat</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Tgl Pinjam</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Jatuh Tempo</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBorrowings.map((borrowing) => (
                  <tr key={borrowing.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <p className="text-sm font-mono text-gray-900">#{borrowing.id}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-900">{borrowing.borrowerName}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{borrowing.toolName}</p>
                        <p className="text-xs text-gray-500">{borrowing.toolCode}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-700">
                        {new Date(borrowing.borrowDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-700">
                        {new Date(borrowing.dueDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={statusColors[borrowing.status]}>
                        {statusLabels[borrowing.status]}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openDetailModal(borrowing)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openQRModal(borrowing)}>
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBorrowing && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Peminjaman #{selectedBorrowing.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Peminjam</p>
                  <p className="text-sm text-gray-900">{selectedBorrowing.borrowerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                  <Badge className={statusColors[selectedBorrowing.status]}>
                    {statusLabels[selectedBorrowing.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Alat</p>
                  <p className="text-sm text-gray-900">{selectedBorrowing.toolName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Kode Alat</p>
                  <p className="text-sm font-mono text-gray-900">{selectedBorrowing.toolCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Tanggal Pinjam</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedBorrowing.borrowDate).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Jatuh Tempo</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedBorrowing.dueDate).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {selectedBorrowing.returnDate && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-600 mb-1">Tanggal Dikembalikan</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedBorrowing.returnDate).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
                {selectedBorrowing.approvedBy && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Disetujui Oleh</p>
                      <p className="text-sm text-gray-900">{selectedBorrowing.approvedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Waktu Persetujuan</p>
                      <p className="text-sm text-gray-900">
                        {selectedBorrowing.approvedAt &&
                          new Date(selectedBorrowing.approvedAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tujuan Peminjaman</p>
                <p className="text-sm text-gray-900">{selectedBorrowing.purpose}</p>
              </div>
              {selectedBorrowing.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Catatan</p>
                  <p className="text-sm text-gray-900">{selectedBorrowing.notes}</p>
                </div>
              )}
              {selectedBorrowing.rejectedReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-900 mb-1">Alasan Penolakan</p>
                  <p className="text-sm text-red-800">{selectedBorrowing.rejectedReason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* QR Code Modal */}
      {selectedBorrowing && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          title={`QR Code Peminjaman #${selectedBorrowing.id}`}
          qrCodeUrl={selectedBorrowing.qrCode}
          data={[
            { label: 'ID Peminjaman', value: `#${selectedBorrowing.id}` },
            { label: 'Peminjam', value: selectedBorrowing.borrowerName },
            { label: 'Alat', value: selectedBorrowing.toolName },
            { label: 'Kode Alat', value: selectedBorrowing.toolCode },
            {
              label: 'Tanggal Pinjam',
              value: new Date(selectedBorrowing.borrowDate).toLocaleDateString('id-ID'),
            },
            {
              label: 'Jatuh Tempo',
              value: new Date(selectedBorrowing.dueDate).toLocaleDateString('id-ID'),
            },
          ]}
        />
      )}
    </div>
  );
}
