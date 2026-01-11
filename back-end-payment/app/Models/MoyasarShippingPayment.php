<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoyasarShippingPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'name',
        'reportNumber',
        'model',
        'modelCategory',
        'plateNumber',
        'from',
        'to',
        'shippingType',
        'price',
        'phoneNumber',
        'status',
        'isShipped',
        'accountant_status',
        'note',
    ];
}
