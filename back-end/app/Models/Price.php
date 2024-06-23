<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Price extends Model
{
    use HasFactory;

    protected $fillable = ['car_model_id', 'year_id', 'service_id', 'price'];

    public function carModel()
    {
        return $this->belongsTo(CarModel::class);
    }

    public function yearOfManufacture()
    {
        return $this->belongsTo(YearOfManufacture::class, 'year_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
