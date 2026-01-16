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
        Schema::create('peminjaman', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_user')
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('received_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->date('tanggal_pinjam')->nullable();
            $table->date('tanggal_kembali')->nullable();

            $table->string('kondisi_sebelum')->nullable();
            $table->string('kondisi_sesudah')->nullable();

            $table->string('foto_sebelum')->nullable();
            $table->string('foto_sesudah')->nullable();

            $table->enum('status', [
                'diajukan',
                'ditolak',
                'dipinjam',
                'menunggu_konfirmasi_pengembalian',
                'dikembalikan',
                'dikembalikan_rusak'
            ])->default('diajukan');

            $table->date('rencana_pengembalian');

            $table->text('catatan')->nullable();
            $table->text('alasan_penolakan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjaman');
    }
};
