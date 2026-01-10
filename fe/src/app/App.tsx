import { useState } from 'react';
import { AppProvider, useApp } from './lib/context';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from './components/ui/sonner';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageTools } from './pages/admin/ManageTools';
import { ManageCategories } from './pages/admin/ManageCategories';
import { DataBorrowings } from './pages/admin/DataBorrowings';
import { DataReturns } from './pages/admin/DataReturns';
import { ActivityLogs } from './pages/admin/ActivityLogs';

// Petugas Pages
import { PetugasDashboard } from './pages/petugas/Dashboard';
import { ApprovalBorrowings } from './pages/petugas/Approval';
import { MonitoringReturns } from './pages/petugas/Monitoring';
import { ScanQR } from './pages/petugas/ScanQR';
import { Reports } from './pages/petugas/Reports';

// Peminjam Pages
import { PeminjamDashboard } from './pages/peminjam/Dashboard';
import { ToolsList } from './pages/peminjam/ToolsList';
import { MyBorrowings } from './pages/peminjam/MyBorrowings';
import { PeminjamReturns } from './pages/peminjam/Returns';

// Shared Pages
import { NotificationsPage } from './pages/shared/Notifications';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { currentRole } = useApp();

  const renderPage = () => {
    // Dashboard berdasarkan role
    if (currentPage === 'dashboard') {
      if (currentRole === 'admin') return <AdminDashboard />;
      if (currentRole === 'petugas') return <PetugasDashboard />;
      if (currentRole === 'peminjam') return <PeminjamDashboard />;
    }

    switch (currentPage) {
      // Admin Routes
      case 'users':
        return <ManageUsers />;
      case 'tools':
        return <ManageTools />;
      case 'categories':
        return <ManageCategories />;
      case 'borrowings':
        return <DataBorrowings />;
      case 'returns':
        return currentRole === 'admin' ? <DataReturns /> : <PeminjamReturns />;
      case 'logs':
        return <ActivityLogs />;

      // Petugas Routes
      case 'approval':
        return <ApprovalBorrowings />;
      case 'monitoring':
        return <MonitoringReturns />;
      case 'scan':
        return <ScanQR />;
      case 'reports':
        return <Reports />;

      // Peminjam Routes
      case 'tools-list':
        return <ToolsList />;
      case 'my-borrowings':
        return <MyBorrowings />;

      // Shared Routes
      case 'notifications':
        return <NotificationsPage />;

      default:
        if (currentRole === 'admin') return <AdminDashboard />;
        if (currentRole === 'petugas') return <PetugasDashboard />;
        return <PeminjamDashboard />;
    }
  };

  return (
    <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}