import { useState } from 'react';
import { Search, Clock } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockActivityLogs } from '../../lib/mock-data';
import type { ActivityLog } from '../../lib/types';
import { EmptyState } from '../../components/shared/EmptyState';

export function ActivityLogs() {
  const [logs] = useState<ActivityLog[]>(mockActivityLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const entityColors = {
    Peminjaman: 'bg-blue-100 text-blue-800',
    Pengembalian: 'bg-green-100 text-green-800',
    Alat: 'bg-purple-100 text-purple-800',
    User: 'bg-yellow-100 text-yellow-800',
    Kategori: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Log Aktivitas</h1>
        <p className="text-gray-600 mt-1">Riwayat aktivitas sistem</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari user, aksi, atau detail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Semua Entitas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Entitas</SelectItem>
              <SelectItem value="Peminjaman">Peminjaman</SelectItem>
              <SelectItem value="Pengembalian">Pengembalian</SelectItem>
              <SelectItem value="Alat">Alat</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Kategori">Kategori</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Tidak ada log aktivitas"
            description="Belum ada aktivitas atau coba ubah filter pencarian"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-sm font-medium text-gray-900">{log.userName}</p>
                      <Badge className={entityColors[log.entity as keyof typeof entityColors] || 'bg-gray-100 text-gray-800'}>
                        {log.entity}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">{log.action}</span>
                    </p>
                    {log.details && (
                      <p className="text-sm text-gray-600">{log.details}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
