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
        Schema::create('billing_basts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billing_id')->constrained()->onDelete('cascade');
            $table->string('no_bast');
            $table->date('tgl_bast');
            $table->timestamps();
        });

        Schema::create('billing_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billing_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('type'); // DP, Termin, Pelunasan, 100%
            $table->boolean('completed')->default(false);
            $table->timestamps();
        });

        Schema::create('billing_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billing_id')->constrained()->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size'); // in bytes
            $table->string('file_type')->nullable(); // mime type or extension
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_files');
        Schema::dropIfExists('billing_items');
        Schema::dropIfExists('billing_basts');
    }
};
