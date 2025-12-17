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
        Schema::table('moyasar_shipping_payments', function (Blueprint $table) {
            $table->boolean('accountant_status')->default(false)->after('isShipped');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('moyasar_shipping_payments', function (Blueprint $table) {
            //
        });
    }
};
