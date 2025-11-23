<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


// Database migration route (for development/testing)
Route::get('migrate/{password}', function ($password) {
    if ($password == env('MIGRATION_PASSWORD', null)) {
        try {
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            return response()->json([
                'success' => true,
                'message' => 'Database migrated successfully',
                'output' => \Illuminate\Support\Facades\Artisan::output()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Migration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
});

// Run any artisan command via web (for development/testing)
Route::get('artisan/{password}/{command}', function ($password, $command) {
    if ($password == env('MIGRATION_PASSWORD', null)) {
        try {
            $command = str_replace('-', ':', $command);
            \Illuminate\Support\Facades\Artisan::call($command);
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
