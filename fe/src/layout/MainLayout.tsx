import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import type { UserRoleDashboard } from "../types/user";
import { Topbar } from "./Topbar";

interface MainLayoutProps {
    name: string;
    role: UserRoleDashboard;
    currentPage: string;
    avatar?: string | null;
    onNavigate: (page: string) => void;
    children: ReactNode;
}

export default function MainLayout({
    name,
    role,
    currentPage,
    avatar,
    onNavigate,
    children,
}: MainLayoutProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar name={name} role={role} avatar={avatar} currentPage={currentPage} onNavigate={onNavigate} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar name={name} avatar={avatar} onNavigate={onNavigate} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6">{children}</div>
                </main>

                <footer className="border-t bg-white px-6 py-3 text-xs text-gray-800 text-center">
                    © {new Date().getFullYear()} SIMPA. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
