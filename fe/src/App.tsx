import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

// Components
import PublicRoute from './components/PublicRoute'

// Pages
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import PrivateRoute from './components/PrivateRoute'
import LayoutWrapper from './components/LayoutWrapper'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import ToolManagementPage from './pages/admin/ToolManagementPage'
import CategoryManagementPage from './pages/admin/CategoryManagementPage'
import BorrowingManagementPage from './pages/admin/BorrowingManagementPage'

// Petugas Pages
import PetugasDashboardPage from './pages/petugas/PetugasDashboardPage'

// Peminjam Pages
import PeminjamDashboardPage from './pages/peminjam/PeminjamDashboardPage'
import ReturnManagementPage from './pages/admin/ReturnManagementPage'
import LogManagementPage from './pages/admin/LogManagementPage'
import ReportManagementPage from './pages/petugas/ReportManagementPage'
import ToolListPage from './pages/peminjam/ToolListPage'
import MyBorrowingsPage from './pages/peminjam/MyBorrowingsPage'
import { Toaster } from 'sonner'
import SettingPage from './pages/SettingPage'
import { EquipmentListPage } from './pages/landing/EquipmentListPage'
import { LandingPage } from './pages/landing/Root'
import HomePage from './pages/landing/HomePage'
import { HowToBorrowPage } from './pages/landing/HowToBorrowPage'
import { AboutPage } from './pages/landing/AboutPage'
import { EquipmentDetailPage } from './pages/landing/EquipmentDetailPage'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route element={<LandingPage />}>
            <Route path="home" element={<HomePage />} />
            <Route path="list-peralatan" element={<EquipmentListPage />} />
            <Route path="cara-peminjaman" element={<HowToBorrowPage />} />
            <Route path="tentang-kami" element={<AboutPage />} />
            <Route path="detail-alat/:id"  element={<EquipmentDetailPage />} />
          </Route>

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Admin Pages */}
          <Route path="/admin" element={<PrivateRoute requiredRole="admin" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LayoutWrapper><AdminDashboardPage /></LayoutWrapper>} />
            <Route path="pengaturan" element={<LayoutWrapper><SettingPage /></LayoutWrapper>} />
            <Route path="manajemen-user" element={<LayoutWrapper><UserManagementPage /></LayoutWrapper>} />
            <Route path="manajemen-alat" element={<LayoutWrapper><ToolManagementPage /></LayoutWrapper>} />
            <Route path="manajemen-kategori" element={<LayoutWrapper><CategoryManagementPage /></LayoutWrapper>} />
            <Route path="manajemen-peminjaman" element={<LayoutWrapper><BorrowingManagementPage /></LayoutWrapper>} />
            <Route path="manajemen-pengembalian" element={<LayoutWrapper><ReturnManagementPage /></LayoutWrapper>} />
            <Route path="manajemen-log" element={<LayoutWrapper><LogManagementPage /></LayoutWrapper>} />
          </Route>

          {/* Petugas Pages */}
          <Route path="/petugas" element={<PrivateRoute requiredRole="petugas" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LayoutWrapper><PetugasDashboardPage /></LayoutWrapper>} />
            <Route path="manajemen-peminjaman" element={<LayoutWrapper><BorrowingManagementPage /></LayoutWrapper>} />
            <Route path="manajemen-pengembalian" element={<LayoutWrapper><ReturnManagementPage /></LayoutWrapper>} />
            <Route path="manajemen-laporan" element={<LayoutWrapper><ReportManagementPage /></LayoutWrapper>} />
          </Route>

          {/* Peminjam Pages */}
          <Route path="/peminjam" element={<PrivateRoute requiredRole="peminjam" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LayoutWrapper><PeminjamDashboardPage /></LayoutWrapper>} />
            <Route path="daftar-alat" element={<LayoutWrapper><ToolListPage /></LayoutWrapper>} />
            <Route path="peminjaman-saya" element={<LayoutWrapper><MyBorrowingsPage /></LayoutWrapper>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  )
}