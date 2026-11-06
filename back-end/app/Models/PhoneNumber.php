<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhoneNumber extends Model
{
    use HasFactory;

    protected $fillable = [
        'accepted_phone_number',
        'is_accept_terms',
        'special_code',
    ];

    protected $casts = [
        'is_accept_terms' => 'boolean',
    ];
}
