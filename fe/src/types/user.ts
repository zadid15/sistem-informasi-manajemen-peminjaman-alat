export type UserRole = 'admin' | 'petugas' | 'peminjam';

export interface User {
    id: string;
    nama: string;
    email: string;
    role: UserRole;
    phone: string;
    createdAt: string;
}