import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, PackageCheck, ChevronDown, ExternalLink, CheckCircle } from "lucide-react";
import { getDetailPeminjaman, ajukanPengembalian } from "../../services/peminjamanService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import type { DetailPeminjaman, Peminjaman } from "../../types/peminjaman";
import placeholderImg from '../../assets/placeholder.jpg';
import { toast } from "sonner";
import { formatKondisi } from "../../utils/formatKondisi";
import { Button } from "../../components/ui/button";
import axiosInstance from "../../utils/axios";

type Pembayaran = {
    id: number;
    status: 'pending' | 'lunas' | 'expired' | 'manual';
    jumlah: number;
    metode: string | null;
    xendit_invoice_url: string | null;
    confirmed_at: string | null;
};

const TIMELINE_STEPS = [
    { key: "terkirim", label: "Terkirim" },
    { key: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
    { key: "dipinjam", label: "Dipinjam" },
    { key: "pengembalian_diajukan", label: "Pengembalian Diajukan" },
    { key: "dikembalikan", label: "Dikembalikan" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; ring: string }> = {
    terkirim: { label: "TERKIRIM", color: "text-blue-700", bg: "bg-blue-50", ring: "ring-blue-200" },
    menunggu_konfirmasi: { label: "MENUNGGU KONFIRMASI", color: "text-indigo-700", bg: "bg-indigo-50", ring: "ring-indigo-200" },
    disetujui: { label: "DISETUJUI", color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
    ditolak: { label: "DITOLAK", color: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" },
    dipinjam: { label: "DIPINJAM", color: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
    pengembalian_diajukan: { label: "PENGEMBALIAN DIAJUKAN", color: "text-purple-700", bg: "bg-purple-50", ring: "ring-purple-200" },
    dikembalikan: { label: "DIKEMBALIKAN", color: "text-gray-700", bg: "bg-gray-100", ring: "ring-gray-200" },
    dikembalikan_terlambat: { label: "DIKEMBALIKAN TERLAMBAT", color: "text-orange-700", bg: "bg-orange-50", ring: "ring-orange-200" },
    menunggu_pembayaran: { label: "MENUNGGU PEMBAYARAN", color: "text-orange-700", bg: "bg-orange-50", ring: "ring-orange-200" },
};

const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

function getStepIndex(status: string) {
    if (status === "dikembalikan_terlambat") return TIMELINE_STEPS.length - 1;
    if (status === "menunggu_pembayaran") return 3;
    return TIMELINE_STEPS.findIndex(step => step.key === status);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

// ─── Loading Spinner ──────────────────────────────────────────────────────────

function LoadingSpinner() {
    return (
        <svg className="animate-spin" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <path d="M7.5 1.5 A6 6 0 0 1 13.5 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function BorrowTimeline({ status, loading = false }: { status: string; loading?: boolean }) {
    const currentIndex = loading ? -1 : getStepIndex(status);
    const isRejected = !loading && status === "ditolak";

    return (
        <div className="mt-10 px-4">
            <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0" />
                {!loading && (
                    <div
                        className="absolute top-4 left-0 h-1 bg-green-500 z-0 transition-all duration-300"
                        style={{ width: `${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                    />
                )}
                {TIMELINE_STEPS.map((step, index) => {
                    const isDone = !loading && (index < currentIndex || (currentIndex === TIMELINE_STEPS.length - 1 && index === currentIndex));
                    const isActive = !loading && index === currentIndex && !isRejected && index !== TIMELINE_STEPS.length - 1;

                    return (
                        <div key={step.key} className="flex-1 flex flex-col items-center z-10 relative group">
                            {isActive && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-400 opacity-50 animate-ping z-0" />
                            )}
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-md font-bold shadow-md transition-colors duration-300
                                ${loading
                                    ? "bg-gray-200 text-gray-400"
                                    : isRejected && index <= currentIndex ? "bg-red-500 text-white"
                                        : isDone ? "bg-green-500 text-white"
                                            : isActive ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                {!loading && isDone ? "✓" : index + 1}
                            </div>
                            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                {step.label}
                            </div>
                            <span className="mt-2 text-sm text-gray-700 text-center max-w-[70px]">{step.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Payment Section ──────────────────────────────────────────────────────────

type DendaItem = {
    id: number;
    nama: string;
    kode: string;
    harga: number;
    kondisi: string;
    denda: number;
};

function PembayaranDendaSection({
    items,
    pembayaran,
    buatInvoiceLoading,
    onBuatInvoice,
}: {
    items: DendaItem[];
    pembayaran: Pembayaran | null;
    buatInvoiceLoading: boolean;
    onBuatInvoice: () => void;
}) {
    const totalDenda = items.reduce((acc, i) => acc + i.denda, 0);
    const statusKey = !pembayaran ? "none" : pembayaran.status;
    const isDone = statusKey === "lunas" || statusKey === "manual";

    const formatMetode = (metode: string | null) => {
        const map: Record<string, string> = {
            qris: "QRIS",
            qr_code: "QRIS",
            ewallet: "E-Wallet",
            virtual_account: "Virtual Account",
            manual: "Transfer Manual",
            unknown: "Lainnya",
        };
        return metode ? (map[metode] ?? metode) : "-";
    };

    const statusInfo = {
        none: { label: "BELUM DIBAYAR", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
        pending: { label: "MENUNGGU PEMBAYARAN", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
        expired: { label: "KADALUARSA", color: "text-gray-500", bg: "bg-gray-50", dot: "bg-gray-400" },
        lunas: { label: "LUNAS", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
        manual: { label: "LUNAS", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
    }[statusKey] ?? { label: "-", color: "text-gray-500", bg: "bg-gray-50", dot: "bg-gray-400" };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-md font-semibold text-gray-900">Tagihan Denda</p>
                    <p className="text-sm text-gray-500 mt-0.5">Harap segera diselesaikan</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                    {statusInfo.label}
                </span>
            </div>

            <div className="divide-y divide-gray-50">
                {items.map((item) => (
                    <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-md font-medium text-gray-800 truncate">{item.nama}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{item.kode} · {item.kondisi}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-md font-bold text-red-600">{fmt(item.denda)}</p>
                            <p className="text-[12px] text-gray-400">dari {fmt(item.harga)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Total Tagihan</p>
                <p className={`text-xl font-bold ${isDone ? "text-emerald-600" : "text-gray-900"}`}>
                    {fmt(totalDenda)}
                </p>
            </div>

            <div className="px-5 py-4">
                {statusKey === "none" && (
                    <button
                        onClick={onBuatInvoice}
                        disabled={buatInvoiceLoading}
                        className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {buatInvoiceLoading ? <><LoadingSpinner />Memproses...</> : "Bayar Sekarang"}
                    </button>
                )}
                {statusKey === "pending" && (
                    <button
                        onClick={() => window.open(pembayaran!.xendit_invoice_url!, '_blank')}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        Buka Halaman Pembayaran <ExternalLink size={14} />
                    </button>
                )}
                {statusKey === "expired" && (
                    <button
                        onClick={onBuatInvoice}
                        disabled={buatInvoiceLoading}
                        className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {buatInvoiceLoading ? <><LoadingSpinner />Memproses...</> : "Buat Invoice Baru"}
                    </button>
                )}
                {isDone && (
                    <div className="text-center py-2">
                        <div className="flex justify-center mb-2">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <p className="text-lg font-semibold text-emerald-700">Pembayaran Selesai</p>
                        <p className="text-md text-gray-400 mt-0.5">
                            {statusKey === "manual" ? "Dibayar tunai · dikonfirmasi petugas" : `via ${formatMetode(pembayaran?.metode ?? null)}`}
                        </p>
                    </div>
                )}
            </div>

            <div className="px-5 pb-4 text-center">
                <p className="text-[12px] text-gray-300">Powered by Xendit · Aman & Terenkripsi</p>
            </div>
        </div>
    );
}

// ─── Info Card ────────────────────────────────────────────────────────────────

function InfoCard({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
            <p className={`text-sm text-gray-900 font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
        </div>
    );
}

// ─── Kondisi Badge ────────────────────────────────────────────────────────────

function KondisiBadge({ kondisi }: { kondisi: string | null | undefined }) {
    if (!kondisi || kondisi === "-") return <span className="text-xs text-gray-400">—</span>;
    const colorMap: Record<string, string> = {
        baik: "bg-green-100 text-green-700 uppercase",
        "rusak ringan": "bg-yellow-100 text-yellow-700 uppercase",
        "rusak berat": "bg-red-100 text-red-700 uppercase",
        hilang: "bg-gray-900 text-white uppercase",
    };
    const color = colorMap[kondisi.toLowerCase()] ?? "bg-gray-100 text-gray-600";
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs text-center font-medium ${color}`}>{kondisi}</span>;
}

// ─── Ketentuan Denda ──────────────────────────────────────────────────────────

function KetentuanDenda() {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full px-5 py-4 flex items-center bg-gray-50 justify-between cursor-pointer hover:bg-gray-200 transition"
            >
                <div className="flex items-center gap-2">
                    <span className="text-md font-semibold text-gray-800">Ketentuan Denda</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">4 jenis</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                    {[
                        { icon: "⏰", label: "KETERLAMBATAN", desc: "1% dari harga alat per hari", example: "Rp 500.000 × 3 hari → Rp 15.000", color: "border-orange-200 bg-orange-50", textColor: "text-orange-800", subColor: "text-orange-500" },
                        { icon: "🔧", label: "RUSAK RINGAN", desc: "25% dari harga alat", example: "Rp 500.000 → Rp 125.000", color: "border-yellow-200 bg-yellow-50", textColor: "text-yellow-800", subColor: "text-yellow-500" },
                        { icon: "💥", label: "RUSAK BERAT", desc: "60% dari harga alat", example: "Rp 500.000 → Rp 300.000", color: "border-red-200 bg-red-50", textColor: "text-red-800", subColor: "text-red-500" },
                        { icon: "🚫", label: "HILANG", desc: "100% dari harga alat", example: "Rp 500.000 → Rp 500.000", color: "border-gray-700 bg-gray-900", textColor: "text-white", subColor: "text-gray-400" },
                    ].map(item => (
                        <div key={item.label} className={`rounded-lg border p-3.5 ${item.color}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span>{item.icon}</span>
                                <p className={`text-md font-semibold ${item.textColor}`}>{item.label}</p>
                            </div>
                            <p className={`text-sm font-bold ${item.textColor}`}>{item.desc}</p>
                            <p className={`text-[13px] mt-1 ${item.subColor}`}>{item.example}</p>
                        </div>
                    ))}
                    <div className="sm:col-span-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                        <p className="text-md font-semibold text-blue-800">📋 Denda Kombinasi</p>
                        <p className="text-sm text-blue-700 mt-1">Denda keterlambatan dan kerusakan dijumlahkan apabila keduanya terjadi bersamaan.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BorrowingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<Peminjaman | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState<DetailPeminjaman["alat_unit"] | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showKonfirmasiModal, setShowKonfirmasiModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [checkKondisiBaik, setCheckKondisiBaik] = useState(false);
    const [checkAdaMasalah, setCheckAdaMasalah] = useState(false);
    const checkKonfirmasi = checkKondisiBaik || checkAdaMasalah;

    const [pembayaran, setPembayaran] = useState<Pembayaran | null>(null);
    const [buatInvoiceLoading, setBuatInvoiceLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        let ignore = false;
        const load = async () => {
            setLoading(true);
            await new Promise(r => setTimeout(r, 500));
            const res = await getDetailPeminjaman(id!);
            if (!ignore) { setData(res.data); setLoading(false); }
        };
        load();

        axiosInstance.get(`/peminjaman/${id}/pembayaran`)
            .then(res => setPembayaran(res.data.pembayaran))
            .catch(() => { });

        return () => { ignore = true };
    }, [id]);

    const handleBuatInvoice = async () => {
        setBuatInvoiceLoading(true);
        try {
            const res = await axiosInstance.post(`/peminjaman/${id}/buat-invoice`);
            setPembayaran(res.data.pembayaran);
            window.open(res.data.invoice_url, '_blank');
        } catch { toast.error("Gagal membuat invoice"); }
        finally { setBuatInvoiceLoading(false); }
    };

    const handleAjukanPengembalian = async () => {
        if (!checkKonfirmasi) { toast.error("Harap centang konfirmasi terlebih dahulu"); return; }
        setSubmitting(true);
        try {
            await ajukanPengembalian(id!);
            toast.success("Pengembalian berhasil diajukan");
            setData(prev => prev ? { ...prev, status: "pengembalian_diajukan" } : prev);
            setShowKonfirmasiModal(false);
        } catch { toast.error("Gagal mengajukan pengembalian"); }
        finally { setSubmitting(false); }
    };

    const config = data ? STATUS_CONFIG[data.status] : null;
    const hasDenda = data && (data.status === "dikembalikan" || data.status === "dikembalikan_terlambat" || data.status === "menunggu_pembayaran");
    const dendaItems: DendaItem[] = hasDenda
        ? data!.detail_peminjaman
            .filter(item => item.total_denda && Number(item.total_denda) > 0)
            .map(item => ({
                id: item.id,
                nama: item.alat_unit.alat.nama_alat,
                kode: item.alat_unit.kode_unit,
                harga: Number(item.alat_unit.alat.harga ?? 0),
                kondisi: formatKondisi(item.kondisi_sesudah) ?? "-",
                denda: Number(item.total_denda),
            }))
        : [];

    const INFO_LABELS = [
        "Tanggal Pinjam", "Rencana Pengembalian",
        "Tanggal Kembali", "Catatan",
        "Penyetuju Peminjaman", "Penerima Pengembalian"
    ];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── TOP HEADER ── */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-52 pb-6">
                    <Link
                        to="/list-peminjaman"
                        className="inline-flex items-center gap-1.5 text-md text-gray-500 hover:text-gray-800 font-medium group mb-6"
                    >
                        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                        Kembali ke List Peminjaman
                    </Link>

                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Detail Peminjaman</h1>
                        {loading
                            ? <Skeleton className="h-8 w-36 rounded-full" />
                            : config && (
                                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold ring-1 ${config.bg} ${config.color} ${config.ring}`}>
                                    <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                                    {config.label}
                                </span>
                            )
                        }
                    </div>

                    <BorrowTimeline status={data?.status ?? ""} loading={loading} />
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ─── LEFT ─── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Alasan penolakan */}
                        {!loading && data?.status === "ditolak" && data.alasan_penolakan && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                                <span className="text-red-400 text-lg flex-shrink-0">✕</span>
                                <div>
                                    <p className="text-sm font-semibold text-red-800">Alasan Penolakan</p>
                                    <p className="text-sm text-red-700 mt-1">{data.alasan_penolakan}</p>
                                </div>
                            </div>
                        )}

                        {/* Info umum */}
                        <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-lime-800 px-5 py-3">
                                <p className="text-md font-semibold text-white">Informasi Peminjaman</p>
                            </div>
                            <div className="bg-white p-5">
                                <div className="grid grid-cols-2 gap-4">
                                    {loading
                                        ? INFO_LABELS.map(label => (
                                            <div key={label} className="space-y-1">
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                                                <Skeleton className="h-4 w-28" />
                                            </div>
                                        ))
                                        : (
                                            <>
                                                <InfoCard label="Tanggal Pinjam" value={formatDate(data!.tanggal_pinjam)} />
                                                <InfoCard label="Rencana Pengembalian" value={formatDate(data!.rencana_pengembalian)} />
                                                <InfoCard label="Tanggal Kembali" value={formatDate(data!.tanggal_kembali)} />
                                                <InfoCard label="Catatan" value={data!.catatan} />
                                                <InfoCard label={data!.status === "ditolak" ? "Penolak Peminjaman" : "Penyetuju Peminjaman"} value={data!.approver?.nama || "-"} />
                                                <InfoCard label="Penerima Pengembalian" value={data!.receiver?.nama || "-"} />
                                            </>
                                        )
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Tabel alat */}
                        <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-lime-800 px-5 py-3 flex items-center justify-between">
                                <p className="text-md font-semibold text-white">Daftar Alat Dipinjam</p>
                                {loading
                                    ? <Skeleton className="h-5 w-12 rounded-full bg-white/20" />
                                    : <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">{data!.detail_peminjaman.length} item</span>
                                }
                            </div>
                            <div className="bg-white overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Alat</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kondisi Awal</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kondisi Akhir</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                            <th className="px-5 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading
                                            ? Array.from({ length: 3 }).map((_, i) => (
                                                <tr key={i} className={i % 2 === 1 ? "bg-gray-50/40" : "bg-white"}>
                                                    <td className="px-5 py-3.5">
                                                        <Skeleton className="h-4 w-32 mb-1.5" />
                                                        <Skeleton className="h-3 w-20" />
                                                    </td>
                                                    <td className="px-5 py-3.5"><Skeleton className="h-4 w-20" /></td>
                                                    <td className="px-5 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                                    <td className="px-5 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                                    <td className="px-5 py-3.5"><Skeleton className="h-4 w-24" /></td>
                                                    <td className="px-5 py-3.5"><Skeleton className="h-7 w-14 rounded-full" /></td>
                                                    <td className="px-5 py-3.5" />
                                                </tr>
                                            ))
                                            : data!.detail_peminjaman.length === 0
                                                ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                                                            Tidak ada alat
                                                        </td>
                                                    </tr>
                                                )
                                                : data!.detail_peminjaman.map((item: DetailPeminjaman, idx: number) => (
                                                    <tr
                                                        key={item.id}
                                                        className={`transition-colors ${idx % 2 === 1 ? "bg-gray-50/40" : "bg-white"} hover:bg-blue-50/30`}
                                                    >
                                                        <td className="px-5 py-3.5">
                                                            <p className="font-medium text-sm text-gray-900">{item.alat_unit.alat.nama_alat}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5 font-mono">{item.alat_unit.kode_unit}</p>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-gray-500 text-sm">{item.alat_unit.lokasi}</td>
                                                        <td className="px-5 text-sm py-3.5"><KondisiBadge kondisi={formatKondisi(item.kondisi_sebelum)} /></td>
                                                        <td className="px-5 text-sm py-3.5"><KondisiBadge kondisi={formatKondisi(item.kondisi_sesudah)} /></td>
                                                        <td className="px-5 py-3.5 text-gray-700 text-sm font-medium">
                                                            {item.alat_unit.alat.harga ? fmt(Number(item.alat_unit.alat.harga)) : "—"}
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="cursor-pointer text-sm h-7 px-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                                                                onClick={() => { setSelectedUnit(item.alat_unit); setShowDetailModal(true); }}
                                                            >
                                                                Detail
                                                            </Button>
                                                        </td>
                                                        <td className="px-5 py-3.5" />
                                                    </tr>
                                                ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <KetentuanDenda />
                    </div>

                    {/* ─── RIGHT SIDEBAR ─── */}
                    <div className="space-y-5">

                        {/* Status card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Status</p>
                            {loading
                                ? <Skeleton className="h-16 rounded-lg" />
                                : config && (
                                    <div className={`rounded-lg p-3.5 ${config.bg}`}>
                                        <p className={`text-md font-bold ${config.color}`}>{config.label}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {data!.status === "dipinjam" && "Alat sedang dalam proses peminjaman"}
                                            {data!.status === "disetujui" && "Silakan ambil alat dari petugas"}
                                            {data!.status === "terkirim" && "Permohonan telah dikirim"}
                                            {data!.status === "menunggu_konfirmasi" && "Menunggu persetujuan petugas"}
                                            {data!.status === "pengembalian_diajukan" && "Menunggu konfirmasi petugas"}
                                            {data!.status === "dikembalikan" && "Proses peminjaman selesai"}
                                            {data!.status === "dikembalikan_terlambat" && "Dikembalikan melebihi batas waktu"}
                                            {data!.status === "ditolak" && "Permohonan tidak disetujui"}
                                            {data!.status === "menunggu_pembayaran" && "Harap selesaikan pembayaran denda terlebih dahulu"}
                                        </p>
                                    </div>
                                )
                            }
                        </div>

                        {/* Ajukan pengembalian */}
                        {!loading && data?.status === "dipinjam" && (
                            <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 bg-amber-50 border-b border-amber-100">
                                    <p className="text-md font-semibold text-amber-900">Selesai menggunakan alat?</p>
                                    <p className="text-sm text-amber-700 mt-1">Ajukan pengembalian agar petugas dapat memproses konfirmasi.</p>
                                </div>
                                <div className="p-4">
                                    <button
                                        onClick={() => { setCheckKondisiBaik(false); setCheckAdaMasalah(false); setShowKonfirmasiModal(true); }}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                                    >
                                        <PackageCheck size={16} />
                                        Ajukan Pengembalian
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Pengembalian diajukan */}
                        {!loading && data?.status === "pengembalian_diajukan" && (
                            <div className="bg-white rounded-xl border border-purple-200 shadow-sm p-5 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 text-md">⏳</span>
                                </div>
                                <div>
                                    <p className="text-md font-semibold text-purple-900">Pengembalian Diproses</p>
                                    <p className="text-sm text-purple-600 mt-1">Serahkan alat ke petugas dan tunggu konfirmasi.</p>
                                </div>
                            </div>
                        )}

                        {/* Denda */}
                        {!loading && hasDenda && (
                            dendaItems.length > 0 ? (
                                <PembayaranDendaSection
                                    items={dendaItems}
                                    pembayaran={pembayaran}
                                    buatInvoiceLoading={buatInvoiceLoading}
                                    onBuatInvoice={handleBuatInvoice}
                                />
                            ) : (
                                <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-5 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-emerald-600">✓</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-800">Tidak Ada Denda</p>
                                        <p className="text-xs text-emerald-600 mt-1">Alat dikembalikan dalam kondisi baik dan tepat waktu.</p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* ── MODAL DETAIL UNIT ── */}
            {!loading && selectedUnit && (
                <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-base">Detail Alat</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-1">
                            <div className="aspect-square w-full overflow-hidden rounded-xl border bg-gray-50 flex items-center justify-center">
                                {selectedUnit.alat.foto_alat ? (
                                    <img
                                        src={selectedUnit.alat.foto_alat}
                                        alt={selectedUnit.alat.nama_alat}
                                        className="h-full w-full object-cover"
                                        onError={(e) => (e.currentTarget.src = placeholderImg)}
                                    />
                                ) : (
                                    <span className="text-sm text-gray-400">Tidak ada gambar</span>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <InfoCard label="Kode Unit" value={selectedUnit.kode_unit} mono />
                                    <InfoCard label="Nama Alat" value={selectedUnit.alat.nama_alat} />
                                    <InfoCard label="Kategori" value={selectedUnit.alat.kategori?.nama_kategori ?? "—"} />
                                    <InfoCard label="Lokasi" value={selectedUnit.lokasi} />
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Kondisi</p>
                                        <Badge>{selectedUnit.kondisi}</Badge>
                                    </div>
                                </div>
                                {selectedUnit.alat.deskripsi && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Deskripsi</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">{selectedUnit.alat.deskripsi}</p>
                                    </div>
                                )}
                                {Array.isArray(selectedUnit.alat.spesifikasi) && selectedUnit.alat.spesifikasi.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Spesifikasi</p>
                                        <div className="space-y-1.5">
                                            {selectedUnit.alat.spesifikasi.map((spec, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-400 w-1/3">{spec.name}</span>
                                                    <span className="text-gray-300">·</span>
                                                    <span className="text-gray-800 font-medium">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* ── MODAL KONFIRMASI PENGEMBALIAN ── */}
            {!loading && data && (
                <Dialog open={showKonfirmasiModal} onOpenChange={(open) => {
                    setShowKonfirmasiModal(open);
                    if (!open) { setCheckKondisiBaik(false); setCheckAdaMasalah(false); }
                }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-3xl">Konfirmasi Pengembalian</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-1">
                            <p className="text-md text-gray-500">Pastikan semua alat berikut sudah siap dikembalikan:</p>
                            <div className="bg-gray-50 rounded-lg p-3.5 space-y-2">
                                {data.detail_peminjaman.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2 text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                        <span className="text-gray-700 font-medium">{item.alat_unit.alat.nama_alat}</span>
                                        <span className="text-gray-400 font-mono text-xs">{item.alat_unit.kode_unit}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-start gap-3 cursor-pointer bg-green-50 border border-green-200 rounded-lg p-3.5 hover:bg-green-100/70 transition">
                                    <input type="checkbox" checked={checkKondisiBaik}
                                        onChange={(e) => { setCheckKondisiBaik(e.target.checked); if (e.target.checked) setCheckAdaMasalah(false); }}
                                        className="mt-0.5 h-4 w-4 accent-green-600 cursor-pointer flex-shrink-0"
                                    />
                                    <span className="text-sm text-green-800">Semua alat dalam kondisi baik dan siap dikembalikan</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer bg-red-50 border border-red-200 rounded-lg p-3.5 hover:bg-red-100/70 transition">
                                    <input type="checkbox" checked={checkAdaMasalah}
                                        onChange={(e) => { setCheckAdaMasalah(e.target.checked); if (e.target.checked) setCheckKondisiBaik(false); }}
                                        className="mt-0.5 h-4 w-4 accent-red-600 cursor-pointer flex-shrink-0"
                                    />
                                    <span className="text-sm text-red-800">Ada alat yang rusak atau hilang — saya siap menanggung denda</span>
                                </label>
                                {checkAdaMasalah && (
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-3.5 text-sm text-red-700 grid grid-cols-2 gap-1.5">
                                        <span>• Rusak ringan: 25%</span>
                                        <span>• Rusak berat: 60%</span>
                                        <span>• Hilang: 100%</span>
                                        <span>• Terlambat: 1%/hari</span>
                                        <p className="col-span-2 text-red-500 mt-1">Petugas akan menentukan kondisi akhir.</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={handleAjukanPengembalian}
                                    disabled={!checkKonfirmasi || submitting}
                                    className="flex-1 py-2.5 cursor-pointer rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Mengajukan..." : "Ajukan Pengembalian"}
                                </button>
                                <button
                                    onClick={() => setShowKonfirmasiModal(false)}
                                    disabled={submitting}
                                    className="flex-1 py-2.5 cursor-pointer rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}