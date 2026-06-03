<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_method_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_method_id')
                ->constrained('payment_methods')
                ->cascadeOnDelete();
            $table->string('session_id')->nullable();
            $table->string('event_type'); // view_method, copy_field, copy_all
            $table->string('field_label')->nullable();
            $table->string('ip_hash')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['payment_method_id', 'event_type']);
            $table->index('event_type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_method_events');
    }
};
