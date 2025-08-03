<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ForumSyncService
{
    /**
     * 同步Laravel用户到Flarum论坛
     */
    public function syncUserToForum(User $user): bool
    {
        try {
            // 检查论坛用户是否已存在
            $existingForumUser = DB::connection('forum')
                ->table('users')
                ->where('email', $user->email)
                ->first();

            if ($existingForumUser) {
                // 更新现有用户
                DB::connection('forum')
                    ->table('users')
                    ->where('email', $user->email)
                    ->update([
                        'username' => $this->sanitizeUsername($user->name),
                        'avatar_url' => $user->wechat_avatar ?: $user->avatar,
                    ]);
            } else {
                // 创建新用户
                DB::connection('forum')
                    ->table('users')
                    ->insert([
                        'username' => $this->sanitizeUsername($user->name),
                        'email' => $user->email,
                        'password' => $user->password, // Laravel已经hash的密码
                        'is_email_confirmed' => 1,
                        'avatar_url' => $user->wechat_avatar ?: $user->avatar,
                        'joined_at' => now(),
                        'preferences' => json_encode([]),
                        'discussion_count' => 0,
                        'comment_count' => 0,
                    ]);
            }

            return true;
        } catch (\Exception $e) {
            \Log::error('Forum user sync failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'user_email' => $user->email,
            ]);
            return false;
        }
    }

    /**
     * 获取论坛用户信息
     */
    public function getForumUser($email)
    {
        return DB::connection('forum')
            ->table('users')
            ->where('email', $email)
            ->first();
    }

    /**
     * 创建论坛会话token
     */
    public function createForumSession(User $user): string
    {
        $payload = [
            'user_email' => $user->email,
            'user_id' => $user->id,
            'timestamp' => time(),
            'nonce' => Str::random(32),
        ];

        return encrypt($payload);
    }

    /**
     * 验证并解析论坛会话token
     */
    public function validateForumSession(string $token): ?array
    {
        try {
            $payload = decrypt($token);
            
            // 检查token是否在5分钟内有效
            if (time() - $payload['timestamp'] > 300) {
                return null;
            }

            return $payload;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * 清理用户名，确保符合Flarum要求
     */
    private function sanitizeUsername(string $name): string
    {
        // 移除特殊字符，保留中文、英文、数字和下划线
        $username = preg_replace('/[^\p{L}\p{N}_]/u', '', $name);
        
        // 如果为空，使用默认前缀
        if (empty($username)) {
            $username = 'user_' . time();
        }

        // 限制长度
        $username = mb_substr($username, 0, 30);

        // 检查用户名是否已存在
        $originalUsername = $username;
        $counter = 1;
        
        while ($this->usernameExists($username)) {
            $username = $originalUsername . '_' . $counter;
            $counter++;
        }

        return $username;
    }

    /**
     * 检查用户名是否已存在
     */
    private function usernameExists(string $username): bool
    {
        return DB::connection('forum')
            ->table('users')
            ->where('username', $username)
            ->exists();
    }

    /**
     * 同步用户头像
     */
    public function syncUserAvatar(User $user): bool
    {
        try {
            $avatarUrl = $user->wechat_avatar ?: $user->avatar;
            
            if ($avatarUrl) {
                DB::connection('forum')
                    ->table('users')
                    ->where('email', $user->email)
                    ->update(['avatar_url' => $avatarUrl]);
            }

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * 检查用户是否已在论坛中
     */
    public function userExistsInForum(User $user): bool
    {
        return DB::connection('forum')
            ->table('users')
            ->where('email', $user->email)
            ->exists();
    }
}