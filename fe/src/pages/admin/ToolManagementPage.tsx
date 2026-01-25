import { Box, Edit, Eye, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
} from "../../components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "../../components/ui/label";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";

import { Textarea } from "../../components/ui/textarea";
import { EmptyState } from "../../components/shared/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
    getAlat,
    createAlat,
    updateAlat,
    deleteAlat,
} from "../../services/alatService";
import type { Alat } from "../../types/alat";
import { Badge } from "../../components/ui/badge";

type KondisiAlat = 'baik' | 'rusak-ringan' | 'rusak-berat';
type StatusAlat = 'tersedia' | 'dipinjam' | 'maintenance';

type AlatForm = {
    kode_alat: string;
    nama_alat: string;
    kategori_id: number;
    harga: string;
    batas_peminjaman: number;
    lokasi: string;
    kondisi: KondisiAlat | '';
    status: StatusAlat | '';
    deskripsi: string;
    jumlah_tersedia: number;
    jumlah_dipinjam: number;
    foto_alat: string;
};

export default function ToolManagementPage() {
    const [alat, setAlat] = useState<Alat[]>([]);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    });

    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("page") || 1);
    const searchQuery = searchParams.get("search") || "";
    const categoryFilter = searchParams.get("category") || "all";
    const statusFilter = searchParams.get("status") || "all";
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAlat, setSelectedAlat] = useState<Alat | null>(null);

    const [formData, setFormData] = useState<AlatForm>({
        kode_alat: "",
        nama_alat: "",
        kategori_id: 0,
        harga: "",
        batas_peminjaman: 0,
        lokasi: "",
        kondisi: "",
        status: "",
        deskripsi: "",
        jumlah_tersedia: 0,
        jumlah_dipinjam: 0,
        foto_alat: "",
    });

    const fetchAlat = async (page = 1) => {
        try {
            const res = await getAlat(page, searchQuery, categoryFilter);

            setAlat(res.alat);
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengambil data alat");
        }
    };

    useEffect(() => {
        const loadAlat = async () => {
            const res = await getAlat(currentPage, searchQuery, categoryFilter);

            setAlat(res.alat);
            setPagination(res.pagination);
        };

        loadAlat();
    }, [currentPage, searchQuery, categoryFilter]);

    const handleAdd = async () => {
        if (!formData.kondisi || !formData.status) {
            toast.error("Kondisi dan status wajib dipilih");
            return;
        }

        try {
            await createAlat({
                ...formData,
                kondisi: formData.kondisi || undefined,
                status: formData.status || undefined,
            });
            toast.success("Alat berhasil ditambahkan");
            setShowAddModal(false);
            resetForm();
            fetchAlat(currentPage);
        } catch {
            toast.error("Gagal menambahkan alat");
        }
    };

    const handleEdit = async () => {
        if (!selectedAlat) return;

        try {
            await updateAlat(selectedAlat.id, {
                ...formData,
                kondisi: formData.kondisi || undefined,
                status: formData.status || undefined,
            });
            toast.success("Alat berhasil diperbarui");
            setShowEditModal(false);
            setSelectedAlat(null);
            resetForm();
            fetchAlat(currentPage);
        } catch {
            toast.error("Gagal memperbarui alat");
        }
    };

    const handleDelete = async () => {
        if (!selectedAlat) return;

        try {
            await deleteAlat(selectedAlat.id);
            toast.success("Alat berhasil dihapus");
            setShowDeleteDialog(false);
            setSelectedAlat(null);
            fetchAlat(currentPage);
        } catch {
            toast.error("Gagal menghapus alat");
        }
    };

    const resetForm = () => {
        setFormData({
            kode_alat: "",
            nama_alat: "",
            kategori_id: 0,
            harga: "",
            batas_peminjaman: 0,
            lokasi: "",
            kondisi: "",
            status: "",
            deskripsi: "",
            jumlah_tersedia: 0,
            jumlah_dipinjam: 0,
            foto_alat: "",
        });
    };

    const openDetailModal = (alat: Alat) => {
        setSelectedAlat(alat);
        setShowDetailModal(true);
    };

    const statusColors: Record<StatusAlat, string> = {
        tersedia: 'bg-green-100 text-green-800',
        dipinjam: 'bg-yellow-100 text-yellow-800',
        maintenance: 'bg-red-100 text-red-800',
    };

    const statusLabels: Record<StatusAlat, string> = {
        tersedia: 'Tersedia',
        dipinjam: 'Dipinjam',
        maintenance: 'Maintenance',
    };

    const kondisiColors: Record<KondisiAlat, string> = {
        baik: 'bg-green-100 text-green-800',
        'rusak-ringan': 'bg-yellow-100 text-yellow-800',
        'rusak-berat': 'bg-red-100 text-red-800',
    };

    const kondisiLabels: Record<KondisiAlat, string> = {
        baik: 'Baik',
        'rusak-ringan': 'Rusak Ringan',
        'rusak-berat': 'Rusak Berat',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Alat</h1>
                    <p className="text-gray-600 mt-1">Kelola alat yang tersedia</p>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setSelectedAlat(null);
                    setShowAddModal(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Alat
                </Button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Cari nama atau kode alat..."
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchParams({
                                    page: "1",
                                    search: e.target.value,
                                    category: categoryFilter,
                                })
                            }
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={categoryFilter}
                        onValueChange={(value) =>
                            setSearchParams({
                                page: "1",
                                search: searchQuery,
                                role: value,
                            })
                        }
                    >
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            <SelectItem value="elektronik">Elektronik</SelectItem>
                            <SelectItem value="lab komputer">Lab Komputer</SelectItem>
                            <SelectItem value="olahraga">Olahraga</SelectItem>
                            <SelectItem value="multimedia">Multimedia</SelectItem>
                            <SelectItem value="lab fisika">Lab Fisika</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                            setSearchParams({
                                page: "1",
                                search: searchQuery,
                                role: value,
                            })
                        }
                    >
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

            {/* Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
                {alat.length === 0 ? (
                    <EmptyState
                        icon={Box}
                        title="Alat kosong"
                        description="Belum ada data alat yang ditambahkan."
                        action={{ label: "Tambah Alat", onClick: () => setShowAddModal(true) }}
                    />
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm">Kode</th>
                                    <th className="px-6 py-3 text-left text-sm">Nama Alat</th>
                                    <th className="px-6 py-3 text-left text-sm">Kategori</th>
                                    <th className="px-6 py-3 text-left text-sm">Kondisi</th>
                                    <th className="px-6 py-3 text-left text-sm">Status</th>
                                    <th className="px-6 py-3 text-left text-sm">Lokasi</th>
                                    <th className="px-6 py-3 text-right text-sm">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {alat.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-mono font-medium text-gray-900">{item.kode_alat}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-medium text-gray-900">{item.nama_alat}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-700">{item.kategori.nama_kategori}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge className={kondisiColors[item.kondisi]}>
                                                {kondisiLabels[item.kondisi]}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge className={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-700">{item.lokasi}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openDetailModal(item)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedAlat(item);
                                                            setFormData({
                                                                kode_alat: item.kode_alat,
                                                                nama_alat: item.nama_alat,
                                                                kategori_id: item.kategori.id,
                                                                harga: item.harga,
                                                                batas_peminjaman: item.batas_peminjaman,
                                                                lokasi: item.lokasi,
                                                                kondisi: item.kondisi,
                                                                status: item.status,
                                                                deskripsi: item.deskripsi,
                                                                jumlah_tersedia: item.jumlah_tersedia,
                                                                jumlah_dipinjam: item.jumlah_dipinjam,
                                                                foto_alat: item.foto_alat,
                                                            });
                                                            setShowEditModal(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            setSelectedAlat(item);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-gray-200 gap-3">

                            {/* Info */}
                            <p className="text-sm text-gray-600">
                                Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1}
                                {" - "}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                                {" dari "}
                                {pagination.total} data
                            </p>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-1">

                                {/* Prev */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() =>
                                        setSearchParams({
                                            page: String(pagination.current_page - 1),
                                            search: searchQuery,
                                            category: categoryFilter,
                                        })
                                    }
                                >
                                    Prev
                                </Button>

                                {/* Page Numbers */}
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={page === pagination.current_page ? "default" : "outline"}
                                        onClick={() =>
                                            setSearchParams({
                                                page: String(page),
                                                search: searchQuery,
                                                category: categoryFilter,
                                            })
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}

                                {/* Next */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() =>
                                        setSearchParams({
                                            page: String(pagination.current_page + 1),
                                            search: searchQuery,
                                            category: categoryFilter,
                                        })
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Add Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Alat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nama Alat</Label>
                            <Input
                                value={formData.nama_alat}
                                onChange={(e) =>
                                    setFormData({ ...formData, nama_alat: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label>Deskripsi</Label>
                            <Textarea
                                value={formData.deskripsi}
                                onChange={(e) =>
                                    setFormData({ ...formData, deskripsi: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleAdd}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Alat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nama Alat</Label>
                            <Input
                                value={formData.nama_alat}
                                onChange={(e) =>
                                    setFormData({ ...formData, nama_alat: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label>Deskripsi</Label>
                            <Textarea
                                value={formData.deskripsi}
                                onChange={(e) =>
                                    setFormData({ ...formData, deskripsi: e.target.value })
                                }
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

            {selectedAlat && (
                <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detail Alat</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Kode Alat</p>
                                    <p className="text-sm font-mono text-gray-900">{selectedAlat.kode_alat}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Nama Alat</p>
                                    <p className="text-sm text-gray-900">{selectedAlat.nama_alat}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Kategori</p>
                                    <p className="text-sm text-gray-900">{selectedAlat.kategori.nama_kategori}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Kondisi</p>
                                    <Badge className={kondisiColors[selectedAlat.kondisi]}>
                                        {kondisiLabels[selectedAlat.kondisi]}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                                    <Badge className={statusColors[selectedAlat.status]}>
                                        {statusLabels[selectedAlat.status]}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Lokasi</p>
                                    <p className="text-sm text-gray-900">{selectedAlat.lokasi || '-'}</p>
                                </div>
                            </div>
                            {selectedAlat.deskripsi && (
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Deskripsi</p>
                                    <p className="text-sm text-gray-900">{selectedAlat.deskripsi}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Hapus Kategori"
                description={`Yakin ingin menghapus kategori "${selectedAlat?.nama_alat}"?`}
                confirmText="Hapus"
                variant="danger"
            />
        </div>
    );
}
