import type { Alat } from "../types/alat";
import axiosInstance from "../utils/axios";

export const getAlat = async (
    page = 1,
    search = "",
    role = "all"
) => {
    const res = await axiosInstance.get("/alat", {
        params: { page, search, role },
    });

    console.log(res.data.data);
    

    return {
        alat: res.data.data as Alat[],        
        pagination: res.data.pagination,       
        message: res.data.message,
    };
};


export const createAlat = async (data: Partial<Alat>) => {
    const res = await axiosInstance.post("/alat", data);
    return res.data;
};

export const updateAlat = async (id: number, data: Partial<Alat>) => {
    const res = await axiosInstance.put(`/alat/${id}`, data);
    return res.data;
};

export const deleteAlat = async (id: number) => {
    const res = await axiosInstance.delete(`/alat/${id}`);
    return res.data;
};
