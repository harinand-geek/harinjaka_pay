<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_methods', function (Blueprint $table) {
            // Path (on the "public" disk) of an admin-uploaded logo that
            // overrides the built-in Lucide icon for this wallet.
            $table->string('logo_path')->nullable()->after('icon');
        });
    }

    public function down(): void
    {
        Schema::table('payment_methods', function (Blueprint $table) {
            $table->dropColumn('logo_path');
        });
    }
};
