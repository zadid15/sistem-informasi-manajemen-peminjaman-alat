import { Package, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { mockBorrowings, mockTools, mockUsers } from '../../lib/mock-data';
import { Badge } from '../../components/ui/badge';

export function AdminDashboard() {
  // Calculate statistics
  const totalTools = mockTools.length;
  const availableTools = mockTools.filter(t => t.status === 'tersedia').length;
  const borrowedTools = mockTools.filter(t => t.status === 'dipinjam').length;
  const maintenanceTools = mockTools.filter(t => t.status === 'maintenance').length;
  
  const totalUsers = mockUsers.filter(u => u.role === 'peminjam').length;
  const activeBorrowings = mockBorrowings.filter(b => b.status === 'active').length;
  const pendingBorrowings = mockBorrowings.filter(b => b.status === 'pending').length;
  const overdueBorrowings = mockBorrowings.filter(b => b.status === 'overdue').length;

  // Recent borrowings
  const recentBorrowings = [...mockBorrowings]
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Ringkasan sistem peminjaman alat</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Alat"
          value={totalTools}
          icon={Package}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Tersedia"
          value={availableTools}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Dipinjam"
          value={borrowedTools}
          icon={FileText}
          color="yellow"
        />
        <StatsCard
          title="Terlambat"
          value={overdueBorrowings}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Alat */}
        <Card>
          <CardHeader>
            <CardTitle>Status Alat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Tersedia</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{availableTools}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(availableTools / totalTools) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Dipinjam</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{borrowedTools}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(borrowedTools / totalTools) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Maintenance</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{maintenanceTools}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(maintenanceTools / totalTools) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Peminjaman */}
        <Card>
          <CardHeader>
            <CardTitle>Status Peminjaman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Menunggu Persetujuan</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{pendingBorrowings}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Aktif</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{activeBorrowings}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Terlambat</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{overdueBorrowings}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Total User Aktif</span>
                <span className="text-sm font-semibold text-gray-900">{totalUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Borrowings */}
      <Card>
        <CardHeader>
          <CardTitle>Peminjaman Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Peminjam</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Alat</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal Pinjam</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jatuh Tempo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBorrowings.map((borrowing) => (
                  <tr key={borrowing.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{borrowing.borrowerName}</p>
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
                      <Badge className={statusColors[borrowing.status]}>
                        {statusLabels[borrowing.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
