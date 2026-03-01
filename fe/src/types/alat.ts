import type { Kategori } from "./kategori";

export type KondisiAlat = 'baik' | 'rusak-ringan' | 'rusak-berat';
export type StatusAlat = 'tersedia' | 'tidak-tersedia' | 'dipinjam' | 'maintenance';
export type AlatArray = Alat[];


export interface Alat {
    id: number;
    nama_alat: string;
    kategori: Kategori;
    deskripsi: string;
    foto_alat: File | string | null;
    kondisi_awal: KondisiAlat;
    lokasi_awal: string;
    harga: string;
    batas_peminjaman: number;
    jumlah_unit: number;
    spesifikasi: Record<string, string | number>;
}

export type SpesifikasiPayload = {
    name: string;
    value: string;
};

export type AlatForm = {
    nama_alat: string;
    id_kategori: number;
    deskripsi: string;
    foto_alat: File | null | string;
    kondisi_awal: KondisiAlat | '';
    lokasi_awal: string;
    harga: string;
    batas_peminjaman: number;
    jumlah_unit: number;
    spesifikasi: SpesifikasiPayload[];
};