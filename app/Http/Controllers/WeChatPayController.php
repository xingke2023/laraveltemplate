<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use EasyWeChat\Pay\Application;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WeChatPayController extends Controller
{
    protected $app;

    public function __construct()
    {
        try {
            $this->app = $this->getPayApplication();
        } catch (Exception $e) {
            Log::error('WeChat Pay Application initialization failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'config' => [
                    'mch_id' => config('wechat_pay.mch_id'),
                    'private_key_path' => storage_path('certs/apiclient_key_wx.pem'),
                    'private_key_exists' => file_exists(storage_path('certs/apiclient_key_wx.pem')),
                ]
            ]);
            $this->app = null;
        }
    }

    private function getPayApplication()
    {
        $privateKeyPath = storage_path('certs/apiclient_key_wx.pem');
        
        // 检查私钥文件是否存在
        if (!file_exists($privateKeyPath)) {
            throw new Exception("私钥文件不存在: {$privateKeyPath}");
        }
        
        // 读取私钥内容
        $privateKeyContent = file_get_contents($privateKeyPath);
        if (empty($privateKeyContent)) {
            throw new Exception("私钥文件内容为空");
        }
        
        // 检查私钥格式
        if (strpos($privateKeyContent, '-----BEGIN PRIVATE KEY-----') === false) {
            throw new Exception("私钥文件格式不正确，请确保是PEM格式的私钥");
        }
        
        // 验证私钥是否有效
        $privateKey = openssl_pkey_get_private($privateKeyContent);
        if (!$privateKey) {
            throw new Exception("无效的私钥内容，请检查私钥文件");
        }
        
        $config = [
            'mch_id' => config('wechat_pay.mch_id'),
            'private_key' => $privateKeyPath,
            'certificate' => storage_path('certs/apiclient_cert_wx.pem'),
            'secret_key' => config('wechat_pay.apiv3_key'),
            // 使用微信支付公钥模式，不需要平台证书
            'platform_certs' => [],
            'http' => config('wechat_pay.http'),
        ];

        try {
            $app = new Application($config);
            // 测试应用是否正确初始化
            Log::info('WeChat Pay application initialized successfully', ['config' => $config]);
            return $app;
        } catch (Exception $e) {
            Log::error('WeChat Pay Application creation failed: ' . $e->getMessage(), [
                'config' => $config,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function index()
    {
        $status = [
            'app_id' => config('wechat_pay.app_id'),
            'mch_id' => config('wechat_pay.mch_id'),
            'private_key_exists' => file_exists(storage_path('certs/apiclient_key_wx.pem')),
            'private_key_path' => storage_path('certs/apiclient_key_wx.pem'),
            'notify_url' => config('wechat_pay.notify_url'),
            'app_initialized' => $this->app !== null,
        ];
        
        return Inertia::render('Payment/Index', ['status' => $status]);
    }

    public function createOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:127',
        ]);

        // 检查微信支付应用是否初始化成功
        if (!$this->app) {
            return response()->json([
                'success' => false,
                'message' => '微信支付配置错误，请检查私钥文件是否正确',
            ], 500);
        }

        try {
            $outTradeNo = 'ORDER_' . date('YmdHis') . '_' . Str::random(6);
            $amount = (int) ($request->amount * 100);

            $params = [
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

            $response = $this->app->getClient()->postJson('v3/pay/transactions/jsapi', $params);
            $result = $response->toArray();

            if (isset($result['prepay_id'])) {
                $utils = $this->app->getUtils();
                $config = $utils->buildBridgeConfig($result['prepay_id'], config('wechat_pay.app_id'));

                return response()->json([
                    'success' => true,
                    'data' => [
                        'out_trade_no' => $outTradeNo,
                        'prepay_id' => $result['prepay_id'],
                        'config' => $config,
                    ],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => '创建订单失败',
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

    public function notify(Request $request)
    {
        try {
            $server = $this->app->getServer();
            
            $server->handlePaid(function ($message, $next) {
                Log::info('WeChat Pay notify: ', $message->toArray());
                
                // 这里处理支付成功的业务逻辑
                // 比如更新订单状态、发送通知等
                
                return $next($message);
            });

            return $server->serve();
        } catch (Exception $e) {
            Log::error('WeChat Pay notify error: ' . $e->getMessage());
            return response()->json(['code' => 'FAIL', 'message' => $e->getMessage()]);
        }
    }

    public function queryOrder(Request $request)
    {
        $request->validate([
            'out_trade_no' => 'required|string',
        ]);

        try {
            $outTradeNo = $request->out_trade_no;
            $mchid = config('wechat_pay.mch_id');
            $response = $this->app->getClient()->get("v3/pay/transactions/out-trade-no/{$outTradeNo}?mchid={$mchid}");
            $result = $response->toArray();

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (Exception $e) {
            Log::error('WeChat Pay query order error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '查询订单失败: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function refund(Request $request)
    {
        $request->validate([
            'out_trade_no' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'string|max:80',
        ]);

        try {
            $outRefundNo = 'REFUND_' . date('YmdHis') . '_' . Str::random(6);
            $amount = (int) ($request->amount * 100);

            $params = [
                'out_trade_no' => $request->out_trade_no,
                'out_refund_no' => $outRefundNo,
                'reason' => $request->reason ?? '用户申请退款',
                'amount' => [
                    'refund' => $amount,
                    'total' => $amount,
                    'currency' => 'CNY',
                ],
            ];

            $response = $this->app->getClient()->postJson('v3/refund/domestic/refunds', $params);
            $result = $response->toArray();

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (Exception $e) {
            Log::error('WeChat Pay refund error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '退款申请失败: ' . $e->getMessage(),
            ], 500);
        }
    }
}