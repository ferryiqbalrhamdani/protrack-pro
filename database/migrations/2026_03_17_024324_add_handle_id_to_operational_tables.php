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
        Schema::table('billings', function (Blueprint $table) {
            $table->foreignId('handle_id')->nullable()->constrained('users')->onDelete('set null');
        });
        Schema::table('shippings', function (Blueprint $table) {
            $table->foreignId('handle_id')->nullable()->constrained('users')->onDelete('set null');
        });
        Schema::table('merchandisers', function (Blueprint $table) {
            $table->foreignId('handle_id')->nullable()->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('merchandisers', function (Blueprint $table) {
            $table->dropForeign(['handle_id']);
            $table->dropColumn('handle_id');
        });
        Schema::table('shippings', function (Blueprint $table) {
            $table->dropForeign(['handle_id']);
            $table->dropColumn('handle_id');
        });
        Schema::table('billings', function (Blueprint $table) {
            $table->dropForeign(['handle_id']);
            $table->dropColumn('handle_id');
        });
    }
};
