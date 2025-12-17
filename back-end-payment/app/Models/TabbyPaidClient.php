<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TabbyPaidClient extends Model
{
    use HasFactory;

    protected $fillable = [
        'paid_qr_code',
        'full_name',
        'phone',
        'branch',
        'plan',
        'price',
        'model',
        'year',
        'additionalServices',
        'service',
        'date_of_visited',
        'affiliate',
        'discountCode',
        'marketerShare',
        'full_year',
        'clientId',
        'redeemeAmoumntValue',
        'isShipped',
        'address',
    ];
}
