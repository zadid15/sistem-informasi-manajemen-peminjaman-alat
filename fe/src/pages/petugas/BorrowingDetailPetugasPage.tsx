import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { tolakPeminjaman, setujuiPeminjaman } from "../../services/peminjamanService";
import axiosInstance from "../../utils/axios";
import { Button } from "../../components/ui/button";
import { createPortal } from "react-dom";
import { formatKondisi } from "../../utils/formatKondisi";

type StatusPeminjaman =
    | 'terkirim'
    | 'menunggu_konfirmasi'
    | 'disetujui'
    | 'ditolak'
    | 'dipinjam'
    | 'pengembalian_diajukan'
    | 'dikembalikan'
    | 'dikembalikan_terlambat';

type DetailPeminjamanPetugas = {
    id: number;
    status: StatusPeminjaman;
    tanggal_pinjam: string;
    rencana_pengembalian: string;
    tanggal_kembali: string | null;
    catatan: string | null;
    alasan_penolakan: string | null;
    user: {
        id: number;
        nama: string;
        email: string;
        phone: string;
        alamat: string;
    };
    approver: { id: number; nama: string } | null;
    receiver: { id: number; nama: string } | null;
    detail_peminjaman: {
        id: number;
        total_denda?: number | null;
        kondisi_sebelum: string | null;
        kondisi_sesudah: string | null;
        foto_sebelum: string | null;
        foto_sesudah: string | null;
        alat_unit: {
            id: number;
            kode_unit: string;
            kondisi: string;
            lokasi: string;
            alat: {
                id: number;
                nama_alat: string;
                foto_alat?: string | null;
                harga?: number | null;
            };
        };
    }[];
};

