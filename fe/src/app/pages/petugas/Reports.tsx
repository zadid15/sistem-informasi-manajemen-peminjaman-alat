import { useState } from 'react';
import { Download, FileBarChart, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockBorrowings, mockTools } from '../../lib/mock-data';
import { toast } from 'sonner';

export function Reports() {
  const [reportType, setReportType] = useState('borrowings');
  const [period, setPeriod] = useState('month');

  const handleGenerateReport = () => {
    toast.success('Laporan berhasil dibuat dan siap diunduh');
    
    // Simulate export
    const fileName = `laporan-${reportType}-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    toast.info(`File: ${fileName}`);
  };

  // Statistics
  const totalBorrowings = mockBorrowings.length;
  const activeBorrowings = mockBorrowings.filter((b) => b.status === 'active').length;
  const returnedBorrowings = mockBorrowings.filter((b) => b.status === 'returned').length;
  const overdueBorrowings = mockBorrowings.filter((b) => b.status === 'overdue').length;
  const availableTools = mockTools.filter((t) => t.status === 'tersedia').length;
  const borrowedTools = mockTools.filter((t) => t.status === 'dipinjam').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
        <p className="text-gray-600 mt-1">Generate dan unduh laporan sistem</p>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Jenis Laporan
                </label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrowings">Laporan Peminjaman</SelectItem>
                    <SelectItem value="returns">Laporan Pengembalian</SelectItem>
                    <SelectItem value="tools">Laporan Inventaris Alat</SelectItem>
                    <SelectItem value="overdue">Laporan Keterlambatan</SelectItem>
                    <SelectItem value="summary">Laporan Ringkasan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Periode
                </label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hari Ini</SelectItem>
                    <SelectItem value="week">Minggu Ini</SelectItem>
                    <SelectItem value="month">Bulan Ini</SelectItem>
                    <SelectItem value="quarter">Kuartal Ini</SelectItem>
                    <SelectItem value="year">Tahun Ini</SelectItem>
                    <SelectItem value="custom">Kustom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGenerateReport} className="w-full md:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Generate & Download Laporan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Peminjaman</h3>
              <FileBarChart className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalBorrowings}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Aktif</span>
                <span className="font-medium text-green-600">{activeBorrowings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dikembalikan</span>
                <span className="font-medium text-gray-600">{returnedBorrowings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Terlambat</span>
                <span className="font-medium text-red-600">{overdueBorrowings}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Status Alat</h3>
              <FileBarChart className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockTools.length}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tersedia</span>
                <span className="font-medium text-green-600">{availableTools}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dipinjam</span>
                <span className="font-medium text-yellow-600">{borrowedTools}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Maintenance</span>
                <span className="font-medium text-red-600">
                  {mockTools.filter((t) => t.status === 'maintenance').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Periode Bulan Ini</h3>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockBorrowings.filter(b => {
              const date = new Date(b.borrowDate);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}</p>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Peminjaman bulan ini</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Template Laporan Tersedia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: 'Laporan Peminjaman Lengkap',
                description: 'Data lengkap semua peminjaman dengan status dan detail',
              },
              {
                name: 'Laporan Pengembalian',
                description: 'Riwayat pengembalian alat beserta informasi keterlambatan',
              },
              {
                name: 'Laporan Inventaris Alat',
                description: 'Daftar semua alat dengan kondisi dan status terkini',
              },
              {
                name: 'Laporan Keterlambatan',
                description: 'Detail peminjaman yang terlambat dikembalikan',
              },
              {
                name: 'Laporan Aktivitas QR Scan',
                description: 'Log scan QR Code untuk peminjaman dan pengembalian',
              },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{report.name}</h4>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
