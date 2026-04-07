import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://almeda-noctis-nonpastorally.ngrok-free.dev/api",
    headers: {
        "ngrok-skip-browser-warning": "true"
    },
    withCredentials: true // aman kalau nanti pakai auth cookie
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;