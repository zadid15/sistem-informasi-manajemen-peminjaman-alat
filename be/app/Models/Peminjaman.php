<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Peminjaman extends Model
{
    //
    protected $table = 'peminjaman';

    protected $fillable = [
        'id_user',
        'approved_by',
        'received_by',
        'tanggal_pinjam',
        'tanggal_kembali',
        'kondisi_sebelum',
        'kondisi_sesudah',
        'status',
        'catatan',
        'alasan_penolakan',
        'rencana_pengembalian',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function detailPeminjaman(): HasMany
    {
        return $this->hasMany(
            DetailPeminjaman::class,
            'id_peminjaman',
            'id'
        );
    }
}
