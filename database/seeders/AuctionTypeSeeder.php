<?php

namespace Database\Seeders;

use App\Models\AuctionType;
use Illuminate\Database\Seeder;

class AuctionTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Tender Umum', 'status' => 'Active'],
            ['name' => 'Seleksi Umum', 'status' => 'Active'],
            ['name' => 'Tender Terbatas', 'status' => 'Active'],
            ['name' => 'Seleksi Terbatas', 'status' => 'Active'],
            ['name' => 'Pengadaan Langsung', 'status' => 'Active'],
            ['name' => 'Penunjukan Langsung', 'status' => 'Active'],
            ['name' => 'E-Purchasing', 'status' => 'Active'],
        ];

        foreach ($types as $type) {
            AuctionType::updateOrCreate(['name' => $type['name']], $type);
        }
    }
}
