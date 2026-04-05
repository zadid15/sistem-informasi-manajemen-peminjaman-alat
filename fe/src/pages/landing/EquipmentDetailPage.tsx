import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, HardDrive, Info, ShoppingCart, Tag, XCircle } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { showAlat } from "../../services/alatService";
import type { Alat } from "../../types/alat";
import { toast } from "sonner";
import { addToCart } from "../../services/cartService";

type AlatUnit = {
  id: number;
  kode_unit: string;
  kondisi: string;
  lokasi: string;
  status: string;
};

export function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [alat, setAlat] = useState<Alat | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "warning">("success");
  const [dialogMessage, setDialogMessage] = useState("");

  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<AlatUnit[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [pinjamModalOpen, setPinjamModalOpen] = useState(false);
  const [selectedPinjamUnitId, setSelectedPinjamUnitId] = useState<number | null>(null);
  const [pinjamUnits, setPinjamUnits] = useState<AlatUnit[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAlat = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await showAlat(Number(id));
        setAlat(res.alat);
      } catch (err) {
        console.error(err);
        setAlat(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAlat();
  }, [id]);

  useEffect(() => {
    if (dialogOpen) {
      const timer = setTimeout(() => setDialogOpen(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [dialogOpen]);

  const handleAddToCart = async (alatId: number) => {
    if (!isLoggedIn) {
      setDialogType("warning");
      setDialogMessage("Silahkan login terlebih dahulu!");
      setDialogOpen(true);
      return;
    }

    try {
      const res = await addToCart(alatId);

      if (res.action === "select_unit") {
        setAvailableUnits(res.units);
        setSelectedUnitIds([]);
        setUnitModalOpen(true);
        return;
      }

      setDialogType("success");
      setDialogMessage("Alat berhasil ditambahkan ke keranjang!");
      setDialogOpen(true);
    } catch (error) {
      setDialogType("warning");
      setDialogMessage(typeof error === "string" ? error : "Terjadi kesalahan!");
      setDialogOpen(true);
    }
  };

  const toggleUnitSelection = (unitId: number) => {
    setSelectedUnitIds(prev =>
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  const handleSubmitUnits = async () => {
    if (!alat || selectedUnitIds.length === 0) return;

    setSubmitting(true);
    let successCount = 0;
    const errors: string[] = [];

    for (const unitId of selectedUnitIds) {
      try {
        await addToCart(alat.id, unitId);
        successCount++;
      } catch (error) {
        errors.push(typeof error === "string" ? error : "Gagal");
      }
    }

    setSubmitting(false);
    setUnitModalOpen(false);
    setSelectedUnitIds([]);

    if (successCount > 0) {
      setDialogType("success");
      setDialogMessage(`${successCount} unit berhasil ditambahkan ke keranjang!`);
    } else {
      setDialogType("warning");
      setDialogMessage(errors[0] || "Gagal menambahkan unit ke keranjang");
    }
    setDialogOpen(true);
  };

  const handleAjukanPeminjaman = async () => {
    if (!isLoggedIn) {
      toast.error("Silahkan login terlebih dahulu!");
      navigate("/login");
      return;
    }

    if (!alat) return;

    try {
      const res = await addToCart(alat.id);

      if (res.action === "select_unit") {
        setPinjamUnits(res.units);
        setSelectedPinjamUnitId(null);
        setPinjamModalOpen(true);
      } else {
        // Hanya 1 unit tersedia, langsung ke form
        navigate(`/form-peminjaman/${alat.id}/${res.unit_id}`, {
          state: { batas_peminjaman: alat.batas_peminjaman ?? 7 }
        });
      }
    } catch (error) {
      setDialogType("warning");
      setDialogMessage(typeof error === "string" ? error : "Gagal memuat unit alat");
      setDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse w-full max-w-7xl px-6 lg:px-8 space-y-6">
          <div className="h-12 bg-gray-200 rounded-xl w-1/3" />
          <div className="h-6 bg-gray-200 rounded-xl w-2/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
            <div className="aspect-square bg-gray-200 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded-xl w-1/2" />
              <div className="h-6 bg-gray-200 rounded-xl w-full" />
              <div className="h-80 bg-gray-200 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!alat) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Alat Tidak Ditemukan</h1>
          <Link to="/list-peralatan" className="text-lime-500 hover:text-lime-600 font-semibold">
            ← Kembali ke List Peralatan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="pt-52 pb-12 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Detail Peralatan</h1>
          <p className="text-lg text-gray-600">
            Lihat informasi lengkap tentang alat ini, termasuk spesifikasi, ketersediaan, dan cara peminjamannya.
          </p>
        </div>
      </section>

      <div className="pb-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/list-peralatan" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke List Peralatan
          </Link>
        </div>
      </div>

      <section className="pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <div className="space-y-6">
                <div className="aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50">
                  <ImageWithFallback
                    src={alat.foto_alat instanceof File ? URL.createObjectURL(alat.foto_alat) : alat.foto_alat ?? undefined}
                    alt={alat.nama_alat}
                    className="w-full h-full object-cover transform transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={12} /> {alat.kategori.nama_kategori}
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">{alat.nama_alat}</h1>

                {/* Tambahkan ini */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${(alat.unit_tersedia ?? 0) > 0
                      ? "bg-lime-50 text-lime-700"
                      : "bg-red-50 text-red-600"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${(alat.unit_tersedia ?? 0) > 0 ? "bg-lime-500" : "bg-red-500"}`} />
                    {(alat.unit_tersedia ?? 0) > 0 ? `${alat.unit_tersedia} unit tersedia` : "Tidak tersedia"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Info size={20} className="text-gray-400" /> Deskripsi
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-gray-100 pl-4">
                  {alat.deskripsi || "Tidak ada deskripsi untuk alat ini."}
                </p>
              </div>

              {Array.isArray(alat.spesifikasi) && alat.spesifikasi.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <HardDrive size={20} className="text-gray-400" /> Spesifikasi
                  </h3>
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        {alat.spesifikasi.map((spec, index) => (
                          <tr key={index} className="group hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6 text-sm font-medium text-gray-400 w-1/3 border-b border-gray-50 uppercase tracking-wider">
                              {spec.name}
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-gray-800 border-b border-gray-50">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-6 space-y-3">
                <div className="p-1 bg-gray-50 rounded-[2rem] flex flex-col gap-3">
                  <div className="p-1 bg-gray-50 rounded-[2rem] flex flex-row gap-3">
                    <button
                      onClick={() => handleAddToCart(alat.id)}
                      className="w-full py-5 bg-lime-800 hover:bg-lime-700 text-white font-bold rounded-[1.8rem] transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3 cursor-pointer"
                    >
                      Masukkan ke Keranjang
                      <ShoppingCart size={20} />
                    </button>
                    <button
                      onClick={handleAjukanPeminjaman}
                      className="w-full py-5 bg-gray-900 hover:bg-black text-white font-bold rounded-[1.8rem] transition-all transform hover:-translate-y-1 shadow-xl shadow-gray-200 flex items-center justify-center gap-3 cursor-pointer"
                    >
                      Ajukan Peminjaman
                      <FileText size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                  Pastikan Anda telah membaca syarat & ketentuan peminjaman alat laboratorium.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dialog success/warning */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
          <div className="bg-black/80 rounded-xl shadow-2xl p-6 max-w-md w-full text-center pointer-events-auto animate-fadeIn scale-95">
            <div className="flex flex-col items-center gap-3">
              {dialogType === "success" ? (
                <CheckCircle2 className="text-green-500 w-18 h-18" />
              ) : (
                <XCircle className="text-yellow-500 w-18 h-18" />
              )}
              <p className="mt-2 text-white text-xl">{dialogMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pilih Unit untuk Cart */}
      {unitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Pilih Unit</h2>
            <p className="text-sm text-gray-500 mb-4">
              Pilih satu atau lebih unit yang ingin ditambahkan ke keranjang.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {availableUnits.map((unit) => {
                const isChecked = selectedUnitIds.includes(unit.id);
                return (
                  <button
                    key={unit.id}
                    onClick={() => toggleUnitSelection(unit.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${isChecked
                      ? "border-lime-500 bg-lime-50"
                      : "border-gray-200 hover:border-lime-300 hover:bg-lime-50/50"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => { }}
                      className="h-4 w-4 accent-lime-600 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{unit.kode_unit}</p>
                      <p className="text-xs text-gray-500">{unit.lokasi}</p>
                    </div>
                    {/* <Badge className={kondisiColors[unit.kondisi]}>
                      {unit.kondisi}
                    </Badge> */}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleSubmitUnits}
                disabled={selectedUnitIds.length === 0 || submitting}
                className="w-full py-3 rounded-xl bg-lime-800 hover:bg-lime-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? "Menambahkan..." : `Masukkan ke Keranjang (${selectedUnitIds.length})`}
              </button>
              <button
                onClick={() => { setUnitModalOpen(false); setSelectedUnitIds([]); }}
                disabled={submitting}
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pilih Unit untuk Pinjam */}
      {pinjamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Pilih Unit untuk Dipinjam</h2>
            <p className="text-sm text-gray-500 mb-4">
              Pilih satu unit yang ingin kamu pinjam.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {pinjamUnits.map((unit) => {
                const isSelected = selectedPinjamUnitId === unit.id;
                return (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedPinjamUnitId(unit.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${isSelected
                      ? "border-lime-500 bg-lime-50"
                      : "border-gray-200 hover:border-lime-300 hover:bg-lime-50/50"
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-lime-600" : "border-gray-300"}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-lime-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{unit.kode_unit}</p>
                      <p className="text-xs text-gray-500">{unit.lokasi}</p>
                    </div>
                    {/* <Badge className={kondisiColors[unit.kondisi]}>
                      {unit.kondisi}
                    </Badge> */}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (!selectedPinjamUnitId || !alat) return;
                  navigate(`/form-peminjaman/${alat.id}/${selectedPinjamUnitId}`, {
                    state: { batas_peminjaman: alat.batas_peminjaman ?? 7 }
                  });
                }}
                disabled={!selectedPinjamUnitId}
                className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Lanjut ke Form Peminjaman
              </button>
              <button
                onClick={() => { setPinjamModalOpen(false); setSelectedPinjamUnitId(null); }}
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}