// Types untuk Sistem Peminjaman Alat

export type UserRole = 'admin' | 'petugas' | 'peminjam';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  totalItems: number;
}

export interface Tool {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  condition: 'baik' | 'rusak-ringan' | 'rusak-berat';
  status: 'tersedia' | 'dipinjam' | 'maintenance';
  image?: string;
  qrCode: string;
  location?: string;
  createdAt: string;
}

export interface Borrowing {
  id: string;
  borrowerId: string;
  borrowerName: string;
  toolId: string;
  toolName: string;
  toolCode: string;
  qrCode: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'returned' | 'overdue';
  purpose: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'peminjaman' | 'pengembalian' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
  timestamp: string;
}
