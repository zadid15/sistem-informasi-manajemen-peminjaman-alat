<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Peminjaman extends Model
{
    //
    protected $table = 'peminjaman';

    protected $fillable = [
        'id_user',
        'received_by',
        'tanggal_pinjam',
        'tanggal_kembali',
        'kondisi',
        'status',
        'catatan',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
