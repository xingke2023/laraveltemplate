import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { useWeChatAuth } from '@/hooks/useWeChatAuth';
import AppWrapper from '@/components/AppWrapper';

// 微信支付相关类型定义
declare global {
    interface Window {
        WeixinJSBridge?: {
            invoke: (method: string, params: any, callback: (res: any) => void) => void;
        };
    }
}

// 检查微信JSAPI是否可用
const isWeixinJSBridgeReady = () => {
    return typeof window !== 'undefined' && window.WeixinJSBridge && typeof window.WeixinJSBridge.invoke === 'function';
};

export default function Hall() {
    const { auth } = usePage<SharedData>().props;
    const [isPaid, setIsPaid] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    
    const { 
        isWeChatBrowser, 
        isDetectingWeChat, 
        shouldAutoLogin, 
        loginWithWeChat 
    } = useWeChatAuth({ 
        autoRedirect: true, 
        redirectUrl: window.location.pathname,
        enableAutoLogin: true 
    });

    const handlePayment = async () => {
        // 检查用户是否已登录
        if (!auth.user) {
            if (isWeChatBrowser) {
                if (confirm('请先登录后再进行支付，是否使用微信登录？')) {
                    loginWithWeChat();
                }
            } else {
                if (confirm('请先登录后再进行支付，是否前往登录页面？')) {
                    router.visit('/login');
                }
            }
            return;
        }

        setIsPaymentProcessing(true);
        
        try {
            // 获取CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // 调用微信支付API
            const response = await fetch('/wechat/pay/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    amount: 990, // 9.9元，以分为单位
                    description: '会员群付费加入',
                    order_id: `vip_group_${Date.now()}`,
                })
            });

            const data = await response.json();
            
            if (data.success && data.data?.config) {
                // 检查是否在微信浏览器环境中
                if (isWeChatBrowser && isWeixinJSBridgeReady()) {
                    // 在微信环境中且JSAPI已准备好，调用微信支付
                    window.WeixinJSBridge!.invoke('getBrandWCPayRequest', {
                        appId: data.data.config.appId,
                        timeStamp: data.data.config.timeStamp,
                        nonceStr: data.data.config.nonceStr,
                        package: data.data.config.package,
                        signType: data.data.config.signType,
                        paySign: data.data.config.paySign
                    }, (res: any) => {
                        if (res.err_msg === "get_brand_wcpay_request:ok") {
                            // 支付成功
                            setShowSuccessAnimation(true);
                            setTimeout(() => {
                                setIsPaid(true);
                                setShowSuccessAnimation(false);
                            }, 1500);
                        } else if (res.err_msg === "get_brand_wcpay_request:cancel") {
                            // 用户取消支付
                            alert('支付已取消');
                        } else {
                            // 支付失败
                            alert('支付失败，请重试');
                        }
                    });
                } else if (isWeChatBrowser && !isWeixinJSBridgeReady()) {
                    // 在微信环境中但WeixinJSBridge未准备好，等待加载
                    const waitForWeixinJSBridge = () => {
                        if (isWeixinJSBridgeReady()) {
                            // 重新触发支付
                            window.WeixinJSBridge!.invoke('getBrandWCPayRequest', {
                                appId: data.data.config.appId,
                                timeStamp: data.data.config.timeStamp,
                                nonceStr: data.data.config.nonceStr,
                                package: data.data.config.package,
                                signType: data.data.config.signType,
                                paySign: data.data.config.paySign
                            }, (res: any) => {
                                if (res.err_msg === "get_brand_wcpay_request:ok") {
                                    setShowSuccessAnimation(true);
                                    setTimeout(() => {
                                        setIsPaid(true);
                                        setShowSuccessAnimation(false);
                                    }, 1500);
                                } else if (res.err_msg === "get_brand_wcpay_request:cancel") {
                                    alert('支付已取消');
                                } else {
                                    alert('支付失败，请重试');
                                }
                            });
                        } else {
                            // 如果5秒后还没准备好，显示错误
                            setTimeout(() => {
                                if (!isWeixinJSBridgeReady()) {
                                    alert('微信支付环境加载超时，请刷新页面重试');
                                }
                            }, 5000);
                        }
                    };
                    
                    // 监听WeixinJSBridge准备事件
                    if (typeof window !== 'undefined') {
                        if (document.readyState === 'complete') {
                            setTimeout(waitForWeixinJSBridge, 100);
                        } else {
                            document.addEventListener('WeixinJSBridgeReady', waitForWeixinJSBridge);
                            // 备用方案：定时检查
                            setTimeout(waitForWeixinJSBridge, 1000);
                        }
                    }
                } else {
                    // 不在微信环境中，提供更好的用户体验
                    if (confirm('检测到您不在微信环境中。是否要在新窗口打开微信支付？')) {
                        // 可以跳转到支付页面或显示二维码
                        console.log('Payment config:', data.data.config);
                        // 这里可以显示支付二维码或跳转到支付页面
                        window.open(`/wechat/pay?order_id=${data.data.out_trade_no}`, '_blank');
                    }
                }
            } else {
                throw new Error(data.message || '支付订单创建失败');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert(`支付发起失败：${error instanceof Error ? error.message : '未知错误'}`);
        } finally {
            setIsPaymentProcessing(false);
        }
    };

    // 模拟支付成功状态（实际中应该通过后端回调设置）
    const simulatePaymentSuccess = () => {
        setShowSuccessAnimation(true);
        setTimeout(() => {
            setIsPaid(true);
            setShowSuccessAnimation(false);
        }, 1500);
    };

    return (
        <AppWrapper>
            <Head title="大厅" />
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900">
                {/* Header Navigation */}
                <header className="p-6">
                    <nav className="flex items-center justify-between">
                        <Link
                            href={route('home')}
                            className="text-lg font-semibold text-gray-800 dark:text-white"
                        >
                            返回首页
                        </Link>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <>
                                    <Link
                                        href={route('forum.sso.redirect')}
                                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                                    >
                                        进入论坛
                                    </Link>
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                                    >
                                        仪表板
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {isWeChatBrowser ? (
                                        <button
                                            onClick={loginWithWeChat}
                                            disabled={shouldAutoLogin || isDetectingWeChat}
                                            className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {shouldAutoLogin ? (
                                                <>
                                                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" fill="none" />
                                                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                                                    </svg>
                                                    正在跳转...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8.691 2.188C8.691 1.5 8.188 0 7.5 0S6.309 1.5 6.309 2.188c0 .688.5 1.25 1.191 1.25s1.191-.563 1.191-1.25zm4.309 0C13 1.5 12.5 0 11.809 0c-.688 0-1.191 1.5-1.191 2.188 0 .688.503 1.25 1.191 1.25S13 2.875 13 2.188zm4.309 0C17.309 1.5 16.809 0 16.121 0c-.688 0-1.191 1.5-1.191 2.188 0 .688.503 1.25 1.191 1.25s1.188-.563 1.188-1.25z"/>
                                                    </svg>
                                                    微信登录
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                登录
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                                            >
                                                注册
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <div className="mb-12 max-w-2xl">
                        <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                            <svg
                                className="h-16 w-16 text-purple-600 dark:text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                        
                        <h1 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white">
                            大厅
                        </h1>
                        
                        <h2 className="mb-8 text-2xl font-semibold text-purple-600 dark:text-purple-400">
                            精彩内容即将上线
                        </h2>
                        
                        <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                            我们正在构建一个充满活力的社区大厅，这里将成为用户交流、分享创意和发现精彩内容的中心枢纽。
                            敬请期待我们为您带来的全新体验！
                        </p>
                    </div>

                    {/* Upcoming Features */}
                    <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl">
                        <div className="group rounded-xl bg-white p-8 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-colors dark:from-blue-900 dark:to-blue-800">
                                <svg
                                    className="h-8 w-8 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                社区互动
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                与其他用户实时交流，分享想法，建立有价值的连接
                            </p>
                        </div>

                        <div className="group rounded-xl bg-white p-8 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300 transition-colors dark:from-green-900 dark:to-green-800">
                                <svg
                                    className="h-8 w-8 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                创意展示
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                展示您的创意作品，获得社区的认可和反馈
                            </p>
                        </div>

                        <div className="group rounded-xl bg-white p-8 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:to-orange-300 transition-colors dark:from-orange-900 dark:to-orange-800">
                                <svg
                                    className="h-8 w-8 text-orange-600 dark:text-orange-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                热门话题
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                关注和参与当前最热门的讨论话题
                            </p>
                        </div>
                    </div>

                    {/* VIP Group Section */}
                    <div className="mb-12 w-full max-w-2xl">
                        <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 p-8 shadow-xl dark:from-yellow-900/20 dark:to-orange-900/20 dark:bg-gray-800">
                            <div className="mb-6 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                                    <svg
                                        className="h-8 w-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    🌟 VIP会员群
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    加入专属会员群，享受更多优质内容和服务
                                </p>
                                <div className="mt-4 inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-lg font-semibold text-white">
                                    仅需 ¥9.9
                                </div>
                            </div>

                            {/* QR Code Section */}
                            <div className="mb-6 flex justify-center">
                                <div className="relative">
                                    {/* QR Code Placeholder - 这里应该是实际的群二维码图片 */}
                                    <div className="h-48 w-48 rounded-lg bg-white p-4 shadow-lg">
                                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                                            微信群二维码
                                            <br />
                                            (实际项目中替换为真实二维码)
                                        </div>
                                    </div>
                                    
                                    {/* Mosaic Overlay */}
                                    {!isPaid && !showSuccessAnimation && (
                                        <div className="absolute inset-0 rounded-lg bg-black/10 backdrop-blur-sm">
                                            <div 
                                                className="absolute inset-4 rounded bg-white/80"
                                                style={{
                                                    background: `
                                                        repeating-conic-gradient(
                                                            rgba(0,0,0,0.1) 0deg 90deg,
                                                            rgba(255,255,255,0.8) 90deg 180deg
                                                        ),
                                                        repeating-linear-gradient(
                                                            45deg,
                                                            rgba(0,0,0,0.1),
                                                            rgba(0,0,0,0.1) 8px,
                                                            rgba(255,255,255,0.8) 8px,
                                                            rgba(255,255,255,0.8) 16px
                                                        )
                                                    `,
                                                    backgroundSize: '16px 16px, 16px 16px'
                                                }}
                                            >
                                                <div className="flex h-full items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="mb-2 text-2xl">🔒</div>
                                                        <div className="text-sm font-medium text-gray-700">
                                                            付费后可见
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Success Animation Overlay */}
                                    {showSuccessAnimation && (
                                        <div className="absolute inset-0 rounded-lg bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="mb-4 animate-bounce">
                                                    <svg 
                                                        className="mx-auto h-16 w-16 text-green-500" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                            strokeWidth={2} 
                                                            d="M5 13l4 4L19 7" 
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="text-lg font-bold text-green-600 animate-pulse">
                                                    支付成功！
                                                </div>
                                                <div className="text-sm text-green-600">
                                                    正在解锁二维码...
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Status */}
                            {isPaid ? (
                                <div className="mb-6 text-center">
                                    <div className="mb-4 text-green-600 dark:text-green-400">
                                        <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <p className="font-semibold">支付成功！</p>
                                    </div>
                                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                        请长按上方二维码加入微信群
                                    </p>
                                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            💡 提示：长按二维码 → 识别图中二维码 → 加入群聊
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6 text-center">
                                    <div className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <p>✨ 专属会员内容分享</p>
                                        <p>🎯 优先获取最新资源</p>
                                        <p>💬 与志同道合的朋友交流</p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Button */}
                            {!isPaid ? (
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handlePayment}
                                        disabled={isPaymentProcessing}
                                        className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isPaymentProcessing ? (
                                            <>
                                                <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        className="opacity-25"
                                                        fill="none"
                                                    />
                                                    <path
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        className="opacity-75"
                                                    />
                                                </svg>
                                                处理中...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16l-6.284 6.284c-.394.394-1.034.394-1.428 0L7.432 12.02c-.394-.394-.394-1.034 0-1.428s1.034-.394 1.428 0l1.712 1.712 5.57-5.57c.394-.394 1.034-.394 1.428 0s.394 1.034-.002 1.426z"/>
                                                </svg>
                                                微信支付 ¥9.9
                                            </>
                                        )}
                                    </button>
                                    
                                    {/* Demo Button - 仅用于测试 */}
                                    <button
                                        onClick={simulatePaymentSuccess}
                                        className="w-full rounded-lg border-2 border-dashed border-gray-300 px-6 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-600"
                                    >
                                        🧪 测试：模拟支付成功
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="inline-flex items-center rounded-lg bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        已成功加入会员群
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href={route('home')}
                            className="rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 transition-colors"
                        >
                            返回首页
                        </Link>
                        <Link
                            href={route('latest')}
                            className="rounded-lg border border-purple-600 px-6 py-3 text-purple-600 hover:bg-purple-50 transition-colors dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900"
                        >
                            最新发布
                        </Link>
                    </div>
                </main>

                {/* Footer */}
                <footer className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© 2024 社区大厅正在建设中，期待与您相遇</p>
                </footer>
            </div>
        </AppWrapper>
    );
}