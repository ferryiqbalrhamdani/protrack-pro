<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name', 'up_no', 'auction_type_id', 'agency_id', 'company_id',
        'budget_type_id', 'pic_id', 'budget_year', 'description',
        'tax_free', 'tax_doc', 'brand_origin_id', 'payment_term',
        'warranty', 'contract_no', 'contract_value', 'contract_date',
        'due_date', 'status', 'progress'
    ];

    public function auctionType()
    {
        return $this->belongsTo(AuctionType::class);
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function budgetType()
    {
        return $this->belongsTo(BudgetType::class);
    }

    public function pic()
    {
        return $this->belongsTo(User::class, 'pic_id');
    }

    public function brandOrigin()
    {
        return $this->belongsTo(BrandOrigin::class);
    }

    public function vendors()
    {
        return $this->belongsToMany(Vendor::class, 'project_vendor');
    }

    public function certifications()
    {
        return $this->belongsToMany(Certification::class, 'project_certification');
    }

    public function installments()
    {
        return $this->hasMany(ProjectInstallment::class);
    }

    public function contract()
    {
        return $this->hasOne(Contract::class);
    }

    public function merchandiser()
    {
        return $this->hasOne(Merchandiser::class);
    }

    public function billing()
    {
        return $this->hasOne(Billing::class);
    }

    public function shipping()
    {
        return $this->hasOne(Shipping::class);
    }

    public function updateProgress()
    {
        $contractProgress = $this->contract ? $this->contract->progress : 0;
        $merchandiserProgress = $this->merchandiser ? $this->merchandiser->progress : 0;
        $billingProgress = $this->billing ? $this->billing->progress : 0;
        $shippingProgress = $this->shipping ? $this->shipping->progress : 0;

        $overall = ($contractProgress * 0.20) + ($merchandiserProgress * 0.50) + ($billingProgress * 0.10) + ($shippingProgress * 0.20);
        
        // Prevent infinite loops if project has its own save events
        $this->progress = (int) round($overall);
        $this->saveQuietly();
    }
}
