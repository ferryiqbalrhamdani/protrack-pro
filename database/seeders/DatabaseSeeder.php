<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            CompanySeeder::class,
            AgencySeeder::class,
            VendorSeeder::class,
            AuctionTypeSeeder::class,
            BudgetTypeSeeder::class,
            BrandOriginSeeder::class,
        ]);

        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Super Admin',
                'email' => null,
                'password' => \Illuminate\Support\Facades\Hash::make('121232'),
            ]
        );

        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Super Admin']);
        
        if (!$admin->hasRole('Super Admin')) {
            $admin->assignRole($role);
        }

        // Reset PostgreSQL sequence to avoid duplicate key errors on next insert
        DB::statement("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
    }
}
