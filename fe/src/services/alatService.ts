import type { Alat, AlatForm } from "../types/alat";
import axiosInstance from "../utils/axios";

export const getAlat = async (
    page = 1,
    search = "",
    category = "all",
    status = "all"
) => {
    const res = await axiosInstance.get("/alat", {
        params: {
            page,
            search,
            category,
            status,
        },
    });

    return {
        alat: res.data.data as Alat[],
        pagination: res.data.pagination,
        message: res.data.message,
    };
};

export const createAlat = async (data: AlatForm) => {
    const formDataToSend = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        // khusus foto_alat
        if (key === "foto_alat" && value instanceof File) {
            formDataToSend.append(key, value);
        } else {
            // untuk string/number
            formDataToSend.append(key, String(value));
        }
    });

    const res = await axiosInstance.post("/alat", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
};

export const updateAlat = async (id: number, data: AlatForm) => {
    const formDataToSend = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        // khusus foto_alat: hanya append kalau File baru
        if (key === "foto_alat") {
            if (value instanceof File) {
                formDataToSend.append(key, value);
            }
            // kalau string URL lama, jangan append
        } else {
            // untuk string/number lain
            formDataToSend.append(key, String(value));
        }
    });

    const res = await axiosInstance.put(`/alat/${id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
};

export const deleteAlat = async (id: number) => {
    const res = await axiosInstance.delete(`/alat/${id}`);
    return res.data;
};
