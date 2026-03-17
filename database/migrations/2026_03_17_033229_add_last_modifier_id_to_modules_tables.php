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
        Schema::table('merchandisers', function (Blueprint $table) {
            $table->foreignId('last_modifier_id')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::table('billings', function (Blueprint $table) {
            $table->foreignId('last_modifier_id')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::table('shippings', function (Blueprint $table) {
            $table->foreignId('last_modifier_id')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('merchandisers', function (Blueprint $table) {
            $table->dropForeign(['last_modifier_id']);
            $table->dropColumn('last_modifier_id');
        });

        Schema::table('billings', function (Blueprint $table) {
            $table->dropForeign(['last_modifier_id']);
            $table->dropColumn('last_modifier_id');
        });

        Schema::table('shippings', function (Blueprint $table) {
            $table->dropForeign(['last_modifier_id']);
            $table->dropColumn('last_modifier_id');
        });
    }
};
