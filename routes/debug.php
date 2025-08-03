<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// 调试认证状态的临时路由
Route::get('/debug-auth', function (Request $request) {
    $user = $request->user();
    $authData = [
        'authenticated' => !is_null($user),
        'user_id' => $user ? $user->id : null,
        'user_name' => $user ? $user->name : null,
        'user_email' => $user ? $user->email : null,
        'session_id' => session()->getId(),
        'has_remember_token' => $user ? !empty($user->remember_token) : false,
        'cookies' => $request->cookies->all(),
        'session_data' => session()->all(),
    ];
    
    return response()->json($authData, 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
})->name('debug.auth');