<?php

namespace App\Listeners;

use App\Services\ForumSyncService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SyncUserToForum implements ShouldQueue
{
    use InteractsWithQueue;

    private $forumSyncService;

    /**
     * Create the event listener.
     */
    public function __construct(ForumSyncService $forumSyncService)
    {
        $this->forumSyncService = $forumSyncService;
    }

    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        try {
            $user = $event->user;
            
            // 异步同步用户到论坛
            $this->forumSyncService->syncUserToForum($user);
            
            \Log::info('User synced to forum successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Failed to sync user to forum', [
                'user_id' => $event->user->id ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
            
            // 重新尝试3次
            if ($this->attempts() < 3) {
                $this->release(30); // 30秒后重试
            }
        }
    }
}