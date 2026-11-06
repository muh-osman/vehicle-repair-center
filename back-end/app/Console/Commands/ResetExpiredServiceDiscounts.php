<?php

namespace App\Console\Commands;

use App\Models\ServiceDiscount;
use Illuminate\Console\Command;

class ResetExpiredServiceDiscounts extends Command
{
    protected $signature = 'discounts:reset-expired';
    protected $description = 'Reset service discounts back to default once expires_at has passed';

    /**
     * Fixed default discounts — these never change.
     */
    protected array $defaults = [
        8  => ['value' => 10, 'unit' => '%'], // الشامل
        9  => ['value' => 0,  'unit' => '%'], // الأساسي
        10 => ['value' => 0,  'unit' => '%'], // المحركات
        15 => ['value' => 0,  'unit' => '%'], // المسافر
    ];

    public function handle(): int
    {
        $expired = ServiceDiscount::query()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->get();

        if ($expired->isEmpty()) {
            $this->info('No expired discounts found.');
            return self::SUCCESS;
        }

        foreach ($expired as $discount) {
            $default = $this->defaults[$discount->service_id] ?? null;

            if (!$default) {
                continue;
            }

            $discount->update([
                'discount_value' => $default['value'],
                'discount_unit'  => $default['unit'],
                'expires_at'     => null,
            ]);

            $this->info("Reset service_id {$discount->service_id} to {$default['value']}{$default['unit']}");
        }

        return self::SUCCESS;
    }
}
