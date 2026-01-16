<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alat extends Model
{
    protected $table = 'alat';

    protected $fillable = [
        'id_kategori',
        'nama_alat',
        'kode_alat',
        'deskripsi',
        'foto_alat',
        'jumlah_tersedia',
        'jumlah_dipinjam',
        'kondisi',
        'lokasi',
        'harga',
        'batas_peminjaman',
    ];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori');
    }

    public function detailPeminjaman()
    {
        return $this->hasMany(DetailPeminjaman::class, 'id_alat');
    }
}
