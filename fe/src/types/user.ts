export type UserRole = 'admin' | 'petugas' | 'peminjam';
export type UserStatus = "aktif" | "nonaktif";

export interface User {
    id: number;
    nama: string;
    email: string;
    role: UserRole;
    phone: string;
    is_active: UserStatus;
    created_at: string;
}