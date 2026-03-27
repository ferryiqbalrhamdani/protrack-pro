<?php

namespace Database\Seeders;

use App\Models\BudgetType;
use Illuminate\Database\Seeder;

class BudgetTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'APBN', 'status' => 'Active'],
            ['name' => 'APBD', 'status' => 'Active'],
            ['name' => 'PHLN', 'status' => 'Active'],
            ['name' => 'BUMN', 'status' => 'Active'],
            ['name' => 'Swasta', 'status' => 'Active'],
        ];

        foreach ($types as $type) {
            BudgetType::updateOrCreate(['name' => $type['name']], $type);
        }
    }
}
