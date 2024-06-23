<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class YearOfManufacture extends Model
{
    use HasFactory;

    protected $fillable = ['year'];


    public function carModel()
    {
        return $this->belongsTo(CarModel::class);
    }

    public function prices()
    {
        return $this->hasMany(Price::class);
    }
}
