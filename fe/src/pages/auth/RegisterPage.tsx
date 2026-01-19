import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";
import auth from "../../assets/auth.jpg";
import simpa from "../../assets/simpa.png";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [agree, setAgree] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Password dan konfirmasi password tidak sama.");
            return;
        }

        setLoading(true);

        try {
            await axiosInstance.post("/register", {
                name,
                email,
                password,
            });

            navigate("/login");
        } catch (error) {
            console.error("Register failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex">
            {/* FORM REGISTER */}
            <div className="w-full md:w-2/5 flex items-center justify-center h-full bg-gray-100 p-8">
                <div className="w-full max-w-md mx-auto">
                    <img src={simpa} alt="Logo Sistem" className="mx-auto w-44 h-44 object-contain" />

                    <p className="text-gray-600 text-center mt-[-58px] mb-10">
                        Sistem Informasi Managemen Peminjaman Alat
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-md mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                placeholder="Nama lengkap"
                                className="w-full border border-gray-400 rounded-lg px-4 py-2"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-md mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="contoh@gmail.com"
                                className="w-full border border-gray-400 rounded-lg px-4 py-2"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-md mb-1">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                className="w-full border border-gray-400 rounded-lg px-4 py-2 pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div>
                            <label className="block text-md mb-1">Konfirmasi Password</label>
                            <input
                                type="password"
                                placeholder="********"
                                className="w-full border border-gray-400 rounded-lg px-4 py-2"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={agree}
                                onChange={(e) => setAgree(e.target.checked)}
                                required
                            />
                            <span>
                                Saya menyetujui{" "}
                                <a href="/terms" className="text-blue-600 hover:underline">Syarat & Ketentuan</a> dan{" "}
                                <a href="/privacy" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !agree}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? "Daftar" : "Daftar"}
                        </button>

                        <p className="text-sm text-gray-600 text-center mt-2">
                            Sudah punya akun?{" "}
                            <Link to="/login" className="text-blue-600">
                                Masuk disini
                            </Link>
                        </p>
                    </form>

                    <p className="text-xs text-gray-400 mt-6 text-center">
                        © 2026 Sistem Informasi Managemen Peminjaman Alat.
                    </p>
                </div>
            </div>

            {/* GAMBAR */}
            <div className="hidden md:flex relative w-3/5 h-full">
                <img src={auth} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/65 p-8 text-center">
                    <h2 className="text-4xl font-bold italic">
                        Buat Akun dan Mulai{" "}
                        <span className="text-zinc-900 bg-white px-3 py-1 rounded-tr-xl rounded-bl-xl">
                            Kelola Alat.
                        </span>
                    </h2>
                </div>
            </div>
        </div>
    );
}
