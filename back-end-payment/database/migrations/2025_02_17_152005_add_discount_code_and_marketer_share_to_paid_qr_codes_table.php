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
            $table->string('discountCode')->nullable(); // Add discountCode column
            $table->decimal('marketerShare', 10, 2)->nullable(); // Add marketerShare column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paid_qr_codes', function (Blueprint $table) {
            $table->dropColumn('discountCode'); // Drop discountCode column
            $table->dropColumn('marketerShare'); // Drop marketerShare column
        });
    }
};
