<?php

namespace Database\Seeders;

use App\Models\AuctionType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuctionTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ["id"=>1,"name"=>"LPSE","status"=>"Active"],
            ["id"=>2,"name"=>"e-Katalog","status"=>"Active"],
            ["id"=>3,"name"=>"Lelang Tertutup","status"=>"Active"],
            ["id"=>4,"name"=>"Penunjukan Langsung","status"=>"Active"],
            ["id"=>5,"name"=>"Tender Umum","status"=>"Active"],
            ["id"=>6,"name"=>"Seleksi Umum","status"=>"Active"],
            ["id"=>7,"name"=>"Tender Terbatas","status"=>"Active"],
            ["id"=>8,"name"=>"Seleksi Terbatas","status"=>"Active"],
            ["id"=>9,"name"=>"Pengadaan Langsung","status"=>"Active"],
            ["id"=>10,"name"=>"E-Purchasing","status"=>"Active"],
        ];

        foreach ($types as $type) {
            AuctionType::updateOrCreate(['id' => $type['id']], $type);
        }

        // Reset PostgreSQL sequence to avoid duplicate key errors on next insert
        DB::statement("SELECT setval('auction_types_id_seq', (SELECT MAX(id) FROM auction_types))");
    }
}
