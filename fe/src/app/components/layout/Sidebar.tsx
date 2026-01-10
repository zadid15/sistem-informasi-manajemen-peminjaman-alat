import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  FileText,
  RotateCcw,
  Activity,
  Bell,
  CheckSquare,
  Eye,
  QrCode,
  FileBarChart,
  List,
  UserCircle,
} from 'lucide-react';
import { cn } from '../ui/utils';
import type { UserRole } from '../../lib/types';
import { useApp } from '../../lib/context';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

interface SidebarProps {
  role: UserRole;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems: Record<UserRole, MenuItem[]> = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: Users, label: 'Manajemen User', path: 'users' },
    { icon: Package, label: 'Manajemen Alat', path: 'tools' },
    { icon: FolderTree, label: 'Manajemen Kategori', path: 'categories' },
    { icon: FileText, label: 'Data Peminjaman', path: 'borrowings' },
    { icon: RotateCcw, label: 'Data Pengembalian', path: 'returns' },
    { icon: Activity, label: 'Log Aktivitas', path: 'logs' },
    { icon: Bell, label: 'Notifikasi', path: 'notifications' },
  ],
  petugas: [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: CheckSquare, label: 'Persetujuan Peminjaman', path: 'approval' },
    { icon: Eye, label: 'Monitoring Pengembalian', path: 'monitoring' },
    { icon: QrCode, label: 'Scan QR', path: 'scan' },
    { icon: FileBarChart, label: 'Laporan', path: 'reports' },
    { icon: Bell, label: 'Notifikasi', path: 'notifications' },
  ],
  peminjam: [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: List, label: 'Daftar Alat', path: 'tools-list' },
    { icon: FileText, label: 'Peminjaman Saya', path: 'my-borrowings' },
    { icon: RotateCcw, label: 'Pengembalian', path: 'returns' },
    { icon: Bell, label: 'Notifikasi', path: 'notifications' },
  ],
};

export function Sidebar({ role, currentPage, onNavigate }: SidebarProps) {
  const { currentUser, unreadCount } = useApp();
  const items = menuItems[role];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">SIM-PA</h1>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.path;
            const badge = item.path === 'notifications' ? unreadCount : item.badge;

            return (
              <li key={item.path}>
                <button
                  onClick={() => onNavigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {badge && badge > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
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
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}