<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class JWTFlarumService
{
    private string $issuer = 'paper.xingke888.com';
    private string $signerKey = 'J7kDHeZxMGQAQOK9X6DtMCFFKvZ3nrP6bz+YsPWEew4=';
    private string $algorithm = 'HS256';

    /**
     * 为用户创建JWT token并设置到Flarum
     */
    public function createForumJWTToken(User $user): ?string
    {
        try {
            // 1. 确保论坛用户存在
            $forumUser = $this->ensureForumUserExists($user);
            
            if (!$forumUser) {
                return null;
            }

            // 2. 创建JWT payload
            $payload = [
                'iss' => $this->issuer,  // 发行者
                'sub' => (string)$forumUser->id,  // 用户ID
                'username' => $forumUser->username,
                'email' => $user->email,
                'iat' => time(),  // 发行时间
                'exp' => time() + (30 * 24 * 60 * 60),  // 30天过期
            ];

            // 3. 生成JWT
            $jwt = JWT::encode($payload, base64_decode($this->signerKey), $this->algorithm);

            Log::info('Forum JWT created successfully', [
                'user_id' => $user->id,
                'forum_user_id' => $forumUser->id,
                'jwt_sub' => $payload['sub'],
            ]);

            return $jwt;

        } catch (\Exception $e) {
            Log::error('Failed to create forum JWT: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * 验证JWT token
     */
    public function validateJWT(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key(base64_decode($this->signerKey), $this->algorithm));
            return (array) $decoded;
        } catch (\Exception $e) {
            Log::error('JWT validation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * 确保论坛用户存在
     */
    private function ensureForumUserExists(User $user)
    {
        // 检查用户是否已存在
        $existingUser = DB::connection('forum')
            ->table('users')
            ->where('email', $user->email)
            ->first();

        if ($existingUser) {
            // 更新用户信息
            DB::connection('forum')
                ->table('users')
                ->where('id', $existingUser->id)
                ->update([
                    'username' => $this->generateUniqueUsername($user->name, $existingUser->id),
                    'avatar_url' => $user->wechat_avatar ?: $user->avatar,
                    'last_seen_at' => now(),
                ]);

            return $existingUser;
        }

        // 创建新用户
        $username = $this->generateUniqueUsername($user->name);
        $userId = DB::connection('forum')->table('users')->insertGetId([
            'username' => $username,
            'email' => $user->email,
            'is_email_confirmed' => 1,
            'password' => Hash::make(Str::random(32)), // 随机密码，不用于登录
            'avatar_url' => $user->wechat_avatar ?: $user->avatar,
            'joined_at' => now(),
            'last_seen_at' => now(),
            'preferences' => null,
            'discussion_count' => 0,
            'comment_count' => 0,
        ]);

        return (object) ['id' => $userId, 'username' => $username, 'email' => $user->email];
    }

    /**
     * 生成唯一用户名
     */
    private function generateUniqueUsername(string $baseName, int $excludeUserId = null): string
    {
        // 清理用户名
        $username = preg_replace('/[^\p{L}\p{N}_]/u', '', $baseName);
        
        if (empty($username)) {
            $username = 'user';
        }

        // 限制长度
        $username = mb_substr($username, 0, 20);
        
        // 检查是否唯一
        $originalUsername = $username;
        $counter = 1;
        
        while ($this->usernameExists($username, $excludeUserId)) {
            $username = $originalUsername . '_' . $counter;
            $counter++;
            
            // 防止无限循环
            if ($counter > 100) {
                $username = $originalUsername . '_' . time();
                break;
            }
        }

        return $username;
    }

    /**
     * 检查用户名是否存在
     */
    private function usernameExists(string $username, int $excludeUserId = null): bool
    {
        $query = DB::connection('forum')
            ->table('users')
            ->where('username', $username);

        if ($excludeUserId) {
            $query->where('id', '!=', $excludeUserId);
        }

        return $query->exists();
    }

    /**
     * 获取论坛用户信息
     */
    public function getForumUser(string $email): ?object
    {
        return DB::connection('forum')
            ->table('users')
            ->where('email', $email)
            ->first();
    }
}