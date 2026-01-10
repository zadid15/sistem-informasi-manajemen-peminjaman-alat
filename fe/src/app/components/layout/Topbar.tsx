import { useState } from 'react';
import { Bell, Search, Check, ChevronDown } from 'lucide-react';
import { useApp } from '../../lib/context';
import type { UserRole } from '../../lib/types';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';

interface TopbarProps {
  onNavigate: (page: string) => void;
}

export function Topbar({ onNavigate }: TopbarProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, currentRole, setCurrentRole } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      const page = link.split('/').pop() || 'dashboard';
      onNavigate(page);
    }
    setShowNotifications(false);
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'petugas', label: 'Petugas' },
    { value: 'peminjam', label: 'Peminjam' },
  ];

  const currentRoleLabel = roles.find(r => r.value === currentRole)?.label || 'Admin';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari alat, peminjam, atau kategori..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Role Switcher (Demo Only) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitch(!showRoleSwitch)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span>Role: {currentRoleLabel}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showRoleSwitch && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleSwitch(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => {
                        setCurrentRole(role.value);
                        setShowRoleSwitch(false);
                        onNavigate('dashboard');
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors',
                        currentRole === role.value && 'bg-blue-50 text-blue-700 font-medium'
                      )}
                    >
                      {role.label}
                      {currentRole === role.value && (
                        <Check className="inline-block w-4 h-4 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAllAsRead();
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Tandai Semua Dibaca
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.slice(0, 10).map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification.id, notification.link)}
                            className={cn(
                              'w-full p-4 text-left hover:bg-gray-50 transition-colors',
                              !notification.isRead && 'bg-blue-50'
                            )}
                          >
                            <div className="flex gap-3">
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                                  notification.type === 'success' && 'bg-green-500',
                                  notification.type === 'warning' && 'bg-yellow-500',
                                  notification.type === 'error' && 'bg-red-500',
                                  notification.type === 'info' && 'bg-blue-500'
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className="font-medium text-sm text-gray-900">
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <Badge variant="default" className="bg-blue-600 text-xs px-2 py-0">
                                      Baru
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(notification.createdAt).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          onNavigate('notifications');
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Lihat Semua Notifikasi
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
