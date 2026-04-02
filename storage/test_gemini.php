<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = 'AIzaSyAu4hx68wc4uoWgfmJOfEvGnDwmvFuXpk8';
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}";

$response = Http::withHeaders([
    'Content-Type' => 'application/json',
])->withoutVerifying()->post($url, [
    'contents' => [
        [
            'parts' => [
                ['text' => 'Hello']
            ]
        ]
    ]
]);

echo "Status Code: " . $response->status() . "\n";
echo "Error: (" . ($response->serverError()?1:0) . ")\n";
echo "Client Error: (" . ($response->clientError()?1:0) . ")\n";
echo "Response Body: \n" . $response->body() . "\n";
