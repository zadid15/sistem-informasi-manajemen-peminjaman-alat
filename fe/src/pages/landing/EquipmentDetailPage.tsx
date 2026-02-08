import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, FileText, HardDrive, Info, MapPin, Tag, XCircle } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { showAlat } from "../../services/alatService";
import type { Alat } from "../../types/alat";
import { toast } from "sonner";

export function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [alat, setAlat] = useState<Alat | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

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

  const handleAjukanPeminjaman = () => {
    if (!isLoggedIn) {

      toast.error("Silahkan login terlebih dahulu!");

      navigate("/login");
      return;
    }

    // Jika sudah login, lanjut ke proses peminjaman
    // Bisa buka modal atau redirect ke halaman form peminjaman
    navigate(`/form-peminjaman/${id}`);
  };

  if (loading) {
    // Skeleton Loading
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Alat Tidak Ditemukan
          </h1>
          <Link
            to="/list-peralatan"
            className="text-lime-500 hover:text-lime-600 font-semibold"
          >
            ← Kembali ke List Peralatan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="pt-36 pb-12 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Detail Peralatan
          </h1>
          <p className="text-lg text-gray-600">
            Lihat informasi lengkap tentang alat ini, termasuk spesifikasi, ketersediaan, dan cara peminjamannya.
          </p>
        </div>
      </section>

      {/* Back Button */}
      <div className="pb-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/list-peralatan"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Kembali ke List Peralatan
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* KIRI: Visual Section (Sticky) */}
            <div className="lg:col-span-5">
              <div className="sticky top-32 space-y-6">
                <div className="aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50">
                  <ImageWithFallback
                    src={alat.foto_alat instanceof File ? URL.createObjectURL(alat.foto_alat) : alat.foto_alat ?? undefined}
                    alt={alat.nama_alat}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Info Ringkas Badge */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Kode Alat</p>
                    <p className="font-mono font-bold text-gray-700">{alat.kode_alat}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Kondisi</p>
                    <p className="font-bold text-gray-700 capitalize">{alat.kondisi}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* KANAN: Detail Section */}
            <div className="lg:col-span-7 space-y-10">

              {/* Header Informasi */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={12} /> {alat.kategori.nama_kategori}
                  </span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${alat.status === "tersedia" ? "bg-lime-100 text-lime-700" : "bg-red-50 text-red-600"
                    }`}>
                    {alat.status === "tersedia" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {alat.status === "tersedia" ? "Tersedia" : "Dipinjam"}
                  </div>
                </div>

                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                  {alat.nama_alat}
                </h1>

                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={18} className="text-lime-500" />
                  <span className="font-medium">{alat.lokasi || "Lokasi tidak ditentukan"}</span>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Info size={20} className="text-gray-400" /> Deskripsi
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-gray-100 pl-4">
                  {alat.deskripsi || "Tidak ada deskripsi untuk alat ini."}
                </p>
              </div>

              {/* Spesifikasi Teknis - Layout Modern */}
              {Array.isArray(alat.spesifikasi) && alat.spesifikasi.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <HardDrive size={20} className="text-gray-400" /> Spesifikasi Teknis
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

              {/* CTA Action Section */}
              <div className="pt-6">
                <div className="p-1 bg-gray-50 rounded-[2rem]">
                  {alat.status === "tersedia" ? (
                    <button
                      onClick={handleAjukanPeminjaman}
                      className="w-full py-5 bg-gray-900 hover:bg-black text-white font-bold rounded-[1.8rem] transition-all transform hover:-translate-y-1 shadow-xl shadow-gray-200 flex items-center justify-center gap-3 cursor-pointer"
                    >
                      Ajukan Peminjaman
                      <FileText size={20} />  {/* icon ditaruh di sini */}
                    </button>
                  ) : (
                    <div className="w-full py-5 bg-white border-2 border-dashed border-gray-200 text-gray-400 font-bold rounded-[1.8rem] flex items-center justify-center gap-2">
                      <Clock size={20} /> Sedang Digunakan
                    </div>
                  )}
                </div>
                <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                  Pastikan Anda telah membaca syarat & ketentuan peminjaman alat laboratorium.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
