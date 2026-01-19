import React from 'react';
import {
    LayoutDashboard,
    Users,
    Package,
    FolderTree,
    FileText,
    RotateCcw,
    Activity,
    CheckSquare,
    Eye,
    FileBarChart,
    List,
    UserCircle,
} from 'lucide-react';
import type { UserRole } from '../types/user';
import simpa from '../assets/simpa.png';

interface MenuItem {
    icon: React.ElementType;
    label: string;
    path: string;
}

interface SidebarProps {
    name: string;
    role: UserRole;
    currentPage: string;
    onNavigate: (page: string) => void;
}

const menuItems: Record<UserRole, MenuItem[]> = {
    admin: [
        { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
        { icon: Users, label: 'Manajemen User', path: 'manajemen-user' },
        { icon: Package, label: 'Manajemen Alat', path: 'manajemen-alat' },
        { icon: FolderTree, label: 'Manajemen Kategori', path: 'manajemen-kategori' },
        { icon: FileText, label: 'Data Peminjaman', path: 'manajemen-peminjaman' },
        { icon: RotateCcw, label: 'Data Pengembalian', path: 'manajemen-pengembalian' },
        { icon: Activity, label: 'Log Aktivitas', path: 'manajemen-log' },
    ],
    petugas: [
        { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
        { icon: CheckSquare, label: 'Persetujuan Peminjaman', path: 'manajemen-peminjaman' },
        { icon: Eye, label: 'Monitoring Pengembalian', path: 'manajemen-pengembalian' },
        { icon: FileBarChart, label: 'Laporan', path: 'manajemen-laporan' },
    ],
    peminjam: [
        { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
        { icon: List, label: 'Daftar Alat', path: 'daftar-alat' },
        { icon: FileText, label: 'Peminjaman Saya', path: 'peminjaman-saya' },
        { icon: RotateCcw, label: 'Pengembalian', path: 'pengembalian' },
    ],
};

export function Sidebar({ name, role, currentPage, onNavigate }: SidebarProps) {
    const items = menuItems[role];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 flex justify-center">
                <div className="rounded-lg flex items-center justify-center overflow-hidden">
                    <img src={simpa} alt="Logo" className="w-24 h-24 object-contain" />
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.path;

                        return (
                            <li key={item.path}>
                                <button
                                    onClick={() => onNavigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
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
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
