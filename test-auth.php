<?php

require_once __DIR__.'/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🔍 Authentication Status Check\n";
echo "==============================\n\n";

// 模拟web请求环境
$request = Request::createFromGlobals();
$app->instance('request', $request);

// 检查session配置
echo "1. Session Configuration:\n";
echo "   Driver: " . config('session.driver') . "\n";
echo "   Lifetime: " . config('session.lifetime') . " minutes\n";
echo "   Domain: " . (config('session.domain') ?: 'null') . "\n\n";

// 检查数据库中的用户
echo "2. Database Users:\n";
try {
    $userCount = DB::table('users')->count();
    echo "   Total users: $userCount\n";
    
    $rememberCount = DB::table('users')->whereNotNull('remember_token')->count();
    echo "   Users with remember_token: $rememberCount\n";
    
    if ($rememberCount > 0) {
        $user = DB::table('users')->whereNotNull('remember_token')->first();
        echo "   Sample user: {$user->name} ({$user->email})\n";
        echo "   Remember token exists: " . (!empty($user->remember_token) ? 'Yes' : 'No') . "\n";
    }
} catch (Exception $e) {
    echo "   Database error: " . $e->getMessage() . "\n";
}

echo "\n3. Session Storage:\n";
if (config('session.driver') === 'database') {
    try {
        $sessionCount = DB::table('sessions')->count();
        echo "   Total sessions: $sessionCount\n";
        
        // 检查最近的session
        $recentSession = DB::table('sessions')
            ->orderBy('last_activity', 'desc')
            ->first();
        
        if ($recentSession) {
            $lastActivity = date('Y-m-d H:i:s', $recentSession->last_activity);
            echo "   Latest session activity: $lastActivity\n";
        }
    } catch (Exception $e) {
        echo "   Sessions table error: " . $e->getMessage() . "\n";
    }
} else {
    echo "   Using file-based sessions\n";
}

echo "\n💡 Troubleshooting Tips:\n";
echo "1. Check if user is actually logged in by visiting /dashboard\n";
echo "2. Check browser cookies for laravel_session and remember_*\n";
echo "3. Try logging out and back in with WeChat\n";
echo "4. Check if session has expired (current lifetime: " . config('session.lifetime') . " min)\n";
echo "5. Test forum access after fresh login\n";

echo "\n📋 Test URLs:\n";
echo "- Dashboard (requires auth): https://paper.xingke888.com/dashboard\n";
echo "- Forum redirect (requires auth): https://paper.xingke888.com/forum-redirect\n";
echo "- WeChat login: https://paper.xingke888.com/auth/wechat/redirect\n";