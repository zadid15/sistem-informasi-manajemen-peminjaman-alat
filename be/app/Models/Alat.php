<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alat extends Model
{
    protected $table = 'alat';

    protected $fillable = [
        'id_kategori',
        'nama_alat',
        'deskripsi',
        'foto_alat',
        'harga',
        'batas_peminjaman',
        'spesifikasi',
        'jumlah_unit',
    ];

    protected $casts = [
        'spesifikasi' => 'array'
    ];
    public function detailPeminjaman()
    {
        return $this->hasManyThrough(
            \App\Models\DetailPeminjaman::class,
            \App\Models\AlatUnit::class,
            'alat_id',
            'id_alat_unit'
        );
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori');
    }

    public function alatUnit()
    {
        return $this->hasMany(AlatUnit::class, 'alat_id');
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'alat_id');
    }
}
