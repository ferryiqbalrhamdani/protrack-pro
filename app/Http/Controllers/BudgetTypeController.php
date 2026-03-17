<?php

namespace App\Http\Controllers;

use App\Models\BudgetType;
use App\Traits\HandlesActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetTypeController extends Controller
{
    use HandlesActivityLog;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Inertia::render('MasterData/BudgetType', [
            'budgetTypes' => BudgetType::query()
                ->when($request->input('search'), function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%");
                })
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string',
        ]);

        $budgetType = BudgetType::create($validated);

        $this->logActivity('telah menambahkan jenis anggaran baru', 'Jenis Anggaran', $budgetType->name, 'payments', 'text-emerald-500');

        return redirect()->back()->with('success', 'Jenis Anggaran berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BudgetType $budgetType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|string',
        ]);

        $budgetType->update($validated);

        $this->logActivity('telah memperbarui data jenis anggaran', 'Jenis Anggaran', $budgetType->name, 'edit', 'text-amber-500');

        return redirect()->back()->with('success', 'Jenis Anggaran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BudgetType $budgetType)
    {
        $this->logActivity('telah menghapus jenis anggaran', 'Jenis Anggaran', $budgetType->name, 'delete', 'text-rose-500');

        $budgetType->delete();

        return redirect()->back()->with('success', 'Jenis Anggaran berhasil dihapus.');
    }
}
