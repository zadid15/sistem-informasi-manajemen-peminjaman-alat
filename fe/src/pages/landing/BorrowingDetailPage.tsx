import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getDetailPeminjaman } from "../../services/peminjamanService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import type { Alat, KondisiAlat, StatusAlat } from "../../types/alat";
import { Badge } from "../../components/ui/badge";
import type { DetailPeminjaman, Peminjaman } from "../../types/peminjaman";
import placeholderImg from '../../assets/placeholder.jpg';

const TIMELINE_STEPS = [
    { key: "terkirim", label: "Terkirim" },
    { key: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
    { key: "disetujui", label: "Disetujui" },
    { key: "dipinjam", label: "Dipinjam" },
    { key: "pengembalian_diajukan", label: "Pengembalian Diajukan" },
    { key: "dikembalikan", label: "Dikembalikan" },
];

function getStepIndex(status: string) {
    if (status === "dikembalikan_terlambat") {
        return TIMELINE_STEPS.length - 1;
    }

    return TIMELINE_STEPS.findIndex(step => step.key === status);
}

/* ================= PAGE ================= */

export default function BorrowingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<Peminjaman | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAlat, setSelectedAlat] = useState<Alat | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            setLoading(true);

            await new Promise(r => setTimeout(r, 500)); // delay dikit
            const res = await getDetailPeminjaman(id!);

            if (!ignore) {
                setData(res.data);
                setLoading(false);
            }
        };

        load();
        return () => { ignore = true };
    }, [id]);

    if (loading) return <BorrowingDetailSkeleton />;
    if (!data) return <div className="p-6">Data tidak ditemukan</div>;

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
        <div className="min-h-screen bg-white">
            {/* HEADER */}
            <section className="pt-36 pb-10 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                                Detail Peminjaman
                            </h1>
                            <p className="mt-3 text-lg text-gray-600">
                                Informasi lengkap tentang peminjaman alat
                            </p>
                        </div>

                        <StatusBadge status={data.status} />
                    </div>

                    <BorrowTimeline status={data.status} />
                </div>
            </section>

            {/* BACK */}
            <div className="pb-8 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium group cursor-pointer"
                    >
                        <ArrowLeft
                            size={20}
                            className="group-hover:-translate-x-1 transition-transform"
                        />
                        Kembali ke List Peminjaman
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-6">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* INFO */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <InfoItem label="Tanggal Pinjam" value={data.tanggal_pinjam} />
                        <InfoItem label="Rencana Pengembalian" value={data.rencana_pengembalian} />
                        <InfoItem label="Tanggal Dikembalikan" value={data.tanggal_kembali ?? "-"} />
                        <InfoItem label="Catatan" value={data.catatan ?? "-"} />
                    </div>

                    {/* ALASAN PENOLAKAN */}
                    {data.status === "ditolak" && data.alasan_penolakan && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                            <p className="font-medium mb-1">Alasan Penolakan</p>
                            <p className="text-sm">{data.alasan_penolakan}</p>
                        </div>
                    )}

                    {/* TABEL ALAT */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b font-semibold bg-lime-800 text-white">
                            Daftar Alat Dipinjam
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Nama Alat</th>
                                        <th className="px-6 py-4 text-left">Kode</th>
                                        <th className="px-6 py-4 text-left">Lokasi</th>
                                        <th className="px-6 py-4 text-left">Kondisi</th>
                                        <th className="px-6 py-4 text-left">Harga</th>
                                        <th className="px-6 py-4 text-left">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.detail_peminjaman.map((item: DetailPeminjaman) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4">{item.alat.nama_alat}</td>
                                            <td className="px-6 py-4">{item.alat.kode_alat}</td>
                                            <td className="px-6 py-4">{item.alat.lokasi}</td>
                                            <td className="px-6 py-4 capitalize">{item.alat.kondisi}</td>
                                            <td className="px-6 py-4">
                                                Rp {item.alat.harga.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAlat(item.alat);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="inline-flex px-4 py-1 cursor-pointer rounded-full border border-blue-600 text-blue-600
                        bg-blue-50 hover:bg-blue-600 hover:text-white transition"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {data.detail_peminjaman.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                                                Tidak ada alat
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Modal */}
                        {selectedAlat && (
                            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>Detail Alat</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                                                <InfoItem label="Kategori" value={selectedAlat.kategori?.nama_kategori ?? "-"} />
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
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Deskripsi</p>
                                                    <p className="text-sm text-gray-600 leading-relaxed italic">
                                                        "{selectedAlat.deskripsi}"
                                                    </p>
                                                </div>
                                            )}

                                            {Array.isArray(selectedAlat.spesifikasi) && selectedAlat.spesifikasi.length > 0 && (
                                                <div className="pt-2">
                                                    <p className="text-xs font-medium text-gray-500 mb-2">Spesifikasi</p>
                                                    <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-lg">
                                                        {selectedAlat.spesifikasi.map((spec, index) => (
                                                            <div key={index} className="flex border-b border-gray-200 last:border-0 pb-1 last:pb-0">
                                                                <span className="text-sm text-gray-500 w-1/3">{spec.name}</span>
                                                                <span className="text-sm font-semibold text-gray-800 w-2/3">: {spec.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                        )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}


function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        terkirim: "bg-blue-50 text-blue-700 ring-blue-200",
        menunggu_konfirmasi: "bg-indigo-50 text-indigo-700 ring-indigo-200",
        disetujui: "bg-green-50 text-green-700 ring-green-200",
        ditolak: "bg-red-50 text-red-700 ring-red-200",
        dipinjam: "bg-yellow-50 text-yellow-700 ring-yellow-200",
        pengembalian_diajukan: "bg-purple-50 text-purple-700 ring-purple-200",
        dikembalikan: "bg-gray-100 text-gray-700 ring-gray-200",
        dikembalikan_terlambat: "bg-orange-50 text-orange-700 ring-orange-200",
    };

    return (
        <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ring-1 ${map[status]}`}
        >
            {status.replaceAll("_", " ").toUpperCase()}
        </span>
    );
}

function BorrowTimeline({ status }: { status: string }) {
    const currentIndex = getStepIndex(status);
    const isRejected = status === "ditolak";

    return (
        <div className="mt-10 px-4">
            <div className="flex items-center justify-between relative">
                {/* Garis timeline abu-abu */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0" />

                {/* Garis progress hijau */}
                <div
                    className={`absolute top-4 left-0 h-1 bg-green-500 z-0 transition-all duration-300`}
                    style={{ width: `${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                />

                {TIMELINE_STEPS.map((step, index) => {
                    // 1. Logika isDone diubah: 
                    // Jika status saat ini adalah langkah terakhir, maka langkah terakhir juga harus ceklis.
                    const isDone = index < currentIndex || (currentIndex === TIMELINE_STEPS.length - 1 && index === currentIndex);

                    // 2. Logika isActive diubah:
                    // Aktif hanya jika indeks sama DAN bukan status terakhir yang sudah selesai
                    const isActive = index === currentIndex && !isRejected && index !== TIMELINE_STEPS.length - 1;

                    return (
                        <div key={step.key} className="flex-1 flex flex-col items-center z-10 relative group">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md
                ${isRejected && index <= currentIndex
                                        ? "bg-red-500 text-white"
                                        : isDone // Ceklis akan muncul di sini
                                            ? "bg-green-500 text-white"
                                            : isActive
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-500"
                                    } transition-colors duration-300`}
                            >
                                {isDone ? "✓" : index + 1}
                            </div>

                            {/* Tooltip saat hover */}
                            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                {step.label}
                            </div>

                            {/* Label di bawah */}
                            <span className="mt-2 text-sm text-gray-700 text-center max-w-[70px]">
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

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

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

function BorrowingDetailSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            {/* HEADER */}
            <section className="pt-36 pb-10 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                                Detail Peminjaman
                            </h1>
                            <p className="mt-3 text-lg text-gray-600">
                                Informasi lengkap tentang peminjaman alat
                            </p>
                        </div>
                        {/* status badge */}
                        <Skeleton className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold h-10 w-40" />
                    </div>

                    {/* timeline */}
                    <div className="mt-10 flex justify-between gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <div className="p-6">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* INFO */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                        ))}
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <Skeleton className="h-5 w-40" />
                        </div>

                        <div className="p-6 space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-6 gap-4">
                                    <Skeleton className="h-4 col-span-2" />
                                    <Skeleton className="h-4" />
                                    <Skeleton className="h-4" />
                                    <Skeleton className="h-4" />
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}