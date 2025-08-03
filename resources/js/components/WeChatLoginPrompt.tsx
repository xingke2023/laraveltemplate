import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export default function WeChatLoginPrompt() {
    const { auth } = usePage<SharedData>().props;
    const [showPrompt, setShowPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        // 禁用微信登录提示
        // 用户不希望弹出登录提示框
        return;
    }, [auth.user]);
    
    const handleLogin = () => {
        setIsLoading(true);
        sessionStorage.setItem('wechat_auto_login_attempted', 'true');
        
        const currentPath = window.location.pathname;
        const loginUrl = getWeChatLoginUrl();
        const finalUrl = `${loginUrl}?redirect=${encodeURIComponent(currentPath)}`;
        
        // 添加一点延迟显示加载状态
        setTimeout(() => {
            window.location.replace(finalUrl);
        }, 500);
    };
    
    const handleDismiss = () => {
        setShowPrompt(false);
        sessionStorage.setItem('wechat_auto_login_attempted', 'true');
    };
    
    if (!showPrompt) return null;
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in duration-300">
                {/* 微信图标 */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.5 8.5C8.5 7.67 9.17 7 10 7s1.5.67 1.5 1.5S10.83 10 10 10s-1.5-.67-1.5-1.5zM14 7c.83 0 1.5.67 1.5 1.5S14.83 10 14 10s-1.5-.67-1.5-1.5S13.17 7 14 7zM16.31 12.56c.14-.28.28-.58.28-.97 0-3.17-3.36-5.74-7.5-5.74S1.59 8.42 1.59 11.59c0 1.66.85 3.14 2.25 4.16l-.66 2.78 2.97-1.48c.67.13 1.36.2 2.06.2.29 0 .58-.02.86-.05-.18-.3-.31-.63-.31-1 0-2.22 2.09-4.03 4.67-4.03.47 0 .91.07 1.34.17-.2-.19-.33-.42-.33-.69 0-.52.48-.94 1.06-.94s1.06.42 1.06.94c0 .27-.13.5-.33.69z"/>
                            <path d="M22.41 16.41c0-2.22-2.09-4.03-4.67-4.03s-4.67 1.81-4.67 4.03c0 2.23 2.09 4.03 4.67 4.03.45 0 .89-.06 1.3-.17l2.08 1.04-.46-1.95c.98-.72 1.62-1.8 1.62-3.02zm-6.25-.89c-.42 0-.75-.33-.75-.75s.33-.75.75-.75.75.33.75.75-.33.75-.75.75zm3.5 0c-.42 0-.75-.33-.75-.75s.33-.75.75-.75.75.33.75.75-.33.75-.75.75z"/>
                        </svg>
                    </div>
                </div>
                
                {/* 标题 */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                    微信登录
                </h3>
                
                {/* 描述 */}
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    检测到您正在使用微信浏览器，登录后可获得更好的体验和专属功能
                </p>
                
                {/* 按钮组 */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                正在跳转...
                            </>
                        ) : (
                            '立即登录'
                        )}
                    </button>
                    
                    <button
                        onClick={handleDismiss}
                        className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl transition-colors"
                    >
                        稍后再说
                    </button>
                </div>
                
                {/* 底部提示 */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        无刷新登录 • 安全可靠
                    </p>
                </div>
            </div>
        </div>
    );
}