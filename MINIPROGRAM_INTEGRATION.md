# 小程序支付集成指南（简化版）

本文档说明如何在小程序中集成webview支付功能。

## 简化的支付流程

1. 用户在小程序webview中访问 `https://paper.xingke888.com/wechat/pay/miniprogram`
2. 用户点击支付按钮
3. webview通过postMessage向小程序发送支付信息（金额、描述、订单号）
4. 小程序接收支付信息并调用自己的支付流程
5. 支付完成后可以向webview返回结果

## 小程序端需要实现的代码

### 1. webview页面配置

在小程序的页面中添加webview组件：

```html
<!-- pages/webview/webview.wxml -->
<web-view src="{{webviewUrl}}" bindmessage="handleWebviewMessage"></web-view>
```

### 2. 消息处理逻辑（简化版）

```javascript
// pages/webview/webview.js
Page({
  data: {
    webviewUrl: 'https://paper.xingke888.com/wechat/pay/miniprogram'
  },

  onLoad: function(options) {
    // 可以通过参数传递不同的页面URL
    if (options.url) {
      this.setData({
        webviewUrl: decodeURIComponent(options.url)
      });
    }
  },

  // 处理来自webview的消息
  handleWebviewMessage: function(e) {
    console.log('收到webview消息:', e.detail);
    
    // e.detail.data 是一个数组，包含所有发送的消息
    const messages = e.detail.data;
    if (!messages || messages.length === 0) {
      console.log('没有收到消息数据');
      return;
    }
    
    // 处理最新的消息
    const latestMessage = messages[messages.length - 1];
    console.log('最新消息:', latestMessage);
    
    if (latestMessage) {
      if (latestMessage.action === 'requestPayment') {
        // webview请求支付
        console.log('处理支付请求:', latestMessage.paymentInfo);
        this.handlePaymentRequest(latestMessage.paymentInfo);
      } else if (latestMessage.action === 'navigateTo') {
        // webview请求页面跳转
        console.log('处理页面跳转:', latestMessage.url);
        this.handleNavigateRequest(latestMessage.url);
      } else if (latestMessage.action === 'test') {
        // 测试消息
        console.log('收到测试消息:', latestMessage.message);
        wx.showToast({
          title: '收到webview消息',
          icon: 'success'
        });
      }
    }
  },

  // 处理支付请求
  handlePaymentRequest: function(paymentInfo) {
    console.log('收到支付请求:', paymentInfo);
    
    const { amount, description, orderId } = paymentInfo;
    
    // 显示支付确认
    wx.showModal({
      title: '确认支付',
      content: `商品：${description}\n金额：¥${amount}\n订单号：${orderId}`,
      success: (res) => {
        if (res.confirm) {
          this.startMiniProgramPayment(amount, description, orderId);
        }
      }
    });
  },

  // 发起小程序支付
  startMiniProgramPayment: function(amount, description, orderId) {
    // 这里调用你的小程序支付逻辑
    // 可能需要先调用后端API创建支付订单，然后调用wx.requestPayment
    
    // 示例：直接调用支付（需要替换为真实的支付参数）
    wx.requestPayment({
      timeStamp: String(Date.now()),
      nonceStr: this.generateNonceStr(),
      package: 'prepay_id=your_prepay_id', // 需要从后端获取
      signType: 'MD5',
      paySign: 'your_pay_sign', // 需要从后端获取
      success: (res) => {
        console.log('支付成功', res);
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        });
        
        // 可以向webview发送支付成功的消息
        // 但由于webview限制，通常使用其他方式通知
      },
      fail: (err) => {
        console.error('支付失败', err);
        wx.showToast({
          title: '支付失败',
          icon: 'error'
        });
      }
    });
  },

  // 处理页面跳转请求
  handleNavigateRequest: function(url) {
    console.log('准备跳转到页面:', url);
    
    wx.navigateTo({
      url: url,
      success: (res) => {
        console.log('页面跳转成功', res);
      },
      fail: (err) => {
        console.error('页面跳转失败', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error'
        });
      }
    });
  },

  // 生成随机字符串
  generateNonceStr: function() {
    return Math.random().toString(36).substr(2, 15);
  }
});
```

## 消息格式说明

### webview向小程序发送的消息格式

```javascript
// 支付请求消息
{
  action: 'requestPayment',
  paymentInfo: {
    amount: 9.9,           // 支付金额（元）
    description: 'VIP会员', // 商品描述
    orderId: 'ORDER_1234567890_abc123', // 订单号
    timestamp: 1703123456789 // 请求时间戳
  }
}

// 页面跳转消息
{
  action: 'navigateTo',
  url: '/pages/my/index',  // 要跳转的小程序页面路径
  timestamp: 1703123456789
}
```

### 小程序向webview发送的消息格式（可选）

```javascript
// 支付结果消息（如果需要通知webview）
{
  type: 'miniprogram',
  action: 'paymentResult',
  result: {
    success: true,         // 支付是否成功
    orderId: 'ORDER_1234567890_abc123', // 订单号
    message: '支付成功'     // 结果消息
  }
}
```

## 简化的使用流程

1. 用户在小程序中打开webview页面 `https://paper.xingke888.com/wechat/pay/miniprogram`
2. webview页面自动检测小程序环境
3. 用户点击支付按钮
4. webview通过postMessage向小程序发送支付信息（金额、描述、订单号）
5. 小程序接收到支付请求，显示确认对话框
6. 用户确认后，小程序调用自己的支付流程
7. 支付完成，小程序显示结果

## 优势

1. **简单直接**：不需要复杂的OpenID获取和后端订单创建
2. **灵活性高**：小程序可以使用自己的支付逻辑和订单系统  
3. **减少依赖**：webview只负责发送支付信息，不参与实际支付流程
4. **更好的用户体验**：支付在小程序原生环境中完成

## 调试步骤

### 1. 检查小程序是否正确接收消息

在小程序的 `pages/webview/webview.js` 中添加：

```javascript
// 在 handleWebviewMessage 函数的开头添加
handleWebviewMessage: function(e) {
  console.log('=== webview消息调试 ===');
  console.log('事件对象:', e);
  console.log('消息数据:', e.detail);
  console.log('消息数组:', e.detail.data);
  
  // 如果没有收到消息，检查这些日志
  if (!e.detail.data || e.detail.data.length === 0) {
    console.error('未收到任何消息！');
    return;
  }
  
  // ... 其余处理逻辑
}
```

### 2. 在webview页面测试消息发送

1. 打开 `https://paper.xingke888.com/wechat/pay/miniprogram`
2. 滚动到页面底部的"调试信息"面板
3. 点击"测试消息"按钮
4. 查看小程序控制台是否收到测试消息
5. 如果收到测试消息，再点击"测试支付"按钮

### 3. 常见问题排查

- **小程序没有反应**：检查 `bindmessage="handleWebviewMessage"` 是否正确绑定
- **消息格式错误**：查看webview控制台的详细日志
- **权限问题**：确认webview域名已在小程序后台配置

## 注意事项

1. 小程序AppID必须是 `wx4f373d46de28e43e`
2. 需要在小程序后台配置webview的业务域名 `paper.xingke888.com`
3. 小程序需要实现自己的支付订单创建和支付调用逻辑
4. webview只传递支付基本信息，具体支付参数由小程序后端生成
5. 消息传递可能有延迟，建议在小程序端添加调试日志确认接收状态