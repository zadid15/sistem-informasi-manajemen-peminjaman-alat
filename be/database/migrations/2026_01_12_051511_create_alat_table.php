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
            $table->foreignId('kategori_id')->constrained("kategori")->onDelete('cascade');
            $table->string('nama_alat');
            $table->string('kode_alat');
            $table->string('deskripsi');
            $table->string('foto_alat');
            $table->integer('jumlah_tersedia');
            $table->integer('jumlah_dipinjam');
            $table->string('kondisi');
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
