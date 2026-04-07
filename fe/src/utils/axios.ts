import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://almeda-noctis-nonpastorally.ngrok-free.dev/api",
    headers: {
        "ngrok-skip-browser-warning": "true"
    }
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default axiosInstance;