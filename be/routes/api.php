<?php

use App\Http\Controllers\AlatController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\PeminjamanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Log routes
Route::get('/logs', [LogController::class, 'index'])->middleware('auth:sanctum');

// User routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
});
// Kategori routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('kategori', KategoriController::class);
});
// Alat routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('alat', AlatController::class);
});
// Peminjaman routes
Route::middleware('auth:sanctum')->group(function () {

    // =====================
    // PEMINJAM
    // =====================
    Route::post('/peminjaman', [PeminjamanController::class, 'ajukan']);
    Route::get('/peminjaman/saya', [PeminjamanController::class, 'saya']);
    Route::post('/peminjaman/{id}/ajukan_pengembalian', [PeminjamanController::class, 'ajukanPengembalian']);

    // =====================
    // PETUGAS
    // =====================
    Route::post('/peminjaman/{id}/setujui', [PeminjamanController::class, 'setujui']);
    Route::post('/peminjaman/{id}/tolak', [PeminjamanController::class, 'tolak']);
    Route::post('/peminjaman/{id}/konfirmasi_pengembalian', [PeminjamanController::class, 'konfirmasiPengembalian']);

    // =====================
    // ADMIN
    // =====================
    Route::get('/peminjaman', [PeminjamanController::class, 'index']);
    Route::delete('/peminjaman/{id}', [PeminjamanController::class, 'destroy']);
});
