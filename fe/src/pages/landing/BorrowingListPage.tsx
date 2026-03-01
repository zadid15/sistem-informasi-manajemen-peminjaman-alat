import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPeminjamanSaya } from "../../services/peminjamanService";
import type { Meta, Peminjaman } from "../../types/peminjaman";
import { EmptyState } from "../../components/shared/EmptyState";
import { BoxIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import type { StatusPeminjaman } from "../petugas/BorrowingManagementPage";

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

export default function BorrowingListPage() {
    const [data, setData] = useState<Peminjaman[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            setLoading(true);

            const res = await getPeminjamanSaya({
                page,
                per_page: 5,
                status: statusFilter || undefined,
            });

            if (!ignore) {
                setData(res.data);
                setMeta(res.meta);

                // Tambahkan delay agar skeleton terlihat
                setTimeout(() => {
                    if (!ignore) setLoading(false);
                }, 700); // 700ms, bisa disesuaikan
            }
        };

        load();

        return () => { ignore = true; };
    }, [page, statusFilter]);

    return (
        <div className="bg-white">
            {/* Header */}
            <section className="pt-36 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        List Peminjaman
                    </h1>
                    <p className="text-lg text-gray-600">
                        Daftar peminjaman yang kamu lakukan
                    </p>
                </div>
            </section>

            {/* Filters */}
            <div className="max-w-7xl mx-auto pt-12">
                {loading ? (
                    <FilterSkeleton />
                ) : (
                    <div className="flex flex-col md:flex-row gap-4">
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => { setPage(1); setStatusFilter(value); }}
                        >
                            <SelectTrigger className="w-full md:w-48 cursor-pointer">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="terkirim">Terkirim</SelectItem>
                                <SelectItem value="disetujui">Disetujui</SelectItem>
                                <SelectItem value="ditolak">Ditolak</SelectItem>
                                <SelectItem value="dipinjam">Dipinjam</SelectItem>
                                <SelectItem value="dikembalikan">Dikembalikan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="max-w-7xl mx-auto mt-6 overflow-x-auto rounded-xl bg-gray-50 shadow-sm mb-[80px]">
                <table className="w-full text-sm border-separate border-spacing-0 rounded-xl">
                    {loading ? (
                        <TableHeadSkeleton />
                    ) : (
                        <thead className="bg-lime-800">
                            <tr>
                                <th className="text-left py-3 px-6 font-semibold text-white rounded-tl-xl">Tanggal Pinjam</th>
                                <th className="text-left py-3 px-6 font-semibold text-white">Rencana Pengembalian</th>
                                <th className="text-left py-3 px-6 font-semibold text-white">Jumlah Alat</th>
                                <th className="text-left py-3 px-6 font-semibold text-white">Status</th>
                                <th className="text-left py-3 px-6 font-semibold text-white rounded-tr-xl">Aksi</th>
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {loading ? (
                            <BorrowingTableSkeleton rows={5} />
                        ) : data.length === 0 ? (
                            <tr className="bg-white">
                                <td colSpan={5} className="py-12 px-6">
                                    <EmptyState
                                        icon={BoxIcon}
                                        title="Tidak ada data"
                                        description="Coba ubah filter atau pilih sort yang lain"
                                    />
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="bg-white hover:bg-gray-50 transition">
                                    <td className="py-4 px-6">{item.tanggal_pinjam}</td>
                                    <td className="py-4 px-6">{item.rencana_pengembalian}</td>
                                    <td className="py-4 px-6">{item.detail_peminjaman.length} alat</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusColors[item.status as StatusPeminjaman]}`}>
                                            {statusLabels[item.status as StatusPeminjaman]}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <Link
                                            to={`/detail-peminjaman/${item.id}`}
                                            className="inline-flex px-4 py-1 cursor-pointer rounded-full border border-blue-600 text-blue-600
                        bg-blue-50 hover:bg-blue-600 hover:text-white transition"
                                        >
                                            Lihat Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Skeleton Pagination persis dengan tombol asli */}
                {loading && (
                    <PaginationSkeleton />
                )}

                {/* Pagination */}
                {meta && !loading && (
                    <div className="flex flex-col md:flex-row items-center justify-between p-3 bg-gray-100 rounded-b-xl shadow-sm gap-3">
                        <p className="text-sm text-gray-700">
                            Menampilkan {(page - 1) * 5 + 1} - {Math.min(page * 5, meta.total)} dari {meta.total} data
                        </p>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Prev
                            </Button>

                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                                <Button
                                    key={p}
                                    size="sm"
                                    className="w-8 h-8 flex items-center justify-center"
                                    variant={p === page ? "default" : "outline"}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === meta.last_page}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-300 rounded ${className}`} />
);

function BorrowingTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="bg-white">
                    <td className="py-4 px-6">
                        <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-4 px-6">
                        <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-4 px-6">
                        <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="py-4 px-6">
                        <Skeleton className="h-4 w-20 rounded-full" />
                    </td>
                    <td className="py-4 px-6">
                        <Skeleton className="h-8 w-20 rounded-full mx-auto" />
                    </td>
                </tr>
            ))}
        </>
    );
}

function FilterSkeleton() {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 w-full md:w-48 rounded-md" />
            <Skeleton className="h-10 w-full md:w-48 rounded-md" />
        </div>
    );
}

function TableHeadSkeleton() {
    return (
        <thead className="bg-lime-800">
            <tr>
                {Array.from({ length: 5 }).map((_, i) => (
                    <th
                        key={i}
                        className={`py-3 px-6 ${i === 0 ? "rounded-tl-xl" : ""
                            } ${i === 4 ? "rounded-tr-xl" : ""
                            }`}
                    >
                        <Skeleton className="h-4 w-24 bg-lime-700/60" />
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function PaginationSkeleton() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-3 bg-gray-100 rounded-b-xl shadow-sm gap-3">
            <Skeleton className="h-4 w-40" />

            <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-14 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-14 rounded-md" />
            </div>
        </div>
    );
}