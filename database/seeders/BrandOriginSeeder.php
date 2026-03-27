<?php

namespace Database\Seeders;

use App\Models\BrandOrigin;
use App\Models\Certification;
use Illuminate\Database\Seeder;

class BrandOriginSeeder extends Seeder
{
    public function run(): void
    {
        $origins = [
            ["id" => 1, "name" => "Lokal"],
            ["id" => 2, "name" => "Import"],
        ];

        foreach ($origins as $origin) {
            BrandOrigin::updateOrCreate(['id' => $origin['id']], ['name' => $origin['name']]);
        }

        $certifications = [
            ["id" => 1, "brand_origin_id" => 1, "name" => "TKDNLITBAG"],
            ["id" => 2, "brand_origin_id" => 1, "name" => "TKDN"],
            ["id" => 3, "brand_origin_id" => 1, "name" => "Sertifikat Keaslian Produksi"],
            ["id" => 4, "brand_origin_id" => 1, "name" => "Sertifikat Keaslian Produk"],
            ["id" => 5, "brand_origin_id" => 2, "name" => "COC"],
            ["id" => 6, "brand_origin_id" => 2, "name" => "COO"],
            ["id" => 7, "brand_origin_id" => 2, "name" => "COM"],
            ["id" => 8, "brand_origin_id" => 2, "name" => "ARC"],
        ];

        foreach ($certifications as $cert) {
            Certification::updateOrCreate(['id' => $cert['id']], $cert);
        }
    }
}
