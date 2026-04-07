import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, GripVertical, Eye, EyeOff, Image, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import axiosInstance from "../../utils/axios";
import { EmptyState } from "../../components/shared/EmptyState";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";

type Banner = {
    id: number;
    title: string;
    image: string;
    image_url: string;
    urutan: number;
    aktif: boolean;
    created_at: string;
};

const Sk = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export default function BannerManagementPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editBanner, setEditBanner] = useState<Banner | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 500));
            const res = await axiosInstance.get("/banners/all");
            setBanners(res.data.banners);
        } catch {
            toast.error("Gagal memuat banner");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBanners(); }, []);

    const handleToggleAktif = async (banner: Banner) => {
        setTogglingId(banner.id);
        try {
            const form = new FormData();
            form.append("aktif", banner.aktif ? "0" : "1");
            await axiosInstance.post(`/banners/${banner.id}`, form);
            setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, aktif: !b.aktif } : b));
            toast.success(`Banner ${banner.aktif ? "dinonaktifkan" : "diaktifkan"}`);
        } catch {
            toast.error("Gagal mengubah status banner");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeletingId(deleteId);
        try {
            await axiosInstance.delete(`/banners/${deleteId}`);
            setBanners(prev => prev.filter(b => b.id !== deleteId));
            toast.success("Banner berhasil dihapus");
        } catch {
            toast.error("Gagal menghapus banner");
        } finally {
            setDeletingId(null);
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manajemen Banner</h1>
                    <p className="text-gray-600 text-md mt-1">Kelola banner yang tampil di halaman daftar alat</p>
                </div>
                <Button
                    onClick={() => { setEditBanner(null); setShowAddModal(true); }}
                    className="cursor-pointer gap-2"
                >
                    <Plus size={16} /> Tambah Banner
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Banner", value: loading ? "—" : banners.length, color: "bg-blue-50 text-blue-700 border-blue-100" },
                    { label: "Aktif", value: loading ? "—" : banners.filter(b => b.aktif).length, color: "bg-green-50 text-green-700 border-green-100" },
                    { label: "Nonaktif", value: loading ? "—" : banners.filter(b => !b.aktif).length, color: "bg-gray-50 text-gray-600 border-gray-100" },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-sm font-medium mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                {loading ? (
                    <table className="w-full">
                        <thead className="bg-lime-800">
                            <tr>
                                {["Preview", "Judul", "Urutan", "Status", "Aksi"].map((_, i) => (
                                    <th key={i} className="px-6 py-3 text-left">
                                        <Sk className="h-4 w-20" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><Sk className="h-16 w-28 rounded-lg" /></td>
                                    <td className="px-6 py-4"><Sk className="h-4 w-40" /></td>
                                    <td className="px-6 py-4"><Sk className="h-4 w-10" /></td>
                                    <td className="px-6 py-4"><Sk className="h-6 w-16 rounded-full" /></td>
                                    <td className="px-6 py-4"><Sk className="h-8 w-24 rounded-lg" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : banners.length === 0 ? (
                    <div className="p-16 text-center text-gray-400">
                        <EmptyState
                            icon={ImageIcon}
                            title="Tidak ada banner"
                            description="Coba ubah filter atau tambahkan banner baru"
                            action={{ label: "Tambah Banner", onClick: () => setShowAddModal(true) }}
                        />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-lime-800 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-md">Preview</th>
                                <th className="px-6 py-3 text-left font-semibold text-md">Judul</th>
                                <th className="px-6 py-3 text-left font-semibold text-md">Urutan</th>
                                <th className="px-6 py-3 text-left font-semibold text-md">Status</th>
                                <th className="px-6 py-3 text-left font-semibold text-md">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {banners.map(banner => (
                                <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-28 h-16 rounded-lg overflow-hidden border bg-gray-100">
                                            <img
                                                src={banner.image_url}
                                                alt={banner.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-800">{banner.title}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm inline-flex items-center gap-1 text-gray-500">
                                            <GripVertical size={14} />
                                            {banner.urutan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${banner.aktif
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-500"
                                            }`}>
                                            {banner.aktif ? "AKTIF" : "NONAKTIF"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleAktif(banner)}
                                                disabled={togglingId === banner.id}
                                                title={banner.aktif ? "Nonaktifkan" : "Aktifkan"}
                                                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
                                            >
                                                {banner.aktif ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                            <button
                                                onClick={() => { setEditBanner(banner); setShowAddModal(true); }}
                                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-medium transition cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(banner.id)}
                                                disabled={deletingId === banner.id}
                                                className="p-2 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Hapus Banner"
                description={`Yakin ingin menghapus banner "${banners.find(b => b.id === deleteId)?.title}"?`}
                confirmText="Hapus"
                variant="danger"
            />

            {/* Modal */}
            {showAddModal && (
                <BannerFormModal
                    banner={editBanner}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { setShowAddModal(false); fetchBanners(); }}
                />
            )}
        </div>
    );
}

function BannerFormModal({
    banner,
    onClose,
    onSuccess,
}: {
    banner: Banner | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [title, setTitle] = useState(banner?.title ?? "");
    const [urutan, setUrutan] = useState(String(banner?.urutan ?? 0));
    const [aktif, setAktif] = useState(banner?.aktif ?? true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(banner?.image_url ?? null);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!title) return toast.error("Judul wajib diisi");
        if (!banner && !imageFile) return toast.error("Gambar wajib diupload");

        setSubmitting(true);
        try {
            const form = new FormData();
            form.append("title", title);
            form.append("urutan", urutan);
            form.append("aktif", aktif ? "1" : "0");
            if (imageFile) form.append("image", imageFile);

            if (banner) {
                await axiosInstance.post(`/banners/${banner.id}`, form);
                toast.success("Banner berhasil diupdate");
            } else {
                await axiosInstance.post("/banners", form);
                toast.success("Banner berhasil ditambahkan");
            }
            onSuccess();
        } catch {
            toast.error("Gagal menyimpan banner");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="font-semibold text-gray-900">{banner ? "Edit Banner" : "Tambah Banner"}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl leading-none">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    {/* Image Upload */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Gambar Banner</p>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 hover:border-lime-400 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden transition"
                        >
                            {preview ? (
                                <img src={preview} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center">
                                    <Image size={28} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-400">Klik untuk upload gambar</p>
                                    <p className="text-[10px] text-gray-300 mt-1">PNG, JPG max 4MB</p>
                                </div>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    </div>

                    {/* Title */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1.5">Judul</p>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul banner" />
                    </div>

                    {/* Urutan */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1.5">Urutan</p>
                        <Input type="number" value={urutan} onChange={e => setUrutan(e.target.value)} placeholder="0" />
                    </div>

                    {/* Aktif */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div
                            onClick={() => setAktif(p => !p)}
                            className={`w-10 h-6 rounded-full transition-colors ${aktif ? "bg-lime-600" : "bg-gray-200"} relative`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${aktif ? "left-5" : "left-1"}`} />
                        </div>
                        <span className="text-sm text-gray-700">Tampilkan banner</span>
                    </label>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                    <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer">Batal</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 cursor-pointer"
                    >
                        {submitting ? "Menyimpan..." : banner ? "Update" : "Simpan"}
                    </Button>
                </div>
            </div>
        </div>
    );
}