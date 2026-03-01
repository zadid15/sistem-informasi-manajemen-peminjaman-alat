import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { getDetailPeminjaman, ajukanPengembalian } from "../../services/peminjamanService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import type { DetailPeminjaman, Peminjaman } from "../../types/peminjaman";
import placeholderImg from '../../assets/placeholder.jpg';
import { toast } from "sonner";
import { formatKondisi } from "../../utils/formatKondisi";
import { Button } from "../../components/ui/button";

const TIMELINE_STEPS = [
    { key: "terkirim", label: "Terkirim" },
    { key: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
    { key: "disetujui", label: "Disetujui" },
    { key: "dipinjam", label: "Dipinjam" },
    { key: "pengembalian_diajukan", label: "Pengembalian Diajukan" },
    { key: "dikembalikan", label: "Dikembalikan" },
];

function getStepIndex(status: string) {
    if (status === "dikembalikan_terlambat") return TIMELINE_STEPS.length - 1;
    return TIMELINE_STEPS.findIndex(step => step.key === status);
}

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
    const [showKetentuan, setShowKetentuan] = useState(false);

    useEffect(() => {
        let ignore = false;
        const load = async () => {
            setLoading(true);
            await new Promise(r => setTimeout(r, 500));
            const res = await getDetailPeminjaman(id!);
            if (!ignore) {
                setData(res.data);
                setLoading(false);
            }
        };
        load();
        return () => { ignore = true };
    }, [id]);

    const handleAjukanPengembalian = async () => {
        if (!checkKonfirmasi) {
            toast.error("Harap centang konfirmasi terlebih dahulu");
            return;
        }
        setSubmitting(true);
        try {
            await ajukanPengembalian(id!);
            toast.success("Pengembalian berhasil diajukan");
            setData(prev => prev ? { ...prev, status: "pengembalian_diajukan" } : prev);
            setShowKonfirmasiModal(false);
        } catch {
            toast.error("Gagal mengajukan pengembalian");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <BorrowingDetailSkeleton />;
    if (!data) return <div className="p-6">Data tidak ditemukan</div>;

    return (
        <div className="min-h-screen bg-white">
            {/* HEADER */}
            <section className="pt-36 pb-10 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Detail Peminjaman</h1>
                            <p className="mt-3 text-lg text-gray-600">Informasi lengkap tentang peminjaman alat</p>
                        </div>
                        <StatusBadge status={data.status} />
                    </div>
                    <BorrowTimeline status={data.status} />
                </div>
            </section>

            {/* BACK */}
            <div className="pb-8 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <Link
                        to="/list-peminjaman"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium group cursor-pointer"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Kembali ke List Peminjaman
                    </Link>
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
                                        <th className="px-6 py-4 text-left">Kode Unit</th>
                                        <th className="px-6 py-4 text-left">Lokasi</th>
                                        <th className="px-6 py-4 text-left">Kondisi Awal</th>
                                        <th className="px-6 py-4 text-left">Kondisi Akhir</th>
                                        <th className="px-6 py-4 text-left">Harga</th>
                                        <th className="px-6 py-4 text-left">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.detail_peminjaman.map((item: DetailPeminjaman) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4">{item.alat_unit.alat.nama_alat}</td>
                                            <td className="px-6 py-4">{item.alat_unit.kode_unit}</td>
                                            <td className="px-6 py-4">{item.alat_unit.lokasi}</td>
                                            <td className="px-6 py-4">{formatKondisi(item.kondisi_sebelum) ?? "-"}</td>
                                            <td className="px-6 py-4">{formatKondisi(item.kondisi_sesudah) ?? "-"}</td>
                                            <td className="px-6 py-4">
                                                Rp {item.alat_unit.alat.harga?.toLocaleString() ?? "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-full"
                                                    onClick={() => {
                                                        setSelectedUnit(item.alat_unit);
                                                        setShowDetailModal(true);
                                                    }}
                                                >
                                                    Lihat Detail
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.detail_peminjaman.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-6 text-center text-gray-500">Tidak ada alat</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

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
                                    <p className="text-sm text-orange-700"><span className="font-bold">1% dari harga alat per hari</span> keterlambatan.</p>
                                    <p className="text-xs text-orange-500 mt-1">Contoh: Alat Rp 500.000 terlambat 3 hari → denda Rp 15.000</p>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-yellow-800 mb-1">🔧 Rusak Ringan</p>
                                    <p className="text-sm text-yellow-700"><span className="font-bold">25% dari harga alat</span> jika dikembalikan rusak ringan.</p>
                                    <p className="text-xs text-yellow-500 mt-1">Contoh: Alat Rp 500.000 → denda Rp 125.000</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-red-800 mb-1">💥 Rusak Berat</p>
                                    <p className="text-sm text-red-700"><span className="font-bold">60% dari harga alat</span> jika dikembalikan rusak berat.</p>
                                    <p className="text-xs text-red-500 mt-1">Contoh: Alat Rp 500.000 → denda Rp 300.000</p>
                                </div>
                                <div className="bg-gray-900 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-white mb-1">🚫 Hilang</p>
                                    <p className="text-sm text-gray-300"><span className="font-bold text-white">100% dari harga alat</span> jika alat hilang.</p>
                                    <p className="text-xs text-gray-400 mt-1">Contoh: Alat Rp 500.000 → denda Rp 500.000</p>
                                </div>
                                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-blue-800 mb-1">📋 Denda Kombinasi</p>
                                    <p className="text-sm text-blue-700">Denda keterlambatan dan kerusakan <span className="font-bold">dijumlahkan</span> apabila keduanya terjadi bersamaan.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RINGKASAN DENDA */}
                    {(data.status === "dikembalikan" || data.status === "dikembalikan_terlambat") && (
                        (() => {
                            const itemsWithDenda = data.detail_peminjaman.filter(
                                item => item.total_denda && Number(item.total_denda) > 0
                            );
                            const totalDenda = data.detail_peminjaman.reduce(
                                (acc, item) => acc + Number(item.total_denda ?? 0), 0
                            );

                            return totalDenda > 0 ? (
                                <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 bg-red-600 text-white font-semibold text-md flex items-center justify-between">
                                        <span>Rincian Denda</span>
                                        <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalDenda)}</span>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead className="bg-red-100 text-red-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Alat</th>
                                                <th className="px-6 py-3 text-left">Kode Unit</th>
                                                <th className="px-6 py-3 text-left">Harga Alat</th>
                                                <th className="px-6 py-3 text-left">Kondisi Saat Dikembalikan</th>
                                                <th className="px-6 py-3 text-left">Total Denda</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-red-100">
                                            {itemsWithDenda.map(item => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4">{item.alat_unit.alat.nama_alat}</td>
                                                    <td className="px-6 py-4 font-mono">{item.alat_unit.kode_unit}</td>
                                                    <td className="px-6 py-4 font-semibold text-red-600">
                                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(item.alat_unit.alat.harga ?? 0))}
                                                    </td>
                                                    <td className="px-6 py-4">{formatKondisi(item.kondisi_sesudah) ?? "-"}</td>
                                                    <td className="px-6 py-4 font-semibold text-red-600">
                                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(item.total_denda))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-red-100">
                                                <td colSpan={4} className="px-6 py-3 font-bold text-red-800">Total Denda</td>
                                                <td className="px-6 py-3 font-bold text-red-800">
                                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalDenda)}
                                                </td>
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
                                    <p className="text-sm text-green-700 font-medium">Tidak ada denda — alat dikembalikan dalam kondisi baik dan tepat waktu</p>
                                </div>
                            );
                        })()
                    )}

                    {/* BUTTON AJUKAN PENGEMBALIAN */}
                    {data.status === "dipinjam" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-semibold text-amber-900">Sudah selesai menggunakan alat?</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Ajukan pengembalian agar petugas dapat memproses dan mengkonfirmasi alat yang dikembalikan.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setCheckKondisiBaik(false);
                                    setCheckAdaMasalah(false);
                                    setShowKonfirmasiModal(true);
                                }}
                                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition cursor-pointer"
                            >
                                <PackageCheck size={18} />
                                Ajukan Pengembalian
                            </button>
                        </div>
                    )}

                    {/* INFO PENGEMBALIAN SUDAH DIAJUKAN */}
                    {data.status === "pengembalian_diajukan" && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                            <p className="font-semibold text-purple-900">Pengembalian Sedang Diproses</p>
                            <p className="text-sm text-purple-700 mt-1">
                                Pengembalian alat sedang menunggu konfirmasi dari petugas. Harap serahkan alat ke petugas terkait.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail Unit */}
            {selectedUnit && (
                <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Detail Alat</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="md:col-span-2">
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
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Kode Unit" value={selectedUnit.kode_unit} mono />
                                    <InfoItem label="Nama Alat" value={selectedUnit.alat.nama_alat} />
                                    <InfoItem label="Kategori" value={selectedUnit.alat.kategori?.nama_kategori ?? "-"} />
                                    <InfoItem label="Lokasi" value={selectedUnit.lokasi} />
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Kondisi</p>
                                        <Badge>{selectedUnit.kondisi}</Badge>
                                    </div>
                                </div>
                                {selectedUnit.alat.deskripsi && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Deskripsi</p>
                                        <p className="text-sm text-gray-600 leading-relaxed italic">"{selectedUnit.alat.deskripsi}"</p>
                                    </div>
                                )}
                                {Array.isArray(selectedUnit.alat.spesifikasi) && selectedUnit.alat.spesifikasi.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-xs font-medium text-gray-500 mb-2">Spesifikasi</p>
                                        <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-lg">
                                            {selectedUnit.alat.spesifikasi.map((spec, index) => (
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
            )}

            {/* Modal Konfirmasi Pengembalian */}
            <Dialog open={showKonfirmasiModal} onOpenChange={(open) => {
                setShowKonfirmasiModal(open);
                if (!open) {
                    setCheckKondisiBaik(false);
                    setCheckAdaMasalah(false);
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Ajukan Pengembalian</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-gray-600">
                            Sebelum mengajukan pengembalian, pastikan hal berikut sudah terpenuhi:
                        </p>

                        <ul className="text-sm text-gray-700 space-y-2 bg-gray-50 rounded-lg p-4">
                            {data.detail_peminjaman.map((item) => (
                                <li key={item.id} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                    {item.alat_unit.alat.nama_alat} — {item.alat_unit.kode_unit}
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-2">
                            <label className="flex items-start gap-3 cursor-pointer bg-green-50 border border-green-200 rounded-lg p-3">
                                <input
                                    type="checkbox"
                                    checked={checkKondisiBaik}
                                    onChange={(e) => {
                                        setCheckKondisiBaik(e.target.checked);
                                        if (e.target.checked) setCheckAdaMasalah(false);
                                    }}
                                    className="mt-0.5 h-4 w-4 accent-green-600 cursor-pointer"
                                />
                                <span className="text-sm text-green-800">
                                    Semua alat dalam kondisi baik dan siap dikembalikan sesuai dengan yang dipinjam
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer bg-red-50 border border-red-200 rounded-lg p-3">
                                <input
                                    type="checkbox"
                                    checked={checkAdaMasalah}
                                    onChange={(e) => {
                                        setCheckAdaMasalah(e.target.checked);
                                        if (e.target.checked) setCheckKondisiBaik(false);
                                    }}
                                    className="mt-0.5 h-4 w-4 accent-red-600 cursor-pointer"
                                />
                                <span className="text-sm text-red-800">
                                    Ada alat yang rusak atau hilang — saya siap menanggung denda sesuai ketentuan yang berlaku
                                </span>
                            </label>

                            {checkAdaMasalah && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 space-y-1">
                                    <p className="font-semibold">Ketentuan denda:</p>
                                    <p>• Rusak ringan: 25% dari harga alat</p>
                                    <p>• Rusak berat: 60% dari harga alat</p>
                                    <p>• Hilang: 100% dari harga alat</p>
                                    <p>• Terlambat: 1% per hari dari harga alat</p>
                                    <p className="mt-1 text-red-600 font-medium">Petugas akan menentukan kondisi akhir saat konfirmasi pengembalian.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleAjukanPengembalian}
                                disabled={!checkKonfirmasi || submitting}
                                className="flex-1 py-2.5 cursor-pointer rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Mengajukan..." : "Ajukan Pengembalian"}
                            </button>
                            <button
                                onClick={() => setShowKonfirmasiModal(false)}
                                disabled={submitting}
                                className="flex-1 py-2.5 cursor-pointer rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
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
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ring-1 ${map[status] ?? "bg-gray-100 text-gray-700 ring-gray-200"}`}>
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
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0" />
                <div
                    className="absolute top-4 left-0 h-1 bg-green-500 z-0 transition-all duration-300"
                    style={{ width: `${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                />
                {TIMELINE_STEPS.map((step, index) => {
                    const isDone = index < currentIndex || (currentIndex === TIMELINE_STEPS.length - 1 && index === currentIndex);
                    const isActive = index === currentIndex && !isRejected && index !== TIMELINE_STEPS.length - 1;
                    return (
                        <div key={step.key} className="flex-1 flex flex-col items-center z-10 relative group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-md font-bold shadow-md
                                ${isRejected && index <= currentIndex ? "bg-red-500 text-white"
                                    : isDone ? "bg-green-500 text-white"
                                        : isActive ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-500"
                                } transition-colors duration-300`}
                            >
                                {isDone ? "✓" : index + 1}
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

const InfoItem = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div>
        <p className="text-md font-medium text-gray-500 mb-1">{label}</p>
        <p className={`text-md text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
);

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

function BorrowingDetailSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            <section className="pt-36 pb-10 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Detail Peminjaman</h1>
                            <p className="mt-3 text-lg text-gray-600">Informasi lengkap tentang peminjaman alat anda</p>
                        </div>
                        <Skeleton className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold h-10 w-40" />
                    </div>
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
            <div className="p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                        ))}
                    </div>
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