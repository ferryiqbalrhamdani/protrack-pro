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
        // Tab 2: Purchase Orders
        Schema::create('merchandiser_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchandiser_id')->constrained()->onDelete('cascade');
            $table->foreignId('vendor_id')->nullable()->constrained()->onDelete('set null'); // Linked to vendors table
            $table->string('supplier_name_manual')->nullable(); // Fallback if vendor not in DB
            $table->string('po_number');
            $table->bigInteger('item_count')->default(0);
            $table->bigInteger('ea_count')->default(0);
            $table->timestamps();
        });

        // Tab 2: PO Invoices
        Schema::create('merchandiser_po_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchandiser_po_id')->constrained()->onDelete('cascade');
            $table->string('invoice_number');
            $table->date('invoice_date');
            $table->bigInteger('item_count')->default(0);
            $table->bigInteger('ea_count')->default(0);
            $table->string('status')->default('Pending');
            $table->timestamps();
        });

        // Tab 4: Supporting Files
        Schema::create('merchandiser_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchandiser_id')->constrained()->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->bigInteger('file_size');
            $table->string('mime_type')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merchandiser_files');
        Schema::dropIfExists('merchandiser_po_invoices');
        Schema::dropIfExists('merchandiser_pos');
    }
};
