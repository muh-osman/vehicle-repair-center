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
            $table->boolean('is_sent_to_internal_system')
                ->nullable()
                ->default(false)
                ->after('service');
        });

        DB::table('tamara_paid_clients')->update(['is_sent_to_internal_system' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tamara_paid_clients', function (Blueprint $table) {
            $table->dropColumn('is_sent_to_internal_system');
        });
    }
};
