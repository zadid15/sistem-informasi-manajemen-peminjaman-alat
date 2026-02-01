export interface Kategori {
    id: number;
    nama_kategori: string;
    deskripsi: string;
    foto_kategori: string;
    jumlah_alat: number;
}

export type KategoriForm = {
    nama_kategori: string;
    deskripsi: string;
    foto_kategori: File | null | string;
};