<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

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

        // Reset PostgreSQL sequence to avoid duplicate key errors on next insert
        DB::statement("SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies))");
    }
}
