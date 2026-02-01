import type { User } from "../types/user";
import axiosInstance from "../utils/axios";

export const getUsers = async (
    page = 1,
    search = "",
    role = "all"
) => {
    const res = await axiosInstance.get("/users", {
        params: { page, search, role },
    });

    console.log(res.data.data);


    return {
        users: res.data.data as User[],
        pagination: res.data.pagination,
        message: res.data.message,
    };
};

export const createUser = async (data: Partial<User>) => {
    const res = await axiosInstance.post("/users", data);
    return res.data;
};

export const updateUser = async (id: number, data: Partial<User>) => {
    const res = await axiosInstance.put(`/users/${id}`, data);
    return res.data;
};

export const deleteUser = async (id: number) => {
    const res = await axiosInstance.delete(`/users/${id}`);
    return res.data;
};

// 🔹 USER LOGIN
export const getMe = async () => {
    const res = await axiosInstance.get("/me");
    return res.data.data as User;
};

// 🔹 UPDATE PROFIL SENDIRI
export const updateMe = async (data: FormData) => {
    const res = await axiosInstance.post("/me", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

// 🔹 GANTI PASSWORD
export const changePassword = async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}) => {
    const res = await axiosInstance.put("/me/password", data);
    return res.data;
};