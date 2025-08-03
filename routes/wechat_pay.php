<?php

use App\Http\Controllers\WeChatPayController;
use App\Http\Controllers\WeChatPayDirectController;
use Illuminate\Support\Facades\Route;

// 微信支付相关路由
Route::prefix('wechat/pay')->name('wechat.pay.')->group(function () {
    // 支付页面（不需要认证，但会显示登录状态）
    Route::get('/', [WeChatPayController::class, 'index'])->name('index');
    
    // 小程序支付页面
    Route::get('/miniprogram', [WeChatPayDirectController::class, 'miniProgramIndex'])->name('miniprogram.index');
    
    // 小程序跳转支付页面
    Route::get('/miniprogram/navigate', [WeChatPayDirectController::class, 'miniProgramNavigateIndex'])->name('miniprogram.navigate.index');
    
    // 需要认证的路由
    Route::middleware(['auth'])->group(function () {
        // 创建支付订单 (使用直接API调用)
        Route::post('/create', [WeChatPayDirectController::class, 'createOrder'])->name('create');
        
        // 创建小程序支付订单
        Route::post('/miniprogram/create', [WeChatPayDirectController::class, 'createMiniProgramOrder'])->name('miniprogram.create');
        
        // 查询订单状态
        Route::get('/query', [WeChatPayController::class, 'queryOrder'])->name('query');
        
        // 申请退款
        Route::post('/refund', [WeChatPayController::class, 'refund'])->name('refund');
    });
    
    // 支付回调通知 (不需要认证)
    Route::post('/notify', [WeChatPayController::class, 'notify'])->name('notify');
});