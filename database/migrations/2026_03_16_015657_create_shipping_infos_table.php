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
        Schema::table('shippings', function (Blueprint $table) {
            if (!Schema::hasColumn('shippings', 'shipping_type')) {
                $table->string('shipping_type')->default('Lengkap')->after('status');
            }
            if (!Schema::hasColumn('shippings', 'shipping_date')) {
                $table->date('shipping_date')->nullable()->after('shipping_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('shippings', function (Blueprint $table) {
            $table->dropColumn(['shipping_type', 'shipping_date']);
        });
    }

};
