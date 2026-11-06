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
        Schema::create('service_discounts', function (Blueprint $table) {
            $table->id();
            $table->integer('service_id')->unique(); // 8, 9, 10, 15
            $table->string('service_name_ar');                   // شامل, أساسي, محركات, المسافر
            $table->unsignedInteger('discount_value')->default(0); // whole numbers only: 20, 50, 100
            $table->enum('discount_unit', ['%', 'ريال'])->default('%');
            $table->boolean('is_active')->default(true);         // toggle per service
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_discounts');
    }
};
