import { ArrowRight, CheckCircle2, Clock, FileText, Package, RotateCcw, Search, Shield, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { equipmentData } from "../../components/data/equipment";

import kamera from "../../assets/banners/kamera.jpg";
import bor from "../../assets/banners/bor.jpg";
import printer from "../../assets/banners/printer.jpg";

import ramadhan from "../../assets/banners/ramadhan.png";
import temukan from "../../assets/banners/temukan.png";
import weAreOpen from "../../assets/banners/weareopen.png";

const banners = [
    {
        id: 1,
        title: "We Are Open",
        image: weAreOpen,
    },
    {
        id: 2,
        title: "Selamat Ramadhan",
        image: ramadhan,
    },
    {
        id: 3,
        title: "Temukan Peralatanmu",
        image: temukan,
    }
];

const bannerImages = [
    kamera,
    bor,
    printer,
];

export default function HomePage() {

    const [currentSlide, setCurrentSlide] = useState(0);
    const featuredEquipment = equipmentData.slice(0, 4);
    const [currentBanner, setCurrentBanner] = useState(0);

    // Auto slide
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((prev) =>
                prev === banners.length - 1 ? 0 : prev + 1
            );
        }, 5000); // ganti slide tiap 5 detik
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) =>
                prev === bannerImages.length - 1 ? 0 : prev + 1
            );
        }, 5000); // ganti slide tiap 5 detik

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative min-h-screen overflow-hidden flex items-center">
                {/* Background Banner Carousel */}
                <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden">
                    <div className="relative w-full h-full">
                        {bannerImages.map((img, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                                    }`}
                            >
                                <ImageWithFallback
                                    src={img}
                                    alt="Banner"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/50 to-white" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-7xl mx-30 relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-50 border border-lime-200 rounded-full mb-8">
                            <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-gray-700">
                                Ketersediaan alat diperbarui secara real-time
                            </span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Pinjam Alat Lebih Mudah
                            Bersama SIMPA.
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            SIMPA membantu proses peminjaman alat jadi lebih cepat dan tertata.
                            Cek ketersediaan, ajukan peminjaman, dan pantau status secara real-time.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/list-peralatan"
                                className="group px-8 py-4 bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold rounded-xl transition-all hover:shadow-xl hover:shadow-lime-500/30 hover:-translate-y-1 flex items-center gap-2"
                            >
                                Lihat Daftar Alat
                                <ArrowRight
                                    size={20}
                                    className="group-hover:translate-x-1 transition-transform"
                                />
                            </Link>

                            <Link
                                to="/cara-peminjaman"
                                className="px-8 py-4 border-2 border-lime-400 text-gray-900 font-semibold rounded-xl hover:bg-lime-50 transition-all"
                            >
                                Cara Peminjaman
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-8 right-8 flex gap-2 z-10">
                    {bannerImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                                ? "bg-lime-400 w-8"
                                : "bg-gray-300 hover:bg-gray-400"
                                }`}
                            aria-label={`Ke slide ${index + 1}`}
                        />
                    ))}
                </div>
            </section>

            <section className="relative max-w-7xl mx-auto px-6 lg:px-8 mt-12 py-12 h-70 overflow-hidden rounded-2xl">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
                            }`}
                    >
                        <ImageWithFallback
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}

                {/* Dots / Slide Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentBanner(idx)}
                            className={`
                            h-2 transition-all duration-300
                            ${currentBanner === idx
                                    ? "w-8 bg-white rounded-full"  // aktif jadi oval
                                    : "w-3 bg-white/50 rounded-full hover:bg-white" // default bulat
                                }
                            `}
                            aria-label={`Ke slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* Trust & Value Section */}
            <section className="py-20 px-6 lg:px-8 bg-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Mengapa Memilih Kami
                        </h2>
                        <p className="text-lg text-gray-600">
                            Semua yang Anda butuhkan untuk peminjaman peralatan secara profesional
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Clock,
                                title: "Ketersediaan Real-Time",
                                description:
                                    "Lihat ketersediaan peralatan secara langsung tanpa menunggu dan tanpa tebakan.",
                            },
                            {
                                icon: Shield,
                                title: "Sistem Terorganisir",
                                description:
                                    "Proses peminjaman terstruktur dengan tahapan verifikasi yang jelas.",
                            },
                            {
                                icon: UserCheck,
                                title: "Verifikasi Aman",
                                description:
                                    "Setiap pengajuan disetujui admin untuk menjaga keamanan dan tanggung jawab.",
                            },
                            {
                                icon: FileText,
                                title: "Riwayat Transparan",
                                description:
                                    "Pantau seluruh riwayat peminjaman, baik yang sedang berlangsung maupun sebelumnya.",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="
    group bg-white rounded-2xl p-8
    border border-gray-100
    shadow-sm
    transition-all duration-300 ease-out
    hover:shadow-2xl
    hover:-translate-y-2
    hover:-rotate-3
  "
                            >
                                {/* Icon Wrapper */}
                                <div
                                    className="
      w-14 h-14 bg-lime-50 rounded-xl
      flex items-center justify-center mb-6
      transition-all duration-300 ease-out
      group-hover:bg-lime-100
      group-hover:-rotate-6
      group-hover:-translate-y-3
    "
                                >
                                    <item.icon
                                        className="
        w-7 h-7 text-lime-500
        transition-all duration-300 ease-out
        group-hover:rotate-12
        group-hover:scale-110
      "
                                    />
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Equipment */}
            <section className="py-20 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Peralatan Unggulan
                            </h2>
                            <p className="text-lg text-gray-600">
                                Peralatan populer yang siap untuk dipinjam
                            </p>
                        </div>
                        <Link
                            to="/list-peralatan"
                            className="hidden md:flex items-center gap-2 text-lime-500 hover:text-lime-600 font-semibold group"
                        >
                            Lihat Semua
                            <ArrowRight
                                size={20}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredEquipment.map((item) => (
                            <Link
                                key={item.id}
                                to={`/detail-alat/${item.id}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                            >
                                <div className="aspect-square bg-gray-100 overflow-hidden">
                                    <ImageWithFallback
                                        src={`https://source.unsplash.com/featured/?${item.image}`}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {item.category}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "tersedia"
                                                ? "bg-lime-100 text-lime-700"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {item.status === "tersedia" ? "Tersedia" : "Dipinjam"}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-lime-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link
                            to="/equipment"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold rounded-xl transition-all"
                        >
                            Lihat Semua Peralatan
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6 lg:px-8 bg-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Cara Kerja
                        </h2>
                        <p className="text-lg text-gray-600">
                            Proses sederhana, hasil profesional
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Progress Line */}
                        <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-lime-900 via-lime-400 to-lime-600 opacity-30" />

                        {[
                            {
                                number: "01",
                                icon: Search,
                                title: "Jelajahi Peralatan",
                                description:
                                    "Telusuri katalog dan temukan peralatan yang Anda butuhkan",
                            },
                            {
                                number: "02",
                                icon: Package,
                                title: "Ajukan Peminjaman",
                                description:
                                    "Kirim permohonan peminjaman beserta detail penggunaan",
                            },
                            {
                                number: "03",
                                icon: CheckCircle2,
                                title: "Verifikasi Admin",
                                description:
                                    "Admin meninjau dan menyetujui permohonan Anda",
                            },
                            {
                                number: "04",
                                icon: RotateCcw,
                                title: "Ambil & Kembalikan",
                                description:
                                    "Ambil peralatan dan kembalikan sesuai jadwal",
                            },
                        ].map((step, index) => (
                            <div key={index} className="relative group">
                                <div
                                    className="
                                        bg-white rounded-2xl p-8
                                        border border-gray-100
                                        shadow-sm relative z-10
                                        transition-all duration-300 ease-out
                                        group-hover:shadow-2xl
                                        group-hover:-translate-y-2
                                        group-hover:rotate-3
                                        "
                                >
                                    {/* Icon */}
                                    <div
                                        className="
                                                    w-16 h-16 rounded-2xl mb-6
                                                    bg-gradient-to-br from-lime-400 to-lime-500
                                                    flex items-center justify-center
                                                    shadow-lg shadow-lime-500/20
                                                    transition-all duration-300 ease-out
                                                    group-hover:-rotate-6
                                                    group-hover:-translate-y-1
                                                "
                                    >
                                        <step.icon
                                            className="
                                                w-8 h-8 text-white
                                                transition-all duration-300 ease-out
                                                group-hover:rotate-6
                                                group-hover:scale-110
                                                "
                                        />
                                    </div>

                                    <div className="text-4xl font-bold text-lime-400/60 mb-2">
                                        {step.number}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            to="/cara-peminjaman"
                            className="inline-flex items-center gap-2 text-lime-500 hover:text-lime-600 font-semibold"
                        >
                            Pelajari lebih lanjut tentang proses peminjaman
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-lime-800" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        Siap meminjam peralatan dengan lebih mudah?
                    </h2>
                    <p className="text-xl text-white mb-10">
                        Bergabunglah dengan platform kami dan nikmati proses peminjaman peralatan tanpa ribet
                    </p>
                    <Link to="/login" className="inline-flex  gap-2 group items-center px-10 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all hover:shadow-xl hover:-translate-y-0.5 text-lg cursor-pointer">
                        Login untuk Memulai
                        <ArrowRight
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </Link>
                </div>
            </section>
        </div>
    )
}