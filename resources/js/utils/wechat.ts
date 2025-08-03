/**
 * WeChat browser detection and utilities
 */

export interface WeChatUserAgent {
    isWeChat: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    version: string;
}

/**
 * Detect if current browser is WeChat
 */
export function isWeChatBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.includes('micromessenger');
}

/**
 * Get WeChat user agent information
 */
export function getWeChatUserAgent(): WeChatUserAgent {
    const ua = window.navigator.userAgent.toLowerCase();
    const isWeChat = ua.includes('micromessenger');
    
    return {
        isWeChat,
        isIOS: ua.includes('iphone') || ua.includes('ipad'),
        isAndroid: ua.includes('android'),
        version: isWeChat ? getWeChatVersion(ua) : '',
    };
}

/**
 * Extract WeChat version from user agent
 */
function getWeChatVersion(ua: string): string {
    const match = ua.match(/micromessenger\/(\d+\.\d+\.\d+)/);
    return match ? match[1] : '';
}

/**
 * Check if WeChat supports certain features
 */
export function supportsWeChatFeatures(): boolean {
    const { isWeChat, version } = getWeChatUserAgent();
    if (!isWeChat) return false;
    
    // Check if version is >= 6.0.0 for better support
    const versionParts = version.split('.').map(Number);
    return versionParts[0] >= 6;
}

/**
 * Get WeChat login URL
 */
export function getWeChatLoginUrl(): string {
    return '/auth/wechat/redirect';
}

/**
 * Auto-redirect to WeChat login if in WeChat browser
 */
export function autoRedirectToWeChatLogin(): void {
    if (isWeChatBrowser()) {
        window.location.href = getWeChatLoginUrl();
    }
}