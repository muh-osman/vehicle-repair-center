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
        Schema::table('paid_qr_codes', function (Blueprint $table) {
            $table->boolean('is_sent_to_internal_system')->nullable()->default(false)->after('service');
        });

        // Set existing records to null (overrides the default for old rows)
        DB::table('paid_qr_codes')->update(['is_sent_to_internal_system' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paid_qr_codes', function (Blueprint $table) {
            $table->dropColumn('is_sent_to_internal_system');
        });
    }
};
