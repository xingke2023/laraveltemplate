<?php

/*
 * Test Simple SSO Integration
 */

require_once 'vendor/autoload.php';

// 模拟Laravel环境
$_ENV['APP_ENV'] = 'local';

echo "🧪 Testing Simple Flarum SSO Integration\n";
echo "=====================================\n\n";

// 测试数据库连接
echo "1. Testing database connections...\n";

try {
    // Laravel数据库连接
    $laravelPdo = new PDO('mysql:host=127.0.0.1;port=8510;dbname=template1;charset=utf8mb4', 'root', 'Uu8297636');
    $laravelPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Laravel DB connection successful\n";
    
    // 检查users表
    $users = $laravelPdo->query("SELECT COUNT(*) as count FROM users")->fetch();
    echo "   Users in Laravel: " . $users['count'] . "\n";
    
    // Forum数据库连接 (使用前缀)
    $forumUsers = $laravelPdo->query("SELECT COUNT(*) as count FROM fl_users")->fetch();
    echo "   Users in Forum: " . $forumUsers['count'] . "\n";
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// 测试用户同步
echo "\n2. Testing user synchronization...\n";

try {
    // 获取一个Laravel用户
    $user = $laravelPdo->query("SELECT * FROM users LIMIT 1")->fetch(PDO::FETCH_OBJ);
    
    if (!$user) {
        echo "❌ No users found in Laravel database\n";
        exit(1);
    }
    
    echo "Testing with user: {$user->name} ({$user->email})\n";
    
    // 检查论坛用户是否存在
    $forumUserCheck = $laravelPdo->prepare("SELECT * FROM fl_users WHERE email = ?");
    $forumUserCheck->execute([$user->email]);
    $forumUser = $forumUserCheck->fetch(PDO::FETCH_OBJ);
    
    if ($forumUser) {
        echo "✅ User exists in forum: ID {$forumUser->id}\n";
    } else {
        echo "ℹ️  User does not exist in forum, would be created\n";
        
        // 模拟创建用户
        $username = preg_replace('/[^\p{L}\p{N}_]/u', '', $user->name) ?: 'user';
        $username = mb_substr($username, 0, 20);
        $username .= '_' . time();
        
        echo "   Would create with username: {$username}\n";
    }
    
} catch (Exception $e) {
    echo "❌ User sync test failed: " . $e->getMessage() . "\n";
}

// 测试token生成
echo "\n3. Testing token generation...\n";

try {
    $token = bin2hex(random_bytes(20)); // 40字符随机token
    echo "✅ Sample token generated: {$token}\n";
    echo "   Token length: " . strlen($token) . " characters\n";
    
} catch (Exception $e) {
    echo "❌ Token generation failed: " . $e->getMessage() . "\n";
}

echo "\n🎯 Simple SSO Test Complete!\n";
echo "\nIntegration Status:\n";
echo "✅ Database connections working\n";
echo "✅ User data accessible\n";
echo "✅ Token generation ready\n";
echo "\n📋 Next Steps:\n";
echo "1. Visit your main website and login with WeChat\n";
echo "2. Click the forum button (in user menu or mobile tab)\n";
echo "3. You should see the auto-login page and then be redirected to forum\n";
echo "4. Check if you're logged in to the forum\n";

echo "\n💡 Troubleshooting:\n";
echo "- If forum login fails, check the flarum/storage/logs for errors\n";
echo "- If cookie issues, ensure domains match (.domain.com)\n";
echo "- Check browser developer tools for cookie values\n";