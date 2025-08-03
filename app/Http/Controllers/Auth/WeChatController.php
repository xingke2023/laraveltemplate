<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class WeChatController extends Controller
{
    /**
     * Redirect to WeChat OAuth
     */
    public function redirect(Request $request)
    {
        // 保存重定向URL到session
        if ($redirectUrl = $request->get('redirect')) {
            session(['wechat_redirect_url' => $redirectUrl]);
        }
        
        return Socialite::driver('weixin')->scopes(['snsapi_base'])->redirect();
    }

    /**
     * Handle WeChat OAuth callback
     */
    public function callback(Request $request)
    {
        try {
            $wechatUser = Socialite::driver('weixin')->user();
            
            // Check if user exists by WeChat openid
            $user = User::where('wechat_openid', $wechatUser->getId())->first();
            
            if ($user) {
                // User exists, update info and login
                $user->update([
                    'name' => $wechatUser->getName() ?: $user->name,
                    'avatar' => $wechatUser->getAvatar() ?: $user->avatar,
                    'wechat_nickname' => $wechatUser->getNickname(),
                    'wechat_avatar' => $wechatUser->getAvatar(),
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'name' => $wechatUser->getName() ?: $wechatUser->getNickname() ?: '微信用户',
                    'email' => $wechatUser->getEmail() ?: $wechatUser->getId() . '@wechat.local',
                    'password' => Hash::make(Str::random(32)), // Random password
                    'wechat_openid' => $wechatUser->getId(),
                    'wechat_nickname' => $wechatUser->getNickname(),
                    'wechat_avatar' => $wechatUser->getAvatar(),
                    'avatar' => $wechatUser->getAvatar(),
                    'email_verified_at' => now(), // Auto-verify WeChat users
                ]);
            }

            // Login the user
            Auth::login($user, true);

            // 获取保存的重定向URL，优先级：session > intended > 默认首页
            $redirectUrl = session('wechat_redirect_url') ?: '/';
            session()->forget('wechat_redirect_url');
            
            // 返回React登录成功页面，支持Inertia.js
            return $this->inertiaLoginSuccess($redirectUrl, $user);
            
        } catch (\Exception $e) {
            // Handle error
            return redirect()->route('login')->with('error', '微信登录失败，请重试');
        }
    }
    
    /**
     * 使用Inertia.js返回登录成功页面
     */
    private function inertiaLoginSuccess($redirectUrl, $user)
    {
        $welcomeMessage = $user->wasRecentlyCreated ? '欢迎加入！' : '欢迎回来！';
        
        return inertia('auth/WeChatLoginSuccess', [
            'redirectUrl' => $redirectUrl,
            'user' => $user,
            'message' => $welcomeMessage,
            'isNewUser' => $user->wasRecentlyCreated
        ]);
    }
}