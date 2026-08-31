<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'adminlux@example.com')->first();
if (!$user) {
    echo "User not found\n";
    exit;
}

echo "User found: " . $user->email . "\n";
echo "Testing 'contrasena': ";
var_dump(Illuminate\Support\Facades\Hash::check('contrasena', $user->password));

echo "Testing 'password': ";
var_dump(Illuminate\Support\Facades\Hash::check('password', $user->password));

// Test with 'admin' and others
$testPasswords = ['contrasena', 'contraseña', 'admin', 'admin123', 'Admin123!', '12345678', 'password'];
foreach ($testPasswords as $p) {
    if (Illuminate\Support\Facades\Hash::check($p, $user->password)) {
        echo "MATCH: $p\n";
    }
}
