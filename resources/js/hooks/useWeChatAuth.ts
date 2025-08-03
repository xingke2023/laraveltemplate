import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { isWeChatBrowser, getWeChatLoginUrl } from '@/utils/wechat';
import type { SharedData } from '@/types';

export interface WeChatAuthOptions {
    autoRedirect?: boolean;
    redirectUrl?: string;
    enableAutoLogin?: boolean;
}

export function useWeChatAuth(options: WeChatAuthOptions = {}) {
    const { 
        autoRedirect = false, 
        redirectUrl, 
        enableAutoLogin = true 
    } = options;
    
    const { auth } = usePage<SharedData>().props;
    const [isDetectingWeChat, setIsDetectingWeChat] = useState(true);
    const [shouldAutoLogin, setShouldAutoLogin] = useState(false);
    
    useEffect(() => {
        // 确保在客户端环境中运行
        if (typeof window === 'undefined') {
            setIsDetectingWeChat(false);
            return;
        }
        
        // 检测微信浏览器环境
        const isInWeChat = isWeChatBrowser();
        const isLoggedIn = !!auth.user;
        
        // 检查是否已经尝试过自动登录（避免无限循环）
        const hasAttemptedAutoLogin = sessionStorage.getItem('wechat_auto_login_attempted');
        
        setIsDetectingWeChat(false);
        
        // 如果在微信浏览器中且未登录且启用自动登录且未尝试过自动登录
        if (isInWeChat && !isLoggedIn && enableAutoLogin && !hasAttemptedAutoLogin) {
            setShouldAutoLogin(true);
            
            if (autoRedirect) {
                // 标记已尝试自动登录
                sessionStorage.setItem('wechat_auto_login_attempted', 'true');
                
                // 构建重定向URL
                const loginUrl = getWeChatLoginUrl();
                const finalUrl = redirectUrl 
                    ? `${loginUrl}?redirect=${encodeURIComponent(redirectUrl)}`
                    : loginUrl;
                
                // 延迟一点再跳转，给用户一个提示
                setTimeout(() => {
                    window.location.href = finalUrl;
                }, 500);
            }
        }
    }, [auth.user, autoRedirect, redirectUrl, enableAutoLogin]);
    
    // 手动触发微信登录
    const loginWithWeChat = () => {
        const loginUrl = getWeChatLoginUrl();
        const finalUrl = redirectUrl 
            ? `${loginUrl}?redirect=${encodeURIComponent(redirectUrl)}`
            : loginUrl;
        
        window.location.href = finalUrl;
    };
    
    // 清除自动登录尝试标记
    const clearAutoLoginAttempt = () => {
        sessionStorage.removeItem('wechat_auto_login_attempted');
    };
    
    return {
        isWeChatBrowser: isWeChatBrowser(),
        isLoggedIn: !!auth.user,
        isDetectingWeChat,
        shouldAutoLogin,
        loginWithWeChat,
        clearAutoLoginAttempt,
        user: auth.user
    };
}