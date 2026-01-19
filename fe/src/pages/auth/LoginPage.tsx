import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";
import auth from "../../assets/auth.jpg";
import simpa from "../../assets/simpa.png";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const remembered = localStorage.getItem("rememberMe");
        const rememberedEmail = localStorage.getItem("rememberedEmail");

        if (remembered === "true") {
            setRememberMe(true);
            if (rememberedEmail) setEmail(rememberedEmail);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post("/login", {
                email,
                password,
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            if (rememberMe) {
                localStorage.setItem("rememberMe", "true");
                localStorage.setItem("rememberedEmail", email);
            } else {
                localStorage.removeItem("rememberMe");
                localStorage.removeItem("rememberedEmail");
            }

            switch (user.role) {
                case "admin":
                    navigate("/admin/dashboard");
                    break;
                case "petugas":
                    navigate("/petugas/dashboard");
                    break;
                case "peminjam":
                    navigate("/peminjam/dashboard");
                    break;
                default:
                    navigate("/");
            }
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex">
            {/* FORM LOGIN */}
            <div className="w-full md:w-2/5 flex items-center justify-center h-full bg-gray-100 p-8">
                <div className="w-full max-w-md mx-auto">
                    <img src={simpa} alt="Logo Sistem" className="mx-auto w-44 h-44 object-contain" />

                    <p className="text-gray-600 text-center mt-[-58px] mb-12">
                        Sistem Informasi Managemen Peminjaman Alat
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <label className="flex items-center gap-2 text-sm text-gray-600 font-light">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Ingat Saya
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                            {loading ? "Masuk" : "Masuk"}
                        </button>

                        <p className="text-sm text-gray-600 text-center mt-2">
                            Belum punya akun?{" "}
                            <Link to="/register" className="text-blue-600">
                                Daftar disini
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
                        Kelola Peminjaman{" "}
                        <span className="text-zinc-900 bg-white px-3 py-1 rounded-tr-xl rounded-bl-xl">
                            Alat dengan Mudah.
                        </span>
                    </h2>
                </div>
            </div>
        </div>
    );
}
