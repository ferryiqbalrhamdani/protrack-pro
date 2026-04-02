<?php

namespace Database\Seeders;

use App\Models\BudgetType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BudgetTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ["id"=>1,"name"=>"PDN","status"=>"Active"],
            ["id"=>2,"name"=>"PLN","status"=>"Active"],
            ["id"=>3,"name"=>"Capim","status"=>"Active"],
            ["id"=>4,"name"=>"Automatic Adjustment","status"=>"Active"],
            ["id"=>5,"name"=>"Prioritas","status"=>"Active"],
            ["id"=>6,"name"=>"APBN-KM","status"=>"Active"],
            ["id"=>7,"name"=>"APBN-P","status"=>"Active"],
            ["id"=>8,"name"=>"Optimalisasi","status"=>"Active"],
            ["id"=>9,"name"=>"Rutin","status"=>"Active"],
            ["id"=>10,"name"=>"APBN","status"=>"Active"],
            ["id"=>11,"name"=>"APBD","status"=>"Active"],
            ["id"=>12,"name"=>"PHLN","status"=>"Active"],
            ["id"=>13,"name"=>"BUMN","status"=>"Active"],
            ["id"=>14,"name"=>"Swasta","status"=>"Active"],
        ];

        foreach ($types as $type) {
            BudgetType::updateOrCreate(['id' => $type['id']], $type);
        }

        // Reset PostgreSQL sequence to avoid duplicate key errors on next insert
        DB::statement("SELECT setval('budget_types_id_seq', (SELECT MAX(id) FROM budget_types))");
    }
}
