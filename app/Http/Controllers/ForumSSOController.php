<?php

namespace App\Http\Controllers;

use App\Services\JWTFlarumService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ForumSSOController extends Controller
{
    private $flarumService;

    public function __construct(JWTFlarumService $flarumService)
    {
        $this->flarumService = $flarumService;
    }

    /**
     * 重定向用户到论坛并自动登录
     */
    public function redirectToForum(Request $request)
    {
        $user = $request->user();
        
        // 详细的调试信息
        Log::info('Forum SSO attempt', [
            'user_authenticated' => !is_null($user),
            'user_id' => $user ? $user->id : null,
            'session_id' => session()->getId(),
            'has_remember_token' => $user ? !empty($user->remember_token) : false,
            'request_ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        
        if (!$user) {
            Log::warning('Forum SSO failed: User not authenticated');
            return redirect()->route('login')->with('message', '请先登录后再访问论坛');
        }

        try {
            // 获取或创建Flarum JWT token
            $flarumToken = $this->flarumService->createForumJWTToken($user);
            
            if (!$flarumToken) {
                return back()->withErrors(['message' => '论坛登录失败，请稍后重试']);
            }

            // 返回包含自动登录脚本的页面
            return $this->returnAutoLoginPage($flarumToken);
            
        } catch (\Exception $e) {
            Log::error('Forum SSO redirect failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
            ]);
            
            return back()->withErrors(['message' => '跳转论坛失败，请稍后重试']);
        }
    }

    /**
     * 返回自动登录页面
     */
    private function returnAutoLoginPage(string $token)
    {
        $html = '<!DOCTYPE html>
        <html>
        <head>
            <title>正在登录论坛...</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; 
                    text-align: center; 
                    padding: 100px 20px; 
                    background: #f8f9fa;
                }
                .container {
                    max-width: 400px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .loading {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #007bff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: 10px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="loading"></div>
                <h3>正在自动登录论坛...</h3>
                <p>如果页面没有自动跳转，<a href="/forum" id="forum-link">请点击这里</a></p>
            </div>
            
            <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js"></script>
            <script>
                // 设置论坛认证cookie
                const token = "' . $token . '";
                
                // 设置cookie到根域名以便论坛可以访问
                Cookies.set("flarum_remember", token, { 
                    domain: "." + window.location.hostname.split(".").slice(-2).join("."),
                    secure: window.location.protocol === "https:",
                    sameSite: "lax",
                    expires: 30 // 30天
                });
                
                // 也设置到当前域名
                Cookies.set("flarum_remember", token, { 
                    secure: window.location.protocol === "https:",
                    sameSite: "lax",
                    expires: 30
                });
                
                // 延迟跳转，确保cookie设置完成
                setTimeout(() => {
                    window.location.href = "/forum";
                }, 1000);
            </script>
        </body>
        </html>';

        return response($html);
    }

    /**
     * API接口：获取当前用户的论坛状态
     */
    public function getForumStatus(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $forumUser = $this->flarumService->getForumUser($user->email);

        return response()->json([
            'user_exists_in_forum' => !is_null($forumUser),
            'forum_user' => $forumUser,
        ]);
    }

    /**
     * 强制同步用户到论坛（管理员功能）
     */
    public function forceSyncUser(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $token = $this->flarumService->createForumJWTToken($user);
            
            return response()->json([
                'success' => !empty($token),
                'message' => $token ? '用户同步成功' : '用户同步失败',
                'token' => $token
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '同步过程中发生错误：' . $e->getMessage()
            ], 500);
        }
    }
}