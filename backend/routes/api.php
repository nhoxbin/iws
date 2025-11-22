<?php

use App\Http\Controllers\Api\AnswerController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::group(['prefix' => 'auth'], function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('user/role', [AuthController::class, 'updateRole']);
    });
});

Route::apiResource('posts', PostController::class);
Route::apiResource('categories', CategoryController::class);

Route::middleware('auth:api')->group(function () {
    Route::post('posts/{post}/save', [PostController::class, 'save']);
    Route::get('saved-posts', [PostController::class, 'savedPosts']);

    // Answer routes
    Route::post('posts/{post}/answers', [AnswerController::class, 'store']);
    Route::put('answers/{answer}', [AnswerController::class, 'update']);
    Route::delete('answers/{answer}', [AnswerController::class, 'destroy']);
    Route::post('answers/{answer}/helpful', [AnswerController::class, 'toggleHelpful']);

    // Notification routes
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});
