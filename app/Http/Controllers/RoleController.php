<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();
        
        return Inertia::render('MasterData/RolePermission', [
            'roles' => $roles,
            'permissions' => $permissions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array'
        ]);

        $role = Role::create(['name' => $validated['name']]);
        
        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->back()->with('success', 'Role baru berhasil ditambahkan');
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions' => 'nullable|array'
        ]);

        $role->update(['name' => $validated['name']]);
        
        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        } else {
            $role->syncPermissions([]);
        }

        return redirect()->back()->with('success', 'Role berhasil diperbarui');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'Super Admin') {
            return redirect()->back()->with('error', 'Role Super Admin tidak dapat dihapus');
        }
        
        $role->delete();
        return redirect()->back()->with('success', 'Role berhasil dihapus');
    }
}
