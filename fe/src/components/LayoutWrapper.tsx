import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import type { UserRole, UserRoleDashboard } from "../types/user";
import { getMe } from "../services/userService";
import { toast } from "sonner";

interface LayoutWrapperProps {
    children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const [avatar, setAvatar] = useState<{ foto: string } | null>(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const name: string = user?.nama;
    const role: UserRole = user?.role;

    useEffect(() => {
        const handleUserUpdated = () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            setAvatar({ foto: user.foto ?? "" });
        };

        window.addEventListener("userUpdated", handleUserUpdated);

        return () => window.removeEventListener("userUpdated", handleUserUpdated);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getMe();
                setAvatar({
                    foto: data.foto ?? "",
                });
            } catch {
                toast.error("Gagal memuat data profil");
            }
        };

        fetchUser();
    }, []);

    const currentPage = location.pathname.replace(`/${role}/`, "") || "dashboard";

    const onNavigate = (page: string) => navigate(`/${role}/${page}`);

    return (
        <MainLayout
            name={name}
            role={role as UserRoleDashboard}
            avatar={avatar?.foto ?? null}
            currentPage={currentPage}
            onNavigate={onNavigate}
        >
            {children}
        </MainLayout>
    );
}
