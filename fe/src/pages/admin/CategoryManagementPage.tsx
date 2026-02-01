import { Edit, FolderTree, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import type { Kategori, KategoriForm } from "../../types/kategori";
import { useEffect, useState } from "react";
import { getKategori, createKategori, updateKategori, deleteKategori } from "../../services/kategoriService";
import { toast } from "sonner";
import { EmptyState } from "../../components/shared/EmptyState";

export default function CategoryManagementPage() {
    const [kategori, setKategori] = useState<Kategori[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // tambahkan state loading
    const [formData, setFormData] = useState<KategoriForm>({
        nama_kategori: "",
        deskripsi: "",
        foto_kategori: null,
    });

    useEffect(() => {
        const fetchKategori = async () => {
            try {
                setLoading(true);

                await new Promise(resolve => setTimeout(resolve, 500));

                const res = await getKategori();
                setKategori(res.kategori);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchKategori();
    }, []);

    // Reset form
    const resetForm = () => {
        setFormData({ nama_kategori: "", deskripsi: "", foto_kategori: null });
        setSelectedKategori(null);
    };

    // Open edit modal
    const openEditModal = (kategori: Kategori) => {
        setSelectedKategori(kategori);
        setFormData({
            nama_kategori: kategori.nama_kategori,
            deskripsi: kategori.deskripsi || "",
            foto_kategori: null,
        });

        setPreview(kategori.foto_kategori || null);
        setShowEditModal(true);
    };

    // Open delete dialog
    const openDeleteDialog = (kategori: Kategori) => {
        setSelectedKategori(kategori);
        setShowDeleteDialog(true);
    };

    // Handle add
    const handleAdd = async () => {
        try {
            const data = new FormData();
            data.append("nama_kategori", formData.nama_kategori);
            data.append("deskripsi", formData.deskripsi);
            if (formData.foto_kategori) {
                data.append("foto_kategori", formData.foto_kategori);
            }

            await createKategori(data);

            // Toast sukses
            toast.success("Kategori berhasil ditambahkan");

            // Tutup modal & reset form
            setShowAddModal(false);
            resetForm();
            setPreview(null);

            // Refresh kategori
            const res = await getKategori();
            setKategori(res.kategori);
        } catch (error) {
            console.error(error);
            toast.error("Gagal menambahkan kategori");
        }
    };

    // Handle edit
    const handleEdit = async () => {
        if (!selectedKategori) return;

        try {
            const data = new FormData();
            data.append("nama_kategori", formData.nama_kategori);
            data.append("deskripsi", formData.deskripsi);

            // Jika ada gambar baru, append
            if (formData.foto_kategori) {
                data.append("foto_kategori", formData.foto_kategori);
            }

            await updateKategori(selectedKategori.id, data);

            toast.success("Kategori berhasil diperbarui");

            setShowEditModal(false);
            resetForm();
            setPreview(null); // reset preview gambar

            // Refresh kategori
            const res = await getKategori();
            setKategori(res.kategori);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memperbarui kategori");
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!selectedKategori) return;
        try {
            await deleteKategori(selectedKategori.id);
            setShowDeleteDialog(false);
            resetForm();

            toast.success("Kategori berhasil dihapus");

            // Refresh kategori
            const res = await getKategori();
            setKategori(res.kategori);
        } catch {
            toast.error("Gagal menghapus kategori");
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori</h1>
                    <p className="text-gray-600 mt-1">Kelola kategori alat</p>
                </div>
                <Button className="cursor-pointer" onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Kategori
                </Button>
            </div>

            {/* Categories Grid */}
            {/* Categories Grid */}
            <div className="relative min-h-[60vh]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="p-6 border rounded-lg animate-pulse bg-gray-100">
                                <div className="w-12 h-12 bg-gray-300 rounded mb-4"></div>
                                <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                                <div className="h-3 bg-gray-300 rounded mb-2 w-full"></div>
                                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                ) : kategori.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <EmptyState
                            icon={FolderTree}
                            title="Tidak ada kategori yang ditemukan"
                            description="Coba ubah filter atau tambahkan kategori baru"
                            action={{ label: "Tambah kategori", onClick: () => setShowAddModal(true) }}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kategori.map((item) => (
                            <Card key={item.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                                            {item.foto_kategori ? (
                                                <img
                                                    src={item.foto_kategori}
                                                    alt={item.nama_kategori}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <FolderTree className="w-6 h-6 text-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                className="cursor-pointer"
                                                size="sm"
                                                onClick={() => openEditModal(item)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteDialog(item)}
                                                className="text-red-600 hover:text-red-700 cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.nama_kategori}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {item.deskripsi || "Tidak ada deskripsi"}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <span className="text-sm text-gray-600">Total Alat</span>
                                        <span className="text-lg font-semibold text-gray-900">{item.jumlah_alat}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Category Modal */}
            <Dialog
                open={showAddModal}
                onOpenChange={(open) => {
                    setShowAddModal(open);
                    if (!open) {
                        setFormData({ nama_kategori: "", deskripsi: "", foto_kategori: null });
                        setPreview(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Kategori Baru</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-4">
                            <Label htmlFor="image">Gambar Kategori</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFormData({ ...formData, foto_kategori: e.target.files[0] });
                                        setPreview(URL.createObjectURL(e.target.files[0]));
                                    }
                                }}
                            />
                            {preview && (
                                <img
                                    src={preview}
                                    alt="Preview Gambar"
                                    className="mt-2 w-full max-h-48 object-contain rounded border"
                                />
                            )}
                        </div>
                        <div className="col-span-4">
                            <Label htmlFor="nama_kategori">Nama Kategori</Label>
                            <Input
                                id="nama_kategori"
                                value={formData.nama_kategori}
                                onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })}
                                placeholder="Masukkan nama kategori"
                            />
                        </div>

                        <div className="col-span-4">
                            <Label htmlFor="deskripsi">Deskripsi</Label>
                            <Textarea
                                id="deskripsi"
                                value={formData.deskripsi}
                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                placeholder="Deskripsi kategori..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAddModal(false);
                                resetForm();
                                setPreview(null);
                            }}
                            className="cursor-pointer">
                            Batal
                        </Button>
                        <Button className="cursor-pointer" onClick={handleAdd}>Tambah Kategori</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Category Modal */}
            <Dialog
                open={showEditModal}
                onOpenChange={(open) => {
                    setShowEditModal(open);
                    if (!open) {
                        // Reset state saat modal Edit ditutup
                        setSelectedKategori(null);
                        setFormData({ nama_kategori: "", deskripsi: "", foto_kategori: null });
                        setPreview(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Kategori</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-4">
                            <Label htmlFor="image">Gambar Kategori</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFormData({ ...formData, foto_kategori: e.target.files[0] });
                                        setPreview(URL.createObjectURL(e.target.files[0]));
                                    }
                                }}
                            />
                            {preview && (
                                <img
                                    src={preview}
                                    alt="Preview Gambar"
                                    className="mt-2 w-full max-h-48 object-contain rounded border"
                                />
                            )}
                        </div>
                        <div className="col-span-4">
                            <Label htmlFor="nama_kategori">Nama Kategori</Label>
                            <Input
                                id="nama_kategori"
                                value={formData.nama_kategori}
                                onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })}
                                placeholder="Masukkan nama kategori"
                            />
                        </div>

                        <div className="col-span-4">
                            <Label htmlFor="deskripsi">Deskripsi</Label>
                            <Textarea
                                id="deskripsi"
                                value={formData.deskripsi}
                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                placeholder="Deskripsi kategori..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="cursor-pointer"
                            variant="outline"
                            onClick={() => {
                                setShowEditModal(false);
                                resetForm();
                                setPreview(null);
                            }}>Batal</Button>
                        <Button onClick={handleEdit} className="cursor-pointer">Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Hapus Kategori"
                description={`Apakah Anda yakin ingin menghapus kategori "${selectedKategori?.nama_kategori}"? Semua alat dalam kategori ini akan terpengaruh.`}
                confirmText="Hapus"
                variant="danger"
            />
        </div >
    );
}
