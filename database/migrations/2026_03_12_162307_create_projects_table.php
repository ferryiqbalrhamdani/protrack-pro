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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            // Tab 1: Informasi Proyek
            $table->string('name');
            $table->string('up_no')->unique();
            $table->foreignId('auction_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('agency_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('budget_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('pic_id')->constrained('users')->onDelete('cascade');
            $table->year('budget_year');
            $table->text('description')->nullable();

            // Tab 2: Legalitas & Detail
            $table->enum('tax_free', ['Iya', 'Tidak'])->default('Tidak');
            $table->enum('tax_doc', ['SKTD', 'SKB'])->nullable();
            $table->foreignId('brand_origin_id')->constrained()->onDelete('cascade');
            $table->string('payment_term')->default('Tidak ada DP');
            $table->string('warranty')->default('Tidak');

            // Tab 3: Kontrak & Finansial
            $table->string('contract_no')->nullable();
            $table->decimal('contract_value', 20, 2)->default(0);
            $table->date('contract_date')->nullable();
            $table->date('due_date')->nullable();

            // Status & Progress
            $table->string('status')->default('Ongoing');
            $table->integer('progress')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
