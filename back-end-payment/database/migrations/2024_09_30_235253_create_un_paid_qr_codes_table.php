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
        Schema::create('un_paid_qr_codes', function (Blueprint $table) {
            $table->id();
            $table->string('un_paid_qr_code')->unique();
            $table->string('full_name');
            $table->string('phone');
            $table->string('plan');
            $table->string('branch');
            $table->decimal('price', 10, 2); // Changed to decimal for monetary value
            $table->string('model');
            $table->string('year');
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
        Schema::dropIfExists('un_paid_qr_codes');
    }
};
