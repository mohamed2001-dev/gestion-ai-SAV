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
        Schema::create('interventions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sav_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('technician_id')->constrained('users')->cascadeOnDelete();

            $table->date('intervention_date')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            $table->text('diagnosis')->nullable();
            $table->text('work_done')->nullable();
            $table->text('parts_used')->nullable();
            $table->text('technician_notes')->nullable();
            $table->text('ai_generated_report')->nullable();
            $table->text('final_report')->nullable();

            $table->enum('status', ['assigned', 'in_progress', 'completed', 'cancelled'])->default('assigned');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interventions');
    }
};
