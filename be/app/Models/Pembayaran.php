<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    protected $table = 'pembayaran';

    protected $fillable = [
        'peminjaman_id',
        'user_id',
        'jumlah',
        'status',
        'metode',
        'xendit_invoice_id',
        'xendit_invoice_url',
        'expired_at',
        'bukti_transfer',
        'confirmed_by',
        'confirmed_at',
        'catatan',
    ];

    protected $casts = [
        'expired_at'   => 'datetime',
        'confirmed_at' => 'datetime',
        'jumlah'       => 'decimal:2',
    ];

    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'peminjaman_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
