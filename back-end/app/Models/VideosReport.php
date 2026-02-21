<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VideosReport extends Model
{
    use HasFactory;

    protected $table = 'videos_reports'; // optional but clear

    protected $fillable = [
        'report_number',
    ];

    public function videos()
    {
        return $this->hasMany(VideosInspection::class, 'videos_report_id');
    }
}
