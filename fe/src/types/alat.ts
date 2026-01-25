import type { Kategori } from "./kategori";

export interface Alat {
    id: number;
    kode_alat: string;
    nama_alat: string;
    kategori: Kategori;
    harga: string;
    batas_peminjaman: number;
    lokasi: string;
    kondisi: 'baik' | 'rusak-ringan' | 'rusak-berat';
    status: 'tersedia' | 'dipinjam' | 'maintenance';
    deskripsi: string;
    jumlah_tersedia: number;
    jumlah_dipinjam: number;
    foto_alat: string;
}