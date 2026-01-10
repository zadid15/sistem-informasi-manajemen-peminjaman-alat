// Context untuk state global aplikasi
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserRole, User, Notification, Borrowing, Tool } from './types';
import { mockUsers, mockNotifications, mockBorrowings, mockTools, generateQRCode } from './mock-data';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  borrowings: Borrowing[];
  updateBorrowingStatus: (id: string, status: Borrowing['status'], reason?: string) => void;
  addBorrowing: (borrowing: Omit<Borrowing, 'id' | 'qrCode' | 'borrowerId' | 'borrowerName'>) => void;
  tools: Tool[];
  updateToolStatus: (id: string, status: Tool['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [borrowings, setBorrowings] = useState<Borrowing[]>(mockBorrowings);
  const [tools, setTools] = useState<Tool[]>(mockTools);

  // Get current user based on role
  const currentUser = mockUsers.find(u => u.role === currentRole) || mockUsers[0];

  // Filter notifications for current user
  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, isRead: true } : n))
    );
  };

  const addBorrowing = (borrowing: Omit<Borrowing, 'id' | 'qrCode' | 'borrowerId' | 'borrowerName'>) => {
    const tool = tools.find(t => t.id === borrowing.toolId);
    if (!tool) return;
    
    const newBorrowing: Borrowing = {
      ...borrowing,
      id: `${borrowings.length + 1}`,
      borrowerId: currentUser.id,
      borrowerName: currentUser.name,
      toolName: tool.name,
      toolCode: tool.code,
      qrCode: generateQRCode(`BORROWING-${borrowings.length + 1}`),
      status: 'pending',
    };
    setBorrowings(prev => [newBorrowing, ...prev]);
    
    // Add notification for petugas
    const petugasUsers = mockUsers.filter(u => u.role === 'petugas');
    petugasUsers.forEach(petugas => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${petugas.id}`,
        userId: petugas.id,
        title: 'Pengajuan Peminjaman Baru',
        message: `${currentUser.name} mengajukan peminjaman ${tool.name}`,
        type: 'info',
        category: 'peminjaman',
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/petugas/approval',
      };
      setNotifications(prev => [notification, ...prev]);
    });
  };

  const updateBorrowingStatus = (id: string, status: Borrowing['status'], reason?: string) => {
    setBorrowings(prev =>
      prev.map(b => {
        if (b.id === id) {
          const updated: Borrowing = { ...b, status };
          if (status === 'approved') {
            updated.approvedBy = currentUser.name;
            updated.approvedAt = new Date().toISOString();
          }
          if (status === 'rejected' && reason) {
            updated.rejectedReason = reason;
          }
          if (status === 'returned') {
            updated.returnDate = new Date().toISOString();
          }
          return updated;
        }
        return b;
      })
    );

    // Update tool status
    const borrowing = borrowings.find(b => b.id === id);
    if (borrowing) {
      if (status === 'approved') {
        updateToolStatus(borrowing.toolId, 'dipinjam');
      } else if (status === 'returned' || status === 'rejected') {
        updateToolStatus(borrowing.toolId, 'tersedia');
      }
    }
  };

  const updateToolStatus = (id: string, status: Tool['status']) => {
    setTools(prev =>
      prev.map(t => (t.id === id ? { ...t, status } : t))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        notifications: userNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        borrowings,
        updateBorrowingStatus,
        addBorrowing,
        tools,
        updateToolStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}