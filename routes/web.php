<?php

use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\AgencyController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\AuctionTypeController;
use App\Http\Controllers\BudgetTypeController;
use App\Http\Controllers\BrandOriginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MerchandiserController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('LandingPage');
});

Route::get('/projects', [ProjectController::class, 'index'])->middleware(['auth', 'verified', 'permission:view_projects'])->name('projects');
Route::get('/projects/create', [ProjectController::class, 'create'])->middleware(['auth', 'verified'])->name('projects.create');
Route::post('/projects', [ProjectController::class, 'store'])->middleware(['auth', 'verified'])->name('projects.store');

Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->middleware(['auth', 'verified'])->name('projects.edit');
Route::put('/projects/{project}', [ProjectController::class, 'update'])->middleware(['auth', 'verified'])->name('projects.update');
Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->middleware(['auth', 'verified'])->name('projects.destroy');

Route::get('/contracts', [ContractController::class , 'index'])->middleware(['auth', 'verified', 'permission:view_contracts'])->name('contracts');
Route::get('/contracts/{hashedId}/edit', [ContractController::class , 'edit'])->middleware(['auth', 'verified'])->name('contracts.edit');
Route::put('/contracts/{hashedId}', [ContractController::class , 'update'])->middleware(['auth', 'verified'])->name('contracts.update');
Route::delete('/contracts/attachment/{attachment}', [ContractController::class, 'destroyAttachment'])->middleware(['auth', 'verified'])->name('contracts.attachment.destroy');

Route::get('/merchandiser', [MerchandiserController::class, 'index'])->middleware(['auth', 'verified', 'permission:view_merchandiser'])->name('merchandiser');
Route::get('/merchandiser/{hashedId}/edit', [MerchandiserController::class, 'edit'])->middleware(['auth', 'verified'])->name('merchandiser.edit');
Route::put('/merchandiser/{hashedId}', [MerchandiserController::class, 'update'])->middleware(['auth', 'verified'])->name('merchandiser.update');
Route::post('/merchandiser/{hashedId}/upload', [MerchandiserController::class, 'uploadFile'])->middleware(['auth', 'verified'])->name('merchandiser.upload');
Route::delete('/merchandiser/file/{fileId}', [MerchandiserController::class, 'deleteFile'])->middleware(['auth', 'verified'])->name('merchandiser.file.delete');

Route::get('/billing', [BillingController::class, 'index'])->middleware(['auth', 'verified', 'permission:view_billing'])->name('billing');
Route::get('/billing/{hashedId}/edit', [BillingController::class, 'edit'])->middleware(['auth', 'verified'])->name('billing.edit');
Route::put('/billing/{hashedId}', [BillingController::class, 'update'])->middleware(['auth', 'verified'])->name('billing.update');
Route::delete('/billing/file/{fileId}', [BillingController::class, 'deleteFile'])->middleware(['auth', 'verified'])->name('billing.file.delete');

Route::get('/shipping', [App\Http\Controllers\ShippingController::class, 'index'])->middleware(['auth', 'verified', 'permission:view_shipping'])->name('shipping');
Route::get('/shipping/{hashedId}/edit', [App\Http\Controllers\ShippingController::class, 'edit'])->middleware(['auth', 'verified'])->name('shipping.edit');
Route::put('/shipping/{hashedId}', [App\Http\Controllers\ShippingController::class, 'update'])->middleware(['auth', 'verified'])->name('shipping.update');
Route::delete('/shipping/file/{fileId}', [App\Http\Controllers\ShippingController::class, 'deleteFile'])->middleware(['auth', 'verified'])->name('shipping.file.delete');

Route::get('/reports', [ReportController::class, 'index'])->middleware(['auth', 'verified', 'permission:view_reports'])->name('reports');

Route::get('/reports/project', [ReportController::class, 'projectReport'])->middleware(['auth', 'verified'])->name('reports.project');
Route::get('/reports/project-report', [ReportController::class, 'projectReport'])->middleware(['auth', 'verified']);

Route::get('/reports/project/{hashedId}', [ReportController::class, 'projectDetail'])->middleware(['auth', 'verified'])->name('reports.project.detail');

Route::get('/reports/project/{hashedId}/print', [ReportController::class, 'projectPrint'])->middleware(['auth', 'verified'])->name('reports.project.print');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    Route::post('/notifications/{id}/mark-as-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications-read', [\App\Http\Controllers\NotificationController::class, 'destroyRead'])->name('notifications.destroyRead');
});

Route::get('/api/search', [\App\Http\Controllers\SearchController::class, 'search'])->middleware(['auth', 'verified'])->name('api.search');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified', 'permission:view_dashboard'])->name('dashboard');

Route::middleware(['auth', 'verified', 'permission:view_master_data|view_master_company|view_master_agency|view_master_vendor|view_master_auction_type|view_master_budget_type|view_master_brand_origin|manage_users_roles'])->prefix('master-data')->name('master.data.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('MasterData/Index');
    })->name('index');

    Route::resource('company', CompanyController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'company'
    ]);
    Route::resource('agency', AgencyController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'agency'
    ]);
    Route::resource('vendor', VendorController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'vendor'
    ]);
    Route::resource('auction-type', AuctionTypeController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'auction-type'
    ]);
    Route::resource('budget-type', BudgetTypeController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'budget-type'
    ]);
    
    // Brand Origin & Certification
    Route::resource('brand-origin', BrandOriginController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'brand-origin'
    ]);
    Route::post('brand-origin/{brandOrigin}/certification', [BrandOriginController::class, 'storeCertification'])->name('brand-origin.certification.store');
    Route::delete('certification/{certification}', [BrandOriginController::class, 'destroyCertification'])->name('brand-origin.certification.destroy');

    Route::resource('role', RoleController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'role'
    ]);
    
    Route::resource('user', UserController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'user'
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class , 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class , 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class , 'updatePassword'])->name('profile.password');
    Route::delete('/profile/sessions/{session}', [ProfileController::class , 'destroySession'])->name('profile.sessions.destroy');
});

require __DIR__ . '/auth.php';
