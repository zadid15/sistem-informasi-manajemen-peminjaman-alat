export interface BorrowItemPayload {
    id_alat: number;
}

export type BorrowRequestPayload = {
    tanggal_pinjam: string;
    rencana_pengembalian: string;
    catatan?: string | null;
    alat: {
        id_alat_unit: number;
    }[];
};

export interface Meta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export type DetailPeminjaman = {
    id: number;
    id_peminjaman: number;
    alat_unit_id: number;
    kondisi_sebelum: string | null;
    kondisi_sesudah: string | null;
    total_denda?: string | null;
    alat_unit: {
        id: number;
        kode_unit: string;
        kondisi: string;
        lokasi: string;
        alat: {
            id: number;
            nama_alat: string;
            foto_alat?: string | null;
            harga?: number;
            kategori?: { nama_kategori: string };
            deskripsi?: string;
            spesifikasi?: { name: string; value: string }[];
        };
    };
};

export interface Peminjaman {
    id: number;
    tanggal_pinjam: string;
    rencana_pengembalian: string;
    tanggal_kembali: string | null;
    status: string;
    catatan: string | null;
    approver?: {
        id: number;
        nama: string;
    } | null;
    receiver?: {
        id: number;
        nama: string;
    } | null;
    alasan_penolakan: string | null;
    detail_peminjaman: DetailPeminjaman[];
}