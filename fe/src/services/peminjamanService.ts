import type { BorrowRequestPayload } from "../types/peminjaman";
import axiosInstance from "../utils/axios";

export const ajukanPeminjaman = async (data: BorrowRequestPayload) => {
    const res = await axiosInstance.post("/peminjaman", data);
    return res.data;
};

export interface GetPeminjamanParams {
    page?: number;
    per_page?: number;
    search?: string;
}

export const getPeminjaman = async (params?: GetPeminjamanParams) => {
    const res = await axiosInstance.get("/peminjaman", { params });
    return res.data;
};

export const getPeminjamanSaya = async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    sort_by?: string;
}) => {
    const res = await axiosInstance.get("/peminjaman/saya", { params });
    return res.data;
};

export const getDetailPeminjaman = async (id: string) => {
    const res = await axiosInstance.get(`/detail-peminjaman/${id}`);
    return res.data;
};

export const lihatPeminjaman = async (id: number) => {
    const res = await axiosInstance.patch(`/peminjaman/${id}/lihat`);
    return res.data;
};

export const setujuiPeminjaman = async (id: number, formData: FormData) => {
    const res = await axiosInstance.post(`/peminjaman/${id}/setujui`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const tolakPeminjaman = async (id: number, alasan: string) => {
    const res = await axiosInstance.post(`/peminjaman/${id}/tolak`, {
        catatan: alasan,
    });
    return res.data;
};

export const ajukanPengembalian = async (id: string) => {
    const res = await axiosInstance.post(`/peminjaman/${id}/ajukan-pengembalian`);
    return res.data;
};