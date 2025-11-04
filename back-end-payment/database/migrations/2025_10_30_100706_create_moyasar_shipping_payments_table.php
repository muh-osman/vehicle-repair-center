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
        Schema::create('moyasar_shipping_payments', function (Blueprint $table) {
            $table->id();

            $table->string('payment_id');
            $table->string('name');
            $table->string('reportNumber');
            $table->string('model');
            $table->string('modelCategory');
            $table->string('plateNumber');
            $table->string('from');
            $table->string('to');
            $table->string('shippingType');
            $table->decimal('price', 10, 2);
            $table->string('phoneNumber');
            $table->string('status');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('moyasar_shipping_payments');
    }
};
