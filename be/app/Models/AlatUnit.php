<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlatUnit extends Model
{
    //
    protected $table = 'alat_unit';
    protected $fillable = [
        'alat_id',
        'kode_unit',
        'kondisi',
        'status',
        'lokasi',
        'nomor_urut',
    ];

    public function alat()
    {
        return $this->belongsTo(Alat::class, 'alat_id');
    }
}
