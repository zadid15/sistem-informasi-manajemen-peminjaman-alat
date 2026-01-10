import { CheckCircle, Clock, AlertTriangle, Package } from 'lucide-react';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { mockBorrowings } from '../../lib/mock-data';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export function PetugasDashboard() {
  // Calculate statistics
  const pendingApprovals = mockBorrowings.filter((b) => b.status === 'pending').length;
  const activeBorrowings = mockBorrowings.filter((b) => b.status === 'active').length;
  const overdueBorrowings = mockBorrowings.filter((b) => b.status === 'overdue').length;
  const todayReturns = mockBorrowings.filter((b) => {
    const dueDate = new Date(b.dueDate);
    const today = new Date();
    return (
      dueDate.toDateString() === today.toDateString() &&
      (b.status === 'active' || b.status === 'overdue')
    );
  }).length;

  // Pending approvals list
  const pendingList = mockBorrowings
    .filter((b) => b.status === 'pending')
    .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());

  // Due soon list
  const dueSoonList = mockBorrowings
    .filter((b) => b.status === 'active')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    pending: 'Menunggu',
    active: 'Aktif',
    overdue: 'Terlambat',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Petugas</h1>
        <p className="text-gray-600 mt-1">Monitoring dan persetujuan peminjaman</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Menunggu Persetujuan"
          value={pendingApprovals}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Peminjaman Aktif"
          value={activeBorrowings}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Terlambat"
          value={overdueBorrowings}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Jatuh Tempo Hari Ini"
          value={todayReturns}
          icon={Package}
          color="blue"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Perlu Persetujuan</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingList.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Semua pengajuan sudah diproses</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingList.map((borrowing) => (
                  <div
                    key={borrowing.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {borrowing.borrowerName}
                        </p>
                        <p className="text-sm text-gray-600">{borrowing.toolName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Diajukan {new Date(borrowing.borrowDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <Badge className={statusColors[borrowing.status as keyof typeof statusColors]}>
                        {statusLabels[borrowing.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Jatuh Tempo Segera</CardTitle>
          </CardHeader>
          <CardContent>
            {dueSoonList.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Tidak ada peminjaman aktif</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dueSoonList.map((borrowing) => {
                  const daysUntilDue = Math.ceil(
                    (new Date(borrowing.dueDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysUntilDue <= 1;

                  return (
                    <div
                      key={borrowing.id}
                      className={`border rounded-lg p-4 ${isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {borrowing.borrowerName}
                          </p>
                          <p className="text-sm text-gray-600">{borrowing.toolName}</p>
                        </div>
                        {isUrgent && (
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">
                          Jatuh tempo: {new Date(borrowing.dueDate).toLocaleDateString('id-ID')}
                        </p>
                        <span
                          className={`text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'
                            }`}
                        >
                          {daysUntilDue === 0
                            ? 'Hari ini'
                            : daysUntilDue === 1
                              ? 'Besok'
                              : `${daysUntilDue} hari lagi`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto py-4 flex-col gap-2">
              <Clock className="w-6 h-6" />
              <span>Proses Persetujuan</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Package className="w-6 h-6" />
              <span>Scan QR Peminjaman</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <CheckCircle className="w-6 h-6" />
              <span>Scan QR Pengembalian</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
