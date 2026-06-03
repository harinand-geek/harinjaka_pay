<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->nullable();
            $table->string('ip_hash')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('device_type')->nullable(); // mobile, desktop, tablet
            $table->string('browser')->nullable();
            $table->string('platform')->nullable();
            $table->string('country')->nullable();
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->string('referrer')->nullable();
            $table->timestamp('visited_at')->nullable();
            $table->timestamps();

            $table->index('session_id');
            $table->index('visited_at');
            $table->index('device_type');
            $table->index('country');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
