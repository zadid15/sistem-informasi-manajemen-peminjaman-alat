import { Navigate, Outlet } from "react-router-dom"

export default function PublicRoute() {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    const roleUser = user ? JSON.parse(user).role : null

    const dashboardPath = roleUser === "admin" ? "/admin/dashboard"
        : roleUser === "petugas" ? "/petugas/dashboard"
            : roleUser === "peminjam" ? "/peminjam/dashboard"
                : "/dashboard"

    if (token) {
        return <Navigate to={dashboardPath} replace />
    }

    return <Outlet />
}
