<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Permissions for Menus
        $permissions = [
            'view_dashboard',
            'view_projects',
            'view_contracts',
            'view_merchandiser',
            'view_billing',
            'view_shipping',
            'view_reports',
            'view_master_data',
            'view_master_company',
            'view_master_agency',
            'view_master_vendor',
            'view_master_auction_type',
            'view_master_budget_type',
            'view_master_brand_origin',
            'manage_users_roles'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Super Admin role if it doesn't exist
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        // Super admin already has all permissions via Gate::before overriding
    }
}

