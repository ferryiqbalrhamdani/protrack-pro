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
            [
                'name' => 'Lokal (Indonesia)',
                'certifications' => ['TKDN', 'BMP', 'SNI', 'Postel', 'Halal']
            ],
            [
                'name' => 'Luar Negeri / Impor',
                'certifications' => ['CE', 'FCC', 'UL', 'RoHS', 'ISO 9001', 'ISO 27001']
            ],
        ];

        foreach ($origins as $origin) {
            $brandOrigin = BrandOrigin::updateOrCreate(['name' => $origin['name']], [
                'name' => $origin['name']
            ]);

            foreach ($origin['certifications'] as $certName) {
                Certification::updateOrCreate([
                    'brand_origin_id' => $brandOrigin->id,
                    'name' => $certName
                ], [
                    'brand_origin_id' => $brandOrigin->id,
                    'name' => $certName
                ]);
            }
        }
    }
}
