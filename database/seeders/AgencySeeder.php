<?php

namespace Database\Seeders;

use App\Models\Agency;
use Illuminate\Database\Seeder;

class AgencySeeder extends Seeder
{
    public function run(): void
    {
        $agencies = [
            ["id"=>1,"name"=>"Polda","status"=>"Active","address"=>null,"phone"=>null,"email"=>null,"website"=>null],
            ["id"=>2,"name"=>"TNI AD","status"=>"Active","address"=>null,"phone"=>null,"email"=>null,"website"=>null],
            ["id"=>3,"name"=>"TNI AU","status"=>"Active","address"=>null,"phone"=>null,"email"=>null,"website"=>null],
            ["id"=>4,"name"=>"TNI AL","status"=>"Active","address"=>null,"phone"=>null,"email"=>null,"website"=>null],
            ["id"=>10,"name"=>"Kementerian Komunikasi dan Informatika","status"=>"Active","address"=>"Jl. Medan Merdeka Barat No. 9, Jakarta Pusat","phone"=>"021-3456789","email"=>"info@kominfo.go.id","website"=>null],
            ["id"=>11,"name"=>"Badan Siber dan Sandi Negara","status"=>"Active","address"=>"Jl. Harsono RM No. 70, Jakarta Selatan","phone"=>"021-7890123","email"=>"kontak@bssn.go.id","website"=>null],
            ["id"=>12,"name"=>"Pemerintah Provinsi DKI Jakarta","status"=>"Active","address"=>"Jl. Medan Merdeka Selatan No. 8-9, Jakarta Pusat","phone"=>"021-3822222","email"=>"dki@jakarta.go.id","website"=>null],
            ["id"=>13,"name"=>"Kementerian Pertahanan RI","status"=>"Active","address"=>"Jl. Medan Merdeka Barat No. 13-14, Jakarta Pusat","phone"=>"021-3810900","email"=>"info@kemhan.go.id","website"=>null],
        ];

        foreach ($agencies as $agency) {
            Agency::updateOrCreate(['id' => $agency['id']], $agency);
        }
    }
}
