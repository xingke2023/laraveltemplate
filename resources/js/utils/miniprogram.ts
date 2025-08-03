// 小程序相关工具函数

interface PaymentData {
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: string;
    paySign: string;
    orderId: string;
}

interface MiniProgramNavigateOptions {
    url: string;
    success?: (res: any) => void;
    fail?: (err: any) => void;
    complete?: (res: any) => void;
}

/**
 * 检测是否在小程序环境中
 */
export function isMiniProgramEnvironment(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    
    console.log('Environment Detection:', {
        userAgent: ua,
        __wxjs_environment: (window as any).__wxjs_environment,
        hasWindow: typeof window !== 'undefined',
        hasWx: typeof (window as any).wx !== 'undefined',
        hasMiniProgram: typeof (window as any).wx?.miniProgram !== 'undefined'
    });
    
    // 更准确的小程序环境检测
    const checks = {
        // 检查是否包含小程序标识
        hasMiniProgramUA: ua.includes('miniprogram'),
        // 检查微信JS环境变量
        hasWxJsEnv: (window as any).__wxjs_environment === 'miniprogram',
        // 检查是否在微信中
        isInWeChat: /micromessenger/i.test(ua),
        // 检查是否有wx.miniProgram对象
        hasWxMiniProgram: typeof (window as any).wx?.miniProgram !== 'undefined'
    };
    
    console.log('Mini Program Environment Checks:', checks);
    
    // 如果明确检测到小程序环境，返回true
    if (checks.hasMiniProgramUA || checks.hasWxJsEnv) {
        return true;
    }
    
    // 如果在微信中且有wx.miniProgram对象，也认为是小程序环境
    if (checks.isInWeChat && checks.hasWxMiniProgram) {
        return true;
    }
    
    // 为了调试，暂时在微信环境中也返回true
    if (checks.isInWeChat) {
        console.log('Detected WeChat environment, treating as mini program for testing');
        return true;
    }
    
    return false;
}

/**
 * 检测微信 JS-SDK 是否可用
 */
export function isWeChatSDKReady(): boolean {
    const hasWindow = typeof window !== 'undefined';
    const hasWx = typeof (window as any).wx !== 'undefined';
    const hasMiniProgram = typeof (window as any).wx?.miniProgram !== 'undefined';
    const hasPostMessage = typeof (window as any).wx?.miniProgram?.postMessage !== 'undefined';
    
    const result = hasWindow && hasWx && hasMiniProgram && hasPostMessage;
    
    console.log('WeChat SDK Ready Check:', {
        hasWindow,
        hasWx,
        hasMiniProgram, 
        hasPostMessage,
        result
    });
    
    return result;
}

/**
 * 跳转到小程序页面
 */
export function navigateToMiniProgram(options: MiniProgramNavigateOptions): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!isWeChatSDKReady()) {
            reject(new Error('微信 JS-SDK 未就绪'));
            return;
        }

        const wx = (window as any).wx;
        
        wx.miniProgram.navigateTo({
            url: options.url,
            success: (res: any) => {
                console.log('小程序页面跳转成功', res);
                options.success?.(res);
                resolve(res);
            },
            fail: (err: any) => {
                console.error('小程序页面跳转失败', err);
                options.fail?.(err);
                reject(err);
            },
            complete: options.complete
        });
    });
}

/**
 * 跳转到小程序支付页面
 */
export function navigateToMiniProgramPayment(paymentData: PaymentData): Promise<any> {
    const payDataString = encodeURIComponent(JSON.stringify(paymentData));
    const url = `/pages/wxpay/wxpay?payData=${payDataString}`;
    
    return navigateToMiniProgram({ url });
}

/**
 * 返回小程序上一页
 */
export function navigateBackInMiniProgram(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!isWeChatSDKReady()) {
            reject(new Error('微信 JS-SDK 未就绪'));
            return;
        }

        const wx = (window as any).wx;
        
        wx.miniProgram.navigateBack({
            success: resolve,
            fail: reject
        });
    });
}

/**
 * 跳转到小程序指定页面
 */
export function redirectToMiniProgram(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!isWeChatSDKReady()) {
            reject(new Error('微信 JS-SDK 未就绪'));
            return;
        }

        const wx = (window as any).wx;
        
        wx.miniProgram.redirectTo({
            url,
            success: resolve,
            fail: reject
        });
    });
}

