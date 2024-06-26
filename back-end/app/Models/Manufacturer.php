<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Manufacturer extends Model
{
    use HasFactory;

    protected $fillable = ['manufacture_name', 'country_id'];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }


    public function carModels()
    {
        return $this->hasMany(CarModel::class);
    }
}
