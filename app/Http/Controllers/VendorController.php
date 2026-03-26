<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Traits\HandlesActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    use HandlesActivityLog;

    public function index(Request $request)
    {
        return Inertia::render('MasterData/Vendor', [
            'vendors' => Vendor::query()
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
        ]);

        $vendor = Vendor::create($validated);

        $this->logActivity('telah menambahkan vendor baru', 'Vendor', $vendor->name, 'store', 'text-emerald-500');

        return redirect()->back()->with('success', 'Vendor berhasil ditambahkan.');
    }

    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
        ]);

        $vendor->update($validated);

        if ($vendor->wasChanged()) {
            $this->logActivity('telah memperbarui data vendor', 'Vendor', $vendor->name, 'edit', 'text-amber-500');
        }

        return redirect()->back()->with('success', 'Vendor berhasil diperbarui.');
    }

    public function destroy(Vendor $vendor)
    {
        $this->logActivity('telah menghapus vendor', 'Vendor', $vendor->name, 'delete', 'text-rose-500');

        $vendor->delete();

        return redirect()->back()->with('success', 'Vendor berhasil dihapus.');
    }
}
