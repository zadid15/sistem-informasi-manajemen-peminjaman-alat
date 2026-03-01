import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import { ajukanPeminjaman } from "../../services/peminjamanService";

export function BorrowRequestPage() {
    const { unitId } = useParams<{ id: string; unitId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const batasPeminjaman: number = location.state?.batas_peminjaman ?? 7;

    const [loading, setLoading] = useState(false);
    const [checkSetuju, setCheckSetuju] = useState(false);
    const [showKetentuanModal, setShowKetentuanModal] = useState(false);

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

    useEffect(() => { window.scrollTo(0, 0); }, []);

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
                catatan: form.catatan,
                alat: [{ id_alat_unit: Number(unitId) }],
            };

            const res = await ajukanPeminjaman(payload);
            toast.success("Peminjaman berhasil diajukan");
            navigate(`/detail-peminjaman/${res.data.id}`);
        } catch {
            toast.error("Gagal mengajukan peminjaman");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <section className="pt-36 pb-12 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Ajukan Peminjaman</h1>
                    <p className="text-lg text-gray-600">Silahkan isi form dibawah ini untuk mengajukan peminjaman</p>
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

            <section className="px-6 pb-20">
                <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8">
                    {/* Tanggal Pinjam */}
                    <div>
                        <label className="block font-bold text-gray-900 mb-2">Tanggal Pinjam</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={form.tanggal_pinjam}
                                min={today}
                                max={maxTanggalPinjam}
                                onChange={(e) => setForm({
                                    ...form,
                                    tanggal_pinjam: e.target.value,
                                    rencana_pengembalian: ""
                                })}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5 ml-1">
                            Hanya tersedia untuk hari ini hingga 3 hari ke depan
                        </p>
                    </div>

                    {/* Rencana Pengembalian */}
                    <div>
                        <label className="block font-bold text-gray-900 mb-2">Rencana Pengembalian</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={form.rencana_pengembalian}
                                min={form.tanggal_pinjam || today}
                                max={maxRencanaPengembalian}
                                disabled={!form.tanggal_pinjam}
                                onChange={(e) => setForm({ ...form, rencana_pengembalian: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        {form.tanggal_pinjam && (
                            <p className="text-xs text-gray-400 mt-1.5 ml-1">
                                Maksimal peminjaman <span className="font-semibold">{batasPeminjaman} hari</span>
                            </p>
                        )}
                    </div>

                    {/* Catatan */}
                    <div>
                        <label className="block font-bold text-gray-900 mb-2">Catatan (Opsional)</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 text-gray-400" />
                            <textarea
                                rows={4}
                                value={form.catatan}
                                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                                placeholder="Contoh: Digunakan untuk kegiatan lapangan"
                            />
                        </div>
                    </div>

                    {/* Ketentuan Denda */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
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

                    <button
                        disabled={loading || !checkSetuju}
                        className="w-full py-5 bg-gray-900 hover:bg-black text-white font-bold rounded-[1.8rem] transition-all transform hover:-translate-y-1 shadow-xl shadow-gray-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {loading ? "Mengirim..." : "Ajukan Peminjaman"}
                        <Send size={20} />
                    </button>
                </form>
            </section>

            {/* Modal Ketentuan Denda */}
            {showKetentuanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Ketentuan Denda Peminjaman</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Harap baca dan pahami ketentuan berikut sebelum mengajukan peminjaman.
                            </p>
                        </div>

                        <div className="space-y-3">
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

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-sm font-semibold text-yellow-800 mb-2">🔧 Kerusakan Ringan</p>
                                <p className="text-sm text-yellow-700">
                                    Denda sebesar <span className="font-bold">25% dari harga alat</span> apabila alat
                                    dikembalikan dalam kondisi rusak ringan.
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    Contoh: Alat seharga Rp 500.000 rusak ringan → denda Rp 125.000
                                </p>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm font-semibold text-red-800 mb-2">💥 Kerusakan Berat</p>
                                <p className="text-sm text-red-700">
                                    Denda sebesar <span className="font-bold">60% dari harga alat</span> apabila alat
                                    dikembalikan dalam kondisi rusak berat.
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                    Contoh: Alat seharga Rp 500.000 rusak berat → denda Rp 300.000
                                </p>
                            </div>

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
                            className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold transition cursor-pointer"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}