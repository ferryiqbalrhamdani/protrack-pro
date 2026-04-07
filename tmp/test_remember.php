<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Auth;

$guard = Auth::guard('web');
if (method_exists($guard, 'getRememberDuration')) {
    echo "Current remember duration: " . $guard->getRememberDuration() . " minutes\n";
} else {
    echo "getRememberDuration() method not found on " . get_class($guard) . "\n";
}
