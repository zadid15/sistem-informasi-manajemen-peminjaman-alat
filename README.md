# 📦 Sistem Informasi Managemen Peminjaman Alat (SIMPA)

Aplikasi **Sistem Informasi Managemen Peminjaman Alat (SIMPA)** merupakan **Web Application** yang dibuat sebagai bagian dari **Uji Kompetensi Keahlian (UKK)**. Aplikasi ini dirancang untuk membantu proses peminjaman dan pengembalian alat secara **terstruktur, terdokumentasi, dan berbasis role pengguna**.

---

## 🎯 Tujuan Proyek
- Memenuhi kebutuhan **Uji Kompetensi Keahlian (UKK)**
- Menerapkan konsep **CRUD, autentikasi, dan role-based access control**
- Mengimplementasikan alur peminjaman alat secara digital
- Meningkatkan efisiensi pencatatan dan monitoring alat

---

## 👤 Role Pengguna
Aplikasi memiliki **3 level pengguna** dengan hak akses berbeda:

### 1️⃣ Admin
- Mengelola data master sistem
- Memantau seluruh aktivitas aplikasi

### 2️⃣ Petugas
- Menyetujui peminjaman
- Memantau dan mencatat pengembalian
- Mencetak laporan

### 3️⃣ Peminjam
- Melihat daftar alat
- Mengajukan peminjaman
- Mengembalikan alat

---

## ✨ Fitur Utama

### 🔐 Admin
- CRUD User
- CRUD Alat
- CRUD Kategori
- CRUD Data Peminjaman
- CRUD Data Pengembalian
- Log Aktivitas
- Generate & kelola QR Code alat
- Notifikasi sistem

### 🛠️ Petugas
- Menyetujui / Menolak peminjaman
- Monitoring pengembalian alat
- Scan QR Code peminjaman & pengembalian
- Mencetak laporan (PDF / Excel)
- Menerima notifikasi

### 👨‍🎓 Peminjam
- Melihat daftar alat
- Mengajukan peminjaman
- Mengembalikan alat
- Melihat QR Code alat yang dipinjam
- Menerima notifikasi status peminjaman

---

## 📷 Fitur QR Code
- QR Code unik untuk setiap alat
- QR Code transaksi peminjaman
- Digunakan saat serah terima alat
- Mendukung proses scan melalui kamera

---

## 🔔 Fitur Notifikasi
- Pengajuan peminjaman baru
- Status peminjaman (Disetujui / Ditolak)
- Pengingat jatuh tempo pengembalian
- Konfirmasi pengembalian

---

## 🧱 Teknologi yang Digunakan
- Frontend : HTML, CSS, JavaScript
- Backend  : (Disesuaikan dengan implementasi)
- Database : MySQL / PostgreSQL
- Design   : Figma
- Version Control : Git & GitHub

---

## 📂 Struktur Fitur Aplikasi
- Dashboard
- Manajemen User
- Manajemen Alat
- Manajemen Kategori
- Peminjaman
- Pengembalian
- Laporan
- Log Aktivitas
- Notifikasi
- Scan QR Code

---

## 🚀 Cara Menjalankan Proyek

Struktur repository menggunakan **1 repository dengan 2 folder utama (Frontend & Backend)**.

```bash
nama-repository/
├── frontend/   # React + TypeScript
└── backend/    # Laravel
```

### 1️⃣ Clone Repository
```bash
git clone https://github.com/zadid15/sistem-managemen-informasi-peminjaman-alat.git
cd sistem-managemen-informasi-peminjaman-alat
```

---

### 2️⃣ Menjalankan Frontend (React + TypeScript)
```bash
cd fe
npm install
npm run dev

---

### 3️⃣ Menjalankan Backend (Laravel)
```bash
cd be
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

---

### 4️⃣ Konfigurasi Tambahan
- Pastikan database sudah dibuat
- Atur koneksi database di file `.env`
- Sesuaikan endpoint API frontend ke backend

---

## 📌 Catatan UKK
- Proyek ini dibuat untuk keperluan **Uji Kompetensi Keahlian (UKK)**
- Fokus pada penerapan fitur CRUD, alur sistem, dan UI/UX
- Seluruh desain dan fitur disesuaikan dengan standar penilaian UKK

---

## 👨‍💻 Developer
- Nama   : Muhammad Zadid
- Jurusan: Rekayasa Perangkat Lunak 
- Tahun  : 2026