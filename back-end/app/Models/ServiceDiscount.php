<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceDiscount extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'service_name_ar',
        'discount_value',
        'discount_unit',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}
