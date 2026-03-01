import { useEffect, useState } from "react";
import { AlertCircle, BarChart3, Box, Clock, Package, TrendingUp, Users, Wrench } from "lucide-react";
import axiosInstance from "../../utils/axios";
import { toast } from "sonner";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell,
} from "recharts";

type KondisiUnit = { kondisi: string; total: number };
type AlatTerpopuler = { id: number; nama_alat: string; foto_alat: string | null; total_dipinjam: number };
type PeminjamanBulan = { bulan: string; total: number; dikembalikan: number };

type DetailPeminjamanItem = {
    alat_unit: {
        alat: { nama_alat: string } | null;
    } | null;
};

type PeminjamanItem = {
    id: number;
    status: string;
    tanggal_pinjam: string | null;
    user: { nama: string; email: string } | null;
    detail_peminjaman: DetailPeminjamanItem[];
};

type DashboardData = {
    statistik: {
        total_alat: number;
        total_unit: number;
        unit_tersedia: number;
        unit_dipinjam: number;
        unit_tidak_tersedia: number;
        total_peminjam: number;
        total_peminjaman: number;
        menunggu_konfirmasi: number;
        sedang_dipinjam: number;
        dikembalikan: number;
        ditolak: number;
        pengembalian_diajukan: number;
        terlambat: number;
        total_denda: number;
    };
    peminjaman_per_bulan: PeminjamanBulan[];
    kondisi_unit: KondisiUnit[];
    alat_terpopuler: AlatTerpopuler[];
    peminjaman_terbaru: PeminjamanItem[];
    perlu_tindakan: PeminjamanItem[];
};

const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

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
    terkirim: "TERKIRIM",
    menunggu_konfirmasi: "MENUNGGU KONFIRMASI",
    dipinjam: "DIPINJAM",
    pengembalian_diajukan: "PENGEMBALIAN DIAJUKAN",
    dikembalikan: "DIKEMBALIKAN",
    dikembalikan_terlambat: "DIKEMBALIKAN TERLAMBAT",
    ditolak: "DITOLAK",
};

