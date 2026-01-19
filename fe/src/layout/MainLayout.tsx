import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import type { UserRole } from "../types/user";
import { Topbar } from "./Topbar";

interface MainLayoutProps {
    name: string;
    role: UserRole;
    currentPage: string;
    onNavigate: (page: string) => void;
    children: ReactNode;
}

export default function MainLayout({
    name,
    role,
    currentPage,
    onNavigate,
    children,
}: MainLayoutProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar name={name} role={role} currentPage={currentPage} onNavigate={onNavigate} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar name={name} onNavigate={onNavigate} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6">{children}</div>
                </main>
            </div>
        </div>
    );
}
