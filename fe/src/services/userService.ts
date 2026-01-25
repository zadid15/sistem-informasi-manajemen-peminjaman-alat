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
