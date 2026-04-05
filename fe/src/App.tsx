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

// Petugas Pages
import PetugasDashboardPage from './pages/petugas/PetugasDashboardPage'

// Peminjam Pages
import LogManagementPage from './pages/admin/LogManagementPage'
import { Toaster } from 'sonner'
import SettingPage from './pages/SettingPage'
import { EquipmentListPage } from './pages/landing/EquipmentListPage'
import { LandingPage } from './pages/landing/Root'
import HomePage from './pages/landing/HomePage'
import { HowToBorrowPage } from './pages/landing/HowToBorrowPage'
import { AboutPage } from './pages/landing/AboutPage'
import { EquipmentDetailPage } from './pages/landing/EquipmentDetailPage'
import { BorrowRequestPage } from './pages/landing/BorrowRequestPage'
import BorrowingListPage from './pages/landing/BorrowingListPage'
import BorrowingDetailPage from './pages/landing/BorrowingDetailPage'
import CartPage from './pages/landing/CartPage'
import SubmitLoanRequestPage from './pages/landing/SubmitLoanRequestPage'
import SettingUserPage from './pages/landing/SettingUserPage'
import BorrowingManagementPage from './pages/petugas/BorrowingManagementPage'
import UnitManagementPage from './pages/admin/UnitManagementPage'
import BorrowingDetailPetugasPage from './pages/petugas/BorrowingDetailPetugasPage'
import BannerManagementPage from './pages/admin/BannerManagementPage'
import ScanQRPage from './pages/admin/ScanQRPage'
import PeminjamRoute from './components/PeminjamRoute'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/list-peralatan" replace />} />

          <Route element={<PeminjamRoute />}>
            <Route element={<LandingPage />}>
              <Route path="home" element={<HomePage />} />
              <Route path="list-peralatan" element={<EquipmentListPage />} />
              <Route path="cara-peminjaman" element={<HowToBorrowPage />} />
              <Route path="tentang-kami" element={<AboutPage />} />
              <Route path="detail-alat/:id" element={<EquipmentDetailPage />} />
              <Route path="form-peminjaman/:id/:unitId" element={<BorrowRequestPage />} />
              <Route path="list-peminjaman" element={<BorrowingListPage />} />
              <Route path="detail-peminjaman/:id" element={<BorrowingDetailPage />} />
              <Route path="keranjang" element={<CartPage />} />
              <Route path="submit-peminjaman" element={<SubmitLoanRequestPage />} />
              <Route path="settings" element={<SettingUserPage />} />
              <Route path='*' element={<NotFoundPage />} key='not-found' />
            </Route>
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
            <Route path="manajemen-alat/:id/unit" element={<LayoutWrapper><UnitManagementPage /></LayoutWrapper>} />
            <Route path="manajemen-kategori" element={<LayoutWrapper><CategoryManagementPage /></LayoutWrapper>} />
            <Route path="manajemen-banner" element={<LayoutWrapper><BannerManagementPage /></LayoutWrapper>} />
            <Route path="manajemen-log" element={<LayoutWrapper><LogManagementPage /></LayoutWrapper>} />
            <Route path="scan-qr" element={<LayoutWrapper><ScanQRPage /></LayoutWrapper>} />
          </Route>

          {/* Petugas Pages */}
          <Route path="/petugas" element={<PrivateRoute requiredRole="petugas" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LayoutWrapper><PetugasDashboardPage /></LayoutWrapper>} />
            <Route path="pengaturan" element={<LayoutWrapper><SettingPage /></LayoutWrapper>} />
            <Route path="manajemen-peminjaman" element={<LayoutWrapper><BorrowingManagementPage /></LayoutWrapper>} />
            <Route path="peminjaman/:id" element={<LayoutWrapper><BorrowingDetailPetugasPage /></LayoutWrapper>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  )
}