/**
 * 跳转到小程序我的账户页面
 */
export function navigateToMyAccount(): Promise<any> {
    console.log('准备跳转到小程序我的账户页面');
    
    try {
        if (!isWeChatSDKReady()) {
            throw new Error('微信 JS-SDK 未就绪');
        }

        const wx = (window as any).wx;
        const navigationData = {
            action: 'navigateTo',
            url: '/pages/my/index',
            timestamp: Date.now()
        };

        console.log('发送页面跳转请求:', navigationData);

        // 尝试多种方式发送消息
        try {
            console.log('尝试方式1: 直接传递数据');
            wx.miniProgram.postMessage(navigationData);
            console.log('页面跳转请求发送成功');
            return Promise.resolve();
        } catch (error1) {
            console.warn('方式1 失败，尝试方式2:', error1);
            
            try {
                console.log('尝试方式2: 包装在data中');
                wx.miniProgram.postMessage({ data: navigationData });
                console.log('页面跳转请求发送成功');
                return Promise.resolve();
            } catch (error2) {
                console.error('方式2 也失败:', error2);
                throw new Error(`发送页面跳转请求失败: ${error2}`);
            }
        }
    } catch (error) {
        console.error('跳转到我的账户失败:', error);
        return Promise.reject(error);
    }
}

/**
 * 获取小程序环境信息
 */
export function getMiniProgramEnvInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!isWeChatSDKReady()) {
            reject(new Error('微信 JS-SDK 未就绪'));
            return;
        }

        const wx = (window as any).wx;
        
        wx.miniProgram.getEnv((res: any) => {
            resolve(res);
        });
    });
}

/**
 * 向小程序发送数据
 */
export function postMessageToMiniProgram(data: any): void {
    if (!isWeChatSDKReady()) {
        console.warn('微信 JS-SDK 未就绪，无法发送数据到小程序');
        return;
    }

    const wx = (window as any).wx;
    wx.miniProgram.postMessage({ data });
}

/**
 * 获取小程序用户OpenID (需要在小程序环境中调用)
 */
export function getMiniProgramOpenId(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!isWeChatSDKReady()) {
            reject(new Error('微信 JS-SDK 未就绪'));
            return;
        }

        const wx = (window as any).wx;
        
        // 向小程序发送获取OpenID的请求
        wx.miniProgram.postMessage({
            data: { 
                action: 'getOpenId',
                timestamp: Date.now()
            }
        });
        
        // 监听小程序返回的openid
        const messageHandler = (event: MessageEvent) => {
            const data = event.data;
            if (data && data.type === 'miniprogram') {
                if (data.action === 'openIdResponse') {
                    window.removeEventListener('message', messageHandler);
                    if (data.openId) {
                        console.log('收到小程序OpenID:', data.openId);
                        resolve(data.openId);
                    } else {
                        reject(new Error('小程序返回的OpenID为空'));
                    }
                } else if (data.action === 'error') {
                    window.removeEventListener('message', messageHandler);
                    reject(new Error(data.message || '小程序返回错误'));
                }
            }
        };
        
        window.addEventListener('message', messageHandler);
        
        // 设置较长的超时时间，给用户足够时间处理
        setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            reject(new Error('获取小程序OpenID超时，请确保在小程序环境中使用'));
        }, 10000);
    });
}

/**
 * 直接向小程序发送支付请求
 * 不需要后端创建订单，直接传递支付信息给小程序处理
 */
