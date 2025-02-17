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
        Schema::table('tabby_paid_clients', function (Blueprint $table) {
            $table->string('affiliate')->nullable(); // Add the new column here
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tabby_paid_clients', function (Blueprint $table) {
            $table->dropColumn('affiliate'); // Drop the column if rolling back
        });
    }
};
