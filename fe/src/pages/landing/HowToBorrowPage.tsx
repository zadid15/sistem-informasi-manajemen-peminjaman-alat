import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Search,
  FileText,
  UserCheck,
  Package,
  Calendar,
  RotateCcw,
  ChevronDown,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Jelajahi Katalog Peralatan",
    description:
      "Telusuri katalog peralatan yang tersedia. Gunakan filter untuk menemukan alat sesuai kategori, status ketersediaan, atau cari langsung berdasarkan nama.",
    tips: [
      "Cek ketersediaan peralatan secara real-time",
      "Baca spesifikasi alat sebelum mengajukan peminjaman",
      "Lihat gambar untuk memastikan sesuai kebutuhan",
    ],
  },
  {
    number: "02",
    icon: FileText,
    title: "Ajukan Permohonan Peminjaman",
    description:
      "Setelah menemukan peralatan yang dibutuhkan, ajukan permohonan peminjaman dengan mengisi detail penggunaan dan durasi peminjaman.",
    tips: [
      "Login ke akun untuk mengajukan peminjaman",
      "Tentukan tanggal peminjaman dengan jelas",
      "Jelaskan tujuan peminjaman secara singkat dan jelas",
    ],
  },
  {
    number: "03",
    icon: UserCheck,
    title: "Verifikasi oleh Admin",
    description:
      "Permohonan Anda akan ditinjau oleh admin. Admin akan memeriksa ketersediaan, menilai permohonan, lalu menyetujui atau memberikan catatan.",
    tips: [
      "Permohonan biasanya diproses dalam 1x24 jam",
      "Notifikasi status akan dikirim melalui email",
      "Pastikan data kontak Anda sudah benar",
    ],
  },
  {
    number: "04",
    icon: Package,
    title: "Pengambilan Peralatan",
    description:
      "Jika permohonan disetujui, Anda akan menerima instruksi pengambilan. Ambil peralatan sesuai jadwal dan periksa kondisinya sebelum digunakan.",
    tips: [
      "Bawa kartu identitas yang masih berlaku",
      "Periksa kondisi peralatan saat pengambilan",
      "Pastikan tanggal pengembalian sudah sesuai",
    ],
  },
  {
    number: "05",
    icon: RotateCcw,
    title: "Gunakan & Kembalikan",
    description:
      "Gunakan peralatan sesuai aturan yang berlaku. Kembalikan tepat waktu dan dalam kondisi yang sama seperti saat diterima.",
    tips: [
      "Gunakan peralatan dengan hati-hati",
      "Kembalikan tepat waktu untuk menghindari sanksi",
      "Segera laporkan jika terjadi kerusakan atau kendala",
    ],
  },
];

const faqs = [
  {
    question: "Berapa lama proses persetujuan peminjaman?",
    answer:
      "Sebagian besar permohonan akan ditinjau dan disetujui dalam waktu 1x24 jam pada hari kerja. Untuk permohonan mendesak, Anda dapat menghubungi admin secara langsung.",
  },
  {
    question: "Bagaimana jika peralatan yang saya butuhkan sedang dipinjam?",
    answer:
      "Anda tetap dapat mengajukan permohonan dan akan dimasukkan ke dalam daftar tunggu. Anda akan mendapat notifikasi saat peralatan tersedia. Sebagai alternatif, Anda juga bisa mencari peralatan serupa di katalog.",
  },
  {
    question: "Apakah saya bisa memperpanjang masa peminjaman?",
    answer:
      "Bisa. Anda dapat mengajukan perpanjangan melalui dashboard akun. Perpanjangan akan disesuaikan dengan ketersediaan peralatan dan persetujuan admin.",
  },
  {
    question: "Apa yang harus dilakukan jika peralatan rusak saat dipinjam?",
    answer:
      "Segera laporkan kerusakan kepada admin. Tergantung tingkat kerusakan, biaya perbaikan dapat dikenakan. Kami menyarankan untuk selalu memeriksa kondisi peralatan saat pengambilan dan pengembalian.",
  },
  {
    question: "Apakah ada batas jumlah peralatan yang bisa dipinjam?",
    answer:
      "Tidak ada batasan jumlah yang ketat. Namun, setiap permohonan akan dievaluasi berdasarkan riwayat peminjaman, ketepatan pengembalian, dan tujuan peminjaman.",
  },
  {
    question: "Apakah peralatan bisa dipinjam untuk keperluan pribadi?",
    answer:
      "Kebijakan peminjaman dapat berbeda di setiap instansi. Umumnya, peralatan dipinjamkan untuk keperluan akademik, penelitian, atau profesional. Silakan konfirmasi ke admin untuk ketentuan lebih lanjut.",
  },
];

export function HowToBorrowPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="pt-40 pb-16 px-6 lg:px-8 bg-gradient-to-b from-lime-50/30 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-100 border border-lime-200 rounded-full mb-6">
            <HelpCircle size={16} className="text-lime-600" />
            <span className="text-sm font-medium text-gray-700">
              Panduan Lengkap
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Cara Meminjam Peralatan
          </h1>
          <p className="text-xl text-gray-600">
            Ikuti 5 langkah mudah untuk meminjam peralatan secara profesional dan efisien
          </p>
        </div>
      </section>

      {/* Timeline Steps */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative group transition-all duration-300">
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-lime-400 to-lime-200 opacity-30" />
                )}

                <div className="flex gap-8">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl 
flex items-center justify-center shadow-lg shadow-lime-500/30 relative z-10
transition-transform duration-300
group-hover:rotate-8 group-hover:scale-105"
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div
                      className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm
  transition-all duration-300
  group-hover:rotate-1 group-hover:shadow-xl group-hover:border-lime-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-sm font-semibold text-lime-500 mb-2 block">
                            STEP {step.number}
                          </span>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {step.title}
                          </h3>
                        </div>
                        <div className="text-5xl font-bold text-lime-400/30">
                          {step.number}
                        </div>
                      </div>

                      <p className="text-gray-600 leading-relaxed mb-6">
                        {step.description}
                      </p>

                      {/* Tips */}
                      <div className="bg-lime-50 rounded-xl p-6 border border-lime-100">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-lime-400 rounded-full" />
                          Pro Tips
                        </h4>
                        <ul className="space-y-2">
                          {step.tips.map((tip, tipIndex) => (
                            <li
                              key={tipIndex}
                              className="text-sm text-gray-600 flex items-start gap-2"
                            >
                              <span className="text-lime-500 mt-0.5">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA after steps */}
          <div className="mt-16 text-center bg-gradient-to-br from-lime-50 to-white rounded-3xl p-12 border border-lime-100">
            <Calendar className="w-12 h-12 text-lime-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Siap untuk Mulai?
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Jelajahi katalog peralatan kami dan ajukan permohonan peminjaman pertamamu hari ini
            </p>
            <Link
              to="/list-peralatan"
              className="group inline-flex items-center gap-2 px-8 py-4
              bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold
              rounded-xl transition-all
              hover:shadow-xl hover:shadow-lime-500/30
              hover:-translate-y-0.5"
            >
              Jelajahi Peralatan
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-lg text-gray-600">
              Temukan jawaban atas pertanyaan umum seputar peminjaman peralatan
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaqIndex === index ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Masih punya pertanyaan?</p>
            <button className="group text-lime-500 hover:text-lime-600 font-semibold inline-flex items-center cursor-pointer">
              Hubungi Kami
              <ArrowRight
                className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
