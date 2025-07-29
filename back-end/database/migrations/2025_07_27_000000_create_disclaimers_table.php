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
        Schema::create('disclaimers', function (Blueprint $table) {
            $table->id();
            $table->string('plate_letter1');
            $table->string('plate_letter2');
            $table->string('plate_letter3');
            $table->string('plate_number');
            $table->string('car_type');
            $table->string('report_number')->unique();
            $table->string('name');
            $table->string('signature');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disclaimers');
    }
};
