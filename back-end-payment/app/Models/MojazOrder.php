<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MojazOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'lookup_type',
        'lookup_value',
        'name',
        'email',
        'phone',
        'user_id',
        'main_report_number',
        'payment_id',
        'amount',
        'mojaz_request_id',
        'pdf_path',
        'status',
        'failure_reason',
    ];
}
