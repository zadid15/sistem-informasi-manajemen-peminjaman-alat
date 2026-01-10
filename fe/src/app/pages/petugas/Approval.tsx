import { useState } from 'react';
import { Check, X, Eye, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import type { Borrowing } from '../../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { EmptyState } from '../../components/shared/EmptyState';
import { useApp } from '../../lib/context';
import { toast } from 'sonner';

export function ApprovalBorrowings() {
  const { borrowings, updateBorrowingStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Filter pending borrowings
  const pendingBorrowings = borrowings.filter((b) => b.status === 'pending');
  const filteredBorrowings = pendingBorrowings.filter((borrowing) =>
    borrowing.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    borrowing.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    borrowing.toolCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDetailModal = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowDetailModal(true);
  };

  const openApproveDialog = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowApproveDialog(true);
  };

  const openRejectModal = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleApprove = () => {
    if (selectedBorrowing) {
      updateBorrowingStatus(selectedBorrowing.id, 'approved');
      toast.success('Peminjaman berhasil disetujui');
      setSelectedBorrowing(null);
    }
  };

  const handleReject = () => {
    if (selectedBorrowing && rejectReason.trim()) {
      updateBorrowingStatus(selectedBorrowing.id, 'rejected', rejectReason);
      setShowRejectModal(false);
      setSelectedBorrowing(null);
      setRejectReason('');
      toast.success('Peminjaman ditolak');
    } else {
      toast.error('Harap masukkan alasan penolakan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Persetujuan Peminjaman</h1>
        <p className="text-gray-600 mt-1">Proses pengajuan peminjaman alat</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Cari peminjam atau alat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Total Pengajuan Menunggu</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{filteredBorrowings.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Borrowings List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredBorrowings.length === 0 ? (
          <EmptyState
            icon={Check}
            title={searchQuery ? 'Tidak ada pengajuan ditemukan' : 'Semua pengajuan sudah diproses'}
            description={
              searchQuery
                ? 'Coba ubah kata kunci pencarian'
                : 'Tidak ada pengajuan peminjaman yang menunggu persetujuan'
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredBorrowings.map((borrowing) => (
              <div key={borrowing.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Badge className="bg-yellow-600 text-white">Baru</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {borrowing.borrowerName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Mengajukan peminjaman <span className="font-medium">{borrowing.toolName}</span>
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span>Kode: {borrowing.toolCode}</span>
                          <span>•</span>
                          <span>
                            Pinjam: {new Date(borrowing.borrowDate).toLocaleDateString('id-ID')}
                          </span>
                          <span>•</span>
                          <span>
                            Kembali: {new Date(borrowing.dueDate).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(borrowing.borrowDate).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Tujuan:</span> {borrowing.purpose}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetailModal(borrowing)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openApproveDialog(borrowing)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRejectModal(borrowing)}
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Tolak
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBorrowing && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Pengajuan Peminjaman</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Peminjam</p>
                  <p className="text-sm text-gray-900">{selectedBorrowing.borrowerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">ID Peminjaman</p>
                  <p className="text-sm font-mono text-gray-900">#{selectedBorrowing.id}</p>
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
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tujuan Peminjaman</p>
                <p className="text-sm text-gray-900">{selectedBorrowing.purpose}</p>
              </div>
              {selectedBorrowing.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Catatan Tambahan</p>
                  <p className="text-sm text-gray-900">{selectedBorrowing.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Tutup
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  openApproveDialog(selectedBorrowing);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Setujui
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Approve Confirmation */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="Setujui Peminjaman"
        description={`Apakah Anda yakin ingin menyetujui peminjaman ${selectedBorrowing?.toolName} oleh ${selectedBorrowing?.borrowerName}?`}
        confirmText="Setujui"
        variant="success"
      />

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Peminjaman</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Peminjaman <span className="font-medium">{selectedBorrowing?.toolName}</span> oleh{' '}
                <span className="font-medium">{selectedBorrowing?.borrowerName}</span> akan ditolak.
              </p>
            </div>
            <div>
              <Label htmlFor="reject-reason">Alasan Penolakan *</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Batal
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectReason.trim()}
            >
              Tolak Peminjaman
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
