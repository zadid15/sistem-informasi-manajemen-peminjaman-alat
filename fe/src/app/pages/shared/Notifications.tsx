import { useState } from 'react';
import { Bell, Check, CheckCheck, Filter } from 'lucide-react';
import { useApp } from '../../lib/context';
import type { Notification } from '../../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { cn } from '../../components/ui/utils';

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread' | 'peminjaman' | 'pengembalian' | 'system'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const typeColors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const categoryLabels = {
    peminjaman: 'Peminjaman',
    pengembalian: 'Pengembalian',
    system: 'Sistem',
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="w-4 h-4 mr-2" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Belum Dibaca</p>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Peminjaman</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => n.category === 'peminjaman').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pengembalian</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => n.category === 'pengembalian').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Notifikasi</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filter:</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Semua
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Belum Dibaca ({unreadCount})
            </Button>
            <Button
              variant={filter === 'peminjaman' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('peminjaman')}
            >
              Peminjaman
            </Button>
            <Button
              variant={filter === 'pengembalian' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pengembalian')}
            >
              Pengembalian
            </Button>
            <Button
              variant={filter === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('system')}
            >
              Sistem
            </Button>
          </div>

          {filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Tidak ada notifikasi"
              description={
                filter === 'unread'
                  ? 'Semua notifikasi sudah dibaca'
                  : 'Belum ada notifikasi di kategori ini'
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'border rounded-lg p-4 transition-all cursor-pointer',
                    !notification.isRead
                      ? 'bg-blue-50 border-blue-200 hover:shadow-md'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  )}
                >
                  <div className="flex gap-4">
                    {/* Type Indicator */}
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                        typeColors[notification.type]
                      )}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={cn(
                                'text-sm font-medium',
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              )}
                            >
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <Badge variant="default" className="bg-blue-600 text-xs px-2 py-0">
                                Baru
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[notification.category]}
                          </Badge>
                        </div>

                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Tandai dibaca"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <p
                        className={cn(
                          'text-sm mb-2',
                          !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                        )}
                      >
                        {notification.message}
                      </p>

                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
