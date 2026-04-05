<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alat_unit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alat_id')->constrained('alat')->cascadeOnDelete();

            $table->unsignedInteger('nomor_urut'); // ← penting buat auto numbering
            $table->string('kode_unit')->unique();

            $table->enum('kondisi', ['Baik', 'Layak Pakai', 'Perlu Perawatan', 'Rusak Ringan', 'Rusak Berat', 'Dalam Servis', 'Tidak Layak Pakai'])->default('Baik');
            $table->enum('status', ['Tersedia', 'Dipinjam', 'Tidak Tersedia'])->default('Tersedia');
            $table->string('lokasi')->nullable();
            $table->string('qr_code')->nullable();

            $table->timestamps();

            // biar ga ada nomor_urut double dalam 1 alat
            $table->unique(['alat_id', 'nomor_urut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alat_unit');
    }
};
