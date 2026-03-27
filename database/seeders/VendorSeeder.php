<?php

namespace Database\Seeders;

use App\Models\Vendor;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = [
            ['name' => 'PT. Global Network Solution', 'status' => 'Active', 'address' => 'Mega Kuningan Loft, Jakarta Selatan', 'phone' => '021-5551234', 'email' => 'sales@gns.co.id'],
            ['name' => 'PT. Data Center Indonesia', 'status' => 'Active', 'address' => 'Cibitung Industrial Estate, Bekasi', 'phone' => '021-4445678', 'email' => 'support@dci.id'],
            ['name' => 'PT. Solusi Integrasi Sistem', 'status' => 'Active', 'address' => 'Wisma 77, Slipi, Jakarta Barat', 'phone' => '021-3339087', 'email' => 'info@sis.com'],
            ['name' => 'PT. Cyber Security Indonesia', 'status' => 'Active', 'address' => 'Satrio Tower, Jakarta Selatan', 'phone' => '021-2228877', 'email' => 'hello@csi.web.id'],
        ];

        foreach ($vendors as $vendor) {
            Vendor::updateOrCreate(['name' => $vendor['name']], $vendor);
        }
    }
}
