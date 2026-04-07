<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AiController extends Controller
{
    public function summarize(Request $request)
    {
        // 1. Fetch active setting from DB (Enforced as per user request)
        $activeSetting = \App\Models\AiSetting::where('is_active', true)->first();
        
        if (!$activeSetting) {
            Log::warning('AI Audit attempted without active DB configuration.');
            return response()->json(['error' => 'Konfigurasi AI belum diatur atau belum ada yang aktif. Silakan atur di Master Data > Konfigurasi AI.'], 400);
        }

        $apiKey = $activeSetting->api_key;
        $provider = $activeSetting->provider;
        $model = $activeSetting->model;

        $data = $request->input('data') ?? [];
        $year = $request->input('year');

        // --- TOKEN OPTIMIZATION ---
        // Build compact, per-project dataset from the nested moduleData structure sent by frontend
        // Frontend sends: data.moduleData.contract[], data.moduleData.merchandiser[], etc.
        $moduleData = $data['moduleData'] ?? [];
        $contractItems  = collect($moduleData['contract']  ?? []);
        $merchandiserItems = collect($moduleData['merchandiser'] ?? []);
        $billingItems   = collect($moduleData['billing']   ?? []);
        $shippingItems  = collect($moduleData['shipping']  ?? []);

        // Build a project map keyed by project name for cross-module merge
        $projectMap = [];

        foreach ($contractItems as $p) {
            $key = $p['proj'] ?? 'Unknown';
            $projectMap[$key] = [
                'name'     => substr($key, 0, 60),
                'value'    => isset($p['contract_value']) ? 'Rp ' . number_format($p['contract_value'] / 1000000000, 2, ',', '.') . ' M' : 'Rp 0',
                'status'   => $p['project_status'] ?? 'Pending',
                'progress' => ($p['project_progress'] ?? 0) . '%',
                'due_date' => $p['due_date'] ?? null,
                'modules'  => [
                    'contract'     => ['s' => $p['status'] ?? 'Pending', 'p' => ($p['prog'] ?? 0) . '%'],
                    'merchandiser' => ['s' => 'Pending', 'p' => '0%'],
                    'billing'      => ['s' => 'Pending', 'p' => '0%'],
                    'shipping'     => ['s' => 'Pending', 'p' => '0%'],
                ]
            ];
        }

        foreach ($merchandiserItems as $p) {
            $key = $p['proj'] ?? 'Unknown';
            if (!isset($projectMap[$key])) { $projectMap[$key] = ['name' => substr($key, 0, 60), 'value' => 'Rp 0', 'status' => $p['project_status'] ?? 'Pending', 'progress' => ($p['project_progress'] ?? 0) . '%', 'due_date' => null, 'modules' => ['contract' => ['s' => 'Pending', 'p' => '0%'], 'merchandiser' => ['s' => 'Pending', 'p' => '0%'], 'billing' => ['s' => 'Pending', 'p' => '0%'], 'shipping' => ['s' => 'Pending', 'p' => '0%']]]; }
            $projectMap[$key]['modules']['merchandiser'] = ['s' => $p['status'] ?? 'Pending', 'p' => ($p['prog'] ?? 0) . '%'];
        }

        foreach ($billingItems as $p) {
            $key = $p['proj'] ?? 'Unknown';
            if (!isset($projectMap[$key])) { $projectMap[$key] = ['name' => substr($key, 0, 60), 'value' => 'Rp 0', 'status' => $p['project_status'] ?? 'Pending', 'progress' => ($p['project_progress'] ?? 0) . '%', 'due_date' => null, 'modules' => ['contract' => ['s' => 'Pending', 'p' => '0%'], 'merchandiser' => ['s' => 'Pending', 'p' => '0%'], 'billing' => ['s' => 'Pending', 'p' => '0%'], 'shipping' => ['s' => 'Pending', 'p' => '0%']]]; }
            $projectMap[$key]['modules']['billing'] = ['s' => $p['status'] ?? 'Pending', 'p' => ($p['prog'] ?? 0) . '%'];
        }

        foreach ($shippingItems as $p) {
            $key = $p['proj'] ?? 'Unknown';
            if (!isset($projectMap[$key])) { $projectMap[$key] = ['name' => substr($key, 0, 60), 'value' => 'Rp 0', 'status' => $p['project_status'] ?? 'Pending', 'progress' => ($p['project_progress'] ?? 0) . '%', 'due_date' => null, 'modules' => ['contract' => ['s' => 'Pending', 'p' => '0%'], 'merchandiser' => ['s' => 'Pending', 'p' => '0%'], 'billing' => ['s' => 'Pending', 'p' => '0%'], 'shipping' => ['s' => 'Pending', 'p' => '0%']]]; }
            $projectMap[$key]['modules']['shipping'] = ['s' => $p['status'] ?? 'Pending', 'p' => ($p['prog'] ?? 0) . '%'];
        }

        // Take up to 60 projects to stay within safe TPM limits
        $optimizedData = array_slice(array_values($projectMap), 0, 60);

        $maskedKey = substr($apiKey, 0, 4) . '...' . substr($apiKey, -4);
        Log::info("Attempting AI Summary via {$provider}. Model: {$model}. Projects: " . count($optimizedData));

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
- Good Progress = proyek atau modul yang menunjukkan progres baik (progress tinggi, status berjalan lancar, modul-modul sinkron). TIDAK harus 100% completed — yang penting ada kemajuan positif yang signifikan
- Semua nilai uang WAJIB format Rupiah: "Rp X Miliar" atau "Rp X Juta"
- Bahasa: Indonesia profesional

FORMAT OUTPUT KETAT:
- WAJIB JSON murni.
- JANGAN sertakan markdown blocks (```json atau ```).
- JANGAN ada teks pembuka atau penutup di luar JSON.
- Langsung mulai dengan karakter { dan akhiri dengan }.
- JANGAN gunakan karakter newline asli (control character) di dalam teks; gunakan \n jika perlu baris baru.
EOT;

        // === BUILD USER PROMPT ===
        $periode = $year === 'All' ? 'seluruh periode' : "Tahun " . $year;
        $userPrompt = "PERIODE ANALISIS: {$periode}\n";
        $userPrompt .= "TANGGAL HARI INI: " . now()->format('d M Y') . "\n\n";

        // --- Section 1: Per-Project Detailed Data (PRIMARY DATA SOURCE) ---
        $userPrompt .= "=== DATA PROYEK (SUMBER UTAMA ANALISIS) ===\n";
        $userPrompt .= "Format: Nama | Progress Total | Status | Nilai | [M1: Modul1, M2: Modul2, dst]\n\n";

        foreach ($optimizedData as $p) {
            $m = $p['modules'];
            $userPrompt .= "- {$p['name']} ({$p['value']}) | Total: {$p['progress']} | Status: {$p['status']}\n";
            $userPrompt .= "  MODUL: [CONT: {$m['contract']['p']} ({$m['contract']['s']})] [MERCH: {$m['merchandiser']['p']} ({$m['merchandiser']['s']})] [BILL: {$m['billing']['p']} ({$m['billing']['s']})] [SHIP: {$m['shipping']['p']} ({$m['shipping']['s']})]\n";
            
            // Add due date if urgent
            if ($p['due_date'] && $p['due_date'] !== 'No Date') {
                try {
                    $due = \Carbon\Carbon::parse($p['due_date']);
                    $daysLeft = now()->diffInDays($due, false);
                    if ($daysLeft <= 30) {
                        $label = $daysLeft < 0 ? 'LEWAT ' . abs((int)$daysLeft) : 'TERSISA ' . (int)$daysLeft;
                        $userPrompt .= "  ⚠️ URGENT DEADLINE: {$label} HARI ({$p['due_date']})\n";
                    }
                } catch (\Exception $e) {}
            }
        }

        $userPrompt .= "\n";

        // --- Section 2: Aggregate Statistics (SUPPORTING DATA) ---
        $userPrompt .= "=== DATA PENDUKUNG: STATISTIK AGREGAT ===\n";

        if (isset($data['statusStats'])) {
            $ss = $data['statusStats'];
            $userPrompt .= "Status Proyek: Total={$ss['total']}, Ongoing={$ss['ongoing']}, Completed={$ss['completed']}, Pending={$ss['pending']}\n";
        }

        if (isset($data['moduleStats'])) {
            $userPrompt .= "Agregat Modul:\n";
            foreach ($data['moduleStats'] as $mod => $stats) {
                $userPrompt .= "  {$mod}: Ongoing={$stats['ongoing']}, Completed={$stats['completed']}, Pending={$stats['pending']}\n";
            }
        }
        $userPrompt .= "\n";

        // --- Section 3: Audit Instructions ---
        $userPrompt .= "=== INSTRUKSI AUDIT ===\n\n";

        $userPrompt .= "LANGKAH 1 — IDENTIFIKASI GOOD PROGRESS:\n";
        $userPrompt .= "- Evaluasi progress setiap proyek di SETIAP MODUL (Contract, Merchandiser, Billing, Shipping)\n";
        $userPrompt .= "- Good Progress = proyek atau modul yang menunjukkan kemajuan positif:\n";
        $userPrompt .= "  * Proyek yang sudah Completed di semua modul (progress 100%) — ini yang TERBAIK\n";
        $userPrompt .= "  * Proyek Ongoing dengan progress tinggi (misal > 70%) dan modul-modul berjalan sinkron\n";
        $userPrompt .= "  * Modul tertentu yang sudah selesai lebih dulu (misal Contract sudah 100% sementara modul lain masih berjalan)\n";
        $userPrompt .= "- Sebutkan nama proyek, NILAI KONTRAK (Rp), dan jelaskan aspek mana yang bagus\n";
        $userPrompt .= "- Contoh: 'Proyek [NAMA] (Rp X Miliar) menunjukkan progress optimal dengan modul Contract dan Merchandiser telah 100%...'\n\n";

        $userPrompt .= "LANGKAH 2 — IDENTIFIKASI ANOMALI (Lacking):\n";
        $userPrompt .= "- Proyek dengan status Completed tapi ada modul yang progressnya < 100%\n";
        $userPrompt .= "- Proyek bernilai besar tapi masih Pending di beberapa modul\n";
        $userPrompt .= "- Ketidaksinkronan antar modul: misal Contract completed tapi Shipping masih Pending\n";
        $userPrompt .= "- Tagihan termin Rp 0 padahal ada proyek bernilai besar\n";
        $userPrompt .= "- Modul yang progress-nya jauh tertinggal dibanding modul lain pada proyek yang sama\n\n";

        $userPrompt .= "LANGKAH 3 — REKOMENDASI PERBAIKAN (ToImprove):\n";
        $userPrompt .= "- Berikan langkah konkret untuk setiap anomali yang ditemukan\n";
        $userPrompt .= "- Sebutkan nama proyek dan modul yang perlu diperbaiki\n";
        $userPrompt .= "- PERHATIKAN DEADLINE: Jika ada proyek yang sudah LEWAT tenggat waktu (due_date) atau tersisa ≤ 30 hari, WAJIB masukkan ke rekomendasi perbaikan\n";
        $userPrompt .= "- Untuk proyek yang deadline-nya mendesak, rekomendasikan: percepatan proses, prioritaskan modul yang tertinggal, dan eskalasi ke manajemen\n";
        $userPrompt .= "- Contoh: 'Proyek [NAMA] sudah melewati tenggat X hari dengan progress baru Y% — perlu eskalasi segera dan percepatan modul [MODUL]'\n\n";

        $userPrompt .= "LANGKAH 4 — SCORING (0-100):\n";
        $userPrompt .= "- Skor dihitung dari KESELURUHAN kondisi SEMUA proyek dan SEMUA modul, bukan hanya yang sudah 100%\n";
        $userPrompt .= "- Komponen penilaian:\n";
        $userPrompt .= "  * Rata-rata progress semua proyek di semua modul (30%): Hitung rata-rata progress Contract + Merchandiser + Billing + Shipping dari semua proyek\n";
        $userPrompt .= "  * Konsistensi status vs progress (20%): Apakah status modul sesuai dengan angka progress-nya?\n";
        $userPrompt .= "  * Sinkronisasi antar modul (20%): Apakah modul-modul dalam satu proyek berjalan seimbang?\n";
        $userPrompt .= "  * Kesehatan finansial (15%): Keseimbangan DP, pembayaran, dan tagihan\n";
        $userPrompt .= "  * Penyelesaian proyek (15%): Berapa proyek yang sudah fully completed\n";
        $userPrompt .= "- Skor WAJIB antara 0-100, berupa integer\n\n";

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
        $userPrompt .= "    { \"icon\": \"trending_up\", \"color\": \"blue\", \"title\": \"Target Perbaikan\", \"desc\": \"Kalimat tentang area perbaikan — WAJIB menyebutkan proyek yang deadline-nya mendesak/lewat jika ada\" },\n";
        $userPrompt .= "    { \"icon\": \"security\", \"color\": \"amber\", \"title\": \"Audit Administrasi\", \"desc\": \"Kalimat lengkap tentang kualitas data\" }\n";
        $userPrompt .= "  ],\n";
        $userPrompt .= "  \"recommendations\": [\"Rekomendasi 1 spesifik\", \"Rekomendasi 2\", \"Rekomendasi 3\"]\n";
        $userPrompt .= "}\n\n";

        $userPrompt .= "PERATURAN KETAT:\n";
        $userPrompt .= "- Poin di 'good' boleh mencakup proyek Ongoing yang progress-nya tinggi dan modul-modulnya sinkron\n";
        $userPrompt .= "- Prioritaskan proyek yang fully Completed, tapi apresiasi juga progress yang signifikan\n";
        $userPrompt .= "- Field 'desc' di insights WAJIB kalimat lengkap, BUKAN '...' atau placeholder\n";
        $userPrompt .= "- 'score' WAJIB integer\n";
        $userPrompt .= "- Jangan mengarang data yang tidak ada\n";

        try {
            Log::info("Sending request to {$provider} API...");

            // --- RATE LIMITING (3x per provider per day) ---
            $limitKey = "ai_limit_" . strtolower(str_replace(' ', '_', $provider)) . "_" . date('Y-m-d');
            $currentUsage = Cache::get($limitKey, 0);

            if ($currentUsage >= 3) {
                Log::warning("AI Daily Limit reached for {$provider}. Usage: {$currentUsage}");
                return response()->json(['error' => 'Sudah mencapai batas harian AI. Silakan coba lagi besok.'], 429);
            }

            // ============================================================
            // GEMINI: Use the native Google AI REST API for reliability.
            // The OpenAI-compat endpoint truncates responses, causing broken JSON.
            // ============================================================
            if ($provider === 'Gemini') {
                // Native Gemini API URL
                $nativeUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

                $geminiPayload = [
                    'system_instruction' => [
                        'parts' => [['text' => $systemPrompt]]
                    ],
                    'contents' => [
                        ['role' => 'user', 'parts' => [['text' => $userPrompt]]]
                    ],
                    'generationConfig' => [
                        'response_mime_type' => 'application/json',
                        'temperature' => 0.1,
                        'maxOutputTokens' => 8192,
                    ],
                ];

                $response = Http::timeout(120)->withoutVerifying()
                    ->post($nativeUrl, $geminiPayload);

                if ($response->status() === 429) {
                    $body = $response->json();
                    $errorMsg = $body['error']['message'] ?? 'Gemini AI sudah mencapai batas limit, silahkan coba lagi besok.';
                    Log::warning("Gemini API Internal Rate Limit hit (429): " . $errorMsg);
                    return response()->json(['error' => $errorMsg], 429);
                }

                if (!$response->successful()) {
                    Log::error("Gemini Native API Error [" . $response->status() . ']: ' . $response->body());
                    return response()->json(['error' => "Gagal menghubungi Gemini AI. Status: " . $response->status()], 500);
                }

                $result = $response->json();
                $responseText = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if (!$responseText) {
                    Log::error("Unexpected Gemini Native Response: " . json_encode($result));
                    return response()->json(['error' => 'Format respon Gemini tidak valid.'], 500);
                }

                Log::info("Gemini Native API Response Successful. Incrementing usage.");
                Cache::put($limitKey, $currentUsage + 1, now()->addDay());

                // Extract and clean JSON
                $responseText = $this->extractAndCleanJson($responseText, 'Gemini');
                if (is_array($responseText)) {
                    return response()->json($responseText); // error response
                }

                $decoded = json_decode($responseText, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error("Gemini JSON Decode Error: " . json_last_error_msg() . ' | Raw: ' . substr($responseText, 0, 1000));
                    return response()->json(['error' => 'Format data AI tidak valid.'], 500);
                }

                if (isset($decoded['score']) && !is_int($decoded['score'])) {
                    $decoded['score'] = (int) $decoded['score'];
                }

                return response()->json(array_merge([
                    'execSummary' => 'Analisis tidak tersedia.',
                    'score' => 0,
                    'analysis' => ['good' => [], 'lacking' => [], 'toImprove' => []],
                    'insights' => [],
                    'recommendations' => []
                ], $decoded));
            }

            // ============================================================
            // ALL OTHER PROVIDERS: OpenAI-compatible chat completions API
            // ============================================================
            $url = match($provider) {
                'OpenAI' => "https://api.openai.com/v1/chat/completions",
                'OpenRouter' => "https://openrouter.ai/api/v1/chat/completions",
                'GitHub Models' => "https://models.inference.ai.azure.com/chat/completions",
                default => "https://api.groq.com/openai/v1/chat/completions",
            };

            $requestHeaders = [
                'Content-Type' => 'application/json',
                'Authorization' => "Bearer {$apiKey}",
            ];

            if ($provider === 'OpenRouter') {
                $requestHeaders['HTTP-Referer'] = url('/');
                $requestHeaders['X-Title'] = 'Protrack Pro AI Auditor';
            }

            $response = Http::timeout(90)->withHeaders($requestHeaders)->withoutVerifying()
            ->post($url, [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.1,
                'max_tokens' => 8192
            ]);

            // Handle Rate Limit FIRST before checking success
            if ($response->status() === 429) {
                $body = $response->json();
                $errorMsg = $body['error']['message'] ?? 'AI sudah mencapai batas limit, silahkan coba lagi besok.';
                Log::warning("{$provider} API Internal Rate Limit hit (429): " . $errorMsg);
                return response()->json(['error' => $errorMsg], 429);
            }

            if ($response->successful()) {
                Log::info("{$provider} API Response Successful. Incrementing usage.");
                Cache::put($limitKey, $currentUsage + 1, now()->addDay());
                
                $result = $response->json();

                if (!isset($result['choices'][0]['message']['content'])) {
                    Log::error("Unexpected {$provider} Response: " . json_encode($result));
                    return response()->json(['error' => 'Format respon AI tidak valid.'], 500);
                }

                $responseText = $result['choices'][0]['message']['content'];
                
                $responseText = $this->extractAndCleanJson($responseText, $provider);
                if (is_array($responseText)) {
                    return response()->json($responseText); // error response
                }

                $decoded = json_decode($responseText, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error("{$provider} JSON Decode Error: " . json_last_error_msg() . ' | Raw: ' . substr($responseText, 0, 1000));
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

            if ($response->status() === 429) {
                $body = $response->json();
                $errorMsg = $body['error']['message'] ?? 'Rate limit tercapai. Coba lagi besok.';
                return response()->json(['success' => false, 'message' => "Limit: {$errorMsg}"], 200);
            }

            Log::error("{$provider} API Error [" . $response->status() . ']: ' . $response->body());
            return response()->json(['error' => "Gagal menghubungi AI Server ({$provider}). Status: " . $response->status()], 500);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error("{$provider} Connection Timeout: " . $e->getMessage());
            return response()->json(['error' => 'Koneksi ke AI Server timeout. Silakan coba lagi.'], 500);
        } catch (\Exception $e) {
            Log::error("AI Summary ({$provider}) Exception: " . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan sistem saat audit AI.'], 500);
        }
    }

    /**
     * Extract and clean JSON from an AI response string.
     * Handles: markdown blocks, surrounding text, and control characters.
     * Returns the cleaned JSON string, or an error array if extraction fails.
     */
    private function extractAndCleanJson(string $raw, string $provider): string|array
    {
        $text = $raw;

        // Step 1: Strip markdown code blocks (```json ... ``` or ``` ... ```)
        if (preg_match('/```(?:json)?\s*(\{.*?\})\s*```/s', $text, $m)) {
            $text = $m[1];
        }

        // Step 2: Recursive balanced-brace extraction to isolate the first complete JSON object
        if (preg_match('/\{(?:[^{}]|(?R))*\}/s', $text, $m)) {
            $text = $m[0];
        }

        // Step 3: Try decoding as-is
        $decoded = json_decode($text, true);

        // Step 4: If it fails due to control characters, aggressively clean them
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Replace literal newlines/tabs INSIDE string values with escaped versions
            $cleaned = preg_replace_callback('/"(?:[^"\\\\]|\\\\.)*"/s', function ($match) {
                // Only clean inside string values
                return preg_replace('/[\x00-\x1F\x7F]/', ' ', $match[0]);
            }, $text);

            $decoded = json_decode($cleaned ?? $text, true);
        }

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error("{$provider} JSON Clean Failed: " . json_last_error_msg() . ' | Raw snippet: ' . substr($raw, 0, 500));
            return ['error' => 'Format data AI tidak valid.'];
        }

        // Re-encode to get a clean, consistent JSON string
        return json_encode($decoded);
    }
}
