import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useWeChatAuth } from '@/hooks/useWeChatAuth';
import AppWrapper from '@/components/AppWrapper';

export default function Latest() {
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
            <Head title="最新发布" />
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 to-cyan-100 dark:from-gray-900 dark:to-emerald-900">
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
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                                >
                                    仪表板
                                </Link>
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
                                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
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
                    <div className="mb-12 max-w-3xl">
                        <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900 dark:to-cyan-900">
                            <svg
                                className="h-16 w-16 text-emerald-600 dark:text-emerald-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                        </div>
                        
                        <h1 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white">
                            最新发布
                        </h1>
                        
                        <div className="mb-8 inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                            <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            敬请期待
                        </div>
                        
                        <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                            最新发布功能正在开发中！这里将为您呈现最新鲜、最热门的内容。
                            我们正在构建一个智能的内容推荐系统，让您第一时间发现最有价值的内容。
                        </p>
                    </div>

                    {/* Content Categories Preview */}
                    <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl">
                        <div className="group rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300 transition-colors dark:from-red-900 dark:to-red-800">
                                <svg
                                    className="h-6 w-6 text-red-600 dark:text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                                热门资讯
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                最新热点和趋势资讯
                            </p>
                        </div>

                        <div className="group rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-colors dark:from-blue-900 dark:to-blue-800">
                                <svg
                                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                                创新科技
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                前沿技术和创新产品
                            </p>
                        </div>

                        <div className="group rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300 transition-colors dark:from-green-900 dark:to-green-800">
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
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                                生活方式
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                生活经验和实用技巧
                            </p>
                        </div>

                        <div className="group rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 transition-colors dark:from-purple-900 dark:to-purple-800">
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
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                                学习成长
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                知识分享和成长心得
                            </p>
                        </div>
                    </div>

                    {/* Coming Soon Features */}
                    <div className="mb-12 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800 max-w-2xl">
                        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                            即将上线的功能
                        </h2>
                        <div className="space-y-4 text-left">
                            <div className="flex items-center">
                                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300">个性化内容推荐算法</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300">实时内容更新推送</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300">多维度内容筛选</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300">社交分享和互动功能</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href={route('home')}
                            className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700 transition-colors"
                        >
                            返回首页
                        </Link>
                        <Link
                            href={route('hall')}
                            className="rounded-lg border border-emerald-600 px-6 py-3 text-emerald-600 hover:bg-emerald-50 transition-colors dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-900"
                        >
                            前往大厅
                        </Link>
                    </div>
                </main>

                {/* Footer */}
                <footer className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© 2024 精彩内容正在准备中，即将与您见面</p>
                </footer>
            </div>
        </AppWrapper>
    );
}