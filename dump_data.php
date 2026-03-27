<?php

use App\Models\Company;
use App\Models\Agency;
use App\Models\Vendor;
use App\Models\AuctionType;
use App\Models\BudgetType;
use App\Models\BrandOrigin;
use App\Models\Certification;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$data = [
    'companies' => Company::all()->toArray(),
    'agencies' => Agency::all()->toArray(),
    'vendors' => Vendor::all()->toArray(),
    'auction_types' => AuctionType::all()->toArray(),
    'budget_types' => BudgetType::all()->toArray(),
    'brand_origins' => BrandOrigin::with('certifications')->get()->toArray(),
];

echo json_encode($data, JSON_PRETTY_PRINT);
