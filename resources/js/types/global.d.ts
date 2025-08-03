import type { route as routeFn } from 'ziggy-js';

// WeChat JS-SDK Types
interface WxMiniProgramNavigateOptions {
    url: string;
    success?: (res: any) => void;
    fail?: (err: any) => void;
    complete?: (res: any) => void;
}

interface WxMiniProgram {
    navigateTo: (options: WxMiniProgramNavigateOptions) => void;
    navigateBack: (options?: { success?: (res: any) => void; fail?: (err: any) => void; }) => void;
    redirectTo: (options: WxMiniProgramNavigateOptions) => void;
    postMessage: (data: any) => void;
    getEnv: (callback: (res: { miniprogram: boolean }) => void) => void;
}

interface WxConfig {
    debug?: boolean;
    appId: string;
    timestamp: number;
    nonceStr: string;
    signature: string;
    jsApiList: string[];
}

interface Wx {
    config: (config: WxConfig) => void;
    ready: (callback: () => void) => void;
    error: (callback: (res: any) => void) => void;
    miniProgram: WxMiniProgram;
}

declare global {
    const route: typeof routeFn;
    
    interface Window {
        wx: Wx;
        __wxjs_environment: 'miniprogram' | 'webview' | string;
    }
}
