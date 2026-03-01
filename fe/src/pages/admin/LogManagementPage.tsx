import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { getLogs } from "../../services/logService";

type LogItem = {
    id: number;
    aktor: string;
    aktivitas: string;
    ip: string | null;
    created_at: string;
    user: { id: number; nama: string; role: string } | null;
};

type Pagination = {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
};

const ROLE_COLORS: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    petugas: "bg-blue-100 text-blue-700",
    peminjam: "bg-green-100 text-green-700",
};

const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("id-ID", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

const Sk = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export default function LogManagementPage() {
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0, per_page: 15, current_page: 1, last_page: 1,
    });
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page") || 1);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchInput), 500);
        return () => clearTimeout(handler);
    }, [searchInput]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const res = await getLogs({
                    search: debouncedSearch,
                    page: currentPage,
                    per_page: 15,
                });
                setLogs(res.data);
                setPagination(res.pagination);
            } catch {
                toast.error("Gagal memuat log");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [debouncedSearch, currentPage]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Log Management</h1>
                <p className="text-gray-600 text-md mt-1">Log aktivitas sistem peminjaman alat</p>
            </div>

            {/* Search + Info */}
            <div className="bg-white rounded-xl border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Cari aktor, aktivitas, atau IP..."
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            setSearchParams({ page: "1" });
                        }}
                        className="pl-9"
                    />
                </div>
                <p className="text-sm text-gray-500 flex-shrink-0">
                    Total <span className="font-semibold text-gray-800">{pagination.total}</span> log
                </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                {loading ? (
                    <table className="w-full">
                        <thead className="bg-lime-800">
                            <tr>
                                {["Waktu", "Aktor", "Role", "Aktivitas", "IP"].map((_, i) => (
                                    <th key={i} className="px-6 py-3 text-left">
                                        <Sk className="h-4 w-20" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><Sk className="h-4 w-32" /></td>
                                    <td className="px-6 py-4"><Sk className="h-4 w-24" /></td>
                                    <td className="px-6 py-4"><Sk className="h-5 w-16 rounded-full" /></td>
                                    <td className="px-6 py-4"><Sk className="h-4 w-64" /></td>
                                    <td className="px-6 py-4"><Sk className="h-4 w-24" /></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={5} className="p-0">
                                    <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t bg-gray-50 gap-3">
                                        <Sk className="h-4 w-48" />
                                        <div className="flex items-center gap-1">
                                            <Sk className="h-8 w-16 rounded-lg" />
                                            <Sk className="h-8 w-8 rounded-lg" />
                                            <Sk className="h-8 w-8 rounded-lg" />
                                            <Sk className="h-8 w-8 rounded-lg" />
                                            <Sk className="h-8 w-16 rounded-lg" />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Search size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Tidak ada log ditemukan</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-lime-800 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold">Waktu</th>
                                    <th className="px-6 py-3 text-left font-semibold">Aktor</th>
                                    <th className="px-6 py-3 text-left font-semibold">Role</th>
                                    <th className="px-6 py-3 text-left font-semibold">Aktivitas</th>
                                    <th className="px-6 py-3 text-left font-semibold">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {formatDateTime(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">{log.aktor}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[log.user?.role ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                                                {log.user?.role ?? "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 max-w-md">
                                            {log.aktivitas}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                            {log.ip ?? "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t bg-gray-50 gap-3">
                            <p className="text-sm text-gray-600">
                                Menampilkan{" "}
                                <span className="font-semibold">
                                    {(pagination.current_page - 1) * pagination.per_page + 1}
                                </span>
                                {" – "}
                                <span className="font-semibold">
                                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                                </span>
                                {" dari "}
                                <span className="font-semibold">{pagination.total}</span> log
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={pagination.current_page === 1}
                                    onClick={() => setSearchParams({ page: String(currentPage - 1), search: debouncedSearch })}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                                >
                                    <ArrowLeft size={14} /> Prev
                                </button>

                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                                    .filter(p => Math.abs(p - pagination.current_page) <= 2)
                                    .map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setSearchParams({ page: String(page), search: debouncedSearch })}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition cursor-pointer ${page === pagination.current_page
                                                ? "bg-lime-800 text-white"
                                                : "border text-gray-600 hover:bg-gray-100"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                <button
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => setSearchParams({ page: String(currentPage + 1), search: debouncedSearch })}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                                >
                                    Next <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}