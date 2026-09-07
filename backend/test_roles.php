<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// 1. Assign 'admin' role to adminlux@example.com
$adminUser = App\Models\User::where('email', 'adminlux@example.com')->first();
if ($adminUser) {
    $adminUser->syncRoles(['admin']);
    echo "Admin role synced to: " . $adminUser->email . " (roles: " . implode(', ', $adminUser->getRoleNames()->toArray()) . ")\n";
}

// 2. Assign 'user' role to paula.buendia@example.com (client account)
$clientUser = App\Models\User::where('email', 'paula.buendia@example.com')->first();
if ($clientUser) {
    $clientUser->syncRoles(['user']);
    echo "Client role synced to: " . $clientUser->email . " (roles: " . implode(', ', $clientUser->getRoleNames()->toArray()) . ")\n";
}
