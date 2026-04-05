import { Link } from "react-router";
import { Target, Users, Zap, Shield, ArrowRight, BookOpen } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import team from "../../assets/team.jpg"
import { useEffect } from "react";

export function AboutPage() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="pt-52 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-100 border border-lime-200 rounded-full mb-6">
            <span className="w-2 h-2 bg-lime-400 rounded-full" />
            <span className="text-sm font-medium text-gray-700">Tentang Kami</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Membuat Peminjaman Alat
            <br />
            <span className="text-lime-800">Lebih Mudah & Praktis</span>
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Kami percaya bahwa akses terhadap peralatan yang profesional harus
            mudah, transparan, dan efisien. Melalui platform ini, seluruh proses
            peminjaman kami sederhanakan agar lebih cepat dan nyaman.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative h-96 lg:h-[500px] rounded-tr-3xl rounded-bl-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src={team}
                alt="Modern workspace"
                className="w-full h-full object-cover brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Misi Kami
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Mewujudkan akses yang lebih luas terhadap peralatan profesional melalui
                platform yang mudah digunakan, tepercaya, dan efisien, sehingga pengguna
                dapat memperoleh alat yang dibutuhkan kapan pun diperlukan.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Kami tidak hanya membangun sistem peminjaman, tetapi juga menciptakan
                ekosistem berbagi sumber daya yang lebih efektif, mengurangi pemborosan,
                serta mendorong terciptanya inovasi.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="text-3xl font-bold text-lime-500 mb-2">
                    500+
                  </div>
                  <div className="text-sm text-gray-600">
                    Peralatan Tersedia
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="text-3xl font-bold text-lime-500 mb-2">
                    1000+
                  </div>
                  <div className="text-sm text-gray-600">
                    Peminjaman Berhasil
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nilai & Prinsip Kami
            </h2>
            <p className="text-lg text-gray-600">
              Nilai dan prinsip yang kami pegang dalam menjalankan layanan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: "Efisiensi",
                description:
                  "Proses peminjaman yang disederhanakan untuk menghemat waktu dan mengurangi hambatan.",
              },
              {
                icon: Shield,
                title: "Kepercayaan",
                description:
                  "Sistem yang transparan dengan proses verifikasi untuk melindungi pengguna dan peralatan.",
              },
              {
                icon: Users,
                title: "Aksesibilitas",
                description:
                  "Mempermudah akses terhadap peralatan profesional bagi siapa pun yang membutuhkannya.",
              },
              {
                icon: Target,
                title: "Inovasi",
                description:
                  "Terus mengembangkan platform melalui teknologi modern dan masukan dari pengguna.",
              },
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="group w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-500 rounded-3xl 
                flex items-center justify-center mx-auto mb-6 
                shadow-lg shadow-lime-500/30 
                transition-transform duration-300 
                hover:rotate-6 hover:scale-105">
                  <value.icon className="w-10 h-10 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">
            Kisah Kami
          </h2>

          <div className="space-y-6 text-lg text-gray-600 leading-relaxed text-justify">
            <p>
              SIMPA lahir dari pengamatan sederhana: mengakses peralatan profesional seringkali
              terlalu rumit. Baik di institusi pendidikan, studio kreatif, maupun fasilitas penelitian,
              proses peminjaman biasanya manual, tidak transparan, dan membingungkan.
            </p>

            <p>
              Kami ingin mengubah hal itu dengan membangun platform modern yang menghadirkan
              kejelasan, efisiensi, dan kepercayaan dalam manajemen peralatan. Sistem kami
              menyediakan ketersediaan real-time, alur permintaan yang sederhana, dan
              pelacakan transparan—semua dalam antarmuka yang profesional dan mudah digunakan.
            </p>

            <p>
              Saat ini, kami bangga melayani organisasi dan individu yang menghargai
              kualitas peralatan sekaligus pengalaman peminjaman yang baik. Setiap fitur
              yang kami buat dirancang agar peminjaman lebih mudah, cepat, dan terpercaya.
            </p>

            <div className="bg-lime-100 rounded-2xl p-8 border-2 border-lime-100 mt-12 text-justify">
              <p className="text-2xl font-semibold text-gray-900 mb-4">
                "Tujuan kami sederhana: membuat peminjaman peralatan terasa mudah dan nyaman."
              </p>
              <p className="text-gray-600">— Tim SIMPA</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Bergabung dengan Komunitas Kami
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Mulai pinjam peralatan dengan cara modern
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/list-peralatan"
              className="group px-8 py-4 bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold rounded-xl transition-all hover:shadow-xl hover:shadow-lime-500/30 hover:-translate-y-1 flex items-center gap-2"
            >
              Telusuri Peralatan
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>

            <Link
              to="/cara-peminjaman"
              className="group px-8 py-4 border-2 border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              Cara Peminjaman
              <BookOpen size={20} className="text-black" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
