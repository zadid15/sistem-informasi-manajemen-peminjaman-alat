<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('alat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_kategori')->constrained("kategori")->onDelete('cascade');
            $table->string('nama_alat');
            $table->string('kode_alat');
            $table->string('deskripsi');
            $table->string('foto_alat');
            $table->string('kondisi');
            $table->string('lokasi');
            $table->integer('harga');
            $table->integer('batas_peminjaman');
            $table->string('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alats');
    }
};
