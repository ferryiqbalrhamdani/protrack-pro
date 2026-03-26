<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Company;
use App\Models\Agency;
use App\Models\Vendor;
use App\Models\AuctionType;
use App\Models\BudgetType;
use App\Models\BrandOrigin;
use App\Support\Hashid;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->get('q', '');
        if (strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $user = $request->user();
        $isAdmin = $user->username === 'admin' || $user->role === 'Admin';
        $userPermissions = $user->getAllPermissions()->pluck('name')->toArray();

        $hasPermission = function ($perm) use ($isAdmin, $userPermissions) {
            return $isAdmin || in_array($perm, $userPermissions);
        };

        $results = [];

        // Projects
        if ($hasPermission('view_projects')) {
            $projects = Project::where('name', 'ilike', "%{$q}%")
                ->orWhere('contract_no', 'ilike', "%{$q}%")
                ->orWhere('up_no', 'ilike', "%{$q}%")
                ->limit(5)
                ->get();

            foreach ($projects as $p) {
                $hid = Hashid::encode($p->id);
                $results[] = [
                    'category' => 'Project',
                    'icon' => 'business_center',
                    'color' => 'blue',
                    'title' => $p->name,
                    'subtitle' => collect([$p->up_no ? "UP: {$p->up_no}" : null, $p->contract_no ? "Kontrak: {$p->contract_no}" : null])->filter()->implode(' | '),
                    'url' => route('projects.edit', $p->id),
                ];
            }
        }

        // Contracts (search via projects)
        if ($hasPermission('view_contracts')) {
            $contractProjects = Project::with('contract')
                ->whereHas('contract')
                ->where(function ($query) use ($q) {
                    $query->where('name', 'ilike', "%{$q}%")
                        ->orWhere('contract_no', 'ilike', "%{$q}%")
                        ->orWhere('up_no', 'ilike', "%{$q}%");
                })
                ->limit(5)
                ->get();

            foreach ($contractProjects as $p) {
                $hid = Hashid::encode($p->id);
                $results[] = [
                    'category' => 'Kontrak',
                    'icon' => 'description',
                    'color' => 'amber',
                    'title' => $p->name,
                    'subtitle' => collect([$p->up_no ? "UP: {$p->up_no}" : null, $p->contract_no ? "Kontrak: {$p->contract_no}" : null])->filter()->implode(' | '),
                    'url' => route('contracts.edit', $hid),
                ];
            }
        }

        // Merchandiser
        if ($hasPermission('view_merchandiser')) {
            $merchProjects = Project::with('merchandiser')
                ->whereHas('merchandiser')
                ->where(function ($query) use ($q) {
                    $query->where('name', 'ilike', "%{$q}%")
                        ->orWhere('contract_no', 'ilike', "%{$q}%")
                        ->orWhere('up_no', 'ilike', "%{$q}%");
                })
                ->limit(5)
                ->get();

            foreach ($merchProjects as $p) {
                $hid = Hashid::encode($p->id);
                $results[] = [
                    'category' => 'Merchandiser',
                    'icon' => 'storefront',
                    'color' => 'purple',
                    'title' => $p->name,
                    'subtitle' => collect([$p->up_no ? "UP: {$p->up_no}" : null, $p->contract_no ? "Kontrak: {$p->contract_no}" : null])->filter()->implode(' | '),
                    'url' => route('merchandiser.edit', $hid),
                ];
            }
        }

        // Billing
        if ($hasPermission('view_billing')) {
            $billingProjects = Project::with('billing')
                ->whereHas('billing')
                ->where(function ($query) use ($q) {
                    $query->where('name', 'ilike', "%{$q}%")
                        ->orWhere('contract_no', 'ilike', "%{$q}%")
                        ->orWhere('up_no', 'ilike', "%{$q}%");
                })
                ->limit(5)
                ->get();

            foreach ($billingProjects as $p) {
                $hid = Hashid::encode($p->id);
                $results[] = [
                    'category' => 'Penagihan',
                    'icon' => 'payments',
                    'color' => 'rose',
                    'title' => $p->name,
                    'subtitle' => collect([$p->up_no ? "UP: {$p->up_no}" : null, $p->contract_no ? "Kontrak: {$p->contract_no}" : null])->filter()->implode(' | '),
                    'url' => route('billing.edit', $hid),
                ];
            }
        }

        // Shipping
        if ($hasPermission('view_shipping')) {
            $shippingProjects = Project::with('shipping')
                ->whereHas('shipping')
                ->where(function ($query) use ($q) {
                    $query->where('name', 'ilike', "%{$q}%")
                        ->orWhere('contract_no', 'ilike', "%{$q}%")
                        ->orWhere('up_no', 'ilike', "%{$q}%");
                })
                ->limit(5)
                ->get();

            foreach ($shippingProjects as $p) {
                $hid = Hashid::encode($p->id);
                $results[] = [
                    'category' => 'Pengiriman',
                    'icon' => 'local_shipping',
                    'color' => 'emerald',
                    'title' => $p->name,
                    'subtitle' => collect([$p->up_no ? "UP: {$p->up_no}" : null, $p->contract_no ? "Kontrak: {$p->contract_no}" : null])->filter()->implode(' | '),
                    'url' => route('shipping.edit', $hid),
                ];
            }
        }

        // Reports
        if ($hasPermission('view_reports')) {
            $reportProjects = Project::where('name', 'ilike', "%{$q}%")
                ->orWhere('contract_no', 'ilike', "%{$q}%")
                ->orWhere('up_no', 'ilike', "%{$q}%")
                ->limit(5)
                ->get();

            foreach ($reportProjects as $p) {
                $hid = Hashid::encode($p->id);
                $results[] = [
                    'category' => 'Laporan',
                    'icon' => 'analytics',
                    'color' => 'teal',
                    'title' => $p->name,
                    'subtitle' => collect([$p->up_no ? "UP: {$p->up_no}" : null, $p->contract_no ? "Kontrak: {$p->contract_no}" : null])->filter()->implode(' | '),
                    'url' => route('reports.project.detail', $hid),
                ];
            }
        }

        // Master Data — Companies
        if ($hasPermission('view_master_data')) {
            $companies = Company::where('name', 'ilike', "%{$q}%")->limit(5)->get();
            foreach ($companies as $c) {
                $results[] = [
                    'category' => 'Perusahaan',
                    'icon' => 'apartment',
                    'color' => 'sky',
                    'title' => $c->name,
                    'subtitle' => 'Master Data',
                    'url' => route('master.data.company'),
                ];
            }

            // Agencies
            $agencies = Agency::where('name', 'ilike', "%{$q}%")->limit(5)->get();
            foreach ($agencies as $a) {
                $results[] = [
                    'category' => 'Instansi',
                    'icon' => 'account_balance',
                    'color' => 'indigo',
                    'title' => $a->name,
                    'subtitle' => 'Master Data',
                    'url' => route('master.data.agency'),
                ];
            }

            // Vendors
            $vendors = Vendor::where('name', 'ilike', "%{$q}%")->limit(5)->get();
            foreach ($vendors as $v) {
                $results[] = [
                    'category' => 'Vendor',
                    'icon' => 'handshake',
                    'color' => 'orange',
                    'title' => $v->name,
                    'subtitle' => 'Master Data',
                    'url' => route('master.data.vendor'),
                ];
            }

            // Auction Types
            $auctionTypes = AuctionType::where('name', 'ilike', "%{$q}%")->limit(5)->get();
            foreach ($auctionTypes as $at) {
                $results[] = [
                    'category' => 'Jenis Lelang',
                    'icon' => 'gavel',
                    'color' => 'pink',
                    'title' => $at->name,
                    'subtitle' => 'Master Data',
                    'url' => route('master.data.auction-type'),
                ];
            }

            // Budget Types
            $budgetTypes = BudgetType::where('name', 'ilike', "%{$q}%")->limit(5)->get();
            foreach ($budgetTypes as $bt) {
                $results[] = [
                    'category' => 'Jenis Anggaran',
                    'icon' => 'account_balance_wallet',
                    'color' => 'lime',
                    'title' => $bt->name,
                    'subtitle' => 'Master Data',
                    'url' => route('master.data.budget-type'),
                ];
            }

            // Brand Origins
            $brandOrigins = BrandOrigin::where('name', 'ilike', "%{$q}%")->limit(5)->get();
            foreach ($brandOrigins as $bo) {
                $results[] = [
                    'category' => 'Asal Brand',
                    'icon' => 'verified',
                    'color' => 'cyan',
                    'title' => $bo->name,
                    'subtitle' => 'Master Data',
                    'url' => route('master.data.brand-origin'),
                ];
            }
        }

        return response()->json(['results' => $results]);
    }
}
