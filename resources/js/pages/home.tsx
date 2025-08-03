import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useWeChatAuth } from '@/hooks/useWeChatAuth';
import AppWrapper from '@/components/AppWrapper';

export default function Home() {
    const { auth } = usePage<SharedData>().props;
    const { 
        isWeChatBrowser, 
        isLoggedIn, 
        isDetectingWeChat, 
        shouldAutoLogin, 
        loginWithWeChat 
    } = useWeChatAuth({ 
        autoRedirect: true, 
        redirectUrl: window.location.pathname,
        enableAutoLogin: true 
    });

    return (
        <AppWrapper>
            <Head title="首页" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:from-gray-900 dark:to-gray-800">
                {/* Header Navigation */}
                <header className="absolute top-0 left-0 right-0 p-6">
                    <nav className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-gray-800 dark:text-white">
                            首页
                        </div>
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
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
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
                                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
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
                <main className="flex flex-col items-center justify-center text-center">
                    <div className="mb-8">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <svg
                                className="h-12 w-12 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="m9 22 6-6-6-6"
                                />
                            </svg>
                        </div>
                        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
                            敬请期待
                        </h1>
                        <p className="mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
                            我们正在精心打造全新的首页体验，即将为您呈现精彩内容！
                        </p>
                    </div>

                    {/* Feature Preview */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
                        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                                <svg
                                    className="h-6 w-6 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                                快速访问
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                即将提供更便捷的内容访问方式
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                                <svg
                                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                                个性化推荐
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                基于您的喜好推荐精彩内容
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                                <svg
                                    className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                                智能搜索
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                更智能的搜索体验即将上线
                            </p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <Link
                            href={route('hall')}
                            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
                        >
                            前往大厅
                        </Link>
                        <Link
                            href={route('latest')}
                            className="rounded-lg border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50 transition-colors dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900"
                        >
                            最新发布
                        </Link>
                        <a
                            href="https://paper.xingke888.com/wechat/pay/miniprogram/navigate"
                            className="rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 transition-colors"
                        >
                            小程序跳转支付
                        </a>
                        <a
                            href="https://paper.xingke888.com/wechat/pay/miniprogram"
                            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors"
                        >
                            小程序支付
                        </a>
                    </div>
                </main>

                {/* Footer */}
                <footer className="absolute bottom-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© 2024 我们正在努力为您打造更好的体验</p>
                </footer>
            </div>
        </AppWrapper>
    );
}