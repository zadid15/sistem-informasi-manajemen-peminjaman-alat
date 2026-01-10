import { useState } from 'react';
import { Search, QrCode, Eye, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { mockCategories } from '../../lib/mock-data';
import type { Tool } from '../../lib/types';
import { QRCodeModal } from '../../components/shared/QRCodeModal';
import { EmptyState } from '../../components/shared/EmptyState';
import { useApp } from '../../lib/context';
import { toast } from 'sonner';

export function ToolsList() {
  const { tools, addBorrowing } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [borrowForm, setBorrowForm] = useState({
    borrowDate: '',
    dueDate: '',
    purpose: '',
  });

  // Filter available tools only
  const availableTools = tools.filter((t) => t.status === 'tersedia');
  const filteredTools = availableTools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || tool.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openDetailModal = (tool: Tool) => {
    setSelectedTool(tool);
    setShowDetailModal(true);
  };

  const openQRModal = (tool: Tool) => {
    setSelectedTool(tool);
    setShowQRModal(true);
  };

  const openBorrowModal = (tool: Tool) => {
    setSelectedTool(tool);
    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 3);

    setBorrowForm({
      borrowDate: today.toISOString().split('T')[0],
      dueDate: tomorrow.toISOString().split('T')[0],
      purpose: '',
    });
    setShowBorrowModal(true);
  };

  const handleBorrowSubmit = () => {
    if (!borrowForm.purpose.trim()) {
      toast.error('Harap isi tujuan peminjaman');
      return;
    }

    toast.success('Pengajuan peminjaman berhasil dikirim');
    setShowBorrowModal(false);
    setBorrowForm({ borrowDate: '', dueDate: '', purpose: '' });
    if (selectedTool) {
      addBorrowing({
        toolId: selectedTool.id,
        toolName: selectedTool.name, 
        toolCode: selectedTool.code, 
        borrowDate: borrowForm.borrowDate,
        dueDate: borrowForm.dueDate,
        purpose: borrowForm.purpose,
        status: 'pending', 
      });
    }
  };

  const statusColors = {
    tersedia: 'bg-green-100 text-green-800',
    dipinjam: 'bg-yellow-100 text-yellow-800',
    maintenance: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    tersedia: 'Tersedia',
    dipinjam: 'Dipinjam',
    maintenance: 'Maintenance',
  };

  const conditionColors = {
    baik: 'bg-green-100 text-green-800',
    'rusak-ringan': 'bg-yellow-100 text-yellow-800',
    'rusak-berat': 'bg-red-100 text-red-800',
  };

  const conditionLabels = {
    baik: 'Baik',
    'rusak-ringan': 'Rusak Ringan',
    'rusak-berat': 'Rusak Berat',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daftar Alat</h1>
        <p className="text-gray-600 mt-1">Lihat dan ajukan peminjaman alat yang tersedia</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari nama atau kode alat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {mockCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">{filteredTools.length} alat tersedia</span> untuk dipinjam
        </p>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Tidak ada alat ditemukan"
          description="Coba ubah kata kunci pencarian atau filter kategori"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <span className="text-2xl">📦</span>
                  </div>
                  <Badge className={statusColors[tool.status]}>{statusLabels[tool.status]}</Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Kode: {tool.code}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {tool.categoryName}
                    </Badge>
                    <Badge className={conditionColors[tool.condition]}>
                      {conditionLabels[tool.condition]}
                    </Badge>
                  </div>
                </div>
                {tool.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tool.description}</p>
                )}
                {tool.location && (
                  <p className="text-xs text-gray-500 mb-3">Lokasi: {tool.location}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetailModal(tool)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Detail
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openBorrowModal(tool)}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Pinjam
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTool && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Alat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Kode Alat</p>
                  <p className="text-sm font-mono text-gray-900">{selectedTool.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Nama Alat</p>
                  <p className="text-sm text-gray-900">{selectedTool.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Kategori</p>
                  <p className="text-sm text-gray-900">{selectedTool.categoryName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Kondisi</p>
                  <Badge className={conditionColors[selectedTool.condition]}>
                    {conditionLabels[selectedTool.condition]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                  <Badge className={statusColors[selectedTool.status]}>
                    {statusLabels[selectedTool.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Lokasi</p>
                  <p className="text-sm text-gray-900">{selectedTool.location || '-'}</p>
                </div>
              </div>
              {selectedTool.description && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Deskripsi</p>
                  <p className="text-sm text-gray-900">{selectedTool.description}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => openQRModal(selectedTool)} variant="outline" className="flex-1">
                  <QrCode className="w-4 h-4 mr-2" />
                  Lihat QR Code
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    openBorrowModal(selectedTool);
                  }}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajukan Peminjaman
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* QR Code Modal */}
      {selectedTool && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          title={`QR Code - ${selectedTool.name}`}
          qrCodeUrl={selectedTool.qrCode}
          data={[
            { label: 'Kode Alat', value: selectedTool.code },
            { label: 'Nama Alat', value: selectedTool.name },
            { label: 'Kategori', value: selectedTool.categoryName },
            { label: 'Kondisi', value: conditionLabels[selectedTool.condition] },
            { label: 'Status', value: statusLabels[selectedTool.status] },
          ]}
        />
      )}

      {/* Borrow Modal */}
      {selectedTool && (
        <Dialog open={showBorrowModal} onOpenChange={setShowBorrowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajukan Peminjaman</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 mb-1">{selectedTool.name}</p>
                <p className="text-xs text-blue-800">Kode: {selectedTool.code}</p>
              </div>
              <div>
                <Label htmlFor="borrow-date">Tanggal Pinjam</Label>
                <Input
                  id="borrow-date"
                  type="date"
                  value={borrowForm.borrowDate}
                  onChange={(e) => setBorrowForm({ ...borrowForm, borrowDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="due-date">Tanggal Pengembalian</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={borrowForm.dueDate}
                  onChange={(e) => setBorrowForm({ ...borrowForm, dueDate: e.target.value })}
                  min={borrowForm.borrowDate}
                />
              </div>
              <div>
                <Label htmlFor="purpose">Tujuan Peminjaman *</Label>
                <Textarea
                  id="purpose"
                  value={borrowForm.purpose}
                  onChange={(e) => setBorrowForm({ ...borrowForm, purpose: e.target.value })}
                  placeholder="Jelaskan tujuan peminjaman alat..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBorrowModal(false)}>
                Batal
              </Button>
              <Button onClick={handleBorrowSubmit} disabled={!borrowForm.purpose.trim()}>
                Ajukan Peminjaman
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}