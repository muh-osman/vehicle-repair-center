<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\VisitorInfo;
use Illuminate\Support\Carbon;

class DeleteOldVisitorInfo extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'visitor-info:delete-old';

    /**
     * The console command description.
     */
    protected $description = 'Delete visitor info records older than 24 hours';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $cutoffTime = Carbon::now()->subDay();
        $deletedCount = VisitorInfo::where('created_at', '<', $cutoffTime)->delete();

        $this->info("Successfully deleted {$deletedCount} old visitor records.");

        // Optional logging
        logger()->channel('daily')->info(
            'Visitor info cleanup: Deleted ' . $deletedCount . ' records',
            ['cutoff_time' => $cutoffTime]
        );
    }
}
