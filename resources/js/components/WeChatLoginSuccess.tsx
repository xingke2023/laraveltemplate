import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

interface FlashMessages {
    success?: string;
    error?: string;
}

export default function WeChatLoginSuccess() {
    const { auth, flash } = usePage<SharedData & { flash: FlashMessages }>().props;
    
    useEffect(() => {
        // 如果用户已登录，清除自动登录标记
        if (auth.user && typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.removeItem('wechat_auto_login_attempted');
            console.log('User logged in, cleared auto login attempt flag');
        }
        
        // 如果有登录成功消息，提供用户反馈
        if (auth.user && flash?.success) {
            console.log('Login successful:', flash.success);
        }
    }, [auth.user, flash?.success]);
    
    return null;
}