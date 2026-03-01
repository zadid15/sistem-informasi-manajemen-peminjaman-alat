import { ArrowLeft, ArrowRight, Calendar, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { EmptyState } from "../../components/shared/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { getPeminjaman } from "../../services/peminjamanService";

export type StatusPeminjaman =
    | 'terkirim'
    | 'menunggu_konfirmasi'
    | 'disetujui'
    | 'ditolak'
    | 'dipinjam'
    | 'pengembalian_diajukan'
    | 'dikembalikan'
    | 'dikembalikan_terlambat';

export interface Peminjaman {
    id: number;
    id_user: number;
    approved_by: number | null;
    received_by: number | null;
    tanggal_pinjam: string;
    tanggal_kembali: string | null;
    rencana_pengembalian: string;
    kondisi_sebelum: string | null;
    kondisi_sesudah: string | null;
    foto_sebelum: string | null;
    foto_sesudah: string | null;
    status: StatusPeminjaman;
    catatan: string | null;
    alasan_penolakan: string | null;
    user: {
        id: number;
        nama: string;
        email: string;
        role: string;
        phone: string;
        alamat: string;
        foto: string;
    };
    approver: {
        id: number;
        nama: string;
        email: string;
    } | null;
}

const statusColors: Record<StatusPeminjaman, string> = {
    terkirim: 'bg-blue-100 text-sm text-blue-800',
    menunggu_konfirmasi: 'bg-indigo-100 text-indigo-800 text-sm',
    disetujui: 'bg-green-100 text-green-800 text-sm',
    ditolak: 'bg-red-100 text-red-800 text-sm',
    dipinjam: 'bg-yellow-100 text-yellow-800 text-sm',
    pengembalian_diajukan: 'bg-purple-100 text-purple-800 text-sm',
    dikembalikan: 'bg-gray-100 text-gray-800 text-sm',
    dikembalikan_terlambat: 'bg-orange-100 text-orange-800 text-sm',
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

export default function BorrowingManagementPage() {
    const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page") || 1);
    const searchQuery = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";

    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const navigate = useNavigate();

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchInput), 500);
        return () => clearTimeout(handler);
    }, [searchInput]);

    useEffect(() => {
        const loadPeminjaman = async () => {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 500));
                const res = await getPeminjaman({
                    page: currentPage,
                    search: debouncedSearch || undefined,
                });
                setPeminjaman(res.data);
                setPagination(res.pagination);
            } catch {
                toast.error("Gagal mengambil data peminjaman");
            } finally {
                setLoading(false);
            }
        };
        loadPeminjaman();
    }, [currentPage, debouncedSearch, statusFilter]);


    const formatDate = (date: string | null) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
        });
    };

    const filteredPeminjaman = statusFilter === "all"
        ? peminjaman
        : peminjaman.filter(p => p.status === statusFilter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Peminjaman</h1>
                <p className="text-gray-600 text-md mt-1">Kelola peminjaman alat oleh pengguna</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Cari berdasarkan status..."
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value);
                                setSearchParams({ page: "1", search: e.target.value, status: statusFilter });
                            }}
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setSearchParams({ page: "1", search: searchQuery, status: value })}
                    >
                        <SelectTrigger className="w-full md:w-48 cursor-pointer">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="terkirim">Terkirim</SelectItem>
                            <SelectItem value="menunggu_konfirmasi">Menunggu Konfirmasi</SelectItem>
                            <SelectItem value="dipinjam">Dipinjam</SelectItem>
                            <SelectItem value="ditolak">Ditolak</SelectItem>
                            <SelectItem value="dikembalikan">Dikembalikan</SelectItem>
                            <SelectItem value="dikembalikan_terlambat">Dikembalikan Terlambat</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
                {loading ? (
                    <table className="w-full">
                        <thead className="bg-lime-800">
                            <tr>
                                {["ID", "Peminjam", "Tanggal Pinjam", "Rencana Pengembalian", "Status", "Aksi"].map((_, i) => (
                                    <th key={i} className={`px-6 py-3 ${i === 5 ? "text-right" : "text-left"}`}>
                                        <div className={`h-4 w-20 bg-gray-200 rounded animate-pulse ${i === 5 ? "ml-auto" : ""}`} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {Array.from({ length: 5 }).map((_, row) => (
                                <tr key={row} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 w-36 bg-gray-200 rounded mb-1" />
                                        <div className="h-3 w-24 bg-gray-200 rounded" />
                                    </td>
                                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-200 rounded-full" /></td>
                                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-gray-200 rounded-md ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t bg-gray-300 gap-3">
                                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                                        <div className="flex items-center gap-1">
                                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                ) : filteredPeminjaman.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="Tidak ada peminjaman yang ditemukan"
                        description="Belum ada data peminjaman atau coba ubah filter pencarian"
                    />
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-lime-800 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-md text-white font-semibold">ID</th>
                                    <th className="px-6 py-3 text-left text-md text-white font-semibold">Peminjam</th>
                                    <th className="px-6 py-3 text-left text-md text-white font-semibold">Tanggal Pinjam</th>
                                    <th className="px-6 py-3 text-left text-md text-white font-semibold">Rencana Kembali</th>
                                    <th className="px-6 py-3 text-left text-md text-white font-semibold">Status</th>
                                    <th className="px-6 py-3 text-right text-md text-white font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredPeminjaman.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-mono font-medium text-gray-900">{item.id}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-medium text-gray-900">{item.user.nama}</p>
                                            <p className="text-sm text-gray-500">{item.user.email}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-700">{formatDate(item.tanggal_pinjam)}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-700">{formatDate(item.rencana_pengembalian)}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge className={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-full"
                                                onClick={() => navigate(`/petugas/peminjaman/${item.id}`)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Detail
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
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
                                    variant="outline" size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => setSearchParams({ page: String(currentPage - 1), search: debouncedSearch, status: statusFilter })}
                                >
                                    <ArrowLeft /> Prev
                                </Button>
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        className="w-8 h-8 mx-1"
                                        size="sm"
                                        variant={page === pagination.current_page ? "default" : "outline"}
                                        onClick={() => setSearchParams({ page: String(page), search: debouncedSearch, status: statusFilter })}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline" size="sm"
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

        </div>
    );
}