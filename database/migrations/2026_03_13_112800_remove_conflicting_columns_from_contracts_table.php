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
        $columnsToDrop = [];
        if (Schema::hasColumn('contracts', 'no_kontrak')) $columnsToDrop[] = 'no_kontrak';
        if (Schema::hasColumn('contracts', 'tahun_anggaran')) $columnsToDrop[] = 'tahun_anggaran';
        if (Schema::hasColumn('contracts', 'steps')) $columnsToDrop[] = 'steps';

        if (!empty($columnsToDrop)) {
            Schema::table('contracts', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (!Schema::hasColumn('contracts', 'no_kontrak')) {
                $table->string('no_kontrak')->nullable();
            }
            if (!Schema::hasColumn('contracts', 'tahun_anggaran')) {
                $table->string('tahun_anggaran')->nullable();
            }
            if (!Schema::hasColumn('contracts', 'steps')) {
                $table->text('steps')->nullable();
            }
        });
    }

};
