import { ArrowLeft, ArrowRight, Box, Edit, Eye, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
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
import type { Alat, AlatForm, KondisiAlat, StatusAlat } from "../../types/alat";
import { Badge } from "../../components/ui/badge";
import placeholderImg from '../../assets/placeholder.jpg';
import type { Kategori } from "../../types/kategori";
import { getKategori } from "../../services/kategoriService";

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
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
    const [previewFoto, setPreviewFoto] = useState<string | null>(null);

    const [formData, setFormData] = useState<AlatForm>({
        kode_alat: "",
        nama_alat: "",
        id_kategori: 0,
        harga: "",
        batas_peminjaman: 0,
        lokasi: "",
        kondisi: "",
        status: "",
        deskripsi: "",
        foto_alat: null,
    });

    const InfoItem = ({
        label,
        value,
        mono,
    }: {
        label: string;
        value: React.ReactNode;
        mono?: boolean;
    }) => (
        <div>
            <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
            <p className={`text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>
                {value}
            </p>
        </div>
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchInput]);

    const fetchAlat = async (page = 1) => {
        try {
            setLoading(true);

            const res = await getAlat(
                page,
                debouncedSearch,
                categoryFilter,
                statusFilter
            );

            setAlat(res.alat);
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengambil data alat");
        } finally {
            setLoading(false);
        }
    };

    const fetchKategori = async () => {
        try {
            const res = await getKategori();
            setKategoriList(res.kategori);
        } catch {
            toast.error("Gagal mengambil kategori");
        }
    };

    useEffect(() => {
        fetchKategori();
    }, []);

    useEffect(() => {
        const loadAlat = async () => {
            try {
                setLoading(true);

                await new Promise(resolve => setTimeout(resolve, 500));

                const res = await getAlat(
                    currentPage,
                    debouncedSearch,
                    categoryFilter,
                    statusFilter
                );

                setAlat(res.alat);
                setPagination(res.pagination);
            } catch {
                toast.error("Gagal mengambil data alat");
            } finally {
                setLoading(false);
            }
        };

        loadAlat();
    }, [currentPage, debouncedSearch, categoryFilter, statusFilter]);

    useEffect(() => {
        if (formData.foto_alat) {
            // Kalau formData.foto_alat tipe File (baru diupload)
            if (formData.foto_alat instanceof File) {
                const url = URL.createObjectURL(formData.foto_alat);
                setPreviewFoto(url);
                return () => URL.revokeObjectURL(url);
            }
            // Kalau formData.foto_alat string URL (foto lama dari server)
            else if (typeof formData.foto_alat === "string") {
                setPreviewFoto(formData.foto_alat);
            }
        } else {
            setPreviewFoto(null);
        }
    }, [formData.foto_alat]);

    const handleAdd = async () => {
        if (!formData.kondisi || !formData.status) {
            toast.error("Kondisi dan status wajib dipilih");
            return;
        }

        try {
            // Gunakan createAlat versi FormData
            await createAlat({
                ...formData,
                kondisi: formData.kondisi || undefined,
                status: formData.status || undefined,
            });

            toast.success("Alat berhasil ditambahkan");
            setShowAddModal(false);
            resetForm();
            fetchAlat(currentPage);
        } catch (error) {
            console.error(error);
            toast.error("Gagal menambahkan alat");
        }
    };

    const handleEdit = async () => {
        if (!selectedAlat) return;

        // Validasi wajib
        if (!formData.kondisi || !formData.status) {
            toast.error("Kondisi dan status wajib dipilih");
            return;
        }

        try {
            // Kirim formData ke updateAlat
            await updateAlat(selectedAlat.id, formData);

            toast.success("Alat berhasil diperbarui");
            setShowEditModal(false);
            setSelectedAlat(null);
            resetForm();
            fetchAlat(currentPage); // reload data
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
            id_kategori: 0,
            harga: "",
            batas_peminjaman: 0,
            lokasi: "",
            kondisi: "",
            status: "",
            deskripsi: "",
            foto_alat: null,
        });
    };

    const openDetailModal = (alat: Alat) => {
        setSelectedAlat(alat);
        setShowDetailModal(true);
    };

    const formatRupiah = (value: string | number) => {
        if (!value) return "";
        return new Intl.NumberFormat("id-ID").format(Number(value));
    };

    const statusColors: Record<StatusAlat, string> = {
        tersedia: 'bg-green-100 text-green-800',
        'tidak-tersedia': 'bg-gray-100 text-gray-800',
        dipinjam: 'bg-yellow-100 text-yellow-800',
        maintenance: 'bg-red-100 text-red-800',
    };

    const statusLabels: Record<StatusAlat, string> = {
        tersedia: 'Tersedia',
        'tidak-tersedia': 'Tidak Tersedia',
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
                }}
                className="cursor-pointer"
                >
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
                            value={searchInput}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchInput(value);
                                setSearchParams({
                                    page: "1",
                                    search: value,
                                    category: categoryFilter,
                                    status: statusFilter,
                                });
                            }}
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={categoryFilter}
                        onValueChange={(value) =>
                            setSearchParams({
                                page: "1",
                                search: searchQuery,
                                category: value,
                                status: statusFilter,
                            })
                        }
                    >
                        <SelectTrigger className="w-full md:w-48 cursor-pointer">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>

                            {kategoriList.map((k) => (
                                <SelectItem key={k.id} value={String(k.nama_kategori)}>
                                    {k.nama_kategori}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                            setSearchParams({
                                page: "1",
                                search: searchQuery,
                                category: categoryFilter,
                                status: value,
                            })
                        }
                    >
                        <SelectTrigger className="w-full md:w-48 cursor-pointer">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="tersedia">Tersedia</SelectItem>
                            <SelectItem value="tidak-tersedia">Tidak Tersedia</SelectItem>
                            <SelectItem value="dipinjam">Dipinjam</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
                {loading ? (
                    /* ================= SKELETON TABLE ================= */
                    <table className="w-full">
                        <thead className="bg-lime-400 border-b">
                            <tr>
                                {["Kode", "Nama", "Kategori", "Kondisi", "Status", "Lokasi", "Aksi"].map((_, i) => (
                                    <th key={i} className="px-6 py-3">
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {Array.from({ length: 5 }).map((_, row) => (
                                <tr key={row} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-200 rounded-full" /></td>
                                    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-200 rounded-full" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="h-8 w-8 bg-gray-200 rounded-md inline-block" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={7} className="p-0">
                                    <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-gray-200 gap-3 bg-gray-300 min-h-[56px]">
                                        {/* INFO */}
                                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />

                                        {/* PAGINATION */}
                                        <div className="flex items-center gap-1">
                                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />

                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-8 w-8 mx-1 bg-gray-200 rounded animate-pulse"
                                                />
                                            ))}

                                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                ) : alat.length === 0 ? (
                    <EmptyState
                        icon={Box}
                        title="Tidak ada alat yang ditemukan"
                        description="Coba ubah filter atau tambahkan alat baru"
                        action={{ label: "Tambah Alat", onClick: () => setShowAddModal(true) }}
                    />
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-lime-400 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm text-gray-800">Kode</th>
                                    <th className="px-6 py-3 text-left text-sm text-gray-800">Nama Alat</th>
                                    <th className="px-6 py-3 text-left text-sm text-gray-800">Kategori</th>
                                    <th className="px-6 py-3 text-left text-sm text-gray-800">Kondisi</th>
                                    <th className="px-6 py-3 text-left text-sm text-gray-800">Status</th>
                                    <th className="px-6 py-3 text-left text-sm text-gray-800">Lokasi</th>
                                    <th className="px-6 py-3 text-right text-sm text-gray-800">Aksi</th>
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
                                                    <Button variant="ghost" size="sm" className="cursor-pointer">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openDetailModal(item)} className="cursor-pointer">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedAlat(item);
                                                            setFormData({
                                                                kode_alat: item.kode_alat,
                                                                nama_alat: item.nama_alat,
                                                                id_kategori: item.kategori.id,
                                                                harga: item.harga,
                                                                batas_peminjaman: item.batas_peminjaman,
                                                                lokasi: item.lokasi,
                                                                kondisi: item.kondisi,
                                                                status: item.status,
                                                                deskripsi: item.deskripsi,
                                                                foto_alat: item.foto_alat,
                                                            });
                                                            setShowEditModal(true);
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 cursor-pointer"
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
                        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-gray-200 gap-3 bg-gray-300">

                            {/* Info */}
                            <p className="text-sm text-gray-900">
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
                                            page: String(currentPage - 1),
                                            search: debouncedSearch,
                                            category: categoryFilter,
                                            status: statusFilter,
                                        })
                                    }
                                >
                                    <ArrowLeft />
                                    Prev
                                </Button>

                                {/* Page Numbers */}
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        className="w-8 h-8 mx-1 flex items-center justify-center"
                                        size="sm"
                                        variant={page === pagination.current_page ? "default" : "outline"}
                                        onClick={() =>
                                            setSearchParams({
                                                page: String(page),
                                                search: debouncedSearch,
                                                category: categoryFilter,
                                                status: statusFilter,
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
                                            search: debouncedSearch,
                                            category: categoryFilter,
                                            status: statusFilter,
                                        })
                                    }
                                >
                                    Next
                                    <ArrowRight />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Add Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Tambah Alat</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4">
                        {/* Foto */}
                        <div className="col-span-4">
                            <Label>Foto Alat</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        foto_alat: e.target.files?.[0] || null,
                                    })
                                }
                            />
                            {previewFoto && (
                                <img
                                    src={previewFoto}
                                    alt="Preview"
                                    className="mt-2 w-full max-h-48 object-contain rounded border"
                                />
                            )}
                        </div>

                        {/* Nama Alat */}
                        <div className="col-span-4">
                            <Label>Nama Alat</Label>
                            <Input
                                value={formData.nama_alat}
                                placeholder="Masukkan nama alat ..."
                                onChange={(e) =>
                                    setFormData({ ...formData, nama_alat: e.target.value })
                                }
                            />
                        </div>

                        {/* Kode Alat */}
                        <div className="col-span-2">
                            <Label>Kode Alat</Label>
                            <Input
                                value={formData.kode_alat}
                                placeholder="Masukkan kode alat ..."
                                onChange={(e) =>
                                    setFormData({ ...formData, kode_alat: e.target.value })
                                }
                            />
                        </div>

                        {/* Harga */}
                        <div className="col-span-2">
                            <Label>Harga</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800">Rp</span>
                                <Input
                                    type="text"
                                    className="pl-10"
                                    value={formData.harga ? formatRupiah(formData.harga) : ""}
                                    onChange={(e) => {
                                        const onlyNumbers = e.target.value.replace(/\D/g, "");
                                        setFormData({ ...formData, harga: onlyNumbers });
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </div>


                        {/* Kategori */}
                        <div className="col-span-2">
                            <Label>Kategori</Label>
                            <Select
                                value={
                                    formData.id_kategori
                                        ? String(formData.id_kategori)
                                        : undefined
                                }
                                onValueChange={(value) =>
                                    setFormData({ ...formData, id_kategori: Number(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kategoriList.map((k) => (
                                        <SelectItem key={k.id} value={String(k.id)}>
                                            {k.nama_kategori}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Batas Peminjaman */}
                        <div className="col-span-2">
                            <Label>Batas Peminjaman</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min={1}
                                    value={formData.batas_peminjaman || ""} // kosong di input, tetap number di state
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setFormData({
                                            ...formData,
                                            // minimal 1
                                            batas_peminjaman: value < 1 ? 1 : value,
                                        });
                                    }}
                                    className="pr-14"
                                    placeholder="1"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    hari
                                </span>
                            </div>
                        </div>

                        {/* Kondisi */}
                        <div className="col-span-2">
                            <Label>Kondisi</Label>
                            <Select
                                value={formData.kondisi}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, kondisi: value as KondisiAlat })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kondisi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="baik">Baik</SelectItem>
                                    <SelectItem value="rusak-ringan">Rusak Ringan</SelectItem>
                                    <SelectItem value="rusak-berat">Rusak Berat</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, status: value as StatusAlat })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tersedia">Tersedia</SelectItem>
                                    <SelectItem value="tidak-tersedia">Tidak Tersedia</SelectItem>
                                    <SelectItem value="dipinjam">Dipinjam</SelectItem>
                                    <SelectItem value="maintenence">Maintenence</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Lokasi */}
                        <div className="col-span-4">
                            <Label>Lokasi Alat</Label>
                            <Textarea
                                placeholder="Masukkan lokasi alat ..."
                                value={formData.lokasi}
                                onChange={(e) =>
                                    setFormData({ ...formData, lokasi: e.target.value })
                                }
                            />
                        </div>

                        {/* Deskripsi */}
                        <div className="col-span-4">
                            <Label>Deskripsi</Label>
                            <Textarea
                                placeholder="Masukkan deskripsi alat ..."
                                value={formData.deskripsi}
                                onChange={(e) =>
                                    setFormData({ ...formData, deskripsi: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="cursor-pointer" onClick={() => setShowAddModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleAdd} className="cursor-pointer">Tambah Alat</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Alat</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4">
                        {/* Foto */}
                        <div className="col-span-4">
                            <Label>Foto Alat</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        foto_alat: e.target.files?.[0] || null,
                                    })
                                }
                            />
                            {previewFoto && (
                                <img
                                    src={previewFoto}
                                    alt="Preview"
                                    className="mt-2 w-full max-h-48 object-contain rounded border"
                                />
                            )}
                        </div>

                        {/* Nama Alat */}
                        <div className="col-span-4">
                            <Label>Nama Alat</Label>
                            <Input
                                value={formData.nama_alat}
                                onChange={(e) =>
                                    setFormData({ ...formData, nama_alat: e.target.value })
                                }
                            />
                        </div>

                        {/* Kode Alat */}
                        <div className="col-span-2">
                            <Label>Kode Alat</Label>
                            <Input
                                value={formData.kode_alat}
                                onChange={(e) =>
                                    setFormData({ ...formData, kode_alat: e.target.value })
                                }
                            />
                        </div>

                        {/* Harga */}
                        <div className="col-span-2">
                            <Label>Harga</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800">Rp</span>
                                <Input
                                    type="text"
                                    className="pl-10"
                                    value={formData.harga ? formatRupiah(formData.harga) : ""}
                                    onChange={(e) => {
                                        const onlyNumbers = e.target.value.replace(/\D/g, "");
                                        setFormData({ ...formData, harga: onlyNumbers });
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </div>


                        {/* Kategori */}
                        <div className="col-span-2">
                            <Label>Kategori</Label>
                            <Select
                                value={String(formData.id_kategori)}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, id_kategori: Number(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kategoriList.map((k) => (
                                        <SelectItem key={k.id} value={String(k.id)}>
                                            {k.nama_kategori}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Batas Peminjaman */}
                        <div className="col-span-2">
                            <Label>Batas Peminjaman</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min={1}
                                    value={formData.batas_peminjaman || ""} // kosong di input, tetap number di state
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setFormData({
                                            ...formData,
                                            // minimal 1
                                            batas_peminjaman: value < 1 ? 1 : value,
                                        });
                                    }}
                                    className="pr-14"
                                    placeholder="1"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    hari
                                </span>
                            </div>
                        </div>

                        {/* Kondisi */}
                        <div className="col-span-2">
                            <Label>Kondisi</Label>
                            <Select
                                value={formData.kondisi}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, kondisi: value as KondisiAlat })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kondisi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="baik">Baik</SelectItem>
                                    <SelectItem value="rusak-ringan">Rusak Ringan</SelectItem>
                                    <SelectItem value="rusak-berat">Rusak Berat</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, status: value as StatusAlat })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tersedia">Tersedia</SelectItem>
                                    <SelectItem value="tidak-tersedia">Tidak Tersedia</SelectItem>
                                    <SelectItem value="dipinjam">Dipinjam</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Lokasi */}
                        <div className="col-span-4">
                            <Label>Lokasi Alat</Label>
                            <Textarea
                                value={formData.lokasi}
                                onChange={(e) =>
                                    setFormData({ ...formData, lokasi: e.target.value })
                                }
                            />
                        </div>

                        {/* Deskripsi */}
                        <div className="col-span-4">
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
                        <Button variant="outline" className="cursor-pointer" onClick={() => setShowEditModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleEdit} className="cursor-pointer">Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {selectedAlat && (
                <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Detail Alat</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Gambar */}
                            <div className="md:col-span-2">
                                <div className="aspect-square w-full overflow-hidden rounded-xl border bg-gray-50 flex items-center justify-center">
                                    {selectedAlat.foto_alat ? (
                                        <img
                                            src={
                                                selectedAlat.foto_alat instanceof File
                                                    ? URL.createObjectURL(selectedAlat.foto_alat)
                                                    : selectedAlat.foto_alat
                                            }
                                            alt={selectedAlat.nama_alat}
                                            className="h-full w-full object-cover"
                                            onError={(e) => (e.currentTarget.src = placeholderImg)}
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-400">Tidak ada gambar</span>
                                    )}
                                </div>
                            </div>

                            {/* Detail */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Kode Alat" value={selectedAlat.kode_alat} mono />
                                    <InfoItem label="Nama Alat" value={selectedAlat.nama_alat} />
                                    <InfoItem label="Kategori" value={selectedAlat.kategori.nama_kategori} />
                                    <InfoItem label="Lokasi" value={selectedAlat.lokasi || "-"} />

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Kondisi</p>
                                        <Badge className={kondisiColors[selectedAlat.kondisi]}>
                                            {kondisiLabels[selectedAlat.kondisi]}
                                        </Badge>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                                        <Badge className={statusColors[selectedAlat.status]}>
                                            {statusLabels[selectedAlat.status]}
                                        </Badge>
                                    </div>
                                </div>

                                {selectedAlat.deskripsi && (
                                    <div className="pt-2">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Deskripsi</p>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {selectedAlat.deskripsi}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            )
            }

            {/* Delete */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Hapus Alat"
                description={`Yakin ingin menghapus alat "${selectedAlat?.nama_alat}"?`}
                confirmText="Hapus"
                variant="danger"
            />
        </div >
    );
}