const TIMELINE_STEPS = [
    { key: "terkirim", label: "Terkirim" },
    { key: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
    { key: "dipinjam", label: "Dipinjam" },
    { key: "pengembalian_diajukan", label: "Pengembalian Diajukan" },
    { key: "dikembalikan", label: "Dikembalikan" },
];

function getStepIndex(status: string) {
    if (status === "dikembalikan_terlambat") return TIMELINE_STEPS.length - 1;
    if (status === "ditolak") return 1;
    return TIMELINE_STEPS.findIndex(s => s.key === status);
}

const statusColors: Record<StatusPeminjaman, string> = {
    terkirim: 'bg-blue-100 text-blue-800',
    menunggu_konfirmasi: 'bg-indigo-100 text-indigo-800',
    disetujui: 'bg-green-100 text-green-800',
    ditolak: 'bg-red-100 text-red-800',
    dipinjam: 'bg-yellow-100 text-yellow-800',
    pengembalian_diajukan: 'bg-purple-100 text-purple-800',
    dikembalikan: 'bg-gray-100 text-gray-800',
    dikembalikan_terlambat: 'bg-orange-100 text-orange-800',
};

const statusLabels: Record<StatusPeminjaman, string> = {
    terkirim: 'TERKIRIM',
    menunggu_konfirmasi: 'MENUNGGU KONFIRMASI',
    disetujui: 'DISETUJUI',
    ditolak: 'DITOLAK',
    dipinjam: 'DIPINJAM',
    pengembalian_diajukan: 'PENGEMBALIAN DIAJUKAN',
    dikembalikan: 'DIKEMBALIKAN',
    dikembalikan_terlambat: 'DIKEMBALIKAN TERLAMBAT',
};

const DENDA_PERSEN: Record<string, number> = {
    baik: 0,
    rusak_ringan: 25,
    rusak_berat: 60,
    hilang: 100,
};

const InfoItem = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <p className={`text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>{value || "-"}</p>
    </div>
);

const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function BorrowingDetailPetugasPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<DetailPeminjamanPetugas | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form setujui - per unit
    const [kondisiPerUnit, setKondisiPerUnit] = useState<Record<number, string>>({});
    const [fotoPerUnit, setFotoPerUnit] = useState<Record<number, File>>({});
    const [fotoPreviewPerUnit, setFotoPreviewPerUnit] = useState<Record<number, string>>({});
    const [checks, setChecks] = useState({ kondisiSesuai: false, fotoSesuai: false, dataBenar: false });

    // Form tolak
    const [showTolakForm, setShowTolakForm] = useState(false);
    const [alasanPenolakan, setAlasanPenolakan] = useState("");
    const [showKetentuan, setShowKetentuan] = useState(false);

    // Form konfirmasi pengembalian - per unit
    const [tanggalKembali, setTanggalKembali] = useState("");
    const [kondisiSesudahPerUnit, setKondisiSesudahPerUnit] = useState<Record<number, string>>({});
    const [fotoSesudahPerUnit, setFotoSesudahPerUnit] = useState<Record<number, File>>({});
    const [fotoSesudahPreviewPerUnit, setFotoSesudahPreviewPerUnit] = useState<Record<number, string>>({});
    const [checksKembali, setChecksKembali] = useState({ kondisiSesuai: false, fotoSesuai: false, dataBenar: false });
    const [previewFoto, setPreviewFoto] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get(`/peminjaman/${id}/detail-petugas`);
                setData(res.data.data.peminjaman);
            } catch {
                toast.error("Gagal memuat data peminjaman");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const allChecked = Object.values(checks).every(Boolean);
    const allCheckedKembali = Object.values(checksKembali).every(Boolean);

    const allUnitFilled = data?.detail_peminjaman.every(
        item => kondisiPerUnit[item.id] && fotoPerUnit[item.id]
    ) ?? false;

    const allUnitKembaliFilled = data?.detail_peminjaman.every(
        item => kondisiSesudahPerUnit[item.id] && fotoSesudahPerUnit[item.id]
    ) ?? false;

    const hitungEstimasiDenda = () => {
        if (!data || !tanggalKembali) return null;

        const terlambatHari = Math.max(0, Math.floor(
            (new Date(tanggalKembali).getTime() - new Date(data.rencana_pengembalian).getTime())
            / (1000 * 60 * 60 * 24)
        ));

        const rows = data.detail_peminjaman.map((item) => {
            const kondisi = kondisiSesudahPerUnit[item.id] ?? "";
            const dendaKerusakanPersen = DENDA_PERSEN[kondisi] ?? 0;
            const harga = item.alat_unit.alat.harga ?? 0;
            const dendaKerusakan = harga * dendaKerusakanPersen / 100;
            const dendaKeterlambatan = harga * 0.01 * terlambatHari;
            const total = dendaKerusakan + dendaKeterlambatan;
            return { item, kondisi, dendaKerusakanPersen, harga, dendaKerusakan, dendaKeterlambatan, total };
        });

        const totalKeseluruhan = rows.reduce((acc, r) => acc + r.total, 0);
        return { rows, totalKeseluruhan, terlambatHari };
    };

    const handleSetujui = async () => {
        if (!allUnitFilled) {
            toast.error("Kondisi dan foto semua unit wajib diisi");
            return;
        }
        if (!allChecked) {
            toast.error("Harap centang semua konfirmasi terlebih dahulu");
            return;
        }
        if (!data) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            data.detail_peminjaman.forEach((item, index) => {
                formData.append(`units[${index}][detail_id]`, String(item.id));
                formData.append(`units[${index}][kondisi_sebelum]`, kondisiPerUnit[item.id]);
                formData.append(`units[${index}][foto_sebelum]`, fotoPerUnit[item.id]);
            });
            await setujuiPeminjaman(Number(id), formData);
            toast.success("Peminjaman berhasil disetujui");
            setData(prev => prev ? { ...prev, status: "dipinjam" } : prev);
        } catch {
            toast.error("Gagal menyetujui peminjaman");
        } finally {
            setSubmitting(false);
        }
    };

    const handleTolak = async () => {
        if (!alasanPenolakan.trim()) {
            toast.error("Alasan penolakan wajib diisi");
            return;
        }
        setSubmitting(true);
        try {
            await tolakPeminjaman(Number(id), alasanPenolakan);
            toast.success("Peminjaman ditolak");
            setData(prev => prev ? { ...prev, status: "ditolak" } : prev);
            setShowTolakForm(false);
        } catch {
            toast.error("Gagal menolak peminjaman");
        } finally {
            setSubmitting(false);
        }
    };

    const handleKonfirmasiKembali = async () => {
        if (!tanggalKembali) {
            toast.error("Tanggal kembali wajib diisi");
            return;
        }
        if (!allUnitKembaliFilled) {
            toast.error("Kondisi dan foto semua unit wajib diisi");
            return;
        }
        if (!allCheckedKembali) {
            toast.error("Harap centang semua konfirmasi terlebih dahulu");
            return;
        }
        if (!data) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("tanggal_kembali", tanggalKembali);
            data.detail_peminjaman.forEach((item, index) => {
                formData.append(`units[${index}][detail_id]`, String(item.id));
                formData.append(`units[${index}][kondisi_sesudah]`, kondisiSesudahPerUnit[item.id]);
                formData.append(`units[${index}][foto_sesudah]`, fotoSesudahPerUnit[item.id]);
            });

            await axiosInstance.post(`/peminjaman/${id}/konfirmasi-pengembalian`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Pengembalian berhasil dikonfirmasi");
            const res = await axiosInstance.get(`/peminjaman/${id}/detail-petugas`);
            setData(res.data.data.peminjaman);
        } catch {
            toast.error("Gagal mengkonfirmasi pengembalian");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <BorrowingDetailPetugasSkeleton />;
    if (!data) return <div className="p-6">Data tidak ditemukan</div>;

    const currentIndex = getStepIndex(data.status);
    const isRejected = data.status === "ditolak";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Detail Peminjaman ID {data.id}</h1>
                    <p className="text-gray-600 text-md mt-1">Kelola dan konfirmasi peminjaman alat</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusColors[data.status]}`}>
                    {statusLabels[data.status]}
                </span>
            </div>

            <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali
            </Button>

            {/* Timeline */}
            <div className="bg-white rounded-xl border p-6">
                <h2 className="text-md font-semibold text-gray-700 mb-6">Status Peminjaman</h2>
                <div className="flex items-start justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0" />
                    <div
                        className={`absolute top-4 left-0 h-1 z-0 transition-all duration-300 ${isRejected ? "bg-red-400" : "bg-green-500"}`}
                        style={{ width: `${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                    />
                    {TIMELINE_STEPS.map((step, index) => {
                        const isDone = index < currentIndex || (currentIndex === TIMELINE_STEPS.length - 1 && index === currentIndex);
                        const isActive = index === currentIndex && !isRejected;
                        return (
                            <div key={step.key} className="flex-1 flex flex-col items-center z-10 relative">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow
                                    ${isRejected && index <= currentIndex ? "bg-red-500 text-white"
                                        : isDone ? "bg-green-500 text-white"
                                            : isActive ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-500"
                                    } transition-colors duration-300`}
                                >
                                    {isDone ? "✓" : index + 1}
                                </div>
                                <span className="mt-2 text-sm text-gray-600 text-center max-w-[70px] leading-tight">{step.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Ketentuan Denda */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <button
                    onClick={() => setShowKetentuan(prev => !prev)}
                    className="w-full px-6 py-4 bg-gray-800 text-white font-semibold text-md flex items-center justify-between hover:bg-gray-700 transition cursor-pointer"
                >
                    <span>Ketentuan Denda</span>
                    <span className={`transition-transform duration-200 ${showKetentuan ? "rotate-180" : ""}`}>▾</span>
                </button>
                {showKetentuan && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <p className="text-sm font-semibold text-orange-800 mb-1">⏰ Keterlambatan</p>
                            <p className="text-sm text-orange-700"><span className="font-bold">1% dari harga alat per hari</span> keterlambatan, dihitung sejak melewati rencana pengembalian.</p>
                            <p className="text-xs text-orange-500 mt-1">Contoh: Alat Rp 500.000 terlambat 3 hari → denda Rp 15.000</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-sm font-semibold text-yellow-800 mb-1">🔧 Rusak Ringan</p>
                            <p className="text-sm text-yellow-700"><span className="font-bold">25% dari harga alat</span> apabila alat dikembalikan dalam kondisi rusak ringan.</p>
                            <p className="text-xs text-yellow-500 mt-1">Contoh: Alat Rp 500.000 rusak ringan → denda Rp 125.000</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-sm font-semibold text-red-800 mb-1">💥 Rusak Berat</p>
                            <p className="text-sm text-red-700"><span className="font-bold">60% dari harga alat</span> apabila alat dikembalikan dalam kondisi rusak berat.</p>
                            <p className="text-xs text-red-500 mt-1">Contoh: Alat Rp 500.000 rusak berat → denda Rp 300.000</p>
                        </div>
                        <div className="bg-gray-900 rounded-xl p-4">
                            <p className="text-sm font-semibold text-white mb-1">🚫 Hilang</p>
                            <p className="text-sm text-gray-300"><span className="font-bold text-white">100% dari harga alat</span> apabila alat hilang dan tidak dapat dikembalikan.</p>
                            <p className="text-xs text-gray-400 mt-1">Contoh: Alat Rp 500.000 hilang → denda Rp 500.000</p>
                        </div>
                        <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm font-semibold text-blue-800 mb-1">📋 Denda Kombinasi</p>
                            <p className="text-sm text-blue-700">Denda keterlambatan dan kerusakan <span className="font-bold">dijumlahkan</span> apabila keduanya terjadi bersamaan.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border p-6 space-y-4">
                    <h2 className="text-md font-semibold text-gray-900">Informasi Peminjam</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Nama" value={data.user.nama} />
                        <InfoItem label="Email" value={data.user.email} />
                        <InfoItem label="No. Telepon" value={data.user.phone} />
                        <InfoItem label="Alamat" value={data.user.alamat} />
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-6 space-y-4">
                    <h2 className="text-md font-semibold text-gray-900">Informasi Peminjaman</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Tanggal Pinjam" value={formatDate(data.tanggal_pinjam)} />
                        <InfoItem label="Rencana Pengembalian" value={formatDate(data.rencana_pengembalian)} />
                        <InfoItem label="Tanggal Kembali" value={formatDate(data.tanggal_kembali)} />
                        <InfoItem label="Catatan" value={data.catatan} />
                        <InfoItem label="Penyetuju Peminjaman" value={data.approver?.nama} />
                        <InfoItem label="Penerima Pengembalian" value={data.receiver?.nama} />
                    </div>
                </div>
            </div>

            {/* Daftar Alat */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 bg-lime-800 text-white font-semibold text-md">
                    Daftar Alat Dipinjam ({data.detail_peminjaman.length} unit)
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-6 py-3 text-left">Nama Alat</th>
                            <th className="px-6 py-3 text-left">Kode Unit</th>
                            <th className="px-6 py-3 text-left">Lokasi</th>
                            <th className="px-6 py-3 text-left">Kondisi Awal</th>
                            <th className="px-6 py-3 text-left">Kondisi Akhir</th>
                            <th className="px-6 py-3 text-left">Harga</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {data.detail_peminjaman.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4">{item.alat_unit.alat.nama_alat}</td>
                                <td className="px-6 py-4 font-mono">{item.alat_unit.kode_unit}</td>
                                <td className="px-6 py-4">{item.alat_unit.lokasi}</td>
                                <td className="px-6 py-4">{formatKondisi(item.kondisi_sebelum) ?? "-"}</td>
                                <td className="px-6 py-4">{formatKondisi(item.kondisi_sesudah) ??  "-"}</td>
                                <td className="px-6 py-4">{item.alat_unit.alat.harga ? formatRupiah(item.alat_unit.alat.harga) : "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Foto & Kondisi Alat */}
            {data.detail_peminjaman.some(d => d.foto_sebelum || d.foto_sesudah) && (
                <div className="bg-white rounded-xl border p-6 space-y-6">
                    <h2 className="text-md font-semibold text-gray-900">Foto & Kondisi Alat</h2>
                    {data.detail_peminjaman.map(item => (
                        (item.foto_sebelum || item.foto_sesudah) && (
                            <div key={item.id} className="pb-6 border-b last:border-0 last:pb-0 space-y-3">
                                <p className="text-sm font-semibold text-gray-800">
                                    {item.alat_unit.alat.nama_alat} | <span className="font-mono text-sm text-gray-500">{item.alat_unit.kode_unit}</span>
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sebelum Dipinjam</p>
                                        {item.foto_sebelum ? (
                                            <img
                                                src={item.foto_sebelum}
                                                alt="Foto sebelum"
                                                onClick={() => setPreviewFoto(item.foto_sebelum)}
                                                className="rounded-lg max-h-48 w-full object-contain bg-gray-50 cursor-zoom-in"
                                            />
                                        ) : (
                                            <div className="rounded-lg h-48 bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                                                Belum ada foto
                                            </div>
                                        )}
                                        <InfoItem label="Kondisi" value={formatKondisi(item.kondisi_sebelum) ?? "-"} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sesudah Dikembalikan</p>
                                        {item.foto_sesudah ? (
                                            <img
                                                src={item.foto_sesudah}
                                                alt="Foto sesudah"
                                                onClick={() => setPreviewFoto(item.foto_sesudah)}
                                                className="rounded-lg max-h-48 w-full object-contain bg-gray-50 cursor-zoom-in"
                                            />
                                        ) : (
                                            <div className="rounded-lg h-48 bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                                                Belum ada foto
                                            </div>
                                        )}
                                        <InfoItem label="Kondisi" value={formatKondisi(item.kondisi_sesudah) ?? "-"} />
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* Alasan penolakan */}
            {data.status === "ditolak" && data.alasan_penolakan && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-red-800 mb-2">Alasan Penolakan</h2>
                    <p className="text-sm text-red-700">{data.alasan_penolakan}</p>
                </div>
            )}

            {/* ===== FORM SETUJUI ===== */}
            {data.status === "menunggu_konfirmasi" && (
                <div className="bg-white rounded-xl border p-6 space-y-6">
                    <h2 className="text-md font-semibold text-gray-900">Tindakan Petugas</h2>

                    {!showTolakForm && (
                        <div className="space-y-5">
                            <div className="space-y-4">
                                {data.detail_peminjaman.map((item) => (
                                    <div key={item.id} className="border rounded-xl p-4 space-y-3">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {item.alat_unit.alat.nama_alat}
                                            <span className="font-mono text-xs text-gray-400 ml-2">({item.alat_unit.kode_unit})</span>
                                        </p>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Kondisi Sebelum Dipinjam <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={kondisiPerUnit[item.id] ?? ""}
                                                onChange={(e) => setKondisiPerUnit(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                                            >
                                                <option value="">Pilih kondisi...</option>
                                                <option value="baik">Baik</option>
                                                <option value="rusak_ringan">Rusak Ringan</option>
                                                <option value="rusak_berat">Rusak Berat</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Foto Alat <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setFotoPerUnit(prev => ({ ...prev, [item.id]: file }));
                                                    setFotoPreviewPerUnit(prev => ({ ...prev, [item.id]: URL.createObjectURL(file) }));
                                                }}
                                                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-lime-100 file:text-lime-700 hover:file:bg-lime-200 cursor-pointer"
                                            />
                                            {fotoPreviewPerUnit[item.id] && (
                                                <img src={fotoPreviewPerUnit[item.id]} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {allUnitFilled && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-amber-600" />
                                        <p className="text-sm font-semibold text-amber-800">Konfirmasi Sebelum Menyetujui</p>
                                    </div>
                                    <p className="text-xs text-amber-700">Pastikan semua informasi sudah benar sebelum menyetujui peminjaman ini.</p>
                                    {[
                                        { key: "kondisiSesuai", label: "Kondisi semua unit sudah sesuai dengan kondisi fisik alat saat ini" },
                                        { key: "fotoSesuai", label: "Foto yang diupload adalah foto alat yang benar dan terkini" },
                                        { key: "dataBenar", label: "Saya telah memeriksa data peminjaman dan menyatakan informasi sudah benar" },
                                    ].map(({ key, label }) => (
                                        <label key={key} className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={checks[key as keyof typeof checks]}
                                                onChange={(e) => setChecks(prev => ({ ...prev, [key]: e.target.checked }))}
                                                className="mt-0.5 h-4 w-4 accent-lime-700 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSetujui}
                                    disabled={submitting || !allChecked || !allUnitFilled}
                                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {submitting ? "Menyetujui..." : "Setujui Peminjaman"}
                                </button>
                                <button
                                    onClick={() => setShowTolakForm(true)}
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
                                >
                                    Tolak Peminjaman
                                </button>
                            </div>
                        </div>
                    )}

                    {showTolakForm && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-4">
                            <p className="text-sm font-semibold text-red-800">Form Penolakan</p>
                            <textarea
                                rows={4}
                                value={alasanPenolakan}
                                onChange={(e) => setAlasanPenolakan(e.target.value)}
                                placeholder="Tuliskan alasan penolakan secara jelas..."
                                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                            />
                            <div className="flex gap-3">
                                <button onClick={handleTolak} disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50">
                                    {submitting ? "Menolak..." : "Konfirmasi Tolak"}
                                </button>
                                <button onClick={() => setShowTolakForm(false)} disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition">
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ===== FORM KONFIRMASI PENGEMBALIAN ===== */}
            {data.status === "pengembalian_diajukan" && (
                <div className="bg-white rounded-xl border p-6 space-y-6">
                    <h2 className="text-sm font-semibold text-gray-900">Konfirmasi Pengembalian</h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Kembali <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={tanggalKembali}
                                max={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setTanggalKembali(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                            />
                        </div>

                        {/* Per unit kondisi & foto sesudah */}
                        <div className="space-y-4">
                            {data.detail_peminjaman.map((item) => (
                                <div key={item.id} className="border rounded-xl p-4 space-y-3">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {item.alat_unit.alat.nama_alat}
                                        <span className="font-mono text-xs text-gray-400 ml-2">({item.alat_unit.kode_unit})</span>
                                    </p>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kondisi Saat Dikembalikan <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={kondisiSesudahPerUnit[item.id] ?? ""}
                                            onChange={(e) => {
                                                setKondisiSesudahPerUnit(prev => ({ ...prev, [item.id]: e.target.value }));
                                                setChecksKembali({ kondisiSesuai: false, fotoSesuai: false, dataBenar: false });
                                            }}
                                            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                                        >
                                            <option value="">Pilih kondisi...</option>
                                            <option value="baik">Baik</option>
                                            <option value="rusak_ringan">Rusak Ringan</option>
                                            <option value="rusak_berat">Rusak Berat</option>
                                            <option value="hilang">Hilang</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Foto Alat Sesudah <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setFotoSesudahPerUnit(prev => ({ ...prev, [item.id]: file }));
                                                setFotoSesudahPreviewPerUnit(prev => ({ ...prev, [item.id]: URL.createObjectURL(file) }));
                                            }}
                                            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-lime-100 file:text-lime-700 hover:file:bg-lime-200 cursor-pointer"
                                        />
                                        {fotoSesudahPreviewPerUnit[item.id] && (
                                            <img src={fotoSesudahPreviewPerUnit[item.id]} alt="Preview sesudah" className="mt-3 rounded-lg max-h-48 object-cover" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Estimasi Denda */}
                        {tanggalKembali && allUnitKembaliFilled && (() => {
                            const est = hitungEstimasiDenda();
                            if (!est) return null;
                            const adaDenda = est.totalKeseluruhan > 0;
                            return (
                                <div className={`rounded-xl border p-4 space-y-3 ${adaDenda ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                                    <p className={`text-md font-semibold ${adaDenda ? "text-red-800" : "text-green-800"}`}>
                                        {adaDenda ? "Estimasi Denda" : "✓ Tidak ada denda"}
                                    </p>
                                    {adaDenda && (
                                        <>
                                            {est.terlambatHari > 0 && (
                                                <p className="text-xs text-orange-700 bg-orange-100 px-3 py-1.5 rounded-lg">
                                                    Terlambat <strong>{est.terlambatHari} hari</strong> — denda keterlambatan 1% per hari per unit
                                                </p>
                                            )}
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-sm text-gray-500">
                                                        <th className="text-left pb-2">Alat</th>
                                                        <th className="text-left pb-2">Harga Alat</th>
                                                        <th className="text-left pb-2">Kondisi Saat Dikembalikan</th>
                                                        <th className="text-left pb-2">Denda Kerusakan</th>
                                                        <th className="text-left pb-2">Denda Keterlambatan</th>
                                                        <th className="text-left pb-2">Total Denda</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {est.rows.map(({ item, kondisi, dendaKerusakan, dendaKeterlambatan, total }) => (
                                                        <tr key={item.id}>
                                                            <td className="py-2">{item.alat_unit.alat.nama_alat}<span className="text-gray-400 font-mono text-xs ml-1">({item.alat_unit.kode_unit})</span></td>
                                                            <td className="py-2">{item.alat_unit.alat.harga ? formatRupiah(item.alat_unit.alat.harga) : "-"}</td>
                                                            <td className="py-2 text-sm">{formatKondisi(kondisi.replace("_", " "))}</td>
                                                            <td className="py-2">{dendaKerusakan > 0 ? formatRupiah(dendaKerusakan) : "-"}</td>
                                                            <td className="py-2">{dendaKeterlambatan > 0 ? formatRupiah(dendaKeterlambatan) : "-"}</td>
                                                            <td className="py-2 font-semibold text-red-600">{formatRupiah(total)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="border-t border-gray-200">
                                                        <td colSpan={5} className="pt-2 text-sm font-semibold text-gray-700">Total Denda</td>
                                                        <td className="pt-2 text-sm font-bold text-red-600">{formatRupiah(est.totalKeseluruhan)}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Checkbox Konfirmasi */}
                        {tanggalKembali && allUnitKembaliFilled && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-amber-600" />
                                    <p className="text-sm font-semibold text-amber-800">Konfirmasi Sebelum Menyimpan</p>
                                </div>
                                <p className="text-xs text-amber-700">Pastikan semua data pengembalian sudah benar dan sesuai kondisi fisik alat.</p>
                                {[
                                    { key: "kondisiSesuai", label: "Kondisi semua unit sudah sesuai dengan kondisi fisik alat saat dikembalikan" },
                                    { key: "fotoSesuai", label: "Foto yang diupload adalah foto alat yang benar saat dikembalikan" },
                                    { key: "dataBenar", label: "Saya menyatakan semua data pengembalian sudah benar dan menyetujui perhitungan denda" },
                                ].map(({ key, label }) => (
                                    <label key={key} className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={checksKembali[key as keyof typeof checksKembali]}
                                            onChange={(e) => setChecksKembali(prev => ({ ...prev, [key]: e.target.checked }))}
                                            className="mt-0.5 h-4 w-4 accent-lime-700 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleKonfirmasiKembali}
                            disabled={submitting || !allCheckedKembali || !tanggalKembali || !allUnitKembaliFilled}
                            className="w-full cursor-pointer py-3 rounded-xl bg-lime-800 hover:bg-lime-700 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Menyimpan..." : "Konfirmasi Pengembalian"}
                        </button>
                    </div>
                </div>
            )}

            {/* Lightbox Preview */}
            {previewFoto && createPortal(
                <div
                    onClick={() => setPreviewFoto(null)}
                    className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
                    style={{ margin: 0 }}
                >
                    <img
                        src={previewFoto}
                        alt="Preview"
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setPreviewFoto(null)}
                        className="absolute cursor-pointer top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full w-9 h-9 flex items-center justify-center text-lg transition"
                    >
                        ✕
                    </button>
                </div>,
                document.body
            )}

            {/* Rincian Denda */}
            {(data.status === "dikembalikan" || data.status === "dikembalikan_terlambat") && (() => {
                const totalDenda = data.detail_peminjaman.reduce(
                    (acc, item) => acc + Number(item.total_denda ?? 0), 0
                );
                return totalDenda > 0 ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 bg-red-800 text-white font-semibold text-md flex items-center justify-between">
                            <span>Rincian Denda</span>
                            <span>{formatRupiah(totalDenda)}</span>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-red-100 text-red-700">
                                <tr>
                                    <th className="px-6 py-3 text-left">Alat</th>
                                    <th className="px-6 py-3 text-left">Kode Unit</th>
                                    <th className="px-6 py-3 text-left">Harga Alat</th>
                                    <th className="px-6 py-3 text-left">Kondisi Akhir</th>
                                    <th className="px-6 py-3 text-left">Total Denda</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100">
                                {data.detail_peminjaman.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4">{item.alat_unit.alat.nama_alat}</td>
                                        <td className="px-6 py-4 font-mono">{item.alat_unit.kode_unit}</td>
                                        <td className="px-6 py-4">{item.alat_unit.alat.harga ? formatRupiah(item.alat_unit.alat.harga) : "-"}</td>
                                        <td className="px-6 py-4">{formatKondisi(item.kondisi_sesudah)}</td>
                                        <td className="px-6 py-4 font-semibold text-red-600">
                                            {item.total_denda && item.total_denda > 0 ? formatRupiah(item.total_denda) : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-red-100">
                                    <td colSpan={4} className="px-6 py-3 font-bold text-red-800">Total Denda</td>
                                    <td className="px-6 py-3 font-bold text-red-800">{formatRupiah(totalDenda)}</td>
                                </tr>
                            </tfoot>
                        </table>
                        <div className="px-6 py-3 bg-red-50 text-xs text-red-600">
                            * Denda mencakup kerusakan dan/atau keterlambatan pengembalian
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                        <span className="text-green-600 text-lg">✓</span>
                        <p className="text-sm text-green-700 font-medium">Tidak ada denda</p>
                    </div>
                );
            })()}
        </div>
    );
}

const Sk = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

function BorrowingDetailPetugasSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                    <Sk className="h-8 w-64" />
                    <Sk className="h-4 w-48" />
                </div>
                <Sk className="h-8 w-28 rounded-full" />
            </div>
            <Sk className="h-9 w-24 rounded-lg" />
            <div className="bg-white rounded-xl border p-6">
                <Sk className="h-4 w-32 mb-6" />
                <div className="flex justify-between">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <Sk className="w-9 h-9 rounded-full" />
                            <Sk className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[0, 1].map(i => (
                    <div key={i} className="bg-white rounded-xl border p-6 space-y-4">
                        <Sk className="h-4 w-32" />
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 6 }).map((_, j) => (
                                <div key={j} className="space-y-1">
                                    <Sk className="h-3 w-20" />
                                    <Sk className="h-4 w-28" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
                <Sk className="h-14 w-full rounded-none" />
                <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Sk key={i} className="h-10 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}