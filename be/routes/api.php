<?php

use App\Http\Controllers\AlatController;
use App\Http\Controllers\AlatUnitController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\MeController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PeminjamanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::get('/list-kategori', [KategoriController::class, 'kategoriForUserWithoutLogin']);
Route::get('/list-alat', [AlatController::class, 'getListAlatForUserWithoudLogin']);
Route::get('/detail-alat/{id}', [AlatController::class, 'showWithoutLogin']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/alat-populer', [AlatController::class, 'getAlatPopuler']);

// Webhook - tanpa auth middleware!
Route::post('/webhook/xendit', [PembayaranController::class, 'webhook']);

// Log routes
Route::get('/logs', [LogController::class, 'index'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    // Me
    Route::get('/me', [MeController::class, 'me']);
    Route::put('/me', [MeController::class, 'update']);
    Route::put('/me/password', [MeController::class, 'changePassword']);

    // User
    Route::apiResource('users', UserController::class);

    // Kategori
    Route::apiResource('kategori', KategoriController::class);

    // Alat
    Route::apiResource('alat', AlatController::class);

    // Unit Alat
    Route::prefix('alat/{alat}')->group(function () {
        Route::get('/units', [AlatUnitController::class, 'index']);
        Route::post('/units', [AlatUnitController::class, 'store']);
    });

    Route::put('/units/{unit}', [AlatUnitController::class, 'update']);
    Route::delete('/units/{unit}', [AlatUnitController::class, 'destroy']);

    // Peminjam
    Route::post('/peminjaman', [PeminjamanController::class, 'ajukan']);
    Route::get('/peminjaman/saya', [PeminjamanController::class, 'saya']);
    Route::get('/detail-peminjaman/{id}', [PeminjamanController::class, 'detailPeminjam']);
    Route::post('/peminjaman/{id}/ajukan-pengembalian', [PeminjamanController::class, 'ajukanPengembalian']);

    // Petugas
    Route::get('/peminjaman', [PeminjamanController::class, 'index']);
    Route::post('/peminjaman/{id}/setujui', [PeminjamanController::class, 'setujui']);
    Route::post('/peminjaman/{id}/tolak', [PeminjamanController::class, 'tolak']);
    Route::post('/peminjaman/{id}/konfirmasi-pengembalian', [PeminjamanController::class, 'konfirmasiPengembalian']);
    Route::patch('/peminjaman/{id}/lihat', [PeminjamanController::class, 'lihat']);
    Route::get('/peminjaman/{id}/detail-petugas', [PeminjamanController::class, 'detailPetugas']);

    // Admin
    Route::delete('/peminjaman/{id}', [PeminjamanController::class, 'destroy']);
    Route::get('/alat-unit/cari-kode/{kode}', [AlatUnitController::class, 'cariByKode']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::patch('/cart/items/{itemId}/select', [CartController::class, 'selectItem']);
    Route::post('/cart/checkout', [CartController::class, 'checkout']);

    // CartItem
    Route::patch('/cart-item/{itemId}', [CartItemController::class, 'update']);
    Route::delete('/cart-item/{itemId}', [CartItemController::class, 'destroy']);
    Route::get('/cart-item/{itemId}', [CartItemController::class, 'show']);
    Route::post('/cart-item/checkout/{cartId}', [CartItemController::class, 'checkout']);

    // Dashboard Analytics
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/petugas', [DashboardController::class, 'petugas']);

    // Peminjam
    Route::post('/peminjaman/{id}/buat-invoice', [PembayaranController::class, 'buatInvoice']);
    Route::get('/peminjaman/{id}/pembayaran', [PembayaranController::class, 'show']);

    // Petugas
    Route::post('/peminjaman/{id}/konfirmasi-manual', [PembayaranController::class, 'konfirmasiManual']);
    Route::get('/peminjaman/laporan', [PeminjamanController::class, 'laporanPdf']);

    Route::get('/banners/all', [BannerController::class, 'indexAdmin']);
    Route::post('/banners', [BannerController::class, 'store']);
    Route::post('/banners/{banner}', [BannerController::class, 'update']); // POST karena ada file upload
    Route::delete('/banners/{banner}', [BannerController::class, 'destroy']);
});
