<?php

/*
 * Test Forum Route Access
 */

echo "🧪 Testing Forum Route Access\n";
echo "=============================\n\n";

// 测试路由是否存在
echo "1. Testing route existence...\n";

try {
    // 检查路由文件
    $routes_content = file_get_contents('routes/web.php');
    if (strpos($routes_content, 'forum.sso.redirect') !== false) {
        echo "✅ Route 'forum.sso.redirect' found in web.php\n";
    } else {
        echo "❌ Route 'forum.sso.redirect' not found in web.php\n";
    }

    // 检查控制器是否存在
    if (file_exists('app/Http/Controllers/ForumSSOController.php')) {
        echo "✅ ForumSSOController.php exists\n";
    } else {
        echo "❌ ForumSSOController.php not found\n";
    }

    // 检查Ziggy路由
    $ziggy_content = file_get_contents('resources/js/ziggy.js');
    if (strpos($ziggy_content, 'forum.sso.redirect') !== false) {
        echo "✅ Route found in ziggy.js\n";
    } else {
        echo "❌ Route not found in ziggy.js\n";
    }

} catch (Exception $e) {
    echo "❌ Error checking files: " . $e->getMessage() . "\n";
}

echo "\n2. Testing database connections...\n";

try {
    // 测试主数据库
    $pdo = new PDO('mysql:host=127.0.0.1;port=8510;dbname=template1;charset=utf8mb4', 'root', 'Uu8297636');
    echo "✅ Main database connection successful\n";
    
    // 检查用户表
    $user_count = $pdo->query("SELECT COUNT(*) as count FROM users")->fetch()['count'];
    echo "   Users in system: $user_count\n";
    
    if ($user_count > 0) {
        $user = $pdo->query("SELECT id, name, email FROM users LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        echo "   Sample user: {$user['name']} ({$user['email']})\n";
    }

} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n3. Diagnostic Information...\n";
echo "Forum route should be accessible at: /forum-redirect\n";
echo "Route requires authentication (auth middleware)\n";
echo "Make sure user is logged in before accessing\n";

echo "\n💡 Troubleshooting Steps:\n";
echo "1. Ensure user is logged in (check session/cookies)\n";
echo "2. Check Laravel server is running\n";
echo "3. Check browser network tab for actual error\n";
echo "4. Try accessing /forum-redirect directly in browser\n";
echo "5. Check Laravel logs for error details\n";

echo "\n📋 Direct Test URLs:\n";
echo "- Main site: https://paper.xingke888.com/\n";
echo "- Forum SSO: https://paper.xingke888.com/forum-redirect\n";
echo "- Forum: https://paper.xingke888.com/forum\n";