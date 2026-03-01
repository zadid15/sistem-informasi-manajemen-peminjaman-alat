import type { Alat, AlatForm } from "../types/alat";
import axiosInstance from "../utils/axios";

// without login
export const getListAlat = async (params?: {
    search?: string;
    kategori?: number | null;
    status?: "semua" | "tersedia" | "dipinjam";
}) => {
    const res = await axiosInstance.get("/list-alat", {
        params: {
            search: params?.search,
            kategori: params?.kategori,
            status: params?.status === "semua" ? undefined : params?.status,
        },
    });

    return {
        alat: res.data.data as Alat[],
        message: res.data.message,
    };
};

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

export const showAlat = async (id: number) => {
    const res = await axiosInstance.get(`/detail-alat/${id}`);

    return {
        alat: res.data.data as Alat,
        message: res.data.message,
    };
};

export const createAlat = async (data: AlatForm) => {
    const formDataToSend = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        // khusus foto
        if (key === "foto_alat" && value instanceof File) {
            formDataToSend.append(key, value);
            return;
        }

        // khusus spesifikasi (array of object)
        if (key === "spesifikasi" && Array.isArray(value)) {
            value.forEach((item, index) => {
                formDataToSend.append(`spesifikasi[${index}][name]`, item.name);
                formDataToSend.append(`spesifikasi[${index}][value]`, item.value);
            });
            return;
        }

        // default
        formDataToSend.append(key, String(value));
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

        if (key === "foto_alat") {
            if (value instanceof File) {
                formDataToSend.append(key, value);
            }
        } else if (key === "spesifikasi") {
            // Serialize sebagai JSON string, BE parse sebagai array
            formDataToSend.append(key, JSON.stringify(value));
        } else {
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
