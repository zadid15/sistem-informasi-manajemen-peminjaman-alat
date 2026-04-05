import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "../../utils/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";

interface Props {
    open: boolean;
    onClose: () => void;
}

type DetailPeminjaman = {
    total_denda?: number | null;
    alat_unit?: {
        alat?: {
            nama_alat?: string;
        };
    };
};

type LaporanPeminjaman = {
    id: number;
    status: string;
    tanggal_pinjam: string;
    rencana_pengembalian: string;
    tanggal_kembali: string | null;
    user?: { nama: string; email: string };
    detail_peminjaman?: DetailPeminjaman[];
};

const STATUS_OPTIONS = [
    { value: "all", label: "Semua Status" },
    { value: "terkirim", label: "Terkirim" },
    { value: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
    { value: "dipinjam", label: "Dipinjam" },
    { value: "ditolak", label: "Ditolak" },
    { value: "pengembalian_diajukan", label: "Pengembalian Diajukan" },
    { value: "menunggu_pembayaran", label: "Menunggu Pembayaran" },
    { value: "dikembalikan", label: "Dikembalikan" },
    { value: "dikembalikan_terlambat", label: "Dikembalikan Terlambat" },
];

const STATUS_LABELS: Record<string, string> = {
    terkirim: "Terkirim",
    menunggu_konfirmasi: "Menunggu Konfirmasi",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
    dipinjam: "Dipinjam",
    pengembalian_diajukan: "Pengembalian Diajukan",
    menunggu_pembayaran: "Menunggu Pembayaran",
    dikembalikan: "Dikembalikan",
    dikembalikan_terlambat: "Dikembalikan Terlambat",
};

const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
    });
};

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function CetakLaporanModal({ open, onClose }: Props) {
    const [tanggalMulai, setTanggalMulai] = useState("");
    const [tanggalAkhir, setTanggalAkhir] = useState("");
    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(false);

    const handleCetak = async () => {
        if (!tanggalMulai || !tanggalAkhir) {
            toast.error("Tanggal mulai dan akhir wajib diisi");
            return;
        }
        if (new Date(tanggalMulai) > new Date(tanggalAkhir)) {
            toast.error("Tanggal mulai tidak boleh lebih dari tanggal akhir");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.get<{ data: LaporanPeminjaman[] }>("/peminjaman/laporan", {
                params: {
                    tanggal_mulai: tanggalMulai,
                    tanggal_akhir: tanggalAkhir,
                    status: status !== "all" ? status : undefined,
                },
            });

            const data: LaporanPeminjaman[] = res.data.data;

            if (!data || data.length === 0) {
                toast.error("Tidak ada data pada rentang tanggal yang dipilih");
                return;
            }

            generatePDF(data);
            toast.success("Laporan berhasil digenerate");
            onClose();
        } catch {
            toast.error("Gagal mengambil data laporan");
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = (data: LaporanPeminjaman[]) => {
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(63, 98, 18);
        doc.rect(0, 0, pageWidth, 28, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("SIMPA - Sistem Informasi Manajemen Peminjaman Alat", pageWidth / 2, 11, { align: "center" });

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("Laporan Data Peminjaman", pageWidth / 2, 19, { align: "center" });

        // Info filter
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const filterLabel = `Periode: ${formatDate(tanggalMulai)} s/d ${formatDate(tanggalAkhir)}   |   Status: ${status === "all" ? "Semua Status" : STATUS_LABELS[status] ?? status}   |   Total Data: ${data.length}`;
        doc.text(filterLabel, pageWidth / 2, 34, { align: "center" });

        // Hitung total denda
        const totalDenda = data.reduce((acc: number, item: LaporanPeminjaman) => {
            const denda = item.detail_peminjaman?.reduce((s: number, d: DetailPeminjaman) =>
                s + Number(d.total_denda ?? 0), 0) ?? 0;
            return acc + denda;
        }, 0);

        // Tabel rows
        const rows = data.map((item: LaporanPeminjaman, index: number) => {
            const alat = item.detail_peminjaman
                ?.map((d: DetailPeminjaman) => d.alat_unit?.alat?.nama_alat ?? "-")
                .join(", ") ?? "-";
            const denda = item.detail_peminjaman?.reduce((s: number, d: DetailPeminjaman) =>
                s + Number(d.total_denda ?? 0), 0) ?? 0;

            return [
                index + 1,
                item.id,
                item.user?.nama ?? "-",
                item.user?.email ?? "-",
                alat,
                formatDate(item.tanggal_pinjam),
                formatDate(item.rencana_pengembalian),
                formatDate(item.tanggal_kembali),
                STATUS_LABELS[item.status] ?? item.status,
                denda > 0 ? formatRupiah(denda) : "-",
            ];
        });

        autoTable(doc, {
            startY: 38,
            tableWidth: "auto",        // ← tambah ini
            margin: { left: 10, right: 10 },  // ← tambah ini
            head: [[
                "No", "ID", "Peminjam", "Email", "Alat Dipinjam",
                "Tgl Pinjam", "Rencana Kembali", "Tgl Kembali", "Status", "Denda"
            ]],
            body: rows,
            styles: {
                fontSize: 8,
                cellPadding: 3,
                valign: "middle",
            },
            headStyles: {
                fillColor: [63, 98, 18],
                textColor: 255,
                fontStyle: "bold",
                halign: "center",
            },
            columnStyles: {
                0: { halign: "center" },
                1: { halign: "center" },
                2: {},
                3: {},
                4: {},
                5: { halign: "center" },
                6: { halign: "center" },
                7: { halign: "center" },
                8: { halign: "center" },
                9: { halign: "right" },
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            foot: [[
                {
                    content: `Total: ${data.length} peminjaman`,
                    colSpan: 9,
                    styles: { fontStyle: "bold", halign: "right" }
                },
                {
                    content: totalDenda > 0 ? formatRupiah(totalDenda) : "-",
                    styles: { fontStyle: "bold", halign: "right" }
                },
            ]],
            footStyles: {
                fillColor: [230, 240, 210],
                textColor: [50, 80, 10],
            },
        });

        // Footer tiap halaman  ✅ Ganti (doc as any) dengan cara yang proper
        const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Dicetak pada: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}   |   Halaman ${i} dari ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 5,
                { align: "center" }
            );
        }

        doc.save(`Laporan-Peminjaman-${tanggalMulai}-sd-${tanggalAkhir}.pdf`);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-lime-700" />
                        Cetak Laporan Peminjaman
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1 block">Tanggal Mulai</Label>
                            <Input
                                type="date"
                                value={tanggalMulai}
                                onChange={(e) => setTanggalMulai(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1 block">Tanggal Akhir</Label>
                            <Input
                                type="date"
                                value={tanggalAkhir}
                                onChange={(e) => setTanggalAkhir(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="mb-1 block">Filter Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-700">Laporan akan berisi:</p>
                        <p>• ID & data peminjam</p>
                        <p>• Alat yang dipinjam</p>
                        <p>• Tanggal pinjam & pengembalian</p>
                        <p>• Status & total denda</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" className="cursor-pointer" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button className="cursor-pointer bg-lime-800 hover:bg-lime-700" onClick={handleCetak} disabled={loading}>
                        {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                        ) : (
                            <><FileText className="w-4 h-4 mr-2" /> Generate PDF</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}