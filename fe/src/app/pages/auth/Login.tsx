import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post("/login", {
                email,
                password,
            });

            // Simpan token & user info
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            setLoading(false);

            console.log(response.data.user.role);
            

            // Redirect berdasarkan role
            switch (response.data.user.role) {
                case "admin":
                    navigate("/admin");
                    break;
                case "petugas":
                    navigate("/petugas");
                    break;
                case "peminjam":
                    navigate("/peminjam");
                    break;
                default:
                    navigate("/login");
            }
        } catch {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* FORM LOGIN */}
            <div className="w-full md:w-2/5 flex items-center justify-center px-8">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-2">Masuk ke Sistem</h1>
                    <p className="text-gray-600 mb-6">
                        Sistem Peminjaman Alat<br />
                        <span className="text-sm">Uji Kompetensi Keahlian (UKK)</span>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="contoh@email.com"
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" />
                                Ingat Saya
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? "Memproses..." : "Masuk"}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 mt-6">
                        © 2026 Sistem Peminjaman Alat – UKK
                    </p>
                </div>
            </div>

            {/* GAMBAR */}
            <div className="hidden md:flex w-3/5 items-center justify-center bg-blue-50">
                <div className="text-center px-10">
                    <img
                        src="https://illustrations.popsy.co/blue/inventory.svg"
                        alt="Ilustrasi Peminjaman"
                        className="max-w-md mx-auto"
                    />
                    <h2 className="text-xl font-semibold mt-6">
                        Kelola Peminjaman Alat dengan Mudah
                    </h2>
                    <p className="text-gray-600 mt-2">Cepat • Aman • Terstruktur</p>
                </div>
            </div>
        </div>
    );
}
