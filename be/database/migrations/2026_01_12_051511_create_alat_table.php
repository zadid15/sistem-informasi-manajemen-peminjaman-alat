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
            $table->string('deskripsi')->nullable();
            $table->string('foto_alat')->nullable();
            $table->integer('harga')->nullable();
            $table->integer('batas_peminjaman')->nullable();
            $table->json('spesifikasi')->nullable();
            $table->string('jumlah_unit')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alat');
    }
};
