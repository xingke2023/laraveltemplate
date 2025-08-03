<?php

use App\Http\Controllers\ForumSSOController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home page as the main entry point
Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

// Keep welcome route for backward compatibility (optional)
Route::get('welcome', function () {
    return Inertia::render('welcome');
})->name('welcome');

Route::get('hall', function () {
    return Inertia::render('hall');
})->name('hall');

Route::get('latest', function () {
    return Inertia::render('latest');
})->name('latest');

Route::get('NCh85NioN3.txt', function () {
    return response()->file(public_path('NCh85NioN3.txt'));
});

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Placeholder routes for user menu items
    Route::get('my-joined', function () {
        return Inertia::render('my-joined');
    })->name('my-joined');
    
    Route::get('my-published', function () {
        return Inertia::render('my-published');
    })->name('my-published');
    
    Route::get('my-recommendations', function () {
        return Inertia::render('my-recommendations');
    })->name('my-recommendations');
    
    Route::get('my-wallet', function () {
        return Inertia::render('my-wallet');
    })->name('my-wallet');
    
    // Forum SSO routes (only require auth, not verified)
    Route::get('/forum-redirect', [ForumSSOController::class, 'redirectToForum'])->name('forum.sso.redirect');
    Route::get('/api/forum/status', [ForumSSOController::class, 'getForumStatus'])->name('forum.sso.status');
    Route::post('/api/forum/sync', [ForumSSOController::class, 'forceSyncUser'])->name('forum.sso.sync');
});

// Forum SSO validation (for forum to validate tokens)
Route::get('/sso/validate', [ForumSSOController::class, 'validateSSOToken'])->name('forum.sso.validate');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/wechat_pay.php';
require __DIR__.'/debug.php';
