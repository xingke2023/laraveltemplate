<?php

use App\Http\Controllers\WeChatMiniProgramController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// 小程序相关接口
Route::prefix('wechat/miniprogram')->group(function () {
    Route::post('/login', [WeChatMiniProgramController::class, 'login']);
    Route::get('/access-token', [WeChatMiniProgramController::class, 'getAccessToken']);
});