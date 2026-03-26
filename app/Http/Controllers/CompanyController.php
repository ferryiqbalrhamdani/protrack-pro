<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Traits\HandlesActivityLog;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    use HandlesActivityLog;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return inertia('MasterData/Company', [
            'companies' => Company::query()
                ->when($request->input('search'), function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('address', 'like', "%{$search}%");
                })
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string|in:Active,Inactive',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
        ]);

        $company = Company::create($validated);

        $this->logActivity('telah menambahkan perusahaan baru', 'Perusahaan', $company->name, 'business', 'text-emerald-500');

        return redirect()->back()->with('success', 'Perusahaan berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string|in:Active,Inactive',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
        ]);

        $company->update($validated);

        if ($company->wasChanged()) {
            $this->logActivity('telah memperbarui data perusahaan', 'Perusahaan', $company->name, 'edit', 'text-amber-500');
        }

        return redirect()->back()->with('success', 'Perusahaan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        $this->logActivity('telah menghapus perusahaan', 'Perusahaan', $company->name, 'delete', 'text-rose-500');
        
        $company->delete();

        return redirect()->back()->with('success', 'Perusahaan berhasil dihapus.');
    }
}
