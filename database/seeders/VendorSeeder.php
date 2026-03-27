<?php

namespace Database\Seeders;

use App\Models\Vendor;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = [
            ["id" => 2, "name" => "Jasutama Karya Mandiri", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 3, "name" => "PT. Nadin Aerovia Dirgantara", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 4, "name" => "PT. Mulia Knitting Factory", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 5, "name" => "PT. Maju Gemilang Garmen", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 6, "name" => "PT. Primarindo Infrastrukture (Tomkins)", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 7, "name" => "PT. Foximas Mandiri", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 8, "name" => "Airbus", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 9, "name" => "NTP", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 10, "name" => "Segers", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 11, "name" => "Vista Maritim", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 13, "name" => "T&T Aviation Services PTE LTD", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 14, "name" => "Conotech", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 15, "name" => "Mapalad", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 16, "name" => "CAPITOL ARC", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 17, "name" => "GLOBAL CAPITOL", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 18, "name" => "LISTERA", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 19, "name" => "Belleville", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 20, "name" => "ALPHA INDUSTRIES", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 21, "name" => "MILKO BEVERAGE", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 22, "name" => "BERKAT PANGAN ABADI", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 23, "name" => "PANCA TEDJA", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 24, "name" => "RUNDOLF ENGINEERING", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 25, "name" => "Hydraulics International", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 26, "name" => "GLOBAL VISTA", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 27, "name" => "PNR Trading", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
        ];

        foreach ($vendors as $vendor) {
            Vendor::updateOrCreate(['id' => $vendor['id']], $vendor);
        }
    }
}
