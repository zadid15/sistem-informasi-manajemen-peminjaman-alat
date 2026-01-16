<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailPeminjaman extends Model
{
    //
    protected $table = 'detail_peminjaman';
    protected $fillable = [
        'id_peminjaman',
        'id_alat',
        'jumlah',
        'total_denda',
    ];

    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'id_peminjaman');
    }
    public function alat()
    {
        return $this->belongsTo(Alat::class, 'id_alat');
    }
}
