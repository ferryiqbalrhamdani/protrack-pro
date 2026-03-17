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
        Schema::table('contracts', function (Blueprint $table) {
            $table->foreignId('handle_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('jamlak')->nullable();
            $table->decimal('jamlak_nominal', 20, 2)->default(0);
            $table->string('jamuka')->nullable();
            $table->decimal('jamuka_nominal', 20, 2)->default(0);
            $table->string('jamwar')->nullable();
            $table->decimal('jamwar_nominal', 20, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropForeign(['handle_id']);
            $table->dropColumn(['handle_id', 'jamlak', 'jamlak_nominal', 'jamuka', 'jamuka_nominal', 'jamwar', 'jamwar_nominal']);
        });
    }
};
