import React from 'react';
import {
    LayoutDashboard,
    Users,
    Package,
    FolderTree,
    Activity,
    FileBarChart,
    User,
    Image,
    QrCode,
} from 'lucide-react';
import type { UserRoleDashboard } from '../types/user';
import simpa from '../assets/simpa.png';

interface MenuItem {
    icon: React.ElementType;
    label: string;
    path: string;
}

interface SidebarProps {
    name: string;
    role: UserRoleDashboard;
    avatar?: string | null;
    currentPage: string;
    onNavigate: (page: string) => void;
}

const menuItems: Record<UserRoleDashboard, MenuItem[]> = {
    admin: [
        { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
        { icon: Users, label: 'Manajemen User', path: 'manajemen-user' },
        { icon: Package, label: 'Manajemen Alat', path: 'manajemen-alat' },
        { icon: FolderTree, label: 'Manajemen Kategori', path: 'manajemen-kategori' },
        { icon: Image, label: 'Manajemen Banner', path: 'manajemen-banner' },
        { icon: QrCode, label: 'Scan QR Unit', path: 'scan-qr' },
        { icon: Activity, label: 'Log Aktivitas', path: 'manajemen-log' },
    ],
    petugas: [
        { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
        { icon: FileBarChart, label: 'Manajemen Peminjaman', path: 'manajemen-peminjaman' },
    ],
};

export function Sidebar({
    name,
    role,
    avatar,
    currentPage,
    onNavigate
}: SidebarProps) {
    const items = menuItems[role];

    return (
        <aside className="w-64 bg-gray-700 border-r border-gray-600 flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-gray-500 flex justify-center">
                <div className="rounded-lg flex items-center justify-center overflow-hidden">
                    <img src={simpa} alt="Logo" className="w-30 h-30 object-contain" />
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            currentPage === item.path ||
                            (item.path === 'manajemen-alat' && currentPage.startsWith('manajemen-alat/'));

                        return (
                            <li key={item.path}>
                                <button
                                    onClick={() => onNavigate(item.path)}
                                    className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-gray-50 text-gray-700'
                                        : 'text-gray-100 hover:bg-gray-500 hover:text-gray-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="flex-1 text-left">{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-500">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-6 h-6 text-gray-500" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">
                            {name}
                        </p>
                        <p className="text-xs text-gray-100 capitalize">{role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
