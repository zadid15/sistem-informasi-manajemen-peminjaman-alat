import { Link } from "react-router";
import simpa from "../../../assets/simpa-navbar.png";
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={simpa}
                alt="SIMPA"
                className="w-50 h-50 rounded-xl object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm max-w-sm">
              SIMPA mempermudah proses peminjaman alat secara cepat, tertata,
              dan real-time.
            </p>
          </div>

          {/* Tautan Cepat */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/list-peralatan"
                  className="text-sm text-gray-600 hover:text-lime-500 transition-colors"
                >
                  Daftar Peralatan
                </Link>
              </li>
              <li>
                <Link
                  to="/cara-peminjaman"
                  className="text-sm text-gray-600 hover:text-lime-500 transition-colors"
                >
                  Cara Peminjaman
                </Link>
              </li>
              <li>
                <Link
                  to="/tentang-kami"
                  className="text-sm text-gray-600 hover:text-lime-500 transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Bantuan</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-lime-500 transition-colors"
                >
                  Pusat Bantuan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-lime-500 transition-colors"
                >
                  Hubungi Kami
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-lime-500 transition-colors"
                >
                  Syarat & Ketentuan
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} SIMPA. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-lime-500 transition-colors"
              >
                Kebijakan Privasi
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-lime-500 transition-colors"
              >
                Ketentuan Penggunaan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}