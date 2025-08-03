<?php

/*
 * Test SSO Integration
 * 测试Flarum SSO集成是否正常工作
 */

require_once 'vendor/autoload.php';

// 模拟Laravel环境
$_ENV['APP_ENV'] = 'local';

// 配置
$flarumApiUrl = 'http://127.0.0.1:8008/api';
$apiKey = 'sso_api_key_776cf330cd3fec5e98d3b26fec23e9a4c410630a';

echo "🧪 Testing Flarum SSO Integration\n";
echo "================================\n\n";

// 1. 测试API连接
echo "1. Testing API connection...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $flarumApiUrl . '/users');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Token ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "✅ API connection successful\n";
} else {
    echo "❌ API connection failed (HTTP $httpCode)\n";
    echo "Response: $response\n";
}

// 2. 测试创建用户
echo "\n2. Testing user creation...\n";
$testUser = [
    'data' => [
        'attributes' => [
            'username' => 'test_user_' . time(),
            'email' => 'test_' . time() . '@example.com',
            'isEmailConfirmed' => true,
            'password' => 'test_password_123'
        ]
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $flarumApiUrl . '/users');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testUser));
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Token ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 201) {
    echo "✅ User creation successful\n";
    $userData = json_decode($response, true);
    $testEmail = $userData['data']['attributes']['email'];
} else {
    echo "❌ User creation failed (HTTP $httpCode)\n";
    echo "Response: $response\n";
    $testEmail = null;
}

// 3. 测试获取token
if ($testEmail) {
    echo "\n3. Testing token generation...\n";
    $loginData = [
        'identification' => $testEmail,
        'password' => 'test_password_123'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $flarumApiUrl . '/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        echo "✅ Token generation successful\n";
        $tokenData = json_decode($response, true);
        echo "Token: " . $tokenData['token'] . "\n";
    } else {
        echo "❌ Token generation failed (HTTP $httpCode)\n";
        echo "Response: $response\n";
    }
}

echo "\n🎯 Integration Test Complete!\n";
echo "\nNext steps:\n";
echo "1. Visit your main site and login\n";
echo "2. Click 'Enter Forum' button\n";
echo "3. You should be automatically logged in to the forum\n";