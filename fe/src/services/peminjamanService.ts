import type { BorrowRequestPayload } from "../types/peminjaman";
import axiosInstance from "../utils/axios";

export const ajukanPeminjaman = async (data: BorrowRequestPayload) => {
    const res = await axiosInstance.post("/peminjaman", data);
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