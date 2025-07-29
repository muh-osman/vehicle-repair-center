<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disclaimer extends Model
{
    use HasFactory;

    protected $fillable = [
        'plate_letter1',
        'plate_letter2',
        'plate_letter3',
        'plate_number',
        'car_type',
        'report_number',
        'name',
        'signature',
    ];
}
