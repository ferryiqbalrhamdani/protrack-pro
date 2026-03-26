<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Traits\HandlesActivityLog;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    use HandlesActivityLog;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return inertia('MasterData/Agency', [
            'agencies' => Agency::query()
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

        $agency = Agency::create($validated);

        $this->logActivity('telah menambahkan instansi baru', 'Instansi', $agency->name, 'account_balance', 'text-emerald-500');

        return redirect()->back()->with('success', 'Instansi berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Agency $agency)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string|in:Active,Inactive',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
        ]);

        $agency->update($validated);

        if ($agency->wasChanged()) {
            $this->logActivity('telah memperbarui data instansi', 'Instansi', $agency->name, 'edit', 'text-amber-500');
        }

        return redirect()->back()->with('success', 'Instansi berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Agency $agency)
    {
        $this->logActivity('telah menghapus instansi', 'Instansi', $agency->name, 'delete', 'text-rose-500');

        $agency->delete();

        return redirect()->back()->with('success', 'Instansi berhasil dihapus.');
    }
}
