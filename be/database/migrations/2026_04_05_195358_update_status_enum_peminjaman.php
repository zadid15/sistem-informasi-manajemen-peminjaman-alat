<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE peminjaman MODIFY COLUMN status ENUM(
        'terkirim',
        'menunggu_konfirmasi',
        'disetujui',
        'ditolak',
        'dipinjam',
        'menunggu_pengambilan_alat',
        'pengembalian_diajukan',
        'menunggu_pembayaran',
        'dikembalikan',
        'dikembalikan_terlambat'
    ) NOT NULL DEFAULT 'terkirim'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
