<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'alat_unit_id',
        'status',
        'is_selected',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function alatUnit()
    {
        return $this->belongsTo(AlatUnit::class, 'alat_unit_id');
    }
}
