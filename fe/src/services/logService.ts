import axiosInstance from "../utils/axios";

type LogParams = {
    search?: string;
    page?: number;
    per_page?: number;
};

export const getLogs = async (params: LogParams) => {
    const res = await axiosInstance.get("/logs", { params });
    return res.data;
};