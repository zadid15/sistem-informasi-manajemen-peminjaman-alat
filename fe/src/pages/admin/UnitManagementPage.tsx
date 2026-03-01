import { ArrowLeft, ArrowRight, Box, Edit, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { type AlatUnit, type AlatUnitKondisi, type AlatUnitStatus, type CreateAlatUnitForm, type UpdateAlatUnitForm } from "../../types/alatUnit";
import { EmptyState } from "../../components/shared/EmptyState";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { createAlatUnit, deleteAlatUnit, getAlatUnit, updateAlatUnit } from "../../services/alatUnitService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Badge } from "../../components/ui/badge";
import { BrowserQRCodeReader } from "@zxing/browser";
import { QrCode } from "lucide-react";
import { useRef } from "react";

const KONDISI_OPTIONS: AlatUnitKondisi[] = [
    "Baik",
    "Layak Pakai",
    "Perlu Perawatan",
    "Rusak Ringan",
    "Rusak Berat",
    "Dalam Service",
    "Tidak Layak Pakai",
];

const STATUS_OPTIONS: AlatUnitStatus[] = [
    "Tersedia",
    "Dipinjam",
    "Tidak Tersedia",
];

export default function UnitManagementPage() {
    const { id } = useParams();
    const alatId = Number(id);
    const [alatUnit, setAlatUnit] = useState<AlatUnit[]>([]);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    });

    const [searchParams, setSearchParams] = useSearchParams();

    const statusFilter = searchParams.get("status") || "all";
    const searchQuery = searchParams.get("search") || "";
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const [searchInput, setSearchInput] = useState(searchQuery);

    const [loading, setLoading] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const navigate = useNavigate();

    const [showScanModal, setShowScanModal] = useState(false);
    const [highlightedKode, setHighlightedKode] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<{ stop: () => void } | null>(null);

    const handleScanResult = (kode: string) => {
        playBeep();
        setShowScanModal(false);
        setSearchInput(kode);
        setSearchParams({ page: "1", search: kode, status: statusFilter });
        setHighlightedKode(kode);
        setTimeout(() => setHighlightedKode(null), 3000);
    };

    const startCamera = async () => {
        setShowScanModal(true);
        setTimeout(async () => {
            if (!videoRef.current) return;
            const reader = new BrowserQRCodeReader();
            try {
                const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
                    if (result) {
                        controls.stop();
                        handleScanResult(result.getText());
                    }
                });
                controlsRef.current = controls;
            } catch {
                toast.error("Gagal mengakses kamera");
            }
        }, 300);
    };

    const stopCamera = () => {
        controlsRef.current?.stop();
        controlsRef.current = null;
        setShowScanModal(false);
    };

    const playBeep = () => {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    };

    const currentPage = Number(searchParams.get("page") || 1);

    const [selectedAlatUnit, setSelectedAlatUnit] = useState<AlatUnit | null>(null);

    const [createFormData, setCreateFormData] = useState<CreateAlatUnitForm>({
        jumlah_unit: 1,
        kondisi: "" as AlatUnitKondisi,
        lokasi: "",
        status: "" as AlatUnitStatus,
    });

    const [updateFormData, setUpdateFormData] = useState<UpdateAlatUnitForm>({
        kondisi: "" as AlatUnitKondisi,
        lokasi: "",
        status: "" as AlatUnitStatus,
    });

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchInput), 500);
        return () => clearTimeout(handler);
    }, [searchInput]);

    const fetchAlatUnit = async (page = 1) => {
        try {
            setLoading(true);
            const res = await getAlatUnit(page, debouncedSearch, statusFilter, alatId);
            setAlatUnit(res.alatUnit);
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengambil data alat unit");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadAlatUnit = async () => {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 500));
                const res = await getAlatUnit(currentPage, debouncedSearch, statusFilter, alatId);
                setAlatUnit(res.alatUnit);
                setPagination(res.pagination);
            } catch {
                toast.error("Gagal mengambil data alat");
            } finally {
                setLoading(false);
            }
        };
        loadAlatUnit();
    }, [currentPage, debouncedSearch, statusFilter, alatId]);

    const handleAdd = async () => {
        try {
            await createAlatUnit(alatId, createFormData);
            toast.success("Unit berhasil ditambahkan");
            setShowAddModal(false);
            resetCreateForm();
            fetchAlatUnit();
        } catch {
            toast.error("Gagal menambahkan unit");
        }
    };

    const handleUpdate = async () => {
        try {
            if (!selectedAlatUnit) return;
            setLoading(true);
            await updateAlatUnit(selectedAlatUnit.id, updateFormData);
            toast.success("Unit berhasil diperbarui");
            setShowEditModal(false);
            setSelectedAlatUnit(null);
            fetchAlatUnit();
        } catch {
            toast.error("Gagal memperbarui unit");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            if (!deleteId) return;
            setLoading(true);
            await deleteAlatUnit(deleteId);
            toast.success("Unit berhasil dihapus");
            setDeleteId(null);
            fetchAlatUnit();
        } catch {
            toast.error("Gagal menghapus unit");
        } finally {
            setLoading(false);
        }
    };

    const resetCreateForm = () => {
        setCreateFormData({
            jumlah_unit: 1,
            kondisi: "" as AlatUnitKondisi,
            lokasi: "",
            status: "" as AlatUnitStatus,
        });
    };

    const statusColors: Record<string, string> = {
        Tersedia: "bg-green-700 text-white text-sm",
        "Tidak Tersedia": "bg-red-700 text-white text-sm",
        Dipinjam: "bg-yellow-500 text-white text-sm",
        Rusak: "bg-orange-600 text-white text-sm",
        Maintenance: "bg-blue-600 text-white text-sm",
    };

    const kondisiColors: Record<string, string> = {
        Baik: "bg-green-700 text-white text-sm",
        "Layak Pakai": "bg-blue-700 text-white text-sm",
        "Perlu Perawatan": "bg-yellow-500 text-white text-sm",
        "Rusak Ringan": "bg-orange-500 text-white text-sm",
        "Rusak Berat": "bg-red-700 text-white text-sm",
        "Dalam Service": "bg-purple-700 text-white text-sm",
        "Tidak Layak Pakai": "bg-gray-700 text-white text-sm",
    };

    // ─── Reusable Select Fields ───────────────────────────────────────────────

    const KondisiSelect = ({
        value,
        onChange,
    }: {
        value: string;
        onChange: (val: AlatUnitKondisi) => void;
    }) => (
        <div>
            <Label>Kondisi</Label>
            <Select value={value} onValueChange={(v) => onChange(v as AlatUnitKondisi)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kondisi..." />
                </SelectTrigger>
                <SelectContent>
                    {KONDISI_OPTIONS.map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    const StatusSelect = ({
        value,
        onChange,
    }: {
        value: string;
        onChange: (val: AlatUnitStatus) => void;
    }) => (
        <div>
            <Label>Status</Label>
            <Select value={value} onValueChange={(v) => onChange(v as AlatUnitStatus)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status..." />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manajemen Unit</h1>
                        <p className="text-gray-600 text-md mt-1">Kelola unit yang tersedia</p>
                    </div>
                </div>
                <Button
                    onClick={() => { resetCreateForm(); setSelectedAlatUnit(null); setShowAddModal(true); }}
                    className="cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Unit
                </Button>
            </div>

            <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali
            </Button>

            {/* Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Cari kode unit atau scan QR..."
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value);
                                setSearchParams({ page: "1", search: e.target.value, status: statusFilter });
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && searchInput) {
                                    setHighlightedKode(searchInput);
                                    setTimeout(() => setHighlightedKode(null), 3000);
                                }
                            }}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" onClick={startCamera} className="cursor-pointer gap-2">
                        <QrCode className="w-4 h-4" />
                        Scan QR
                    </Button>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                            setSearchParams({ page: "1", search: searchQuery, status: value })
                        }
                    >
                        <SelectTrigger className="w-full md:w-48 cursor-pointer">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
                {loading ? (
                    <table className="w-full">
                        <thead className="bg-lime-800 border-b">
                            <tr>
                                {["Kode Unit", "Kondisi", "Status", "Lokasi", "Aksi"].map((_, i) => (
                                    <th key={i} className={`px-6 py-3 ${i === 4 ? "text-right" : "text-left"}`}>
                                        <div className={`h-4 w-20 bg-gray-200 rounded animate-pulse ${i === 4 ? "ml-auto" : ""}`} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {Array.from({ length: 5 }).map((_, row) => (
                                <tr key={row} className="animate-pulse">
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
                                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                                        <div className="flex items-center gap-1">
                                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="h-8 w-8 mx-1 bg-gray-200 rounded animate-pulse" />
                                            ))}
                                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                ) : alatUnit.length === 0 ? (
                    <EmptyState
                        icon={Box}
                        title="Tidak ada unit yang ditemukan"
                        description="Coba ubah filter atau tambahkan unit baru"
                        action={{ label: "Tambah Unit", onClick: () => setShowAddModal(true) }}
                    />
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-lime-800 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-white">Kode Unit</th>
                                    <th className="px-6 py-3 text-left text-white">Kondisi</th>
                                    <th className="px-6 py-3 text-left text-white">Status</th>
                                    <th className="px-6 py-3 text-left text-white">Lokasi</th>
                                    <th className="px-6 py-3 text-right text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {alatUnit.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`hover:bg-gray-50 transition-colors ${highlightedKode === item.kode_unit
                                            ? "bg-yellow-100 ring-2 ring-yellow-400"
                                            : ""
                                            }`}
                                    >
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-medium text-gray-900">{item.kode_unit}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge className={kondisiColors[item.kondisi] ?? "bg-gray-300 text-sm"}>
                                                {item.kondisi}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge className={statusColors[item.status] ?? "bg-gray-300 text-sm"}>
                                                {item.status}
                                            </Badge>
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
                                                    <DropdownMenuItem
                                                        className={item.status !== "Tersedia" ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
                                                        onClick={() => {
                                                            if (item.status !== "Tersedia") return;
                                                            setSelectedAlatUnit(item);
                                                            setUpdateFormData({
                                                                kondisi: item.kondisi,
                                                                lokasi: item.lokasi,
                                                                status: item.status,
                                                            });
                                                            setShowEditModal(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className={item.status !== "Tersedia" ? "opacity-50 cursor-not-allowed pointer-events-none text-red-600" : "text-red-600 cursor-pointer"}
                                                        onClick={() => {
                                                            if (item.status !== "Tersedia") return;
                                                            setDeleteId(item.id);
                                                            setSelectedAlatUnit(item);
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
                            <p className="text-sm text-gray-900">
                                Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1}
                                {" - "}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                                {" dari "}
                                {pagination.total} data
                            </p>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => setSearchParams({ page: String(currentPage - 1), search: debouncedSearch, status: statusFilter })}
                                >
                                    <ArrowLeft /> Prev
                                </Button>
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        className="w-8 h-8 mx-1 flex items-center cursor-pointer justify-center"
                                        size="sm"
                                        variant={page === pagination.current_page ? "default" : "outline"}
                                        onClick={() => setSearchParams({ page: String(page), search: debouncedSearch, status: statusFilter })}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => setSearchParams({ page: String(pagination.current_page + 1), search: debouncedSearch, status: statusFilter })}
                                >
                                    Next <ArrowRight />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ─── Add Modal ─────────────────────────────────────────────────────── */}
            <Dialog
                open={showAddModal}
                onOpenChange={(open) => { setShowAddModal(open); if (!open) resetCreateForm(); }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Unit</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Jumlah Unit - full width */}
                        <div className="col-span-2">
                            <Label htmlFor="jumlah_unit">Jumlah Unit</Label>
                            <Input
                                id="jumlah_unit"
                                type="number"
                                min={1}
                                value={createFormData.jumlah_unit}
                                onChange={(e) => setCreateFormData({ ...createFormData, jumlah_unit: Number(e.target.value) })}
                                placeholder="Masukkan jumlah unit..."
                            />
                        </div>

                        {/* Kondisi | Status - satu baris */}
                        <KondisiSelect
                            value={createFormData.kondisi}
                            onChange={(val) => setCreateFormData({ ...createFormData, kondisi: val })}
                        />
                        <StatusSelect
                            value={createFormData.status ?? ""}
                            onChange={(val) => setCreateFormData({ ...createFormData, status: val })}
                        />

                        {/* Lokasi - full width */}
                        <div className="col-span-2">
                            <Label htmlFor="lokasi-add">Lokasi</Label>
                            <Textarea
                                id="lokasi-add"
                                value={createFormData.lokasi}
                                onChange={(e) => setCreateFormData({ ...createFormData, lokasi: e.target.value })}
                                placeholder="Masukkan lokasi unit..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="cursor-pointer"
                            onClick={() => { setShowAddModal(false); resetCreateForm(); }}>
                            Batal
                        </Button>
                        <Button className="cursor-pointer" onClick={handleAdd}>Tambah Unit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Edit Modal ────────────────────────────────────────────────────── */}
            <Dialog
                open={showEditModal}
                onOpenChange={(open) => {
                    setShowEditModal(open);
                    if (!open) {
                        setSelectedAlatUnit(null);
                        setUpdateFormData({ kondisi: "" as AlatUnitKondisi, lokasi: "", status: "" as AlatUnitStatus });
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Unit - {selectedAlatUnit?.kode_unit}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Kondisi | Status - satu baris */}
                        <KondisiSelect
                            value={updateFormData.kondisi ?? ""}
                            onChange={(val) => setUpdateFormData({ ...updateFormData, kondisi: val })}
                        />
                        <StatusSelect
                            value={updateFormData.status ?? ""}
                            onChange={(val) => setUpdateFormData({ ...updateFormData, status: val })}
                        />

                        {/* Lokasi - full width */}
                        <div className="col-span-2">
                            <Label htmlFor="lokasi-edit">Lokasi</Label>
                            <Textarea
                                id="lokasi-edit"
                                value={updateFormData.lokasi}
                                onChange={(e) => setUpdateFormData({ ...updateFormData, lokasi: e.target.value })}
                                placeholder="Masukkan lokasi unit..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="cursor-pointer"
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedAlatUnit(null);
                                setUpdateFormData({ kondisi: "" as AlatUnitKondisi, lokasi: "", status: "" as AlatUnitStatus });
                            }}>
                            Batal
                        </Button>
                        <Button onClick={handleUpdate} className="cursor-pointer">Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {showScanModal && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Scan QR Code</h2>
                            <button onClick={stopCamera} className="text-gray-500 hover:text-gray-700 cursor-pointer">✕</button>
                        </div>
                        <p className="text-sm text-gray-500">Arahkan kamera ke QR code yang tertempel di unit alat.</p>
                        <div className="rounded-xl overflow-hidden bg-black aspect-square">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                style={{ transform: "scaleX(-1)" }}
                            />
                        </div>
                        <Button variant="outline" className="w-full cursor-pointer" onClick={stopCamera}>
                            Batal
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Hapus Unit"
                description={`Apakah Anda yakin ingin menghapus unit "${selectedAlatUnit?.kode_unit}"?`}
                confirmText="Hapus"
                variant="danger"
            />
        </div>
    );
}