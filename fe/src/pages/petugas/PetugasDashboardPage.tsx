import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Box, CheckCircle2, Clock, Package, RotateCcw, Send } from "lucide-react";
import axiosInstance from "../../utils/axios";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type KondisiUnit = { kondisi: string; total: number };

type DetailItem = {
    alat_unit: { alat: { nama_alat: string } | null } | null;
};

type PeminjamanItem = {
    id: number;
    status: string;
    tanggal_pinjam: string | null;
    rencana_pengembalian: string | null;
    terlambat?: boolean;
    hari_terlambat?: number;
    user: { nama: string; phone?: string } | null;
    detail_peminjaman: DetailItem[];
};

type DashboardPetugasData = {
    statistik: {
        terkirim: number;
        menunggu_konfirmasi: number;
        pengembalian_diajukan: number;
        sedang_dipinjam: number;
        terlambat: number;
        unit_tersedia: number;
        unit_dipinjam: number;
    };
    perlu_konfirmasi: PeminjamanItem[];
    dipinjam_sekarang: PeminjamanItem[];
    kondisi_unit: KondisiUnit[];
    aktivitas_saya: PeminjamanItem[];
};

const KONDISI_COLORS: Record<string, string> = {
    "Baik": "#22c55e",
    "Layak Pakai": "#84cc16",
    "Perlu Perawatan": "#f59e0b",
    "Rusak Ringan": "#f97316",
    "Rusak Berat": "#ef4444",
    "Dalam Servis": "#6366f1",
    "Tidak Layak Pakai": "#6b7280",
};

const STATUS_COLORS: Record<string, string> = {
    terkirim: "bg-blue-100 text-blue-700",
    menunggu_konfirmasi: "bg-indigo-100 text-indigo-700",
    dipinjam: "bg-yellow-100 text-yellow-700",
    pengembalian_diajukan: "bg-purple-100 text-purple-700",
    dikembalikan: "bg-gray-100 text-gray-700",
    dikembalikan_terlambat: "bg-orange-100 text-orange-700",
    ditolak: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
    terkirim: "MENGAJUKAN",
    menunggu_konfirmasi: "MENUNGGU KONFIRMASI",
    dipinjam: "DIPINJAM",
    pengembalian_diajukan: "PENGEMBALIAN DIAJUKAN",
    dikembalikan: "DIKEMBALIKAN",
    dikembalikan_terlambat: "DIKEMBALIKAN TERLAMBAT",
    ditolak: "DITOLAK",
};

const getNamaAlat = (detail: DetailItem[]) =>
    detail.map(d => d.alat_unit?.alat?.nama_alat ?? "-").join(", ");

