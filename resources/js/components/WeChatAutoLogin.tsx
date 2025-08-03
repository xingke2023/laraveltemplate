import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { isWeChatBrowser, getWeChatLoginUrl } from '@/utils/wechat';
import type { SharedData } from '@/types';

export default function WeChatAutoLogin() {
    const { auth } = usePage<SharedData>().props;
    
    useEffect(() => {
        // 仅在客户端运行
        if (typeof window === 'undefined') return;
        
        // 检查是否已登录
        if (auth.user) {
            // 如果已登录，清除自动登录标记
            sessionStorage.removeItem('wechat_auto_login_attempted');
            return;
        }
        
        // 检查是否在微信浏览器中
        if (!isWeChatBrowser()) return;
        
        // 检查是否已经尝试过自动登录（避免无限循环）
        const hasAttemptedAutoLogin = sessionStorage.getItem('wechat_auto_login_attempted');
        if (hasAttemptedAutoLogin) return;
        
        // 检查当前页面是否是公开页面（不需要登录的页面）
        const currentPath = window.location.pathname;
        const publicPages = ['/', '/home', '/hall', '/latest'];
        if (!publicPages.includes(currentPath)) return;
        
        // 检查是否是微信回调页面或重定向页面，避免重复跳转
        if (currentPath.includes('/auth/wechat/callback') || 
            currentPath.includes('/auth/wechat-login-success') ||
            document.referrer.includes('/auth/wechat/')) {
            return;
        }
        
        // 标记已尝试自动登录
        sessionStorage.setItem('wechat_auto_login_attempted', 'true');
        
        // 构建微信登录URL
        const loginUrl = getWeChatLoginUrl();
        const finalUrl = `${loginUrl}?redirect=${encodeURIComponent(currentPath)}`;
        
        // 使用页面内提示，而不是立即跳转
        const shouldAutoRedirect = confirm('检测到您在微信浏览器中，是否立即登录以获得更好的体验？');
        
        if (shouldAutoRedirect) {
            console.log('WeChat browser detected, redirecting to login...');
            // 使用 location.replace 避免产生历史记录
            window.location.replace(finalUrl);
        } else {
            // 用户选择不自动登录，清除标记
            sessionStorage.removeItem('wechat_auto_login_attempted');
        }
        
    }, [auth.user]);
    
    // 这个组件不渲染任何UI
    return null;
}