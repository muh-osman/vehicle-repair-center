<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LotteryEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'discount_percent',
        'is_discount_used',
        'query_params'
    ];
}
