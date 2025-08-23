<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FreeOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone_number',
        'is_scanned',
        'discount_percent',
    ];
}
