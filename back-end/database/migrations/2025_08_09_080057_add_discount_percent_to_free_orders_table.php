<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('free_orders', function (Blueprint $table) {
            $table->decimal('discount_percent', 5, 2)->nullable()->after('is_scanned');
            // Using decimal(5,2) allows for values like 10.50 (for 10.5%)
            // ->nullable() makes the field optional
            // ->after('is_scanned') places the column after the is_scanned column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('free_orders', function (Blueprint $table) {
            //
        });
    }
};
