import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    avatar?: string;
    email: string;
}

interface Props {
    redirectUrl: string;
    user: User;
    message: string;
    isNewUser: boolean;
}

export default function WeChatLoginSuccess({ redirectUrl, user, message, isNewUser }: Props) {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    
    const steps = [
        '验证登录状态...',
        '加载用户信息...',
        '准备页面内容...',
        '即将完成...'
    ];

    useEffect(() => {
        // 清除自动登录标记
        if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.removeItem('wechat_auto_login_attempted');
        }

        // 模拟进度条和步骤
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    // 使用Inertia.js进行页面内跳转，无刷新
                    setTimeout(() => {
                        router.visit(redirectUrl, {
                            replace: true,
                            preserveScroll: true,
                            onSuccess: () => {
                                console.log('微信登录成功，已跳转到目标页面');
                            }
                        });
                    }, 200);
                    return 100;
                }
                return prev + 2;
            });
        }, 40);

        // 步骤切换
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev >= steps.length - 1) {
                    clearInterval(stepInterval);
                    return prev;
                }
                return prev + 1;
            });
        }, 600);

        return () => {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
        };
    }, [redirectUrl]);

    return (
        <>
            <Head title="登录中..." />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* 卡片容器 */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center transform animate-in fade-in duration-500">
                        
                        {/* 用户头像 */}
                        <div className="mb-6 relative">
                            {user.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg animate-in zoom-in duration-700"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg animate-in zoom-in duration-700">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            
                            {/* 成功标记 */}
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-1000 delay-300">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* 欢迎消息 */}
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-in slide-in-from-bottom duration-700 delay-200">
                            {message}
                        </h1>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6 animate-in slide-in-from-bottom duration-700 delay-300">
                            {user.name}
                            {isNewUser && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">新用户</span>}
                        </p>

                        {/* 进度条 */}
                        <div className="mb-6 animate-in slide-in-from-bottom duration-700 delay-400">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {steps[currentStep]}
                                </span>
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-100 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* 加载动画 */}
                        <div className="flex justify-center items-center space-x-1 animate-in fade-in duration-700 delay-500">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>

                        {/* 备用跳转链接 */}
                        <div className="mt-8 opacity-60 hover:opacity-100 transition-opacity animate-in fade-in duration-700 delay-1000">
                            <button
                                onClick={() => router.visit(redirectUrl, { replace: true })}
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 underline"
                            >
                                点击这里手动跳转
                            </button>
                        </div>
                    </div>

                    {/* 底部提示 */}
                    <div className="text-center mt-6 animate-in slide-in-from-bottom duration-700 delay-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            正在使用无刷新技术为您跳转...
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}