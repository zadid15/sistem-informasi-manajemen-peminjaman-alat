import { Navigate, Outlet } from "react-router-dom";

export default function PeminjamRoute() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "petugas") return <Navigate to="/petugas/dashboard" replace />;

    return <Outlet />;
}