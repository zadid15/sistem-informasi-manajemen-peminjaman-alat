import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import type { UserRole } from "../types/user";

interface LayoutWrapperProps {
    children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const name: string = user?.nama;
    const role: UserRole = user?.role;

    const currentPage = location.pathname.split("/").pop() || "dashboard";

    const onNavigate = (page: string) => navigate(`/${role}/${page}`);

    return (
        <MainLayout
            name={name}
            role={role}
            currentPage={currentPage}
            onNavigate={onNavigate}
        >
            {children}
        </MainLayout>
    );
}
