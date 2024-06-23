<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarModel extends Model
{
    use HasFactory;

    protected $fillable = ['model_name', 'manufacturer_id'];

    public function manufacturer()
    {
        return $this->belongsTo(Manufacturer::class);
    }

    public function yearsOfManufacture()
    {
        return $this->hasMany(YearOfManufacture::class);
    }

    public function prices()
    {
        return $this->hasMany(Price::class);
    }
}
