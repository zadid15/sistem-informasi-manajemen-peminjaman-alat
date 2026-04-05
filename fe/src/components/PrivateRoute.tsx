import { Navigate, Outlet } from "react-router-dom";

type PrivateRouteProps = {
    requiredRole: string;
};

export default function PrivateRoute({ requiredRole }: PrivateRouteProps) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) return <Navigate to="/login" replace />;

    if (user.role !== requiredRole) {
        if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
        if (user.role === "petugas") return <Navigate to="/petugas/dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}