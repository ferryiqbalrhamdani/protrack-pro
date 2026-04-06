<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    public function summarize(Request $request)
    {
        $apiKey = config('services.groq.key');
        $data = $request->input('data');
        $year = $request->input('year');

        if (!$apiKey) {
            Log::error('Groq API Key is missing from .env');
            return response()->json(['error' => 'Groq API Key tidak terkonfigurasi di server.'], 500);
        }

        $maskedKey = substr($apiKey, 0, 4) . '...' . substr($apiKey, -4);
        Log::info("Attempting AI Summary (Groq). Key: {$maskedKey}");

        // === SYSTEM PROMPT ===
        $systemPrompt = <<<EOT
Kamu adalah Senior AI Auditor & Strategic Consultant pada sistem Protrack Pro — platform manajemen proyek bisnis terintegrasi.

SIKLUS HIDUP PROYEK DI PROTRACK PRO:
Setiap proyek melewati 4 modul secara berurutan:
1. CONTRACT (Kontrak) — Penandatanganan & administrasi kontrak
2. MERCHANDISER (Pengadaan) — Pembelian barang, PO, dan penerimaan barang
3. BILLING (Penagihan) — Proses invoice, BAST, dan pembayaran
4. SHIPPING (Pengiriman) — Pengiriman barang ke klien

Setiap modul memiliki:
- status: Ongoing, Pending, atau Completed
- progress: 0-100%

Setiap proyek juga memiliki status dan progress keseluruhan.

ATURAN ANALISIS:
- Analisis WAJIB berbasis data per proyek, BUKAN agregat semata
- Sebutkan NAMA PROYEK saat membahas temuan spesifik
- Proyek yang SEMUA modulnya Completed dengan progress 100% = Good Progress
- Proyek Pending/Ongoing BUKAN good progress meskipun nilai kontraknya besar
- Semua nilai uang WAJIB format Rupiah: "Rp X Miliar" atau "Rp X Juta"
- Bahasa: Indonesia profesional

OUTPUT: JSON murni tanpa markdown, tanpa komentar.
EOT;

        // === BUILD USER PROMPT ===
        $periode = $year === 'All' ? 'seluruh periode' : "Tahun " . $year;
        $userPrompt = "PERIODE ANALISIS: {$periode}\n\n";

        // --- Section 1: Per-Project Module Data (PRIMARY DATA SOURCE) ---
        $userPrompt .= "=== DATA UTAMA: DETAIL PER PROYEK PER MODUL ===\n";
        $userPrompt .= "Data ini berisi detail setiap proyek dengan status dan progress di tiap modul.\n";
        $userPrompt .= "Gunakan data ini sebagai SUMBER UTAMA analisis.\n\n";

        if (isset($data['moduleData'])) {
            foreach (['contract' => 'CONTRACT', 'merchandiser' => 'MERCHANDISER', 'billing' => 'BILLING', 'shipping' => 'SHIPPING'] as $key => $label) {
                if (isset($data['moduleData'][$key]) && count($data['moduleData'][$key]) > 0) {
                    $userPrompt .= "--- MODUL {$label} ---\n";
                    foreach ($data['moduleData'][$key] as $proj) {
                        $name = $proj['proj'] ?? 'Unknown';
                        $client = $proj['client'] ?? '-';
                        $status = $proj['status'] ?? 'Pending';
                        $prog = $proj['prog'] ?? 0;
                        $value = isset($proj['contract_value']) ? 'Rp ' . number_format($proj['contract_value'], 0, ',', '.') : '-';
                        $projStatus = $proj['project_status'] ?? '-';
                        $projProgress = $proj['project_progress'] ?? 0;
                        $userPrompt .= "  Proyek: {$name} | Client: {$client} | Nilai: {$value} | Status Proyek: {$projStatus} | Progress Proyek: {$projProgress}% | Status Modul: {$status} | Progress Modul: {$prog}%\n";
                    }
                    $userPrompt .= "\n";
                }
            }
        }

        // --- Section 2: Aggregate Statistics (SUPPORTING DATA) ---
        $userPrompt .= "=== DATA PENDUKUNG: STATISTIK AGREGAT ===\n";

        if (isset($data['statusStats'])) {
            $ss = $data['statusStats'];
            $userPrompt .= "Status Proyek: Total={$ss['total']}, Ongoing={$ss['ongoing']}, Completed={$ss['completed']}, Pending={$ss['pending']}\n";
        }

        if (isset($data['financialStats'])) {
            $fs = $data['financialStats'];
            $userPrompt .= "Finansial: Total Nilai=Rp " . number_format($fs['total_nilai'], 0, ',', '.') . ", ";
            $userPrompt .= "Akumulasi DP=Rp " . number_format($fs['akumulasi_dp'], 0, ',', '.') . ", ";
            $userPrompt .= "Pembayaran Langsung=Rp " . number_format($fs['pembayaran_langsung'], 0, ',', '.') . ", ";
            $userPrompt .= "Tagihan Termin=Rp " . number_format($fs['tagihan_termin'], 0, ',', '.') . "\n";
        }

        if (isset($data['moduleStats'])) {
            $userPrompt .= "Agregat Modul:\n";
            foreach ($data['moduleStats'] as $mod => $stats) {
                $userPrompt .= "  {$mod}: Ongoing={$stats['ongoing']}, Completed={$stats['completed']}, Pending={$stats['pending']}\n";
            }
        }

        if (isset($data['companyContractValues']) && count($data['companyContractValues']) > 0) {
            $userPrompt .= "Nilai Kontrak per Perusahaan:\n";
            foreach ($data['companyContractValues'] as $cv) {
                $userPrompt .= "  {$cv['name']}: Rp " . number_format($cv['value'], 0, ',', '.') . "\n";
            }
        }

        if (isset($data['dueProjects']) && count($data['dueProjects']) > 0) {
            $userPrompt .= "Proyek Jatuh Tempo:\n";
            foreach ($data['dueProjects'] as $dp) {
                $userPrompt .= "  {$dp['name']} — Due: {$dp['due_date']} | Progress: {$dp['progress']}%\n";
            }
        }

        $userPrompt .= "\n";

        // --- Section 3: Audit Instructions ---
        $userPrompt .= "=== INSTRUKSI AUDIT ===\n\n";

        $userPrompt .= "LANGKAH 1 — IDENTIFIKASI PROYEK TERBAIK (Good Progress):\n";
        $userPrompt .= "- Cari proyek yang status keseluruhannya Completed DAN progress di SEMUA modul = 100%\n";
        $userPrompt .= "- Sebutkan nama proyek tersebut, NILAI KONTRAK (dalam Rp), dan jelaskan mengapa kinerjanya baik\n";
        $userPrompt .= "- Contoh format: 'Proyek [NAMA] dengan nilai kontrak Rp X Miliar berhasil menyelesaikan seluruh modul...'\n";
        $userPrompt .= "- Proyek Pending atau Ongoing TIDAK BOLEH masuk Good Progress\n\n";

        $userPrompt .= "LANGKAH 2 — IDENTIFIKASI ANOMALI (Lacking):\n";
        $userPrompt .= "- Proyek dengan status Completed tapi ada modul yang progressnya < 100%\n";
        $userPrompt .= "- Proyek bernilai besar tapi masih Pending di beberapa modul\n";
        $userPrompt .= "- Ketidaksinkronan: Contract completed tapi Shipping masih Pending\n";
        $userPrompt .= "- Tagihan termin Rp 0 padahal ada proyek bernilai besar\n\n";

        $userPrompt .= "LANGKAH 3 — REKOMENDASI PERBAIKAN (ToImprove):\n";
        $userPrompt .= "- Berikan langkah konkret untuk setiap anomali yang ditemukan\n";
        $userPrompt .= "- Sebutkan nama proyek dan modul yang perlu diperbaiki\n\n";

        $userPrompt .= "LANGKAH 4 — SCORING (0-100):\n";
        $userPrompt .= "- Konsistensi Status (25%): Apakah status sesuai dengan progress per modul?\n";
        $userPrompt .= "- Efisiensi Operasional (25%): Rasio proyek completed vs total\n";
        $userPrompt .= "- Kesehatan Finansial (25%): Apakah DP, pembayaran, dan tagihan proporsional?\n";
        $userPrompt .= "- Sinkronisasi Modul (25%): Apakah semua modul berjalan seimbang?\n\n";

        // --- Section 4: Output Structure ---
        $userPrompt .= "=== STRUKTUR OUTPUT JSON ===\n";
        $userPrompt .= "{\n";
        $userPrompt .= "  \"execSummary\": \"Ringkasan 3-4 kalimat menyebutkan skor, proyek terbaik, anomali utama, dan rekomendasi kunci.\",\n";
        $userPrompt .= "  \"score\": 75,\n";
        $userPrompt .= "  \"analysis\": {\n";
        $userPrompt .= "    \"good\": [\"Poin 1 — nama proyek & pencapaiannya\", \"Poin 2\", \"Poin 3\"],\n";
        $userPrompt .= "    \"lacking\": [\"Poin 1 — nama proyek & anomalinya\", \"Poin 2\", \"Poin 3\"],\n";
        $userPrompt .= "    \"toImprove\": [\"Poin 1 — langkah perbaikan untuk proyek/modul spesifik\", \"Poin 2\", \"Poin 3\"]\n";
        $userPrompt .= "  },\n";
        $userPrompt .= "  \"insights\": [\n";
        $userPrompt .= "    { \"icon\": \"analytics\", \"color\": \"emerald\", \"title\": \"Capaian Terbesar\", \"desc\": \"Kalimat lengkap tentang pencapaian terbaik\" },\n";
        $userPrompt .= "    { \"icon\": \"running_with_errors\", \"color\": \"rose\", \"title\": \"Anomali Terdeteksi\", \"desc\": \"Kalimat lengkap tentang anomali\" },\n";
        $userPrompt .= "    { \"icon\": \"trending_up\", \"color\": \"blue\", \"title\": \"Target Perbaikan\", \"desc\": \"Kalimat lengkap tentang area perbaikan\" },\n";
        $userPrompt .= "    { \"icon\": \"security\", \"color\": \"amber\", \"title\": \"Audit Administrasi\", \"desc\": \"Kalimat lengkap tentang kualitas data\" }\n";
        $userPrompt .= "  ],\n";
        $userPrompt .= "  \"recommendations\": [\"Rekomendasi 1 spesifik\", \"Rekomendasi 2\", \"Rekomendasi 3\"]\n";
        $userPrompt .= "}\n\n";

        $userPrompt .= "PERATURAN KETAT:\n";
        $userPrompt .= "- Setiap poin di 'good' HARUS merujuk proyek yang benar-benar Completed di semua modul\n";
        $userPrompt .= "- JANGAN masukkan proyek Pending/Ongoing ke dalam 'good'\n";
        $userPrompt .= "- Field 'desc' di insights WAJIB kalimat lengkap, BUKAN '...' atau placeholder\n";
        $userPrompt .= "- 'score' WAJIB integer\n";
        $userPrompt .= "- Jangan mengarang data yang tidak ada\n";

        try {
            Log::info("Sending request to Groq API...");
            $response = Http::timeout(30)->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => "Bearer {$apiKey}",
            ])->withoutVerifying()
            ->post("https://api.groq.com/openai/v1/chat/completions", [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.1,
                'max_tokens' => 4096
            ]);

            if ($response->successful()) {
                Log::info("Groq API Response Successful.");
                $result = $response->json();

                if (!isset($result['choices'][0]['message']['content'])) {
                    Log::error('Unexpected Groq Response: ' . json_encode($result));
                    return response()->json(['error' => 'Format respon AI tidak valid.'], 500);
                }

                $responseText = $result['choices'][0]['message']['content'];
                $decoded = json_decode($responseText, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error('Groq JSON Decode Error: ' . json_last_error_msg() . ' | Raw: ' . substr($responseText, 0, 500));
                    return response()->json(['error' => 'Format data AI tidak valid.'], 500);
                }

                // Ensure score is always an integer
                if (isset($decoded['score']) && !is_int($decoded['score'])) {
                    $decoded['score'] = (int) $decoded['score'];
                }

                $finalResult = array_merge([
                    'execSummary' => 'Analisis tidak tersedia untuk periode ini.',
                    'score' => 0,
                    'analysis' => ['good' => [], 'lacking' => [], 'toImprove' => []],
                    'insights' => [],
                    'recommendations' => []
                ], $decoded);

                return response()->json($finalResult);
            }

            Log::error('Groq API Error [' . $response->status() . ']: ' . $response->body());
            return response()->json(['error' => 'Gagal menghubungi AI Server (Groq). Status: ' . $response->status()], 500);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Groq Connection Timeout: ' . $e->getMessage());
            return response()->json(['error' => 'Koneksi ke AI Server timeout. Silakan coba lagi.'], 500);
        } catch (\Exception $e) {
            Log::error('AI Summary (Groq) Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan sistem saat audit AI.'], 500);
        }
    }
}
