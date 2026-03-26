<?php

namespace App\Http\Controllers;

use App\Models\AuctionType;
use App\Traits\HandlesActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuctionTypeController extends Controller
{
    use HandlesActivityLog;

    public function index(Request $request)
    {
        return Inertia::render('MasterData/AuctionType', [
            'auctionTypes' => AuctionType::query()
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
            'status' => 'required|string',
        ]);

        $auctionType = AuctionType::create($validated);

        $this->logActivity('telah menambahkan jenis lelang baru', 'Jenis Lelang', $auctionType->name, 'gavel', 'text-emerald-500');

        return redirect()->back()->with('success', 'Jenis Lelang berhasil ditambahkan.');
    }

    public function update(Request $request, AuctionType $auctionType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string',
        ]);

        $auctionType->update($validated);

        if ($auctionType->wasChanged()) {
            $this->logActivity('telah memperbarui data jenis lelang', 'Jenis Lelang', $auctionType->name, 'edit', 'text-amber-500');
        }

        return redirect()->back()->with('success', 'Jenis Lelang berhasil diperbarui.');
    }

    public function destroy(AuctionType $auctionType)
    {
        $this->logActivity('telah menghapus jenis lelang', 'Jenis Lelang', $auctionType->name, 'delete', 'text-rose-500');

        $auctionType->delete();

        return redirect()->back()->with('success', 'Jenis Lelang berhasil dihapus.');
    }
}
