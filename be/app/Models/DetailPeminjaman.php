<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailPeminjaman extends Model
{
    protected $table = 'detail_peminjaman';

    protected $fillable = [
        'id_peminjaman',
        'id_alat_unit',
        'total_denda',
        'kondisi_sebelum',
        'kondisi_sesudah',
        'foto_sebelum',
        'foto_sesudah',
    ];

    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'id_peminjaman');
    }

    public function alatUnit()
    {
        return $this->belongsTo(AlatUnit::class, 'id_alat_unit');
    }
}
