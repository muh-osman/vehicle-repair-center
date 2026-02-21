<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VideosInspection extends Model
{
    use HasFactory;

    protected $table = 'videos_inspection'; // 👈 REQUIRED

    protected $fillable = [
        'videos_report_id',
        'video_path',
        'video_type',
        'employee_name'
    ];

    public function report()
    {
        return $this->belongsTo(VideosReport::class, 'videos_report_id');
    }
}
