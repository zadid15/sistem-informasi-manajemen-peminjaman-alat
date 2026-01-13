<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alat extends Model
{
    protected $table = 'alat';

    protected $fillable = [
        'kategori_id',
        'nama_alat',
        'kode_alat',
        'deskripsi',
        'foto_alat',
        'jumlah_tersedia',
        'jumlah_dipinjam',
        'kondisi',
    ];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'kategori_id');
    }
}
