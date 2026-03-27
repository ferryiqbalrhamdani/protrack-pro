<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $companies = [
            ['name' => 'PT. Protrack Solusi Indonesia', 'status' => 'Active', 'address' => 'Jl. Jenderal Sudirman No. 1, Jakarta Pusat', 'phone' => '021-1234567', 'email' => 'info@protrack.co.id'],
            ['name' => 'PT. Teknologi Maju Bersama', 'status' => 'Active', 'address' => 'Gedung Cyber 2, Lt. 10, Jakarta Selatan', 'phone' => '021-7654321', 'email' => 'contact@techmaju.com'],
            ['name' => 'PT. Sumber Daya Mandiri', 'status' => 'Active', 'address' => 'Kawasan Industri Jababeka, Bekasi', 'phone' => '021-8889990', 'email' => 'hrd@sdm.id'],
        ];

        foreach ($companies as $company) {
            Company::updateOrCreate(['name' => $company['name']], $company);
        }
    }
}
