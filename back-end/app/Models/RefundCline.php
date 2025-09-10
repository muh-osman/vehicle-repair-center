<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RefundCline extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_number',
        'amount',
        'inspection_date',
        'url',
        'random_number',
        'name',
        'id_number',
        'phone_number',
        'bank_name',
        'iban',
        'signature_date',
        'signature'
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'signature_date' => 'date',
        'amount' => 'decimal:2'
    ];
}
