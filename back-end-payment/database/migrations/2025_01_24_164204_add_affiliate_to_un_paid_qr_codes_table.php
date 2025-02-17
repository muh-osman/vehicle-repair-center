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
        Schema::table('un_paid_qr_codes', function (Blueprint $table) {
            $table->string('affiliate')->nullable(); // Add the affiliate column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('un_paid_qr_codes', function (Blueprint $table) {
            $table->dropColumn('affiliate'); // Drop the affiliate column
        });
    }
};
