<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>微信登录中...</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            max-width: 400px;
            padding: 2rem;
        }
        .avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 0 auto 1rem;
            border: 3px solid rgba(255, 255, 255, 0.3);
            object-fit: cover;
        }
        .loading-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1rem;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .welcome-text {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            opacity: 0;
            animation: fadeIn 0.5s ease-in-out 0.3s forwards;
        }
        .user-name {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            opacity: 0;
            animation: fadeIn 0.5s ease-in-out 0.6s forwards;
        }
        .progress {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 2rem;
            opacity: 0;
            animation: fadeIn 0.5s ease-in-out 0.9s forwards;
        }
        .progress-bar {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
            overflow: hidden;
            margin-top: 1rem;
        }
        .progress-fill {
            height: 100%;
            background: white;
            border-radius: 2px;
            animation: progress 2s ease-in-out;
        }
        @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        .backup-link {
            margin-top: 2rem;
            opacity: 0;
            animation: fadeIn 0.5s ease-in-out 3s forwards;
        }
        .backup-link a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            font-size: 0.9rem;
        }
        .backup-link a:hover {
            color: white;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        @if($user->avatar)
            <img src="{{ $user->avatar }}" alt="头像" class="avatar">
        @else
            <div class="loading-icon"></div>
        @endif
        
        <div class="welcome-text">{{ $message }}</div>
        <div class="user-name">{{ $user->name }}</div>
        <div class="progress">
            正在为您准备页面...
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
        
        <div class="backup-link">
            <a href="{{ $redirectUrl }}" id="backup-link">如果没有自动跳转，请点击这里</a>
        </div>
    </div>

    <script>
        // 清除自动登录尝试标记
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('wechat_auto_login_attempted');
        }
        
        // 平滑跳转到目标页面
        setTimeout(function() {
            // 使用 pushState 避免浏览器显示跳转过程
            if (history.pushState) {
                history.pushState(null, null, '{{ $redirectUrl }}');
                // 触发 popstate 事件让 SPA 应用感知路由变化
                window.dispatchEvent(new PopStateEvent('popstate'));
            }
            
            // 备用方案：直接跳转
            setTimeout(function() {
                window.location.href = '{{ $redirectUrl }}';
            }, 100);
        }, 2000);
        
        // 预加载目标页面资源
        setTimeout(function() {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = '{{ $redirectUrl }}';
            document.head.appendChild(link);
        }, 500);
    </script>
</body>
</html>