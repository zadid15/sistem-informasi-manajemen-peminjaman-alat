import type { Kategori } from "../types/kategori";
import axiosInstance from "../utils/axios";

export const getKategori = async (
    page = 1,
    search = "",
    role = "all"
) => {
    const res = await axiosInstance.get("/kategori", {
        params: { page, search, role },
    });

    console.log(res.data.data);
    

    return {
        kategori: res.data.data as Kategori[],        
        pagination: res.data.pagination,       
        message: res.data.message,
    };
};

export const createKategori = async (data: Partial<Kategori>) => {
    const res = await axiosInstance.post("/kategori", data);
    return res.data;
};

export const updateKategori = async (id: number, data: Partial<Kategori>) => {
    const res = await axiosInstance.put(`/kategori/${id}`, data);
    return res.data;
};

export const deleteKategori = async (id: number) => {
    const res = await axiosInstance.delete(`/kategori/${id}`);
    return res.data;
};