<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $companies = [
            ["id" => 1, "name" => "PT. Mitra Harapan Abadi", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 2, "name" => "PT. Mitra Sembada Mulia", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
            ["id" => 3, "name" => "PT. Murni Tunasa Unggul", "status" => "Active", "address" => null, "phone" => null, "email" => null, "website" => null],
        ];

        foreach ($companies as $company) {
            Company::updateOrCreate(['id' => $company['id']], $company);
        }
    }
}
