<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FalakVideo extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_file_path'
    ];
}
