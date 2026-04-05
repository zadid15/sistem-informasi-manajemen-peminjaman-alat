import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ajukanPeminjaman } from "../../services/peminjamanService";
// import { Badge } from "../../components/ui/badge";
// import { kondisiColors } from "../../types/coloringBadge";
import { ArrowLeft } from "lucide-react";
import { deleteCartItem } from "../../services/cartService";

type SelectedCartItem = {
    id: number;
    alat_unit: {
        id: number;
        kode_unit: string;
        kondisi: string;
        lokasi: string;
        alat: {
            id: number;
            nama_alat: string;
            foto_alat?: string | null;
            batas_peminjaman?: number | null;
        };
    };
};

type LocationState = {
    fromCart: boolean;
    selectedItems: SelectedCartItem[];
};

export default function SubmitLoanRequestPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as LocationState | null;

    const selectedItems = useMemo(() => {
        if (!Array.isArray(state?.selectedItems)) return [];
        return state.selectedItems;
    }, [state]);

    // Ambil batas peminjaman terkecil dari semua item
    const defaultBatasPeminjaman = 7; 
    
    const batasPeminjaman = useMemo(() => {
        if (selectedItems.length === 0) return defaultBatasPeminjaman;
        const batasList = selectedItems
            .map(item => item.alat_unit.alat.batas_peminjaman ?? defaultBatasPeminjaman)
            .filter(b => b > 0);
        return batasList.length > 0 ? Math.min(...batasList) : defaultBatasPeminjaman;
    }, [selectedItems]);

    useEffect(() => {
        if (!state?.fromCart || selectedItems.length === 0) {
            navigate("/keranjang");
        }
    }, [state, selectedItems, navigate]);

    const [loading, setLoading] = useState(false);
    const [showKetentuanModal, setShowKetentuanModal] = useState(false);
    const [checkSetuju, setCheckSetuju] = useState(false);

    const today = new Date().toISOString().split("T")[0];
    const maxTanggalPinjam = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString().split("T")[0];

    const [form, setForm] = useState({
        tanggal_pinjam: "",
        rencana_pengembalian: "",
        catatan: "",
    });

    const maxRencanaPengembalian = form.tanggal_pinjam
        ? new Date(new Date(form.tanggal_pinjam).getTime() + batasPeminjaman * 24 * 60 * 60 * 1000)
            .toISOString().split("T")[0]
        : undefined;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.tanggal_pinjam || !form.rencana_pengembalian) {
            toast.error("Tanggal pinjam dan pengembalian wajib diisi");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                tanggal_pinjam: form.tanggal_pinjam,
                rencana_pengembalian: form.rencana_pengembalian,
                catatan: form.catatan || null,
                alat: selectedItems.map(item => ({
                    id_alat_unit: item.alat_unit.id,
                })),
            };

            const res = await ajukanPeminjaman(payload);
            toast.success("Peminjaman berhasil diajukan");

            try {
                await Promise.all(selectedItems.map(item => deleteCartItem(item.id)));
            } catch {
                // silent fail
            }

            navigate(`/detail-peminjaman/${res.data.id}`);
        } catch {
            toast.error("Gagal mengajukan peminjaman");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4">
            <div className="mx-auto max-w-7xl pt-[200px]">
                {/* HEADER */}
                <section className="pb-12 px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Ajukan Peminjaman Cepat & Mudah
                        </h1>
                        <p className="text-lg text-gray-600">
                            Lengkapi tanggal pinjam, rencana pengembalian, dan catatan opsional untuk mempercepat proses.
                        </p>
                    </div>
                </section>

                <div className="pb-8 px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium group cursor-pointer"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Detail Alat
                        </button>
                    </div>
                </div>

                <section className="px-8 pb-20">
                    <form
                        onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8">
                        {/* LIST ALAT */}
                        <div>
                            <p className="text-md font-medium text-gray-700 mb-3">
                                Alat yang dipilih ({selectedItems.length} unit)
                            </p>
                            <div className="space-y-2">
                                {selectedItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-xl border px-4 py-3 bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {item.alat_unit.alat.nama_alat}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {item.alat_unit.kode_unit} · {item.alat_unit.lokasi}
                                            </p>
                                        </div>
                                        {/* <Badge className={kondisiColors[item.alat_unit.kondisi]}>
                                            {item.alat_unit.kondisi}
                                        </Badge> */}
                                    </div>
                                ))}
                            </div>

                            {/* Info batas peminjaman */}
                            {selectedItems.length > 1 && (
                                <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-700">
                                        Batas maksimal peminjaman untuk item yang dipilih:{" "}
                                        <span className="font-semibold">{batasPeminjaman} hari</span>
                                        <span className="ml-1">(mengikuti alat dengan batas terpendek)</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* FORM */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-md font-medium text-gray-700 mb-1">
                                    Tanggal Pinjam
                                </label>
                                <input
                                    type="date"
                                    value={form.tanggal_pinjam}
                                    min={today}
                                    max={maxTanggalPinjam}
                                    onChange={e => setForm({
                                        ...form,
                                        tanggal_pinjam: e.target.value,
                                        rencana_pengembalian: ""
                                    })}
                                    className="w-full rounded-xl border px-3 py-2 text-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Hanya tersedia untuk hari ini hingga 3 hari ke depan
                                </p>
                            </div>

                            <div>
                                <label className="block text-md font-medium text-gray-700 mb-1">
                                    Rencana Pengembalian
                                </label>
                                <input
                                    type="date"
                                    min={form.tanggal_pinjam || today}
                                    max={maxRencanaPengembalian}
                                    value={form.rencana_pengembalian}
                                    disabled={!form.tanggal_pinjam}
                                    onChange={e => setForm({ ...form, rencana_pengembalian: e.target.value })}
                                    className="w-full rounded-xl border px-3 py-2 text-md focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                {form.tanggal_pinjam && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Maksimal peminjaman <span className="font-semibold">{batasPeminjaman} hari</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-md font-medium text-gray-700 mb-1">
                                Catatan (opsional)
                            </label>
                            <textarea
                                rows={3}
                                value={form.catatan}
                                onChange={e => setForm({ ...form, catatan: e.target.value })}
                                placeholder="Contoh: untuk praktikum"
                                className="w-full rounded-xl border px-3 py-2 text-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                            />
                        </div>

                        {/* KETENTUAN DENDA */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checkSetuju}
                                    onChange={(e) => setCheckSetuju(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 accent-gray-900 cursor-pointer flex-shrink-0"
                                />
                                <span className="text-sm text-gray-700">
                                    Saya telah membaca dan menyetujui{" "}
                                    <button
                                        type="button"
                                        onClick={() => setShowKetentuanModal(true)}
                                        className="text-lime-700 font-semibold underline underline-offset-2 hover:text-lime-800 cursor-pointer"
                                    >
                                        ketentuan denda peminjaman
                                    </button>
                                    {" "}yang berlaku.
                                </span>
                            </label>
                        </div>

                        {/* ACTION */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={loading || !checkSetuju}
                                className="px-6 py-2 rounded-xl bg-gray-900 text-sm text-white hover:bg-gray-800 transition shadow disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? "Mengajukan..." : "Ajukan Peminjaman"}
                            </button>
                        </div>
                        {/* MODAL KETENTUAN DENDA */}
                        {showKetentuanModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
                                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-5">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Ketentuan Denda Peminjaman</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Harap baca dan pahami ketentuan berikut sebelum mengajukan peminjaman.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Keterlambatan */}
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                            <p className="text-sm font-semibold text-orange-800 mb-2">⏰ Keterlambatan Pengembalian</p>
                                            <p className="text-sm text-orange-700">
                                                Denda sebesar <span className="font-bold">1% dari harga alat per hari</span> keterlambatan,
                                                dihitung sejak melewati tanggal rencana pengembalian.
                                            </p>
                                            <p className="text-xs text-orange-600 mt-1">
                                                Contoh: Alat seharga Rp 500.000 terlambat 3 hari → denda Rp 15.000
                                            </p>
                                        </div>

                                        {/* Rusak Ringan */}
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                            <p className="text-sm font-semibold text-yellow-800 mb-2">🔧 Kerusakan Ringan</p>
                                            <p className="text-sm text-yellow-700">
                                                Denda sebesar <span className="font-bold">25% dari harga alat</span> apabila alat dikembalikan
                                                dalam kondisi rusak ringan.
                                            </p>
                                            <p className="text-xs text-yellow-600 mt-1">
                                                Contoh: Alat seharga Rp 500.000 rusak ringan → denda Rp 125.000
                                            </p>
                                        </div>

                                        {/* Rusak Berat */}
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                            <p className="text-sm font-semibold text-red-800 mb-2">💥 Kerusakan Berat</p>
                                            <p className="text-sm text-red-700">
                                                Denda sebesar <span className="font-bold">60% dari harga alat</span> apabila alat dikembalikan
                                                dalam kondisi rusak berat.
                                            </p>
                                            <p className="text-xs text-red-600 mt-1">
                                                Contoh: Alat seharga Rp 500.000 rusak berat → denda Rp 300.000
                                            </p>
                                        </div>

                                        {/* Hilang */}
                                        <div className="bg-gray-900 rounded-xl p-4">
                                            <p className="text-sm font-semibold text-white mb-2">🚫 Alat Hilang</p>
                                            <p className="text-sm text-gray-300">
                                                Denda sebesar <span className="font-bold text-white">100% dari harga alat</span> apabila
                                                alat hilang dan tidak dapat dikembalikan.
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Contoh: Alat seharga Rp 500.000 hilang → denda Rp 500.000
                                            </p>
                                        </div>

                                        {/* Kombinasi */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <p className="text-sm font-semibold text-blue-800 mb-2">📋 Denda Kombinasi</p>
                                            <p className="text-sm text-blue-700">
                                                Denda keterlambatan dan kerusakan <span className="font-bold">dijumlahkan</span> apabila
                                                keduanya terjadi bersamaan.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowKetentuanModal(false)}
                                        className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold transition cursor-pointer"
                                    >
                                        Mengerti
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </section>
            </div>
        </div>
    );
}