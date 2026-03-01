import type { AlatUnit, CreateAlatUnitForm, UpdateAlatUnitForm } from "../types/alatUnit";
import axiosInstance from "../utils/axios";

export const getAlatUnit = async (
    page = 1,
    search = "",
    status = "all",
    id: number
) => {
    const res = await axiosInstance.get(`/alat/${id}/units`, {
        params: {
            page,
            search,
            status,
        },
    });

    return {
        alatUnit: res.data.data as AlatUnit[],
        pagination: res.data.pagination,
        message: res.data.message,
    };
};

export const createAlatUnit = async (id: number, data: CreateAlatUnitForm) => {
    const res = await axiosInstance.post(`/alat/${id}/units`, data);
    return res.data;
};

export const updateAlatUnit = async (id: number, data: UpdateAlatUnitForm) => {
    const res = await axiosInstance.put(`/units/${id}`, data);
    return res.data;
};

export const deleteAlatUnit = async (id: number) => {
    const res = await axiosInstance.delete(`/units/${id}`);
    return res.data;
};