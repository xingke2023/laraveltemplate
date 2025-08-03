<?php

return [
    /*
    |--------------------------------------------------------------------------
    | WeChat Pay Configuration
    |--------------------------------------------------------------------------
    |
    | This file is for configuring WeChat Pay
    |
    */

    'app_id' => env('WECHAT_PAY_APP_ID', ''),
    'mini_program_app_id' => env('WECHAT_PAY_MINI_PROGRAM_APP_ID', 'wx4f373d46de28e43e'),
    'mini_program_app_secret' => env('WECHAT_PAY_MINI_PROGRAM_APP_SECRET', ''),
    'mch_id' => env('WECHAT_PAY_MCH_ID', ''),
    'cert_serial_no' => env('WECHAT_PAY_CERT_SERIAL_NO', ''),
    'apiv3_key' => env('WECHAT_PAY_APIV3_KEY', ''),
    'private_key' => env('WECHAT_PAY_PRIVATE_KEY', ''),
    'notify_url' => env('WECHAT_PAY_NOTIFY_URL', env('APP_URL') . '/wechat/pay/notify'),
    'partner_mode' => env('WECHAT_PAY_PARTNER_MODE', false),
    
    /*
    |--------------------------------------------------------------------------
    | WeChat Pay API Configuration
    |--------------------------------------------------------------------------
    */
    'sandbox' => env('WECHAT_PAY_SANDBOX', false),
    
    /*
    |--------------------------------------------------------------------------
    | HTTP Client Configuration
    |--------------------------------------------------------------------------
    */
    'http' => [
        'timeout' => 30.0,
        'connect_timeout' => 10.0,
        'throw' => true,
    ],
];