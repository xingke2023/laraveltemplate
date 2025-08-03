<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FlarumApiService
{
    private $apiKey;
    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = 'sso_api_key_776cf330cd3fec5e98d3b26fec23e9a4c410630a';
        $this->baseUrl = 'http://127.0.0.1:8008/api';
    }

    /**
     * 获取或创建Flarum用户token
     */
    public function getOrCreateUserToken(User $user): ?string
    {
        try {
            // 首先尝试用现有凭据获取token
            $token = $this->getFlarumUserToken($user->email, $this->generateUserPassword($user));
            
            if ($token) {
                return $token;
            }

            // 如果获取失败，尝试创建用户
            $created = $this->createFlarumUser($user);
            
            if ($created) {
                // 用户创建成功，再次获取token
                return $this->getFlarumUserToken($user->email, $this->generateUserPassword($user));
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Flarum API Service Error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
            return null;
        }
    }

    /**
     * 获取Flarum用户token
     */
    private function getFlarumUserToken(string $email, string $password): ?string
    {
        $response = Http::timeout(10)->post($this->baseUrl . '/token', [
            'identification' => $email,
            'password' => $password,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return $data['token'] ?? null;
        }

        return null;
    }

    /**
     * 在Flarum中创建用户
     */
    private function createFlarumUser(User $user): bool
    {
        $userData = [
            'data' => [
                'attributes' => [
                    'username' => $this->generateUniqueUsername($user->name),
                    'email' => $user->email,
                    'isEmailConfirmed' => true,
                    'password' => $this->generateUserPassword($user),
                ]
            ]
        ];

        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => 'Token ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post($this->baseUrl . '/users', $userData);

        if ($response->successful()) {
            Log::info('Flarum user created successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
            return true;
        }

        Log::error('Failed to create Flarum user', [
            'user_id' => $user->id,
            'email' => $user->email,
            'response' => $response->body(),
            'status' => $response->status(),
        ]);

        return false;
    }

    /**
     * 为用户生成一致的密码（基于用户ID和邮箱）
     */
    private function generateUserPassword(User $user): string
    {
        return 'sso_' . hash('sha256', $user->id . '_' . $user->email . '_' . config('app.key'));
    }

    /**
     * 生成唯一用户名
     */
    private function generateUniqueUsername(string $baseName): string
    {
        // 清理用户名，移除特殊字符
        $username = preg_replace('/[^\p{L}\p{N}_]/u', '', $baseName);
        
        if (empty($username)) {
            $username = 'user';
        }

        // 限制长度
        $username = mb_substr($username, 0, 20);

        // 添加随机后缀确保唯一性
        $username .= '_' . substr(uniqid(), -6);

        return $username;
    }

    /**
     * 检查用户是否在Flarum中存在
     */
    public function checkUserExists(string $email): bool
    {
        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => 'Token ' . $this->apiKey,
            ])
            ->get($this->baseUrl . '/users', [
                'filter[email]' => $email
            ]);

        if ($response->successful()) {
            $data = $response->json();
            return !empty($data['data']);
        }

        return false;
    }

    /**
     * 获取Flarum用户信息
     */
    public function getFlarumUser(string $email): ?array
    {
        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => 'Token ' . $this->apiKey,
            ])
            ->get($this->baseUrl . '/users', [
                'filter[email]' => $email
            ]);

        if ($response->successful()) {
            $data = $response->json();
            return $data['data'][0] ?? null;
        }

        return null;
    }
}