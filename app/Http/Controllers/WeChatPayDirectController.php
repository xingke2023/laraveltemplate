<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WeChatPayDirectController extends Controller
{
    private function signRequest($url, $method, $body, $timestamp, $nonceStr)
    {
        $privateKeyPath = storage_path('certs/apiclient_key_wx.pem');
        $privateKey = file_get_contents($privateKeyPath);
        
        $urlPath = parse_url($url, PHP_URL_PATH);
        $query = parse_url($url, PHP_URL_QUERY);
        if ($query) {
            $urlPath .= '?' . $query;
        }
        
        $message = $method . "\n" . 
                  $urlPath . "\n" . 
                  $timestamp . "\n" . 
                  $nonceStr . "\n" . 
                  $body . "\n";
        
        $signature = '';
        openssl_sign($message, $signature, $privateKey, OPENSSL_ALGO_SHA256);
        
        return base64_encode($signature);
    }
    
    private function getAuthorizationHeader($url, $method, $body)
    {
        $timestamp = time();
        $nonceStr = Str::random(32);
        $signature = $this->signRequest($url, $method, $body, $timestamp, $nonceStr);
        
        return sprintf(
            'WECHATPAY2-SHA256-RSA2048 mchid="%s",nonce_str="%s",timestamp="%s",serial_no="%s",signature="%s"',
            config('wechat_pay.mch_id'),
            $nonceStr,
            $timestamp,
            config('wechat_pay.cert_serial_no'),
            $signature
        );
    }
    
    public function createOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:127',
        ]);
        
        try {
            $outTradeNo = 'ORDER_' . date('YmdHis') . '_' . Str::random(6);
            $amount = (int) ($request->amount * 100);
            
            $body = [
                'appid' => config('wechat_pay.app_id'),
                'mchid' => config('wechat_pay.mch_id'),
                'description' => $request->description,
                'out_trade_no' => $outTradeNo,
                'notify_url' => config('wechat_pay.notify_url'),
                'amount' => [
                    'total' => $amount,
                    'currency' => 'CNY',
                ],
                'payer' => [
                    'openid' => $request->user()->wechat_openid ?? 'test_openid',
                ],
            ];
            
            $bodyJson = json_encode($body);
            $url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';
            
            $authorization = $this->getAuthorizationHeader($url, 'POST', $bodyJson);
            
            $response = Http::withHeaders([
                'Authorization' => $authorization,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'User-Agent' => 'Laravel/EasyWeChat',
            ])->post($url, $body);
            
            if ($response->successful()) {
                $result = $response->json();
                
                if (isset($result['prepay_id'])) {
                    // 生成前端支付配置
                    $paymentConfig = $this->buildPaymentConfig($result['prepay_id']);
                    
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'out_trade_no' => $outTradeNo,
                            'prepay_id' => $result['prepay_id'],
                            'config' => $paymentConfig,
                        ],
                    ]);
                }
            }
            
            Log::error('WeChat Pay API Error', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => '创建订单失败: ' . ($response->json()['message'] ?? 'Unknown error'),
            ], 400);
            
        } catch (Exception $e) {
            Log::error('WeChat Pay create order error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => '创建订单失败: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    private function buildPaymentConfig($prepayId)
    {
        $appId = config('wechat_pay.app_id');
        $timeStamp = time();
        $nonceStr = Str::random(32);
        $package = "prepay_id={$prepayId}";
        
        $message = $appId . "\n" . $timeStamp . "\n" . $nonceStr . "\n" . $package . "\n";
        
        $privateKeyPath = storage_path('certs/apiclient_key_wx.pem');
        $privateKey = file_get_contents($privateKeyPath);
        
        $signature = '';
        openssl_sign($message, $signature, $privateKey, OPENSSL_ALGO_SHA256);
        
        return [
            'appId' => $appId,
            'timeStamp' => (string) $timeStamp,
            'nonceStr' => $nonceStr,
            'package' => $package,
            'signType' => 'RSA',
            'paySign' => base64_encode($signature),
        ];
    }

    public function createMiniProgramOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:127',
            'order_id' => 'nullable|string',
            'mini_openid' => 'nullable|string', // 允许前端传递小程序openid
        ]);
        
        try {
            $outTradeNo = $request->order_id ?? 'MP_ORDER_' . date('YmdHis') . '_' . Str::random(6);
            $amount = (int) $request->amount;
            
            // 获取小程序OpenID
            $miniOpenid = $this->getMiniProgramOpenId($request);
            
            $body = [
                'appid' => config('wechat_pay.mini_program_app_id', config('wechat_pay.app_id')),
                'mchid' => config('wechat_pay.mch_id'),
                'description' => $request->description,
                'out_trade_no' => $outTradeNo,
                'notify_url' => config('wechat_pay.notify_url'),
                'amount' => [
                    'total' => $amount,
                    'currency' => 'CNY',
                ],
                'payer' => [
                    'openid' => $miniOpenid,
                ],
            ];
            
            $bodyJson = json_encode($body);
            $url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';
            
            $authorization = $this->getAuthorizationHeader($url, 'POST', $bodyJson);
            
            $response = Http::withHeaders([
                'Authorization' => $authorization,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'User-Agent' => 'Laravel/MiniProgram',
            ])->post($url, $body);
            
            if ($response->successful()) {
                $result = $response->json();
                
                if (isset($result['prepay_id'])) {
                    // 生成小程序支付参数
                    $miniPaymentConfig = $this->buildMiniProgramPaymentConfig($result['prepay_id']);
                    
                    return response()->json([
                        'timeStamp' => $miniPaymentConfig['timeStamp'],
                        'nonceStr' => $miniPaymentConfig['nonceStr'],
                        'package' => $miniPaymentConfig['package'],
                        'signType' => $miniPaymentConfig['signType'],
                        'paySign' => $miniPaymentConfig['paySign'],
                        'orderId' => $outTradeNo,
                    ]);
                }
            }
            
            Log::error('WeChat Mini Program Pay API Error', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => '创建小程序支付订单失败: ' . ($response->json()['message'] ?? 'Unknown error'),
            ], 400);
            
        } catch (Exception $e) {
            Log::error('WeChat Mini Program Pay create order error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => '创建小程序支付订单失败: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    private function buildMiniProgramPaymentConfig($prepayId)
    {
        $appId = config('wechat_pay.mini_program_app_id', config('wechat_pay.app_id'));
        $timeStamp = time();
        $nonceStr = Str::random(32);
        $package = "prepay_id={$prepayId}";
        $signType = 'RSA';
        
        $message = $appId . "\n" . $timeStamp . "\n" . $nonceStr . "\n" . $package . "\n";
        
        $privateKeyPath = storage_path('certs/apiclient_key_wx.pem');
        $privateKey = file_get_contents($privateKeyPath);
        
        $signature = '';
        openssl_sign($message, $signature, $privateKey, OPENSSL_ALGO_SHA256);
        
        return [
            'appId' => $appId,
            'timeStamp' => (string) $timeStamp,
            'nonceStr' => $nonceStr,
            'package' => $package,
            'signType' => $signType,
            'paySign' => base64_encode($signature),
        ];
    }

    public function miniProgramIndex()
    {
        return Inertia::render('Payment/MiniProgram');
    }

    /**
     * 小程序跳转支付页面
     */
    public function miniProgramNavigateIndex()
    {
        return Inertia::render('Payment/MiniProgramNavigate');
    }
    
    /**
     * 获取小程序OpenID
     * 如果用户有UnionID，可以通过API调用获取小程序OpenID
     * 否则使用传递的OpenID或测试OpenID
     */
    private function getMiniProgramOpenId(Request $request): string
    {
        // 1. 优先使用前端传递的小程序OpenID
        if ($request->mini_openid) {
            return $request->mini_openid;
        }
        
        // 2. 如果用户已登录，检查是否有小程序OpenID
        if ($request->user() && $request->user()->wechat_mini_openid) {
            return $request->user()->wechat_mini_openid;
        }
        
        // 3. 如果有UnionID，可以通过微信API获取小程序OpenID
        if ($request->user() && $request->user()->wechat_unionid) {
            // 这里可以调用微信API根据UnionID获取小程序OpenID
            // 但需要小程序的access_token，暂时跳过
            // $miniOpenid = $this->getOpenIdByUnionId($request->user()->wechat_unionid);
            // if ($miniOpenid) return $miniOpenid;
        }
        
        // 4. 使用测试OpenID（开发环境）
        return 'test_miniprogram_openid_' . time();
    }
    
    /**
     * 根据UnionID获取小程序OpenID（需要小程序access_token）
     * 这个方法需要小程序的AppSecret和access_token
     */
    private function getOpenIdByUnionId(string $unionId): ?string
    {
        // 实现说明：
        // 1. 需要先获取小程序的access_token
        // 2. 调用微信API: GET https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
        // 3. 但这个API需要先有OpenID，形成了循环依赖
        // 
        // 更好的方案是在用户首次通过小程序登录时，就保存小程序的OpenID到数据库
        // 或者让小程序端在webview中传递当前用户的OpenID
        
        return null;
    }
}