<?php

namespace App\Http\Controllers;

use App\Models\BrandOrigin;
use App\Models\Certification;
use App\Traits\HandlesActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandOriginController extends Controller
{
    use HandlesActivityLog;

    public function index(Request $request)
    {
        return Inertia::render('MasterData/BrandOrigin', [
            'brandOrigins' => BrandOrigin::query()
                ->with('certifications')
                ->when($request->input('search'), function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%");
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
        ]);

        $brandOrigin = BrandOrigin::create($validated);

        $this->logActivity('telah menambahkan asal brand baru', 'Asal Brand', $brandOrigin->name, 'branding_watermark', 'text-emerald-500');

        return redirect()->back()->with('success', 'Asal Brand berhasil ditambahkan.');
    }

    public function update(Request $request, BrandOrigin $brandOrigin)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $brandOrigin->update($validated);

        if ($brandOrigin->wasChanged()) {
            $this->logActivity('telah memperbarui data asal brand', 'Asal Brand', $brandOrigin->name, 'edit', 'text-amber-500');
        }

        return redirect()->back()->with('success', 'Asal Brand berhasil diperbarui.');
    }

    public function destroy(BrandOrigin $brandOrigin)
    {
        $this->logActivity('telah menghapus asal brand', 'Asal Brand', $brandOrigin->name, 'delete', 'text-rose-500');

        $brandOrigin->delete();

        return redirect()->back()->with('success', 'Asal Brand berhasil dihapus.');
    }

    public function storeCertification(Request $request, BrandOrigin $brandOrigin)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $certification = $brandOrigin->certifications()->create($validated);

        $this->logActivity('telah menambahkan sertifikasi baru pada ' . $brandOrigin->name, 'Sertifikasi', $validated['name'], 'verified', 'text-emerald-500');

        return redirect()->back()->with('success', 'Sertifikasi berhasil ditambahkan.');
    }

    public function destroyCertification(Certification $certification)
    {
        $brandOrigin = $certification->brandOrigin;
        $brandOriginName = $brandOrigin ? $brandOrigin->name : 'N/A';
        
        $this->logActivity('telah menghapus sertifikasi dari ' . $brandOriginName, 'Sertifikasi', $certification->name, 'delete', 'text-rose-500');

        $certification->delete();

        return redirect()->back()->with('success', 'Sertifikasi berhasil dihapus.');
    }
}
