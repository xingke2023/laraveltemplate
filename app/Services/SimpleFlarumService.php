<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SimpleFlarumService
{
    /**
     * 为用户创建Flarum访问token
     */
    public function createForumToken(User $user): ?string
    {
        try {
            // 1. 确保论坛用户存在
            $forumUser = $this->ensureForumUserExists($user);
            
            if (!$forumUser) {
                return null;
            }

            // 2. 创建访问token
            $token = Str::random(40);
            $userId = $forumUser->id;

            // 3. 插入access token到数据库
            DB::connection('forum')->table('access_tokens')->insert([
                'token' => $token,
                'user_id' => $userId,
                'last_activity_at' => now(),
                'created_at' => now(),
                'type' => 'session_remember',
                'title' => 'SSO Login',
                'last_ip_address' => request()->ip() ?? '127.0.0.1',
                'last_user_agent' => request()->userAgent() ?? 'Laravel SSO',
            ]);

            Log::info('Forum token created successfully', [
                'user_id' => $user->id,
                'forum_user_id' => $userId,
            ]);

            return $token;

        } catch (\Exception $e) {
            Log::error('Failed to create forum token: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
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

    /**
     * 检查用户是否在论坛中存在
     */
    public function checkUserExists(string $email): bool
    {
        return DB::connection('forum')
            ->table('users')
            ->where('email', $email)
            ->exists();
    }
}