const StatCard = ({
    label, value, icon: Icon, color, sub
}: {
    label: string; value: string | number; icon: React.ElementType; color: string; sub?: string
}) => (
    <div className="bg-white rounded-xl border p-5 flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-md text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            {sub && <p className="text-sm text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const getNamaAlat = (detail: DetailPeminjamanItem[]): string =>
    detail.map(d => d.alat_unit?.alat?.nama_alat ?? "-").join(", ");

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

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const currentUser = getUserFromToken();

    useEffect(() => {
        const load = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const res = await axiosInstance.get("/dashboard");
                setData(res.data.data);
            } catch {
                toast.error("Gagal memuat dashboard");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <DashboardSkeleton />;
    if (!data) return <div className="p-6 text-gray-500">Data tidak tersedia</div>;

    const { statistik } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                {/* Left Section */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Dashboard Admin
                    </h1>
                    <p className="text-md text-gray-500 mt-1">
                        Ringkasan dan kontrol sistem peminjaman alat
                    </p>
                </div>

                {/* Right Section */}
                <div className="text-right">
                    <p className="text-md text-gray-500">
                        {getGreeting()},
                    </p>
                    <p className="text-3xl font-semibold text-gray-800">
                        {currentUser?.nama ?? "Admin"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Alat" value={statistik.total_alat} icon={Box} color="bg-lime-600" sub={`${statistik.total_unit} unit total`} />
                <StatCard label="Unit Tersedia" value={statistik.unit_tersedia} icon={Package} color="bg-green-500" sub={`dari ${statistik.total_alat} alat`} />
                <StatCard label="Sedang Dipinjam" value={statistik.sedang_dipinjam} icon={TrendingUp} color="bg-yellow-500" sub={`${statistik.unit_dipinjam} unit keluar`} />
                <StatCard label="Total Peminjam" value={statistik.total_peminjam} icon={Users} color="bg-blue-500" sub="pengguna terdaftar" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Peminjaman" value={statistik.total_peminjaman} icon={BarChart3} color="bg-indigo-500" />
                <StatCard label="Perlu Konfirmasi" value={statistik.menunggu_konfirmasi} icon={Clock} color="bg-purple-500" />
                <StatCard label="Terlambat" value={statistik.terlambat} icon={AlertCircle} color="bg-red-500" sub="melewati rencana kembali" />
                <StatCard label="Total Denda" value={formatRupiah(statistik.total_denda)} icon={Wrench} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border p-6">
                    <h2 className="text-md font-semibold text-gray-900 mb-4">Peminjaman per Bulan</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={data.peminjaman_per_bulan} barSize={14}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="total" name="Diajukan" fill="#65a30d" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="dikembalikan" name="Dikembalikan" fill="#86efac" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-md font-semibold text-gray-900 mb-4">Kondisi Unit Alat</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={data.kondisi_unit}
                                dataKey="total"
                                nameKey="kondisi"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={(props) => {
                                    const entry = data.kondisi_unit[props.index ?? 0];
                                    const kondisi = entry?.kondisi ?? "";
                                    const percent = props.percent ?? 0;
                                    return `${kondisi} ${(percent * 100).toFixed(0)}%`;
                                }}
                                labelLine={false}
                            >
                                {data.kondisi_unit.map((entry, index) => (
                                    <Cell key={index} fill={KONDISI_COLORS[entry.kondisi] ?? "#ccc"} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val, name) => [val ?? 0, name]} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {data.kondisi_unit.map((k, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: KONDISI_COLORS[k.kondisi] ?? "#ccc" }} />
                                <span className="text-sm text-gray-600">{k.kondisi} ({k.total})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="px-6 py-4 bg-amber-600 text-white font-semibold text-md flex items-center justify-between">
                        <span>Perlu Tindakan</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{data.perlu_tindakan.length}</span>
                    </div>
                    {data.perlu_tindakan.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">Tidak ada yang perlu ditindaklanjuti</div>
                    ) : (
                        <div className="divide-y">
                            {data.perlu_tindakan.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition"
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

                <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="px-6 py-4 bg-lime-700 text-white font-semibold text-md">Alat Terpopuler</div>
                    <div className="divide-y">
                        {data.alat_terpopuler.map((alat, idx) => (
                            <div key={alat.id} className="flex items-center gap-4 px-6 py-3">
                                <span className="text-lg font-bold text-gray-400 w-6 text-center">{idx + 1}</span>
                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                    {alat.foto_alat
                                        ? <img src={alat.foto_alat} alt={alat.nama_alat} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-gray-300"><Box size={16} /></div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{alat.nama_alat}</p>
                                </div>
                                <span className="text-sm font-bold text-lime-700">{alat.total_dipinjam}x</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 bg-lime-800 text-white font-semibold text-md flex items-center justify-between">
                    <span>Peminjaman Terbaru</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium">Peminjam</th>
                            <th className="px-6 py-3 text-left font-medium">Alat</th>
                            <th className="px-6 py-3 text-left font-medium">Tgl Pinjam</th>
                            <th className="px-6 py-3 text-left font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {data.peminjaman_terbaru.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-md text-gray-800">{p.user?.nama}</p>
                                    <p className="text-sm text-gray-400">{p.user?.email}</p>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm">{getNamaAlat(p.detail_peminjaman)}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {p.tanggal_pinjam
                                        ? new Date(p.tanggal_pinjam).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                                        : "-"}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-sm px-2 py-1 rounded-full font-medium ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                                        {STATUS_LABELS[p.status] ?? p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const Sk = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <Sk className="h-8 w-52" />
                    <Sk className="h-4 w-72" />
                </div>
                <div className="space-y-2 text-right">
                    <Sk className="h-4 w-28 ml-auto" />
                    <Sk className="h-8 w-40 ml-auto" />
                </div>
            </div>

            {/* Stat Cards Row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border p-5 flex items-start gap-4">
                        <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Sk className="h-3 w-20" />
                            <Sk className="h-7 w-16" />
                            <Sk className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Stat Cards Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border p-5 flex items-start gap-4">
                        <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Sk className="h-3 w-20" />
                            <Sk className="h-7 w-16" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border p-6">
                    <Sk className="h-4 w-44 mb-4" />
                    <Sk className="h-60 w-full" />
                </div>
                <div className="bg-white rounded-xl border p-6">
                    <Sk className="h-4 w-32 mb-4" />
                    <Sk className="h-48 w-48 rounded-full mx-auto" />
                    <div className="mt-4 flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Sk key={i} className="h-4 w-24" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border overflow-hidden">
                    <Sk className="h-14 w-full rounded-none" />
                    <div className="divide-y">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-4">
                                <div className="space-y-2">
                                    <Sk className="h-4 w-32" />
                                    <Sk className="h-3 w-48" />
                                </div>
                                <Sk className="h-6 w-28 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl border overflow-hidden">
                    <Sk className="h-14 w-full rounded-none" />
                    <div className="divide-y">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-3">
                                <Sk className="h-5 w-5 rounded" />
                                <Sk className="w-10 h-10 rounded-lg flex-shrink-0" />
                                <Sk className="h-4 flex-1" />
                                <Sk className="h-4 w-8" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Peminjaman Terbaru */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <Sk className="h-14 w-full rounded-none" />
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {["Peminjam", "Alat", "Tgl Pinjam", "Status"].map((_, i) => (
                                <th key={i} className="px-6 py-3 text-left">
                                    <Sk className="h-4 w-20" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4">
                                    <Sk className="h-4 w-32 mb-1" />
                                    <Sk className="h-3 w-24" />
                                </td>
                                <td className="px-6 py-4"><Sk className="h-4 w-40" /></td>
                                <td className="px-6 py-4"><Sk className="h-4 w-28" /></td>
                                <td className="px-6 py-4"><Sk className="h-6 w-28 rounded-full" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}