export async function requestMiniProgramPayment(
    amount: number, 
    description: string, 
    orderId?: string
): Promise<void> {
    try {
        console.log('requestMiniProgramPayment called with:', { amount, description, orderId });
        
        if (!isWeChatSDKReady()) {
            const error = new Error('微信 JS-SDK 未就绪');
            console.error('SDK not ready:', error);
            throw error;
        }

        const wx = (window as any).wx;
        console.log('wx object:', wx);
        console.log('wx.miniProgram:', wx.miniProgram);
        
        // 生成订单号（如果没有提供）
        const finalOrderId = orderId || `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        const paymentData = {
            action: 'requestPayment',
            paymentInfo: {
                amount: amount, // 保持原始金额（元）
                description: description,
                orderId: finalOrderId,
                timestamp: Date.now()
            }
        };
        
        console.log('准备发送的支付数据:', paymentData);
        
        // 向小程序发送支付请求
        // 注意：wx.miniProgram.postMessage() 的正确格式是直接传递数据对象
        try {
            console.log('尝试方式1: wx.miniProgram.postMessage(paymentData)');
            wx.miniProgram.postMessage(paymentData);
            console.log('postMessage 方式1 调用成功');
        } catch (postMessageError1) {
            console.warn('postMessage 方式1 失败，尝试方式2:', postMessageError1);
            
            try {
                console.log('尝试方式2: wx.miniProgram.postMessage({ data: paymentData })');
                wx.miniProgram.postMessage({ data: paymentData });
                console.log('postMessage 方式2 调用成功');
            } catch (postMessageError2) {
                console.error('postMessage 方式2 也失败:', postMessageError2);
                throw new Error(`postMessage 失败: ${postMessageError2}`);
            }
        }
        
        console.log('已向小程序发送支付请求:', {
            amount,
            description,
            orderId: finalOrderId
        });
        
    } catch (error) {
        console.error('发送小程序支付请求失败:', error);
        throw error;
    }
}

/**
 * 创建小程序支付参数并跳转（保留原方案作为备选）
 */
export async function createAndNavigateToPayment(
    amount: number, 
    description: string, 
    orderId?: string
): Promise<void> {
    try {
        let miniOpenId: string | undefined;
        
        // 尝试获取小程序OpenID
        if (isMiniProgramEnvironment()) {
            try {
                miniOpenId = await getMiniProgramOpenId();
                console.log('获取到小程序OpenID:', miniOpenId);
            } catch (error) {
                console.warn('无法获取小程序OpenID，将使用测试OpenID:', error);
            }
        }
        
        // 创建支付订单
        const response = await fetch('/wechat/pay/miniprogram/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                amount: amount * 100, // 转换为分
                description,
                order_id: orderId,
                mini_openid: miniOpenId, // 传递小程序OpenID
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const paymentData: PaymentData = await response.json();
        
        // 跳转到小程序支付页面
        await navigateToMiniProgramPayment(paymentData);
        
    } catch (error) {
        console.error('创建支付订单或跳转失败:', error);
        throw error;
    }
}

/**
 * 测试消息发送到小程序
 */
export function testMiniProgramMessage(): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            if (!isWeChatSDKReady()) {
                console.error('微信 SDK 未就绪，无法发送测试消息');
                resolve(false);
                return;
            }

            const wx = (window as any).wx;
            const testMessage = {
                action: 'test',
                message: 'Hello from webview',
                timestamp: Date.now()
            };

            console.log('发送测试消息到小程序:', testMessage);

            // 尝试多种方式发送消息
            let success = false;

            try {
                console.log('测试方式1: 直接传递数据');
                wx.miniProgram.postMessage(testMessage);
                console.log('方式1 发送成功');
                success = true;
            } catch (error1) {
                console.warn('方式1 失败:', error1);
                
                try {
                    console.log('测试方式2: 包装在data中');
                    wx.miniProgram.postMessage({ data: testMessage });
                    console.log('方式2 发送成功');
                    success = true;
                } catch (error2) {
                    console.error('方式2 也失败:', error2);
                }
            }

            resolve(success);
        } catch (error) {
            console.error('发送测试消息失败:', error);
            resolve(false);
        }
    });
}

/**
 * 小程序支付结果处理
 */
export interface PaymentResult {
    success: boolean;
    orderId?: string;
    message?: string;
}

export function handlePaymentResult(result: PaymentResult): void {
    if (result.success) {
        console.log('支付成功', result);
        
        // 可以跳转到成功页面或更新页面状态
        if (result.orderId) {
            // 跳转到订单详情或成功页面
            window.location.href = `/orders/${result.orderId}`;
        } else {
            // 刷新当前页面或显示成功提示
            window.location.reload();
        }
    } else {
        console.error('支付失败', result);
        
        // 显示错误信息
        alert(result.message || '支付失败，请重试');
    }
}

// 监听从小程序返回的消息
if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
        // 处理来自小程序的消息
        if (event.data && event.data.type === 'miniprogram') {
            console.log('收到小程序消息:', event.data);
            
            if (event.data.action === 'paymentResult') {
                handlePaymentResult(event.data.result);
            }
        }
    });
}