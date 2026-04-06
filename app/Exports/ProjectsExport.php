<?php

namespace App\Exports;

use App\Models\Project;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ProjectsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function query()
    {
        return $this->query->with(['auctionType', 'agency', 'company', 'budgetType', 'brandOrigin', 'vendors', 'certifications']);
    }

    public function headings(): array
    {
        return [
            'Nama Pengadaan',
            'No. UP',
            'Jenis Lelang',
            'Instansi',
            'Perusahaan',
            'Jenis Anggaran',
            'Tahun Anggaran',
            'Vendor Pelaksana',
            'Deskripsi Pekerjaan',
            'Status Bebas Pajak',
            'Dokumen Pajak',
            'Asal Brand',
            'Garansi Unit',
            'Sertifikasi Produk',
            'Sistem Pembayaran (Payment Term)',
            'Nomor Kontrak',
            'Total Nilai Kontrak',
            'Tanggal Kontrak',
            'Tenggat Waktu (Deadline)'
        ];
    }

    public function map($project): array
    {
        return [
            $project->name,
            $project->up_no ?: '-',
            $project->auctionType ? $project->auctionType->name : '-',
            $project->agency ? $project->agency->name : '-',
            $project->company ? $project->company->name : '-',
            $project->budgetType ? $project->budgetType->name : '-',
            $project->budget_year,
            $project->vendors->pluck('name')->implode(', ') ?: '-',
            $project->description ?: '-',
            $project->tax_free ? 'Ya' : 'Tidak',
            $project->tax_doc ?: '-',
            $project->brandOrigin ? $project->brandOrigin->name : '-',
            $project->warranty ?: '-',
            $project->certifications->pluck('name')->implode(', ') ?: '-',
            $project->payment_term ?: '-',
            $project->contract_no ?: '-',
            number_format($project->contract_value, 0, ',', '.'),
            $project->contract_date ? \Carbon\Carbon::parse($project->contract_date)->format('d/m/Y') : '-',
            $project->due_date ? \Carbon\Carbon::parse($project->due_date)->format('d/m/Y') : '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();

        // Style the header row
        $sheet->getStyle('A1:' . $highestColumn . '1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1E293B'], // Slate-900 like UI
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(30);

        // Standard Table styling
        $sheet->getStyle('A1:' . $highestColumn . $highestRow)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'DEE2E6'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Wrap text for description column (I)
        $sheet->getStyle('I2:I' . $highestRow)->getAlignment()->setWrapText(true);
        $sheet->getColumnDimension('I')->setWidth(40);

        // Zebra striping
        for ($i = 2; $i <= $highestRow; $i++) {
            if ($i % 2 == 0) {
                $sheet->getStyle('A' . $i . ':' . $highestColumn . $i)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F8FAFC');
            }
        }
        
        return [];
    }
}
