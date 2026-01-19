import { Navigate, Outlet } from "react-router-dom";

type PrivateRouteProps = {
    requiredRole: string;
};

export default function PrivateRoute({ requiredRole }: PrivateRouteProps) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) return <Navigate to="/login" replace />;

    if (user.role !== requiredRole) return <Navigate to="/" replace />;

    return <Outlet />;
}
