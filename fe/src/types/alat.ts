import type { Kategori } from "./kategori";

export type KondisiAlat = 'baik' | 'rusak-ringan' | 'rusak-berat';
export type StatusAlat = 'tersedia' | 'tidak-tersedia' | 'dipinjam' | 'maintenance';

export interface Alat {
    id: number;
    kode_alat: string;
    nama_alat: string;
    kategori: Kategori;
    harga: string;
    batas_peminjaman: number;
    lokasi: string;
    kondisi: KondisiAlat;
    status: StatusAlat;
    deskripsi: string;
    foto_alat: File | null | string;
}

export type AlatForm = {
    kode_alat: string;
    nama_alat: string;
    id_kategori: number;
    harga: string;
    batas_peminjaman: number;
    lokasi: string;
    kondisi: KondisiAlat | '';
    status: StatusAlat | '';
    deskripsi: string;
    foto_alat: File | null | string;
};