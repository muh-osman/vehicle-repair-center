<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchDiscount extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_name',
        'discount_percent',
        'scan_count',
        'valid_until',
    ];

    protected $casts = [
        'discount_percent' => 'decimal:2',
        'scan_count'       => 'integer',
        'valid_until'      => 'date',
    ];

    // Helper: check if discount is still valid
    public function isValid(): bool
    {
        return $this->valid_until->isFuture() || $this->valid_until->isToday();
    }

    // Helper: increment scan count
    public function incrementScan(): void
    {
        $this->increment('scan_count');
    }
}
