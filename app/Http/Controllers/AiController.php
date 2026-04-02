<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    public function summarize(Request $request)
    {
        $apiKey = env('GEMINI_API_KEY');
        $data = $request->input('data');
        $year = $request->input('year');

        if (!$apiKey) {
            Log::error('Gemini API Key is missing from .env');
            return response()->json(['error' => 'Gemini API Key tidak terkonfigurasi di server.'], 500);
        }

        // Debug: Log partial key to confirm loading (Safe for production logs)
        $maskedKey = substr($apiKey, 0, 4) . '...' . substr($apiKey, -4);
        Log::info("Attempting AI Summary with Key: {$maskedKey}");

        $prompt = "Sebagai Senior AI Auditor & Strategic Consultant Protrack Pro, berikan audit mendalam untuk periode " . ($year === 'All' ? "seluruh waktu" : "Tahun Laporan " . $year) . ".\n\n";
        $prompt .= "DATA AUDIT (PROYEK, KONTRAK, MERCHANDISER, BILLING, SHIPPING):\n" . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
        $prompt .= "LOGIKA AUDIT KHUSUS:\n";
        $prompt .= "1. AUDIT STATUS VS PROGRESS: Jika progres sudah 100% tapi status masih 'Ongoing' atau 'Pending', tandai sebagai ANOMALI serius. Sebaliknya, jika progres rendah tapi status 'Completed', tandai sebagai galat data.\n";
        $prompt .= "2. AUDIT KONSISTENSI MODUL: Periksa apakah ada ketimpangan antara progres Merchandiser (pengadaan) vs Shipping (pengiriman). Proyek yang bagus adalah yang sinkron di semua modul.\n";
        $prompt .= "3. ANALISIS TAHUNAN: Berdasarkan data budget_year, mana yang kinerjanya turun dan mana yang membaik. Berikan skor (0-100) berdasarkan efisiensi dan ketepatan status.\n\n";
        $prompt .= "TUGAS ANDA:\n";
        $prompt .= "Summarize performa pertahun: mana yang kurang, mana yang harus ditingkatkan, mana yang bagus progresnya. Beri skor akhir.\n\n";
        $prompt .= "Berikan output dalam JSON murni dengan struktur:\n";
        $prompt .= "{\n";
        $prompt .= "  \"execSummary\": \"Ringkasan eksekutif 3-4 kalimat profesional berfokus pada anomali dan performa.\",\n";
        $prompt .= "  \"score\": [angka 0-100],\n";
        $prompt .= "  \"analysis\": {\n";
        $prompt .= "    \"good\": [\"3 poin capaian bagus/progres sinkron\"],\n";
        $prompt .= "    \"lacking\": [\"3 poin anomali status/hambatan/data tidak sinkron\"],\n";
        $prompt .= "    \"toImprove\": [\"3 poin langkah perbaikan teknis/administratif\"]\n";
        $prompt .= "  },\n";
        $prompt .= "  \"insights\": [\n";
        $prompt .= "    { \"icon\": \"analytics\", \"color\": \"emerald\", \"title\": \"Capaian Terbesar\", \"desc\": \"Detail progress terbesar\" },\n";
        $prompt .= "    { \"icon\": \"running_with_errors\", \"color\": \"rose\", \"title\": \"Anomali Terdeteksi\", \"desc\": \"Detail ketidaksinkronan status vs progress\" },\n";
        $prompt .= "    { \"icon\": \"trending_up\", \"color\": \"blue\", \"title\": \"Target Tahun Depan\", \"desc\": \"Apa yang harus dipertahankan\" },\n";
        $prompt .= "    { \"icon\": \"security\", \"color\": \"amber\", \"title\": \"Audit Administrasi\", \"desc\": \"Saran perbaikan data modul\" }\n";
        $prompt .= "  ],\n";
        $prompt .= "  \"recommendations\": [\"3 rekomendasi strategis\"]\n";
        $prompt .= "}\n";
        $prompt .= "PENTING: Hanya kembalikan JSON. Bahasa: Indonesia.";

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->withoutVerifying() 
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                ]
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                    Log::error('Unexpected Gemini Response: ' . json_encode($result));
                    return response()->json(['error' => 'Format respon AI tidak valid.'], 500);
                }

                $responseText = $result['candidates'][0]['content']['parts'][0]['text'];
                
                // Clean response if AI still wraps in markdown blocks
                $cleanJson = preg_replace('/^```json\n?|\n?```$/', '', trim($responseText));
                $decoded = json_decode($cleanJson, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error('AI JSON Decode Error: ' . json_last_error_msg() . ' | Raw: ' . $responseText);
                    return response()->json(['error' => 'Format data AI tidak valid.'], 500);
                }

                // Ensure all keys exist with fallback values
                $finalResult = array_merge([
                    'execSummary' => 'Analisis tidak tersedia untuk periode ini.',
                    'score' => 0,
                    'analysis' => ['good' => [], 'lacking' => [], 'toImprove' => []],
                    'insights' => [],
                    'recommendations' => []
                ], $decoded);

                return response()->json($finalResult);
            }

            Log::error('Gemini API Error: ' . $response->body());
            return response()->json(['error' => 'Gagal menghubungi AI Server.'], 500);

        } catch (\Exception $e) {
            Log::error('AI Summary Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan sistem saat audit AI.'], 500);
        }
    }
}
