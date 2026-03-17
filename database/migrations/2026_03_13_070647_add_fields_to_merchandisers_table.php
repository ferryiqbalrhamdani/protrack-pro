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
            // Tab 1: Informasi Kontrak (Payment Info & Target)
            $table->string('bank_name')->nullable()->after('project_id');
            $table->string('account_number')->nullable()->after('bank_name');
            $table->string('account_name')->nullable()->after('account_number');
            $table->bigInteger('contract_item')->default(0)->after('account_name');
            $table->bigInteger('contract_ea')->default(0)->after('contract_item');

            // Tab 3: Shipping Summary (Calculated/Inputted)
            $table->bigInteger('prod_item')->default(0)->after('contract_ea');
            $table->bigInteger('prod_ea')->default(0)->after('prod_item');
            $table->date('prod_etd')->nullable()->after('prod_ea');
            
            $table->bigInteger('ship_item')->default(0)->after('prod_etd');
            $table->bigInteger('ship_ea')->default(0)->after('ship_item');
            $table->date('ship_etd')->nullable()->after('ship_ea');
            
            $table->bigInteger('stock_item')->default(0)->after('ship_etd');
            $table->bigInteger('stock_ea')->default(0)->after('stock_item');
            
            $table->bigInteger('rec_item')->default(0)->after('stock_ea');
            $table->bigInteger('rec_ea')->default(0)->after('rec_item');

            // Update status default if needed (the plan said "In Progress" in the logic, but migration had "Ongoing")
            $table->string('status')->default('Ongoing')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('merchandisers', function (Blueprint $table) {
            $table->dropColumn([
                'bank_name', 'account_number', 'account_name', 'contract_item', 'contract_ea',
                'prod_item', 'prod_ea', 'prod_etd', 'ship_item', 'ship_ea', 'ship_etd',
                'stock_item', 'stock_ea', 'rec_item', 'rec_ea'
            ]);
            $table->string('status')->default('Ongoing')->change();
        });
    }
};