const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border p-5 flex items-start gap-4">
            <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="space-y-2 flex-1">
                <Sk className="h-3 w-24" />
                <Sk className="h-6 w-12" />
            </div>
        </div>
    );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, color, sub, alert }: {
    label: string; value: number; icon: React.ElementType; color: string; sub?: string; alert?: boolean;
}) => (
    <div className={`bg-white rounded-xl border p-5 flex items-start gap-4 ${alert && value > 0 ? "border-red-200 bg-red-50" : ""}`}>
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-md text-gray-500 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${alert && value > 0 ? "text-red-600" : "text-gray-900"}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserFromToken = () => {
    try {
        const user = localStorage.getItem("user");
        if (!user) return null;
        return JSON.parse(user);
    } catch {
        return null;
    }
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 15) return "Good Afternoon";
    if (hour >= 15 && hour < 18) return "Good Evening";
    return "Good Night";
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PetugasDashboardPage() {
    const [data, setData] = useState<DashboardPetugasData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Dari localStorage — tidak perlu tunggu BE
    const currentUser = getUserFromToken();

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            const start = Date.now();

            try {
                const res = await axiosInstance.get("/dashboard/petugas");
                setData(res.data.data);
            } catch {
                toast.error("Gagal memuat dashboard");
            } finally {
                const elapsed = Date.now() - start;
                const MIN_LOADING = 800; // 👈 bebas: 600–1200ms enak

                setTimeout(() => {
                    setLoading(false);
                }, Math.max(0, MIN_LOADING - elapsed));
            }
        };

        fetchDashboard();
    }, []);

    const statistik = data?.statistik;

    return (
        <div className="space-y-6">

            {/* Header — statis, langsung tampil */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Dashboard Petugas
                    </h1>
                    <p className="text-md text-gray-500 mt-1">
                        Aktivitas dan pengelolaan peminjaman alat
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-md text-gray-500">{getGreeting()},</p>
                    <p className="text-3xl font-semibold text-gray-800">
                        {currentUser?.nama ?? "Admin"}
                    </p>
                </div>
            </div>

            {/* Alert — skeleton saat loading, tampil kalau ada data */}
            {loading ? (
                <Sk className="h-16 w-full rounded-xl" />
            ) : statistik && (statistik.terkirim > 0 || statistik.menunggu_konfirmasi > 0 || statistik.pengembalian_diajukan > 0 || statistik.terlambat > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-md text-amber-800">
                        <p className="font-semibold mb-1">Perlu Tindakan Segera</p>
                        <div className="flex flex-wrap gap-3">
                            {statistik.terkirim > 0 && (
                                <button onClick={() => navigate("/petugas/manajemen-peminjaman?status=terkirim")}
                                    className="underline hover:text-amber-900 cursor-pointer">
                                    {statistik.terkirim} peminjaman baru diajukan
                                </button>
                            )}
                            {statistik.menunggu_konfirmasi > 0 && (
                                <button onClick={() => navigate("/petugas/manajemen-peminjaman?status=menunggu_konfirmasi")}
                                    className="underline hover:text-amber-900 cursor-pointer">
                                    {statistik.menunggu_konfirmasi} menunggu konfirmasi
                                </button>
                            )}
                            {statistik.pengembalian_diajukan > 0 && (
                                <button onClick={() => navigate("/petugas/manajemen-peminjaman?status=pengembalian_diajukan")}
                                    className="underline hover:text-amber-900 cursor-pointer">
                                    {statistik.pengembalian_diajukan} pengembalian diajukan
                                </button>
                            )}
                            {statistik.terlambat > 0 && (
                                <span className="text-red-700 font-semibold">
                                    ⚠ {statistik.terlambat} peminjaman terlambat
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Stat Cards — skeleton per card */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    Array.from({ length: 7 }).map((_, i) => <StatCardSkeleton key={i} />)
                ) : statistik && (
                    <>
                        <StatCard label="Baru Diajukan" value={statistik.terkirim} icon={Send} color="bg-blue-500" alert />
                        <StatCard label="Menunggu Konfirmasi" value={statistik.menunggu_konfirmasi} icon={Clock} color="bg-indigo-500" alert />
                        <StatCard label="Pengembalian Diajukan" value={statistik.pengembalian_diajukan} icon={RotateCcw} color="bg-purple-500" alert />
                        <StatCard label="Terlambat" value={statistik.terlambat} icon={AlertCircle} color="bg-red-500" alert />
                        <StatCard label="User Sedang Meminjam" value={statistik.sedang_dipinjam} icon={Package} color="bg-yellow-500" />
                        <StatCard label="Unit Tersedia" value={statistik.unit_tersedia} icon={CheckCircle2} color="bg-green-500" />
                        <StatCard label="Unit Dipinjam" value={statistik.unit_dipinjam} icon={Box} color="bg-gray-500" />
                    </>
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Perlu Konfirmasi — header statis, isi skeleton */}
                <div className="lg:col-span-2 bg-white rounded-xl border overflow-hidden">
                    <div className="px-6 py-4 bg-amber-600 text-white font-semibold text-md flex items-center justify-between">
                        <span>Perlu Dikonfirmasi</span>
                        {!loading && data && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                {data.perlu_konfirmasi.length}
                            </span>
                        )}
                    </div>
                    {loading ? (
                        <div className="divide-y">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between px-6 py-4">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <Sk className="h-4 w-32" />
                                        <Sk className="h-3 w-48" />
                                        <Sk className="h-3 w-40" />
                                    </div>
                                    <Sk className="h-6 w-28 rounded-full ml-3 flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    ) : data?.perlu_konfirmasi.length === 0 ? (
                        <div className="p-8 text-center">
                            <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Semua sudah dikonfirmasi</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {data?.perlu_konfirmasi.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => navigate(`/petugas/peminjaman/${p.id}`)}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-md font-medium text-gray-800">{p.user?.nama}</p>
                                        <p className="text-sm text-gray-400 mt-0.5 truncate">{getNamaAlat(p.detail_peminjaman)}</p>
                                        <p className="text-sm text-gray-400 mt-0.5">
                                            Pinjam: {formatDate(p.tanggal_pinjam)} · Kembali: {formatDate(p.rencana_pengembalian)}
                                        </p>
                                    </div>
                                    <span className={`ml-3 text-sm px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                                        {STATUS_LABELS[p.status] ?? p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Kondisi Unit — judul statis, chart & legend skeleton */}
                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-md font-semibold text-gray-900 mb-4">Kondisi Unit Alat</h2>
                    {loading ? (
                        <div className="space-y-3">
                            <Sk className="h-44 w-44 rounded-full mx-auto" />
                            <div className="mt-3 space-y-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sk className="w-2.5 h-2.5 rounded-full" />
                                            <Sk className="h-3 w-24" />
                                        </div>
                                        <Sk className="h-3 w-6" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={data?.kondisi_unit}
                                        dataKey="total"
                                        nameKey="kondisi"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={75}
                                        labelLine={false}
                                    >
                                        {data?.kondisi_unit.map((entry, index) => (
                                            <Cell key={index} fill={KONDISI_COLORS[entry.kondisi] ?? "#ccc"} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val, name) => [val ?? 0, name]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-3 space-y-1.5">
                                {data?.kondisi_unit.map((k, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: KONDISI_COLORS[k.kondisi] ?? "#ccc" }} />
                                            <span className="text-sm text-gray-600">{k.kondisi}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">{k.total}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Dipinjam Sekarang — header + thead statis, tbody skeleton */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 bg-yellow-500 text-white font-semibold text-md flex items-center justify-between">
                    <span>Sedang Dipinjam</span>
                    <button
                        onClick={() => navigate("/petugas/manajemen-peminjaman?status=dipinjam")}
                        className="text-sm bg-white/30 hover:bg-white/40 px-3 py-1 rounded-full transition cursor-pointer"
                    >
                        Lihat Semua
                    </button>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-200 text-gray-500">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium">Peminjam</th>
                            <th className="px-6 py-3 text-left font-medium">Alat</th>
                            <th className="px-6 py-3 text-left font-medium">Rencana Kembali</th>
                            <th className="px-6 py-3 text-left font-medium">Keterlambatan</th>
                            <th className="px-6 py-3 text-left font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 5 }).map((__, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <Sk className="h-4 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data?.dipinjam_sekarang.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-6 text-center text-sm text-gray-400">
                                    Tidak ada peminjaman aktif
                                </td>
                            </tr>
                        ) : (
                            data?.dipinjam_sekarang.map((p) => (
                                <tr key={p.id} className={`hover:bg-gray-50 ${p.terlambat ? "bg-red-50" : ""}`}>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-800">{p.user?.nama}</p>
                                        {p.user?.phone && <p className="text-gray-400">{p.user.phone}</p>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{getNamaAlat(p.detail_peminjaman)}</td>
                                    <td className="px-6 py-4 text-gray-500">{formatDate(p.rencana_pengembalian)}</td>
                                    <td className="px-6 py-4">
                                        {p.terlambat ? (
                                            <span className="text-sm font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                                +{p.hari_terlambat} hari
                                            </span>
                                        ) : (
                                            <span className="text-sm text-green-800 px-4 py-1 rounded-full bg-green-100">Tepat waktu</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/petugas/peminjaman/${p.id}`)}
                                            className="text-sm text-gray-800 px-4 py-1 rounded-full bg-gray-100 cursor-pointer"
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Aktivitas Saya — header statis, list skeleton */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 bg-lime-800 text-white font-semibold text-md">
                    Aktivitas Terbaru Saya
                </div>
                {loading ? (
                    <div className="divide-y">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-3">
                                <div className="space-y-2 flex-1">
                                    <Sk className="h-4 w-32" />
                                    <Sk className="h-3 w-48" />
                                </div>
                                <Sk className="h-6 w-24 rounded-full ml-3" />
                            </div>
                        ))}
                    </div>
                ) : data?.aktivitas_saya.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">Belum ada aktivitas</div>
                ) : (
                    <div className="divide-y">
                        {data?.aktivitas_saya.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => navigate(`/petugas/peminjaman/${p.id}`)}
                                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 cursor-pointer transition"
                            >
                                <div>
                                    <p className="text-md font-medium text-gray-800">{p.user?.nama}</p>
                                    <p className="text-sm text-gray-400 mt-0.5">{getNamaAlat(p.detail_peminjaman)}</p>
                                </div>
                                <span className={`text-sm px-2 py-1 rounded-full font-medium ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                                    {STATUS_LABELS[p.status] ?? p.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}