import { Package, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useApp } from '../../lib/context';

export function PeminjamDashboard() {
  const { currentUser, borrowings } = useApp();

  // Filter borrowings for current user (by borrowerName for demo)
  const myBorrowings = borrowings.filter((b) => b.borrowerId === currentUser.id);
  const activeBorrowings = myBorrowings.filter((b) => b.status === 'active').length;
  const pendingBorrowings = myBorrowings.filter((b) => b.status === 'pending').length;
  const overdueBorrowings = myBorrowings.filter((b) => b.status === 'overdue').length;
  const totalBorrowings = myBorrowings.length;

  // Recent borrowings
  const recentBorrowings = myBorrowings
    .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
    .slice(0, 5);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang, {currentUser.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Sedang Dipinjam" value={activeBorrowings} icon={Package} color="green" />
        <StatsCard title="Menunggu Persetujuan" value={pendingBorrowings} icon={Clock} color="yellow" />
        <StatsCard title="Terlambat" value={overdueBorrowings} icon={AlertTriangle} color="red" />
        <StatsCard title="Total Peminjaman" value={totalBorrowings} icon={CheckCircle} color="blue" />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto py-4 flex-col gap-2">
              <Plus className="w-6 h-6" />
              <span>Ajukan Peminjaman Baru</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Package className="w-6 h-6" />
              <span>Lihat Daftar Alat</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <CheckCircle className="w-6 h-6" />
              <span>Peminjaman Saya</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reminder if there are overdue items */}
      {overdueBorrowings > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Peringatan Keterlambatan</h3>
              <p className="text-sm text-red-800">
                Anda memiliki {overdueBorrowings} peminjaman yang terlambat dikembalikan. Segera kembalikan untuk menghindari sanksi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reminder for due soon */}
      {myBorrowings.filter((b) => {
        if (b.status !== 'active') return false;
        const daysUntilDue = Math.ceil(
          (new Date(b.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilDue <= 2 && daysUntilDue >= 0;
      }).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Pengingat Pengembalian</h3>
              <p className="text-sm text-yellow-800">
                Beberapa alat Anda akan jatuh tempo dalam 2 hari. Persiapkan untuk mengembalikannya tepat waktu.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Borrowings */}
      <Card>
        <CardHeader>
          <CardTitle>Peminjaman Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBorrowings.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600">Belum ada riwayat peminjaman</p>
              <Button className="mt-4" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajukan Peminjaman
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBorrowings.map((borrowing) => (
                <div
                  key={borrowing.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{borrowing.toolName}</h3>
                        <Badge className={statusColors[borrowing.status]}>
                          {statusLabels[borrowing.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Kode: {borrowing.toolCode}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>
                          Dipinjam: {new Date(borrowing.borrowDate).toLocaleDateString('id-ID')}
                        </span>
                        {borrowing.status !== 'pending' && borrowing.status !== 'rejected' && (
                          <>
                            <span>•</span>
                            <span>
                              Jatuh tempo: {new Date(borrowing.dueDate).toLocaleDateString('id-ID')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {borrowing.status === 'rejected' && borrowing.rejectedReason && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                      <p className="text-xs font-medium text-red-900 mb-1">Alasan Penolakan:</p>
                      <p className="text-sm text-red-800">{borrowing.rejectedReason}</p>
                    </div>
                  )}
                  <Button variant="outline" size="sm">
                    Lihat Detail
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
