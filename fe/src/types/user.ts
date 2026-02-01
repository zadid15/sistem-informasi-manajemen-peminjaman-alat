export type UserRole = 'admin' | 'petugas' | 'peminjam';
export type UserStatus = "aktif" | "nonaktif";

export interface User {
    id: number;
    nama: string;
    email: string;
    role: UserRole;
    phone: string;
    password: string;
    is_active: UserStatus;
    jenis_kelamin: string;
    alamat: string;
    foto: string;
    created_at: string;
}