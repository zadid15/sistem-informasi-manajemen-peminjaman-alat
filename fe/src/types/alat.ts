import type { Kategori } from "./kategori";

export type KondisiAlat = 'baik' | 'rusak-ringan' | 'rusak-berat';
export type StatusAlat = 'tersedia' | 'tidak-tersedia' | 'dipinjam' | 'maintenance';
export type AlatArray = Alat[];


export interface Alat {
    id: number;
    nama_alat: string;
    kategori: Kategori;
    deskripsi: string;
    status: StatusAlat;
    foto_alat: File | string | null;
    kode_alat: string;
    kondisi: KondisiAlat;
    lokasi: string;
    harga: string;
    batas_peminjaman: number;
    spesifikasi: Record<string, string | number>;
}

export type SpesifikasiPayload = {
    name: string;
    value: string;
};

export type AlatForm = {
    kode_alat: string;
    nama_alat: string;
    id_kategori: number;
    status: StatusAlat | '';
    deskripsi: string;
    foto_alat: File | null | string;
    kondisi: KondisiAlat | '';
    lokasi: string;
    harga: string;
    batas_peminjaman: number;
    spesifikasi: SpesifikasiPayload[];
};