import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { changePassword, getMe, updateMe } from "../../services/userService";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";

type UserForm = {
    nama: string;
    email: string;
    role: string;
    phone: string;
    jenis_kelamin: string;
    alamat: string;
    foto: File | string | null;
};

// ─── Skeleton Components ───────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

function AvatarSkeleton() {
    return (
        <div className="flex flex-col items-center">
            <Skeleton className="w-38 h-38 rounded-full" />
            <Skeleton className="h-4 w-48 mt-2 mb-4" />
        </div>
    );
}

function ProfileFormSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Nama */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Email */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Phone */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Jenis Kelamin */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Alamat */}
            <div className="col-span-2 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-20 w-full rounded-md" />
            </div>
            {/* Button */}
            <div className="col-span-2">
                <Skeleton className="h-10 w-40 rounded-md mt-2 mb-6" />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────

export default function SettingUserPage() {
    const fileRef = useRef<HTMLInputElement>(null);

    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [showConfirmProfile, setShowConfirmProfile] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [originalUser, setOriginalUser] = useState<UserForm | null>(null);

    const [passwordError, setPasswordError] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const validateNewPassword = (value: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(value)
            ? ""
            : "Password minimal 8 karakter dan harus mengandung huruf besar, huruf kecil, dan angka";
    };

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [user, setUser] = useState<UserForm>({
        nama: "",
        email: "",
        role: "",
        phone: "",
        jenis_kelamin: "",
        alamat: "",
        foto: null,
    });

    const [password, setPassword] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const isPasswordFilled =
        password.current.trim() !== "" &&
        password.new.trim() !== "" &&
        password.confirm.trim() !== "";

    const isPasswordValid =
        isPasswordFilled &&
        !passwordError.current &&
        !passwordError.new &&
        !passwordError.confirm;

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const start = Date.now();

            try {
                const data = await getMe();

                const initialUser: UserForm = {
                    nama: data.nama,
                    email: data.email,
                    role: data.role,
                    phone: data.phone ?? "",
                    jenis_kelamin: data.jenis_kelamin ?? "",
                    alamat: data.alamat ?? "",
                    foto: data.foto ?? "",
                };

                setUser(initialUser);
                setOriginalUser(initialUser);
                setPreview(data.foto ?? null);
            } catch {
                toast.error("Gagal memuat data profil");
            } finally {
                const elapsed = Date.now() - start;
                const MIN_LOADING = 800; // 👈 atur disini (ms)

                setTimeout(() => {
                    setLoading(false);
                }, Math.max(0, MIN_LOADING - elapsed));
            }
        };

        fetchUser();
    }, []);

    const isProfileChanged = () => {
        if (!originalUser) return false;
        return (
            user.nama !== originalUser.nama ||
            user.phone !== originalUser.phone ||
            user.jenis_kelamin !== originalUser.jenis_kelamin ||
            user.alamat !== originalUser.alamat ||
            user.foto instanceof File
        );
    };

    const handleUpdateProfile = async () => {
        if (!isProfileChanged()) {
            toast.warning("Tidak ada perubahan");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append("nama", user.nama);
            formData.append("phone", user.phone);
            formData.append("jenis_kelamin", user.jenis_kelamin);
            formData.append("alamat", user.alamat);

            if (user.foto instanceof File) {
                formData.append("foto", user.foto);
            }

            const res = await updateMe(formData);
            const updatedUser = res.data;

            const syncedUser: UserForm = {
                nama: updatedUser.nama,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone ?? "",
                jenis_kelamin: updatedUser.jenis_kelamin ?? "",
                alamat: updatedUser.alamat ?? "",
                foto: updatedUser.foto ?? "",
            };

            setUser(syncedUser);
            setOriginalUser(syncedUser);
            setPreview(updatedUser.foto ? `${updatedUser.foto}?t=${Date.now()}` : null);

            if (fileRef.current) fileRef.current.value = "";

            localStorage.setItem("user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("userUpdated"));

            toast.success("Profil berhasil diperbarui!");
        } catch {
            toast.error("Gagal memperbarui profil");
        }
    };

    const handleChangePassword = async () => {
        if (password.current === password.new) {
            toast.warning("Password baru tidak boleh sama dengan password saat ini");
            return;
        }

        const newPasswordError = validateNewPassword(password.new);
        if (newPasswordError) {
            setPasswordError({ ...passwordError, new: newPasswordError });
            return;
        }

        if (password.new !== password.confirm) {
            setPasswordError({ ...passwordError, confirm: "Konfirmasi password tidak cocok" });
            return;
        }

        try {
            await changePassword({
                current_password: password.current,
                new_password: password.new,
                new_password_confirmation: password.confirm,
            });

            toast.success("Password berhasil diubah!");
            setPassword({ current: "", new: "", confirm: "" });
            setPasswordError({ current: "", new: "", confirm: "" });
        } catch {
            setPasswordError({ ...passwordError, current: "Password saat ini tidak sesuai" });
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error("Foto harus berupa JPG, JPEG, atau PNG");
            e.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error("Ukuran foto maksimal 2MB");
            e.target.value = "";
            return;
        }

        setPreview(URL.createObjectURL(file));
        setUser({ ...user, foto: file });
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header — statis, selalu tampil */}
            <section className="pt-52 pb-12 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Pengaturan Akun
                    </h1>
                    <p className="text-lg text-gray-600">
                        Kelola informasi profil, perbarui data pribadi, serta atur keamanan akun Anda untuk memastikan pengalaman penggunaan yang aman dan optimal.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto">
                {/* Avatar — skeleton saat loading */}
                {loading ? (
                    <AvatarSkeleton />
                ) : (
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="relative w-38 h-38 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center cursor-pointer group"
                            >
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm text-gray-400">No Image</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <span className="text-xs text-white">Ganti</span>
                                </div>
                            </div>
                            <p className="text-md text-gray-500 mt-2 text-center mb-4">
                                Format: JPG / PNG · Maksimal 2MB
                            </p>
                        </div>

                        <Input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                )}

                {/* Profile Form — skeleton saat loading */}
                {loading ? (
                    <ProfileFormSkeleton />
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {/* Nama */}
                        <div>
                            <Label className="text-md">Nama Lengkap</Label>
                            <Input
                                value={user.nama}
                                onChange={(e) => setUser({ ...user, nama: e.target.value })}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <Label className="text-md">Email</Label>
                            <Input value={user.email} disabled />
                        </div>

                        {/* Phone */}
                        <div>
                            <Label className="text-md">Nomor Telepon</Label>
                            <Input
                                value={user.phone}
                                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                            />
                        </div>

                        {/* Jenis Kelamin */}
                        <div>
                            <Label className="text-md">Jenis Kelamin</Label>
                            <Select
                                value={user.jenis_kelamin}
                                onValueChange={(value) => setUser({ ...user, jenis_kelamin: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis kelamin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Alamat */}
                        <div className="col-span-2">
                            <Label className="text-md">Alamat</Label>
                            <Textarea
                                value={user.alamat}
                                onChange={(e) => setUser({ ...user, alamat: e.target.value })}
                            />
                        </div>

                        {/* Button */}
                        <div className="col-span-2">
                            <Button
                                onClick={() => setShowConfirmProfile(true)}
                                disabled={!isProfileChanged()}
                                className={`
                                    ${isProfileChanged() ? "cursor-pointer" : "cursor-default"}
                                    text-md mt-2 mb-6 disabled:opacity-60
                                `}
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </div>
                )}

                {/* Change Password — statis, selalu tampil (tidak ada data dari BE) */}
                <div className="border-t pt-6">
                    <h2 className="text-md font-semibold mb-4">Ganti Password</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Password saat ini */}
                        <div className="col-span-2">
                            <div className="relative flex items-center">
                                <Input
                                    type={showPassword.current ? "text" : "password"}
                                    placeholder="Password saat ini"
                                    value={password.current}
                                    onChange={(e) => {
                                        setPassword({ ...password, current: e.target.value });
                                        setPasswordError({ ...passwordError, current: "" });
                                    }}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                    className="absolute right-3 text-gray-500 flex items-center justify-center h-full"
                                >
                                    {showPassword.current ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                            <p className="text-sm min-h-[20px] mt-1 text-red-500">
                                {passwordError.current}
                            </p>
                        </div>

                        {/* Password baru */}
                        <div>
                            <Label className="text-md">Password baru</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword.new ? "text" : "password"}
                                    placeholder="Password baru"
                                    value={password.new}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPassword({ ...password, new: value });
                                        setPasswordError({ ...passwordError, new: validateNewPassword(value) });
                                    }}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword.new ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                            <p className="text-sm min-h-[20px] mt-1 text-red-500">
                                {passwordError.new}
                            </p>
                        </div>

                        {/* Konfirmasi password */}
                        <div>
                            <Label className="text-md">Konfirmasi password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword.confirm ? "text" : "password"}
                                    placeholder="Konfirmasi password baru"
                                    value={password.confirm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPassword({ ...password, confirm: value });
                                        setPasswordError({
                                            ...passwordError,
                                            confirm: value && value !== password.new
                                                ? "Konfirmasi password tidak cocok"
                                                : "",
                                        });
                                    }}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword.confirm ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                            <p className="text-sm min-h-[20px] mt-1 text-red-500">
                                {passwordError.confirm}
                            </p>
                        </div>
                    </div>

                    {/* Button */}
                    <div>
                        <Button
                            onClick={() => setShowConfirmPassword(true)}
                            disabled={!isPasswordValid}
                            className={`
                                ${isPasswordValid ? "cursor-pointer" : "cursor-not-allowed"}
                                text-md disabled:opacity-60
                            `}
                        >
                            Simpan Password
                        </Button>
                    </div>
                </div>

                <ConfirmDialog
                    isOpen={showConfirmProfile}
                    onClose={() => setShowConfirmProfile(false)}
                    onConfirm={handleUpdateProfile}
                    title="Konfirmasi Perubahan Profil"
                    description="Perubahan ini akan langsung diperbarui di akun Anda. Pastikan semua informasi sudah benar sebelum melanjutkan."
                    confirmText="Ubah Profil"
                    cancelText="Batal"
                    variant="warning"
                />
                <ConfirmDialog
                    isOpen={showConfirmPassword}
                    onClose={() => setShowConfirmPassword(false)}
                    onConfirm={handleChangePassword}
                    title="Konfirmasi Perubahan Password"
                    description="Password baru akan langsung diperbarui. Pastikan Anda sudah mengecek semua input sebelum melanjutkan agar akun tetap aman."
                    confirmText="Ubah Password"
                    cancelText="Batal"
                    variant="warning"
                />
            </div>
        </div>
    );
}