import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Smartphone, CreditCard, User } from 'lucide-react';
import { 
    isMiniProgramEnvironment, 
    isWeChatSDKReady, 
    requestMiniProgramPayment,
    testMiniProgramMessage,
    navigateToMyAccount 
} from '@/utils/miniprogram';

interface PaymentData {
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: string;
    paySign: string;
    orderId: string;
}

interface Props {
    orderId?: string;
    amount?: number;
    description?: string;
}

export default function MiniProgramPayment({ orderId, amount = 9.9, description = 'VIP会员' }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMiniProgram, setIsMiniProgram] = useState(false);
    const [paymentReady, setPaymentReady] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string[]>([]);

    const addDebugInfo = (info: string) => {
        console.log('DEBUG:', info);
        setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
    };

    useEffect(() => {
        const init = async () => {
            try {
                addDebugInfo('开始初始化...');
                
                // 检测是否在小程序环境
                const miniProgram = isMiniProgramEnvironment();
                setIsMiniProgram(miniProgram);
                addDebugInfo(`小程序环境检测结果: ${miniProgram}`);
                addDebugInfo(`User Agent: ${navigator.userAgent}`);
                addDebugInfo(`window.wx 存在: ${typeof window.wx !== 'undefined'}`);
                addDebugInfo(`__wxjs_environment: ${(window as any).__wxjs_environment}`);
                
                // 等待微信 JS-SDK 就绪
                let retries = 0;
                const maxRetries = 20;
                
                const checkSDK = () => {
                    const sdkReady = isWeChatSDKReady();
                    addDebugInfo(`SDK检查 (${retries + 1}/${maxRetries}): ${sdkReady}`);
                    
                    if (sdkReady) {
                        setPaymentReady(true);
                        addDebugInfo('SDK已就绪，支付功能可用');
                        
                        // 测试是否能发送消息
                        try {
                            addDebugInfo('自动测试 postMessage 功能');
                            window.wx.miniProgram.postMessage({
                                data: { test: 'hello from h5', autoTest: true, timestamp: Date.now() }
                            });
                            addDebugInfo('自动测试消息发送成功');
                        } catch (error) {
                            addDebugInfo(`自动测试消息发送失败: ${error}`);
                        }
                        return;
                    }
                    
                    if (retries < maxRetries) {
                        retries++;
                        setTimeout(checkSDK, 500);
                    } else {
                        const errorMsg = '微信 JS-SDK 加载超时';
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

    const createMiniProgramPayment = async () => {
        addDebugInfo('用户点击支付按钮');
        setIsLoading(true);
        setError(null);

        try {
            addDebugInfo(`准备发送支付请求: 金额=${amount}, 描述=${description}, 订单号=${orderId}`);
            await requestMiniProgramPayment(amount, description, orderId);
            addDebugInfo('支付请求已发送到小程序');
            setIsLoading(false);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '支付失败';
            setError(errorMsg);
            addDebugInfo(`支付失败: ${errorMsg}`);
            setIsLoading(false);
        }
    };

    const handleWebviewPayment = () => {
        addDebugInfo('用户点击网页支付按钮');
        // 如果不在小程序环境，跳转到常规支付页面
        try {
            addDebugInfo('准备跳转到常规支付页面');
            window.location.href = '/wechat/pay';
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '跳转失败';
            addDebugInfo(`跳转失败: ${errorMsg}`);
            setError(errorMsg);
        }
    };

    const handleMyAccount = async () => {
        addDebugInfo('用户点击我的账户按钮');
        setIsLoading(true);
        
        try {
            addDebugInfo('准备跳转到小程序我的账户页面');
            await navigateToMyAccount();
            addDebugInfo('跳转请求已发送');
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '跳转失败';
            addDebugInfo(`跳转失败: ${errorMsg}`);
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title="小程序支付" />
            
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
                <div className="max-w-md mx-auto pt-8">
                    <Card className="shadow-lg">
                        <CardHeader className="text-center pb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Smartphone className="w-8 h-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-800">
                                小程序支付
                            </CardTitle>
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

                            {/* 错误信息 */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* 环境检测提示 */}
                            {!isMiniProgram && (
                                <Alert>
                                    <AlertDescription>
                                        检测到您不在小程序环境中，将为您跳转到网页支付
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* 支付按钮 */}
                            <div className="space-y-3">
                                {isMiniProgram && paymentReady ? (
                                    <Button
                                        onClick={createMiniProgramPayment}
                                        disabled={isLoading}
                                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                处理中...
                                            </>
                                        ) : (
                                            <>
                                                <Smartphone className="w-4 h-4 mr-2" />
                                                小程序支付
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleWebviewPayment}
                                        disabled={isLoading}
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                处理中...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4 mr-2" />
                                                网页支付
                                            </>
                                        )}
                                    </Button>
                                )}

                                {/* 我的账户按钮 - 只在小程序环境中显示 */}
                                {isMiniProgram && (
                                    <Button
                                        onClick={handleMyAccount}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                处理中...
                                            </>
                                        ) : (
                                            <>
                                                <User className="w-4 h-4 mr-2" />
                                                我的账户
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {/* 支付说明 */}
                            <div className="text-center text-sm text-gray-500 space-y-1">
                                <p>• 请确保在微信小程序中打开此页面</p>
                                <p>• 支付完成后会自动返回页面</p>
                                <p>• 如有问题请联系客服</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 支付流程说明 */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">支付流程</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-blue-600">1</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">生成支付参数</p>
                                        <p className="text-gray-500">系统生成小程序支付所需参数</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-blue-600">2</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">跳转小程序</p>
                                        <p className="text-gray-500">跳转到小程序原生支付页面</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-blue-600">3</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">完成支付</p>
                                        <p className="text-gray-500">使用微信支付完成交易</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 调试信息 */}
                    {process.env.NODE_ENV === 'development' || debugInfo.length > 0 ? (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">调试信息</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-xs text-gray-600 max-h-40 overflow-y-auto">
                                    {debugInfo.map((info, index) => (
                                        <div key={index} className="font-mono">{info}</div>
                                    ))}
                                    {debugInfo.length === 0 && (
                                        <div className="text-gray-400">暂无调试信息</div>
                                    )}
                                </div>
                                
                                {/* 手动测试按钮 */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            addDebugInfo('手动测试 - 检查环境');
                                            addDebugInfo(`当前 isMiniProgram: ${isMiniProgram}`);
                                            addDebugInfo(`当前 paymentReady: ${paymentReady}`);
                                            addDebugInfo(`window.wx: ${typeof window.wx}`);
                                            if (window.wx) {
                                                addDebugInfo(`wx.miniProgram: ${typeof window.wx.miniProgram}`);
                                            }
                                        }}
                                        className="mr-2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                                    >
                                        检查环境
                                    </button>
                                    <button
                                        onClick={() => {
                                            addDebugInfo('手动测试支付请求');
                                            createMiniProgramPayment();
                                        }}
                                        className="mr-2 px-3 py-1 bg-blue-200 text-blue-700 rounded text-xs hover:bg-blue-300"
                                    >
                                        测试支付
                                    </button>
                                    <button
                                        onClick={() => {
                                            addDebugInfo('手动测试网页支付');
                                            handleWebviewPayment();
                                        }}
                                        className="mr-2 px-3 py-1 bg-purple-200 text-purple-700 rounded text-xs hover:bg-purple-300"
                                    >
                                        测试网页支付
                                    </button>
                                    <button
                                        onClick={async () => {
                                            addDebugInfo('测试消息发送到小程序');
                                            const success = await testMiniProgramMessage();
                                            addDebugInfo(`消息发送结果: ${success ? '成功' : '失败'}`);
                                        }}
                                        className="mr-2 px-3 py-1 bg-green-200 text-green-700 rounded text-xs hover:bg-green-300"
                                    >
                                        测试消息
                                    </button>
                                    <button
                                        onClick={() => {
                                            addDebugInfo('测试我的账户跳转');
                                            handleMyAccount();
                                        }}
                                        className="mr-2 px-3 py-1 bg-orange-200 text-orange-700 rounded text-xs hover:bg-orange-300"
                                    >
                                        测试我的账户
                                    </button>
                                </div>
                                
                                {/* 专门的postMessage测试按钮区域 */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">postMessage 测试按钮</h4>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    addDebugInfo('测试发送简单消息到小程序');
                                                    try {
                                                        if (typeof window.wx !== 'undefined' && window.wx.miniProgram) {
                                                            window.wx.miniProgram.postMessage({
                                                                data: { test: 'hello from h5' }
                                                            });
                                                            addDebugInfo('简单消息发送成功: { test: "hello from h5" }');
                                                        } else {
                                                            addDebugInfo('wx.miniProgram 不可用');
                                                        }
                                                    } catch (error) {
                                                        addDebugInfo(`发送简单消息失败: ${error}`);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-red-200 text-red-700 rounded text-xs hover:bg-red-300"
                                            >
                                                发送简单消息
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    addDebugInfo('测试发送JSON对象到小程序');
                                                    try {
                                                        if (typeof window.wx !== 'undefined' && window.wx.miniProgram) {
                                                            const testData = {
                                                                action: 'test',
                                                                message: 'complex message from h5',
                                                                timestamp: Date.now(),
                                                                user: 'test_user',
                                                                data: {
                                                                    nested: true,
                                                                    array: [1, 2, 3],
                                                                    text: 'nested text'
                                                                }
                                                            };
                                                            window.wx.miniProgram.postMessage({
                                                                data: testData
                                                            });
                                                            addDebugInfo(`复杂消息发送成功: ${JSON.stringify(testData)}`);
                                                        } else {
                                                            addDebugInfo('wx.miniProgram 不可用');
                                                        }
                                                    } catch (error) {
                                                        addDebugInfo(`发送复杂消息失败: ${error}`);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-yellow-200 text-yellow-700 rounded text-xs hover:bg-yellow-300"
                                            >
                                                发送JSON对象
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    addDebugInfo('测试发送支付请求到小程序');
                                                    try {
                                                        if (typeof window.wx !== 'undefined' && window.wx.miniProgram) {
                                                            const paymentInfo = {
                                                                amount: amount,
                                                                description: description,
                                                                orderId: orderId || `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
                                                            };
                                                            
                                                            const paymentData = {
                                                                action: 'requestPayment',
                                                                paymentInfo: paymentInfo
                                                            };
                                                            
                                                            window.wx.miniProgram.postMessage({
                                                                data: paymentData
                                                            });
                                                            addDebugInfo(`支付请求发送成功:`);
                                                            addDebugInfo(`  action: ${paymentData.action}`);
                                                            addDebugInfo(`  paymentInfo: ${JSON.stringify(paymentInfo)}`);
                                                        } else {
                                                            addDebugInfo('wx.miniProgram 不可用');
                                                        }
                                                    } catch (error) {
                                                        addDebugInfo(`发送支付请求失败: ${error}`);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-indigo-200 text-indigo-700 rounded text-xs hover:bg-indigo-300"
                                            >
                                                发送支付请求
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    addDebugInfo('测试发送用户操作事件');
                                                    try {
                                                        if (typeof window.wx !== 'undefined' && window.wx.miniProgram) {
                                                            const eventData = {
                                                                type: 'user_event',
                                                                event: 'button_click',
                                                                target: 'test_button',
                                                                timestamp: Date.now(),
                                                                page: 'miniprogram_payment',
                                                                metadata: {
                                                                    userAgent: navigator.userAgent,
                                                                    url: window.location.href
                                                                }
                                                            };
                                                            window.wx.miniProgram.postMessage({
                                                                data: eventData
                                                            });
                                                            addDebugInfo(`用户事件发送成功: ${JSON.stringify(eventData)}`);
                                                        } else {
                                                            addDebugInfo('wx.miniProgram 不可用');
                                                        }
                                                    } catch (error) {
                                                        addDebugInfo(`发送用户事件失败: ${error}`);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-teal-200 text-teal-700 rounded text-xs hover:bg-teal-300"
                                            >
                                                发送用户事件
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    addDebugInfo('测试发送状态更新消息');
                                                    try {
                                                        if (typeof window.wx !== 'undefined' && window.wx.miniProgram) {
                                                            const statusData = {
                                                                type: 'status_update',
                                                                status: 'ready',
                                                                message: 'H5 页面已准备就绪',
                                                                timestamp: Date.now(),
                                                                capabilities: [
                                                                    'payment',
                                                                    'message_sending', 
                                                                    'user_interaction'
                                                                ]
                                                            };
                                                            window.wx.miniProgram.postMessage({
                                                                data: statusData
                                                            });
                                                            addDebugInfo(`状态更新发送成功: ${JSON.stringify(statusData)}`);
                                                        } else {
                                                            addDebugInfo('wx.miniProgram 不可用');
                                                        }
                                                    } catch (error) {
                                                        addDebugInfo(`发送状态更新失败: ${error}`);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-pink-200 text-pink-700 rounded text-xs hover:bg-pink-300"
                                            >
                                                发送状态更新
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    addDebugInfo('测试批量发送多条消息');
                                                    try {
                                                        if (typeof window.wx !== 'undefined' && window.wx.miniProgram) {
                                                            const messages = [
                                                                { test: 'message 1', id: 1 },
                                                                { test: 'message 2', id: 2 },
                                                                { test: 'message 3', id: 3 }
                                                            ];
                                                            
                                                            messages.forEach((msg, index) => {
                                                                setTimeout(() => {
                                                                    window.wx.miniProgram.postMessage({
                                                                        data: { ...msg, timestamp: Date.now() }
                                                                    });
                                                                    addDebugInfo(`批量消息 ${index + 1} 发送成功: ${JSON.stringify(msg)}`);
                                                                }, index * 100); // 每条消息间隔100ms
                                                            });
                                                        } else {
                                                            addDebugInfo('wx.miniProgram 不可用');
                                                        }
                                                    } catch (error) {
                                                        addDebugInfo(`批量发送消息失败: ${error}`);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-cyan-200 text-cyan-700 rounded text-xs hover:bg-cyan-300"
                                            >
                                                批量发送消息
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            </div>
        </>
    );
}

