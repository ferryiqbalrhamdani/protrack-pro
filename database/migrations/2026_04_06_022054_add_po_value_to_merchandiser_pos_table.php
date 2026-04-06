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
        Schema::table('merchandiser_pos', function (Blueprint $table) {
            $table->decimal('po_value', 20, 2)->default(0)->after('ea_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('merchandiser_pos', function (Blueprint $table) {
            $table->dropColumn('po_value');
        });
    }
};
