import { useState } from 'react';
import { Plus, Search, Edit, Trash2, MoreVertical, QrCode, Eye, Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockTools, mockCategories, generateQRCode } from '../../lib/mock-data';
import type { Tool } from '../../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { EmptyState } from '../../components/shared/EmptyState';
import { QRCodeModal } from '../../components/shared/QRCodeModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';

export function ManageTools() {
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    categoryId: '',
    description: '',
    condition: 'baik' as Tool['condition'],
    status: 'tersedia' as Tool['status'],
    location: '',
  });

  // Filter tools
  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || tool.categoryId === categoryFilter;
    const matchesStatus = statusFilter === 'all' || tool.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAdd = () => {
    const category = mockCategories.find((c) => c.id === formData.categoryId);
    const newTool: Tool = {
      id: `${tools.length + 1}`,
      ...formData,
      categoryName: category?.name || '',
      qrCode: generateQRCode(`TOOL-${formData.code}`),
      createdAt: new Date().toISOString(),
    };
    setTools([...tools, newTool]);
    setShowAddModal(false);
    resetForm();
    toast.success('Alat berhasil ditambahkan');
  };

  const handleEdit = () => {
    if (selectedTool) {
      const category = mockCategories.find((c) => c.id === formData.categoryId);
      setTools(
        tools.map((t) =>
          t.id === selectedTool.id
            ? { ...selectedTool, ...formData, categoryName: category?.name || '' }
            : t
        )
      );
      setShowEditModal(false);
      setSelectedTool(null);
      resetForm();
      toast.success('Alat berhasil diperbarui');
    }
  };

  const handleDelete = () => {
    if (selectedTool) {
      setTools(tools.filter((t) => t.id !== selectedTool.id));
      setSelectedTool(null);
      toast.success('Alat berhasil dihapus');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      categoryId: '',
      description: '',
      condition: 'baik',
      status: 'tersedia',
      location: '',
    });
  };

  const openEditModal = (tool: Tool) => {
    setSelectedTool(tool);
    setFormData({
      name: tool.name,
      code: tool.code,
      categoryId: tool.categoryId,
      description: tool.description || '',
      condition: tool.condition,
      status: tool.status,
      location: tool.location || '',
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (tool: Tool) => {
    setSelectedTool(tool);
    setShowDeleteDialog(true);
  };

  const openDetailModal = (tool: Tool) => {
    setSelectedTool(tool);
    setShowDetailModal(true);
  };

  const openQRModal = (tool: Tool) => {
    setSelectedTool(tool);
    setShowQRModal(true);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Alat</h1>
          <p className="text-gray-600 mt-1">Kelola inventaris alat</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Alat
        </Button>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="tersedia">Tersedia</SelectItem>
              <SelectItem value="dipinjam">Dipinjam</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tools Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredTools.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Tidak ada alat ditemukan"
            description="Coba ubah filter atau tambahkan alat baru"
            action={{ label: 'Tambah Alat', onClick: () => setShowAddModal(true) }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Kode</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Nama Alat</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Kategori</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Kondisi</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Lokasi</th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <p className="text-sm font-mono font-medium text-gray-900">{tool.code}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-700">{tool.categoryName}</p>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={conditionColors[tool.condition]}>
                        {conditionLabels[tool.condition]}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={statusColors[tool.status]}>{statusLabels[tool.status]}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-700">{tool.location || '-'}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetailModal(tool)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openQRModal(tool)}>
                            <QrCode className="w-4 h-4 mr-2" />
                            Lihat QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(tool)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(tool)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Tool Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Alat Baru</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nama Alat</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama alat"
              />
            </div>
            <div>
              <Label htmlFor="code">Kode Alat</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="LAP-001"
              />
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.categoryId.toString()}
                onValueChange={(value: string | number) => setFormData({ ...formData, categoryId: value.toString() })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="condition">Kondisi</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: string) => setFormData({ ...formData, condition: value as Tool['condition'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baik">Baik</SelectItem>
                  <SelectItem value="rusak-ringan">Rusak Ringan</SelectItem>
                  <SelectItem value="rusak-berat">Rusak Berat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => setFormData({ ...formData, status: value as Tool['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tersedia">Tersedia</SelectItem>
                  <SelectItem value="dipinjam">Dipinjam</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Gudang A - Rak 1"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi alat..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button onClick={handleAdd}>Tambah Alat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tool Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Alat</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit-name">Nama Alat</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-code">Kode Alat</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Kategori</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value: number | string) => setFormData({ ...formData, categoryId: value.toString() })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-condition">Kondisi</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: string) => setFormData({ ...formData, condition: value as Tool['condition'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baik">Baik</SelectItem>
                  <SelectItem value="rusak-ringan">Rusak Ringan</SelectItem>
                  <SelectItem value="rusak-berat">Rusak Berat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => setFormData({ ...formData, status: value as Tool['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tersedia">Tersedia</SelectItem>
                  <SelectItem value="dipinjam">Dipinjam</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-location">Lokasi</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
            <Button onClick={handleEdit}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <div className="flex justify-center pt-4">
                <Button onClick={() => openQRModal(selectedTool)} variant="outline">
                  <QrCode className="w-4 h-4 mr-2" />
                  Lihat QR Code
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Hapus Alat"
        description={`Apakah Anda yakin ingin menghapus alat "${selectedTool?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
}
