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
        Schema::table('tamara_paid_clients', function (Blueprint $table) {
            $table->string('clientId')->nullable()->after('paid_qr_code');
            $table->decimal('redeemeAmoumntValue', 10, 2)->nullable()->after('clientId');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tamara_paid_clients', function (Blueprint $table) {
            //
        });
    }
};
