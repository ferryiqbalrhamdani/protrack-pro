<?php
// Fix for previous script failure: refer to project root
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;

// Test if setting config affects the guard
Config::set('auth.guards.web.remember', 12345);

$guard = Auth::guard('web');
if (method_exists($guard, 'getRememberDuration')) {
    echo "Remember duration: " . $guard->getRememberDuration() . " minutes\n";
    if ($guard->getRememberDuration() == 12345) {
        echo "SUCCESS: Config key 'auth.guards.web.remember' works!\n";
    } else {
        echo "FAILURE: Config key did NOT work.\n";
    }
} else {
    echo "getRememberDuration() method not found on " . get_class($guard) . "\n";
}
