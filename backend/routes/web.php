<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Database migration route (for development/testing)
Route::get('artisan/{command}/{password}', function ($command, $password) {
    if ($password == env('MIGRATION_PASSWORD', null)) {
        try {
            $command = str_replace('-', ':', $command);
            if ($command == 'migrate') {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            } else {
                \Illuminate\Support\Facades\Artisan::call($command);
            }
            return response()->json([
                'success' => true,
                'message' => "Command '{$command}' executed successfully",
                'output' => \Illuminate\Support\Facades\Artisan::output()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Command execution failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
})->where('command', '.*');
