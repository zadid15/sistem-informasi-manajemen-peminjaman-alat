import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import { ajukanPeminjaman } from "../../services/peminjamanService";

export function BorrowRequestPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        tanggal_pinjam: "",
        rencana_pengembalian: "",
        catatan: "",
    });

    /* ===================== SCROLL RESET ===================== */
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                alat: [
                    {
                        id_alat: Number(id),
                    },
                ],
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
            {/* Header */}
            <section className="pt-36 pb-12 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Ajukan Peminjaman
                    </h1>
                    <p className="text-lg text-gray-600">
                        Silahkan isi form dibawah ini untuk mengajukan peminjaman
                    </p>
                </div>
            </section>

            {/* Back Button */}
            <div className="pb-8 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium group cursor-pointer"
                    >
                        <ArrowLeft
                            size={20}
                            className="group-hover:-translate-x-1 transition-transform"
                        />
                        Kembali Ke Detail Alat
                    </button>
                </div>
            </div>

            {/* Form */}
            <section className="px-6">
                <form
                    onSubmit={handleSubmit}
                    className="max-w-7xl mx-auto space-y-8"
                >
                    {/* Tanggal Pinjam */}
                    <div>
                        <label className="block font-bold text-gray-900 mb-2">
                            Tanggal Pinjam
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={form.tanggal_pinjam}
                                onChange={(e) =>
                                    setForm({ ...form, tanggal_pinjam: e.target.value })
                                }
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                        </div>
                    </div>

                    {/* Rencana Pengembalian */}
                    <div>
                        <label className="block font-bold text-gray-900 mb-2">
                            Rencana Pengembalian
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={form.rencana_pengembalian}
                                min={form.tanggal_pinjam}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        rencana_pengembalian: e.target.value,
                                    })
                                }
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                        </div>
                    </div>

                    {/* Catatan */}
                    <div>
                        <label className="block font-bold text-gray-900 mb-2">
                            Catatan (Opsional)
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 text-gray-400" />
                            <textarea
                                rows={4}
                                value={form.catatan}
                                onChange={(e) =>
                                    setForm({ ...form, catatan: e.target.value })
                                }
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                                placeholder="Contoh: Digunakan untuk kegiatan lapangan"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        disabled={loading}
                        className="w-full py-5 bg-gray-900 hover:bg-black text-white font-bold rounded-[1.8rem] transition-all transform hover:-translate-y-1 shadow-xl shadow-gray-200 flex items-center justify-center gap-3 cursor-pointer"
                    >
                        {loading ? "Mengirim..." : "Ajukan Peminjaman"}
                        <Send size={20} />
                    </button>
                </form>
            </section>
        </div>
    );
}