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
        Schema::create('paid_qr_codes', function (Blueprint $table) {
            $table->id();
            $table->string('paid_qr_code')->unique();
            $table->string('full_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('plan')->nullable();
            $table->string('branch')->nullable();
            $table->decimal('price', 10, 2)->nullable(); // Changed to decimal for monetary value
            $table->string('model')->nullable();
            $table->string('year')->nullable();
            $table->string('additionalServices')->nullable();
            $table->string('service')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paid_qr_codes');
    }
};
