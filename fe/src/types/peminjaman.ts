import type { Alat } from "./alat";

export interface BorrowItemPayload {
    id_alat: number;
}

export interface BorrowRequestPayload {
    tanggal_pinjam: string;
    rencana_pengembalian: string;
    catatan?: string | null;
    alat: BorrowItemPayload[];
}

export interface Meta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface DetailPeminjaman {
    id: number;
    alat: Alat;
}

export interface Peminjaman {
    id: number;
    tanggal_pinjam: string;
    rencana_pengembalian: string;
    tanggal_kembali: string | null;
    status: string;
    catatan: string | null;
    alasan_penolakan: string | null;
    detail_peminjaman: DetailPeminjaman[];
}