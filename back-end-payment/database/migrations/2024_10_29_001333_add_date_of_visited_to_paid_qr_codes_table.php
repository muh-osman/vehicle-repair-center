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
            $table->date('date_of_visited')->nullable(); // Add the new column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paid_qr_codes', function (Blueprint $table) {
            $table->dropColumn('date_of_visited'); // Remove the column if rolling back
        });
    }
};
