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
        Schema::create('videos_inspection', function (Blueprint $table) {
            $table->id();
            $table->foreignId('videos_report_id')->constrained('videos_reports')->onDelete('cascade');
            $table->string('video_path');
            $table->string('video_type');
            $table->string('employee_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('videos_inspection');
    }
};
