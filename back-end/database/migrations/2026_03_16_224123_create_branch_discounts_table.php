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
        Schema::create('branch_discounts', function (Blueprint $table) {
            $table->id();
            $table->string('branch_name')->unique();
            $table->decimal('discount_percent', 5, 2); // e.g. 99.99%
            $table->unsignedInteger('scan_count')->default(0);
            $table->date('valid_until');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_discounts');
    }
};
