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
        Schema::create('mojaz_orders', function (Blueprint $table) {
            $table->id();
            $table->string('lookup_type')->default('sequence'); // 'sequence' or 'vin'
            $table->string('lookup_value');                    // the actual seq or VIN
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->foreignId('user_id')->nullable();
            $table->string('main_report_number')->nullable(); // shown to user as their reference
            $table->string('payment_id')->unique();            // Moyasar payment ID
            $table->decimal('amount', 10, 2);
            $table->string('mojaz_request_id')->nullable();    // returned by Mojaz
            $table->string('pdf_path')->nullable();            // relative path under public storage
            $table->enum('status', ['paid', 'processing', 'ready', 'failed'])->default('paid');
            $table->text('failure_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mojaz_orders');
    }
};
