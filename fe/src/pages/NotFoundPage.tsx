import { Link } from "react-router-dom";
import NotFoundIllustration from "../assets/404.svg";

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 p-6 mt-20">
            <img
                src={NotFoundIllustration}
                alt="404 Illustration"
                className="w-60 h-60 mb-4 md:w-80 md:h-80 md:mb-6"
            />

            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-2">404</h1>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 md:mb-4">Halaman Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6 text-center">
                Maaf, halaman yang kamu cari tidak ada.
            </p>

            <Link
                to="/dashboard"
                className="px-4 py-2 md:px-6 md:py-3 bg-green-700 text-sm md:text-lg text-white font-semibold rounded-lg hover:bg-green-800 transition"
            >
                Kembali ke Dashboard
            </Link>
        </div>
    );
}
