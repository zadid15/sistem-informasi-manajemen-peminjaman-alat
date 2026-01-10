import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useApp } from '../../lib/context';
import type { Borrowing } from '../../lib/types';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { toast } from 'sonner';

export function MonitoringReturns() {
  const { borrowings, updateBorrowingStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);

  // Filter active and overdue borrowings
  const activeBorrowings = borrowings.filter(
    (b) => b.status === 'active' || b.status === 'overdue'
  );

  const filteredBorrowings = activeBorrowings.filter((borrowing) => {
    const matchesSearch =
      borrowing.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrowing.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrowing.toolCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && borrowing.status === 'active') ||
      (statusFilter === 'overdue' && borrowing.status === 'overdue');
    return matchesSearch && matchesStatus;
  });

  // Sort by due date
  const sortedBorrowings = [...filteredBorrowings].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const openDetailModal = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowDetailModal(true);
  };

  const openReturnDialog = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowReturnDialog(true);
  };

  const handleReturn = () => {
    if (selectedBorrowing) {
      updateBorrowingStatus(selectedBorrowing.id, 'returned');
      setSelectedBorrowing(null);
      toast.success('Pengembalian berhasil dicatat');
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const days = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const statusColors: {
    active: string;
    overdue: string;
    pending: string;
  } = {
    active: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  const statusLabels = {
    active: 'Aktif',
    overdue: 'Terlambat',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitoring Pengembalian</h1>
        <p className="text-gray-600 mt-1">Pantau status pengembalian alat</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari peminjam atau alat..."
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
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="overdue">Terlambat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Aktif</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {activeBorrowings.filter((b) => b.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-900">Terlambat</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {activeBorrowings.filter((b) => b.status === 'overdue').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Jatuh Tempo Hari Ini</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {
                  activeBorrowings.filter((b) => {
                    const dueDate = new Date(b.dueDate);
                    const today = new Date();
                    return dueDate.toDateString() === today.toDateString();
                  }).length
                }
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Borrowings List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {sortedBorrowings.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Tidak ada peminjaman aktif"
            description="Semua alat sudah dikembalikan atau belum ada peminjaman"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedBorrowings.map((borrowing) => {
              const daysRemaining = getDaysRemaining(borrowing.dueDate);
              const isOverdue = borrowing.status === 'overdue';
              const isUrgent = daysRemaining <= 1 && !isOverdue;

              return (
                <div
                  key={borrowing.id}
                  className={`p-6 hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : isUrgent ? 'bg-yellow-50' : ''
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isOverdue
                        ? 'bg-red-100'
                        : isUrgent
                          ? 'bg-yellow-100'
                          : 'bg-green-100'
                        }`}
                    >
                      {isOverdue ? (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      ) : isUrgent ? (
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {borrowing.borrowerName}
                            </h3>
                            <Badge className={statusColors[borrowing.status as keyof typeof statusColors] || ''}>
                              {statusLabels[borrowing.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">{borrowing.toolName}</span> ({borrowing.toolCode})
                          </p>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span>
                              Dipinjam: {new Date(borrowing.borrowDate).toLocaleDateString('id-ID')}
                            </span>
                            <span>•</span>
                            <span>
                              Jatuh tempo: {new Date(borrowing.dueDate).toLocaleDateString('id-ID')}
                            </span>
                            {isOverdue && (
                              <>
                                <span>•</span>
                                <span className="text-red-600 font-medium">
                                  Terlambat {Math.abs(daysRemaining)} hari
                                </span>
                              </>
                            )}
                            {!isOverdue && daysRemaining >= 0 && (
                              <>
                                <span>•</span>
                                <span
                                  className={isUrgent ? 'text-yellow-600 font-medium' : ''}
                                >
                                  {daysRemaining === 0
                                    ? 'Hari ini'
                                    : daysRemaining === 1
                                      ? 'Besok'
                                      : `${daysRemaining} hari lagi`}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetailModal(borrowing)}
                        >
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openReturnDialog(borrowing)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Tandai Dikembalikan
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBorrowing && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Peminjaman</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Peminjam</p>
                  <p className="text-sm text-gray-900">{selectedBorrowing.borrowerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                  <Badge className={statusColors[(selectedBorrowing.status as keyof typeof statusColors)]}>
                    {statusLabels[selectedBorrowing.status as keyof typeof statusLabels]}
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
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tujuan Peminjaman</p>
                <p className="text-sm text-gray-900">{selectedBorrowing.purpose}</p>
              </div>
              {selectedBorrowing.approvedBy && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Disetujui Oleh</p>
                  <p className="text-sm text-gray-900">{selectedBorrowing.approvedBy}</p>
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
                  openReturnDialog(selectedBorrowing);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Tandai Dikembalikan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Return Confirmation */}
      <ConfirmDialog
        isOpen={showReturnDialog}
        onClose={() => setShowReturnDialog(false)}
        onConfirm={handleReturn}
        title="Konfirmasi Pengembalian"
        description={`Apakah ${selectedBorrowing?.borrowerName} telah mengembalikan ${selectedBorrowing?.toolName}?`}
        confirmText="Ya, Sudah Dikembalikan"
        variant="success"
      />
    </div>
  );
}
