<?php

use App\Models\Peminjaman;
use App\Models\Log;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {

    $affected = Peminjaman::where('status', 'diajukan')
        ->whereDate('tanggal_pinjam', '<', now()->toDateString())
        ->update([
            'status' => 'ditolak',
            'alasan_penolakan' => 'Ditolak otomatis karena melewati tanggal pinjam'
        ]);

    if ($affected > 0) {
        Log::create([
            'aktor' => 'sistem',
            'aktivitas' => "Menolak otomatis {$affected} peminjaman yang melewati tanggal pinjam.",
        ]);
    }
})->daily();
