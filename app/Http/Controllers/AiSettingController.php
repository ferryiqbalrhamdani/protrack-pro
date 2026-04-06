<?php

namespace App\Http\Controllers;

use App\Models\AiSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AiSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('MasterData/AiSettings', [
            'settings' => AiSetting::orderBy('created_at', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'provider' => 'required|string',
            'api_key' => 'required|string',
            'model' => 'required|string',
            'is_active' => 'boolean',
        ]);

        if ($request->is_active) {
            AiSetting::where('is_active', true)->update(['is_active' => false]);
        }

        AiSetting::create($request->all());

        return redirect()->back()->with('success', 'Konfigurasi AI berhasil ditambahkan.');
    }

    public function update(Request $request, AiSetting $aiSetting)
    {
        $request->validate([
            'provider' => 'required|string',
            'api_key' => 'required|string',
            'model' => 'required|string',
            'is_active' => 'boolean',
        ]);

        if ($request->is_active && !$aiSetting->is_active) {
            AiSetting::where('is_active', true)->update(['is_active' => false]);
        }

        $aiSetting->update($request->all());

        return redirect()->back()->with('success', 'Konfigurasi AI berhasil diperbarui.');
    }

    public function destroy(AiSetting $aiSetting)
    {
        $aiSetting->delete();
        return redirect()->back()->with('success', 'Konfigurasi AI berhasil dihapus.');
    }

    /**
     * Test connection to the AI provider using the stored configuration.
     */
    public function testConnection(AiSetting $aiSetting)
    {
        $provider = $aiSetting->provider;
        $apiKey   = $aiSetting->api_key;
        $model    = $aiSetting->model;

        $url = match($provider) {
            'OpenAI'        => 'https://api.openai.com/v1/chat/completions',
            'Gemini'        => 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
            'OpenRouter'    => 'https://openrouter.ai/api/v1/chat/completions',
            'GitHub Models' => 'https://models.inference.ai.azure.com/chat/completions',
            default         => 'https://api.groq.com/openai/v1/chat/completions',
        };

        $headers = [
            'Content-Type'  => 'application/json',
            'Authorization' => "Bearer {$apiKey}",
        ];

        if ($provider === 'OpenRouter') {
            $headers['HTTP-Referer'] = url('/');
            $headers['X-Title']      = 'Protrack Pro AI Test';
        }

        try {
            $response = Http::timeout(15)->withHeaders($headers)->withoutVerifying()->post($url, [
                'model'    => $model,
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a connectivity test assistant. Always respond in valid JSON format.'],
                    ['role' => 'user', 'content' => 'Respond in json with exactly: {"status":"ok","message":"Connection successful"}'],
                ],
                'response_format' => ['type' => 'json_object'],
                'max_tokens'      => 30,
                'temperature'     => 0,
            ]);

            if ($response->status() === 429) {
                return response()->json(['success' => false, 'message' => 'Rate limit tercapai. Coba lagi besok.'], 200);
            }

            if ($response->successful()) {
                Log::info("AI Test Connection OK: {$provider} / {$model}");
                return response()->json(['success' => true, 'message' => "Koneksi ke {$provider} berhasil! Model {$model} aktif."], 200);
            }

            $body = $response->json();
            $errorMsg = $body['error']['message'] ?? ('HTTP ' . $response->status());
            Log::warning("AI Test Connection FAILED: {$provider} — {$errorMsg}");
            return response()->json(['success' => false, 'message' => "Gagal: {$errorMsg}"], 200);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json(['success' => false, 'message' => 'Timeout: Tidak dapat menghubungi server AI.'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 200);
        }
    }
}
