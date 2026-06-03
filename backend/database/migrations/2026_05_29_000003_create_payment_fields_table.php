<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_method_id')
                ->constrained('payment_methods')
                ->cascadeOnDelete();
            $table->string('label');
            $table->string('value');
            $table->string('copy_value')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['payment_method_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_fields');
    }
};
