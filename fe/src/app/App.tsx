import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./lib/context";
import { Toaster } from "./components/ui/sonner";

// Pages
import Login from "./pages/auth/Login";

// Admin Pages
import { AdminDashboard } from "./pages/admin/Dashboard";
import { ManageUsers } from "./pages/admin/ManageUsers";

// Petugas Pages
import { PetugasDashboard } from "./pages/petugas/Dashboard";

// Peminjam Pages
import { PeminjamDashboard } from "./pages/peminjam/Dashboard";

// Shared Components
import { MainLayout } from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <MainLayout currentPage="dashboard" onNavigate={() => { }}>
                  <Routes>
                    <Route path="" element={<AdminDashboard />} />
                    <Route path="users" element={<ManageUsers />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Petugas */}
          <Route
            path="/petugas/*"
            element={
              <ProtectedRoute role="petugas">
                <MainLayout currentPage="dashboard" onNavigate={() => { }}>
                  <Routes>
                    <Route path="" element={<PetugasDashboard />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Peminjam */}
          <Route
            path="/peminjam/*"
            element={
              <ProtectedRoute role="peminjam">
                <MainLayout currentPage="dashboard" onNavigate={() => { }}>
                  <Routes>
                    <Route path="" element={<PeminjamDashboard />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}