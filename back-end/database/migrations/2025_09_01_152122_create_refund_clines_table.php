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
        Schema::create('refund_clines', function (Blueprint $table) {
            $table->id();
            $table->string('report_number')->unique();
            $table->decimal('amount', 15, 2); // Assuming monetary amount with 2 decimal places
            $table->date('inspection_date');
            $table->string('url');
            $table->string('random_number');

            // Nullable fields
            $table->string('name')->nullable();
            $table->string('id_number')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('iban')->nullable();
            $table->date('signature_date')->nullable();
            $table->string('signature')->nullable(); // Using text for potential base64 or longer signature data

            $table->timestamps(); // Adds created_at and updated_at columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refund_clines');
    }
};
