<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WeChatMiniProgramController extends Controller
{
    /**
     * 小程序登录，获取用户OpenID和UnionID
     */
    public function login(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);
        
        $code = $request->input('code');
        
        try {
            // 调用微信API获取session_key和openid
            $response = Http::get('https://api.weixin.qq.com/sns/jscode2session', [
                'appid' => config('wechat_pay.mini_program_app_id'),
                'secret' => config('wechat_pay.mini_program_app_secret'),
                'js_code' => $code,
                'grant_type' => 'authorization_code',
            ]);
            
            $data = $response->json();
            
            Log::info('小程序登录API响应', ['response' => $data]);
            
            if (isset($data['openid'])) {
                return response()->json([
                    'success' => true,
                    'openid' => $data['openid'],
                    'unionid' => $data['unionid'] ?? null,
                    'session_key' => $data['session_key'] ?? null,
                ]);
            }
            
            if (isset($data['errcode'])) {
                return response()->json([
                    'success' => false,
                    'error' => '微信API错误',
                    'errcode' => $data['errcode'],
                    'errmsg' => $data['errmsg'] ?? 'Unknown error',
                ], 400);
            }
            
            return response()->json([
                'success' => false,
                'error' => '获取OpenID失败',
                'data' => $data,
            ], 400);
            
        } catch (\Exception $e) {
            Log::error('小程序登录失败', [
                'error' => $e->getMessage(),
                'code' => $code,
            ]);
            
            return response()->json([
                'success' => false,
                'error' => '系统错误: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * 获取小程序access_token
     */
    public function getAccessToken()
    {
        try {
            $response = Http::get('https://api.weixin.qq.com/cgi-bin/token', [
                'grant_type' => 'client_credential',
                'appid' => config('wechat_pay.mini_program_app_id'),
                'secret' => config('wechat_pay.mini_program_app_secret'),
            ]);
            
            $data = $response->json();
            
            if (isset($data['access_token'])) {
                return response()->json([
                    'success' => true,
                    'access_token' => $data['access_token'],
                    'expires_in' => $data['expires_in'],
                ]);
            }
            
            return response()->json([
                'success' => false,
                'error' => '获取access_token失败',
                'data' => $data,
            ], 400);
            
        } catch (\Exception $e) {
            Log::error('获取小程序access_token失败', [
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'error' => '系统错误: ' . $e->getMessage(),
            ], 500);
        }
    }
}