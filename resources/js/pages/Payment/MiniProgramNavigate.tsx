import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Smartphone, ArrowRight, Check, CheckCircle, XCircle } from 'lucide-react';
import { isWeChatBrowser } from '@/utils/wechat';

interface PaymentData {
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: string;
    paySign: string;
    orderId: string;
    amount: number;
    description: string;
}

interface Props {
    orderId?: string;
    amount?: number;
    description?: string;
}

interface PaymentResult {
    status: 'success' | 'failed' | 'cancelled';
    orderId: string;
    message?: string;
}

export default function MiniProgramNavigate({ orderId, amount = 99, description = 'VIP会员' }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isWeChat, setIsWeChat] = useState(false);
    const [sdkReady, setSdkReady] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string[]>([]);
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

    const addDebugInfo = (info: string) => {
        console.log('DEBUG:', info);
        setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
    };

    useEffect(() => {
        const init = async () => {
            try {
                // 解析URL参数，检查是否从小程序返回
                const urlParams = new URLSearchParams(window.location.search);
                const status = urlParams.get('status');
                const returnedOrderId = urlParams.get('orderId');
                
                if (status && returnedOrderId) {
                    addDebugInfo(`检测到小程序返回参数: status=${status}, orderId=${returnedOrderId}`);
                    
                    const result: PaymentResult = {
                        status: status as 'success' | 'failed' | 'cancelled',
                        orderId: returnedOrderId,
                        message: status === 'success' ? '支付成功' : status === 'failed' ? '支付失败' : '支付已取消'
                    };
                    
                    setPaymentResult(result);
                    
                    if (status === 'success') {
                        addDebugInfo(`订单 ${returnedOrderId} 支付成功！`);
                        // 可以在这里添加成功后的处理逻辑，比如跳转到成功页面
                        setTimeout(() => {
                            router.visit('/payment/success', { 
                                data: { orderId: returnedOrderId },
                                method: 'get'
                            });
                        }, 3000);
                    }
                    
                    return; // 如果是返回状态，不需要继续初始化SDK
                }
                
                addDebugInfo('初始化微信JS-SDK环境检测...');
                
                // 检测是否在微信环境
                const wechatEnv = isWeChatBrowser();
                setIsWeChat(wechatEnv);
                addDebugInfo(`微信环境检测: ${wechatEnv}`);
                addDebugInfo(`User Agent: ${navigator.userAgent}`);
                
                // 检测微信JS-SDK
                let retries = 0;
                const maxRetries = 20;
                
                const checkSDK = () => {
                    const hasWx = typeof window.wx !== 'undefined';
                    const hasMiniProgram = typeof window.wx?.miniProgram !== 'undefined';
                    const hasNavigateTo = typeof window.wx?.miniProgram?.navigateTo !== 'undefined';
                    
                    addDebugInfo(`SDK检查 (${retries + 1}/${maxRetries}): wx=${hasWx}, miniProgram=${hasMiniProgram}, navigateTo=${hasNavigateTo}`);
                    
                    if (hasWx && hasMiniProgram && hasNavigateTo) {
                        setSdkReady(true);
                        addDebugInfo('微信JS-SDK已就绪，navigateTo功能可用');
                        return;
                    }
                    
                    if (retries < maxRetries) {
                        retries++;
                        setTimeout(checkSDK, 500);
                    } else {
                        const errorMsg = '微信JS-SDK加载超时，navigateTo功能不可用';
                        setError(errorMsg);
                        addDebugInfo(`错误: ${errorMsg}`);
                    }
                };
                
                // 立即检查一次，然后延迟检查
                checkSDK();
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : '初始化失败';
                setError(errorMsg);
                addDebugInfo(`初始化错误: ${errorMsg}`);
            }
        };

        init();
    }, []);

    /**
     * 使用 wx.miniProgram.navigateTo 跳转到小程序支付页面
     */
    const navigateToMiniProgramPayment = async () => {
        addDebugInfo('用户点击跳转支付按钮');
        setIsLoading(true);
        setError(null);

        try {
            if (!sdkReady) {
                throw new Error('微信JS-SDK未就绪');
            }

            const wx = window.wx;
            
            // 准备支付数据
            const payData = {
                amount: amount,
                description: description,
                orderId: orderId || `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                timestamp: Date.now(),
                source: 'webview'
            };

            addDebugInfo(`准备跳转参数: ${JSON.stringify(payData)}`);
            
            // 构建跳转URL
            const navigateUrl = `/pages/wxpay/wxpay?payData=${encodeURIComponent(JSON.stringify(payData))}`;
            addDebugInfo(`跳转URL: ${navigateUrl}`);

            // 使用 wx.miniProgram.navigateTo 跳转
            wx.miniProgram.navigateTo({
                url: navigateUrl,
                success: (res: any) => {
                    addDebugInfo(`跳转成功: ${JSON.stringify(res)}`);
                    console.log('小程序页面跳转成功', res);
                },
                fail: (err: any) => {
                    const errorMsg = `跳转失败: ${JSON.stringify(err)}`;
                    addDebugInfo(errorMsg);
                    console.error('小程序页面跳转失败', err);
                    setError(`跳转小程序失败: ${err.errMsg || '未知错误'}`);
                },
                complete: (res: any) => {
                    addDebugInfo(`跳转完成: ${JSON.stringify(res)}`);
                    setIsLoading(false);
                }
            });

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '跳转失败';
            setError(errorMsg);
            addDebugInfo(`跳转失败: ${errorMsg}`);
            setIsLoading(false);
        }
    };

    const handleWebPayment = () => {
        addDebugInfo('跳转到网页支付');
        window.location.href = '/wechat/pay';
    };

    return (
        <>
            <Head title={paymentResult ? "支付结果" : "小程序跳转支付"} />
            
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
                <div className="max-w-md mx-auto pt-8">
                    {paymentResult ? (
                        <Card className="shadow-lg">
                            <CardHeader className="text-center pb-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                    paymentResult.status === 'success' 
                                        ? 'bg-green-100' 
                                        : paymentResult.status === 'failed' 
                                            ? 'bg-red-100' 
                                            : 'bg-orange-100'
                                }`}>
                                    {paymentResult.status === 'success' ? (
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    ) : paymentResult.status === 'failed' ? (
                                        <XCircle className="w-8 h-8 text-red-600" />
                                    ) : (
                                        <XCircle className="w-8 h-8 text-orange-600" />
                                    )}
                                </div>
                                <CardTitle className="text-xl font-bold text-gray-800">
                                    {paymentResult.message}
                                </CardTitle>
                                <p className="text-sm text-gray-600 mt-2">
                                    订单号: {paymentResult.orderId}
                                </p>
                                {paymentResult.status === 'success' && (
                                    <p className="text-sm text-green-600 mt-2">
                                        3秒后自动跳转到成功页面...
                                    </p>
                                )}
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                {paymentResult.status === 'success' && (
                                    <Alert className="border-green-200 bg-green-50">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-800">
                                            支付成功！您的VIP会员已激活。
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {paymentResult.status === 'failed' && (
                                    <Alert variant="destructive">
                                        <XCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            支付失败，请重试或联系客服。
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {paymentResult.status === 'cancelled' && (
                                    <Alert className="border-orange-200 bg-orange-50">
                                        <XCircle className="h-4 w-4 text-orange-600" />
                                        <AlertDescription className="text-orange-800">
                                            支付已取消，您可以重新发起支付。
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                <div className="flex space-x-3">
                                    <Button
                                        onClick={() => router.visit('/payment')}
                                        variant={paymentResult.status === 'success' ? 'secondary' : 'default'}
                                        className="flex-1"
                                    >
                                        返回支付页面
                                    </Button>
                                    {paymentResult.status === 'success' && (
                                        <Button
                                            onClick={() => router.visit('/dashboard')}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            进入会员中心
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="shadow-lg">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ArrowRight className="w-8 h-8 text-green-600" />
                                </div>
                                <CardTitle className="text-xl font-bold text-gray-800">
                                    小程序跳转支付
                                </CardTitle>
                                <p className="text-sm text-gray-600 mt-2">
                                    使用 wx.miniProgram.navigateTo 跳转至小程序支付页面
                                </p>
                            </CardHeader>

                        <CardContent className="space-y-6">
                            {/* 支付信息 */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">商品</span>
                                    <span className="font-medium">{description}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">金额</span>
                                    <span className="text-2xl font-bold text-red-600">
                                        ¥{amount.toFixed(2)}
                                    </span>
                                </div>
                                {orderId && (
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-gray-600">订单号</span>
                                        <span className="text-sm text-gray-500">{orderId}</span>
                                    </div>
                                )}
                            </div>

                            {/* 环境状态 */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${isWeChat ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm">微信环境: {isWeChat ? '已检测' : '未检测'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${sdkReady ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                    <span className="text-sm">JS-SDK: {sdkReady ? '已就绪' : '加载中...'}</span>
                                </div>
                            </div>

                            {/* 错误信息 */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* 环境检测提示 */}
                            {!isWeChat && (
                                <Alert>
                                    <AlertDescription>
                                        检测到您不在微信环境中，将为您跳转到网页支付
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* 支付按钮 */}
                            <div className="space-y-3">
                                {isWeChat && sdkReady ? (
                                    <Button
                                        onClick={navigateToMiniProgramPayment}
                                        disabled={isLoading}
                                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                跳转中...
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRight className="w-4 h-4 mr-2" />
                                                跳转到小程序支付
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleWebPayment}
                                        disabled={isLoading}
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    >
                                        <Smartphone className="w-4 h-4 mr-2" />
                                        网页支付
                                    </Button>
                                )}
                            </div>

                            {/* 功能说明 */}
                            <div className="text-center text-sm text-gray-500 space-y-1">
                                <p>• 使用微信 JS-SDK 的 navigateTo 接口</p>
                                <p>• 跳转至小程序 pages/wxpay/wxpay 页面</p>
                                <p>• 支付参数通过 URL 参数传递</p>
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    {/* 实现详情 - 只在非结果页面显示 */}
                    {!paymentResult && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Check className="w-5 h-5 mr-2 text-green-600" />
                                    实现详情
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-sm text-gray-600">
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">核心代码:</h4>
                                        <div className="bg-gray-100 rounded p-3 font-mono text-xs overflow-x-auto">
                                            <pre>{`wx.miniProgram.navigateTo({
  url: \`/pages/wxpay/wxpay?payData=\${encodeURIComponent(JSON.stringify(payData))}\`
});`}</pre>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">传递参数:</h4>
                                        <ul className="space-y-1 text-gray-600">
                                            <li>• amount: 支付金额（元）</li>
                                            <li>• description: 商品描述</li>
                                            <li>• orderId: 订单号</li>
                                            <li>• timestamp: 时间戳</li>
                                            <li>• source: 来源标识（webview）</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">支付流程:</h4>
                                        <ol className="space-y-1 text-gray-600">
                                            <li>1. 检测微信环境和JS-SDK</li>
                                            <li>2. 构建支付参数</li>
                                            <li>3. 调用 navigateTo 跳转小程序</li>
                                            <li>4. 小程序页面处理支付逻辑</li>
                                        </ol>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 调试信息 */}
                    {(process.env.NODE_ENV === 'development' || debugInfo.length > 0) && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">调试信息</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-xs text-gray-600 max-h-60 overflow-y-auto bg-gray-50 rounded p-3">
                                    {debugInfo.map((info, index) => (
                                        <div key={index} className="font-mono break-all">{info}</div>
                                    ))}
                                    {debugInfo.length === 0 && (
                                        <div className="text-gray-400">暂无调试信息</div>
                                    )}
                                </div>
                                
                                {/* 测试按钮 */}
                                <div className="mt-4 pt-4 border-t border-gray-200 space-x-2">
                                    <button
                                        onClick={() => {
                                            addDebugInfo('手动环境检测');
                                            addDebugInfo(`isWeChat: ${isWeChat}`);
                                            addDebugInfo(`sdkReady: ${sdkReady}`);
                                            addDebugInfo(`window.wx: ${typeof window.wx}`);
                                            if (window.wx) {
                                                addDebugInfo(`wx.miniProgram: ${typeof window.wx.miniProgram}`);
                                                addDebugInfo(`wx.miniProgram.navigateTo: ${typeof window.wx.miniProgram?.navigateTo}`);
                                            }
                                        }}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                                    >
                                        环境检测
                                    </button>
                                    <button
                                        onClick={() => {
                                            addDebugInfo('测试跳转功能');
                                            navigateToMiniProgramPayment();
                                        }}
                                        className="px-3 py-1 bg-green-200 text-green-700 rounded text-xs hover:bg-green-300"
                                    >
                                        测试跳转
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

