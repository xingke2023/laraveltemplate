# Laravel + Flarum 单点登录(SSO)系统

## 📋 系统概述

本系统实现了Laravel主站与Flarum论坛的无缝单点登录，用户在主站登录后可以一键跳转到论坛并自动登录。

## 🎯 功能特点

- **无缝登录体验**：一键从主站跳转到论坛
- **自动用户同步**：新用户注册时自动创建论坛账户  
- **微信登录支持**：完美支持微信OAuth登录的用户
- **安全Token机制**：加密传输，5分钟时效性
- **多端支持**：桌面端和移动端都有论坛入口

## 📍 论坛入口位置

### 1. 桌面端（Desktop）
- 位置：右上角用户头像点击后的下拉菜单
- 显示：**"进入论坛"** 选项（带外链图标）

### 2. 移动端（Mobile）  
- 位置：底部Tab导航栏的第3个按钮
- 显示：**"论坛"** Tab（原"最新发布"已替换）

## 🔧 技术实现

### 核心文件结构
```
app/
├── Services/ForumSyncService.php          # 用户同步服务
├── Http/Controllers/ForumSSOController.php # SSO控制器
└── Listeners/SyncUserToForum.php          # 事件监听器

flarum/
└── sso-handler.php                        # 论坛SSO处理器

resources/js/components/
├── ForumButton.tsx                        # 论坛按钮组件
├── mobile-tab-navigation.tsx              # 移动端导航（已修改）
└── user-menu-content.tsx                 # 用户菜单（已添加论坛入口）
```

### 数据库配置
```php
// config/database.php
'forum' => [
    'driver' => 'mysql',
    'host' => '127.0.0.1',
    'port' => '8510',
    'database' => 'template1',
    'prefix' => 'fl_',
    // ... 其他配置
],
```

## 🚀 使用流程

1. **用户登录主站**
   - 支持邮箱密码登录
   - 支持微信OAuth登录

2. **点击论坛入口**
   - 桌面端：点击右上角头像 → "进入论坛"
   - 移动端：点击底部"论坛"Tab

3. **自动处理流程**
   - 系统自动同步用户数据到 `fl_users` 表
   - 生成加密的SSO Token
   - 跳转到论坛并自动登录

## 🛡️ 安全机制

### Token安全
- **加密传输**：使用Laravel的encrypt()方法
- **时效限制**：Token有效期5分钟
- **数据验证**：多层验证确保安全

### 用户数据同步
- **邮箱唯一性**：以邮箱为主键同步用户
- **用户名处理**：自动处理重复用户名
- **头像同步**：微信头像优先，fallback到系统头像

## 📱 API接口

### SSO相关路由
```php
// 用户相关（需要登录）
Route::middleware(['auth'])->group(function () {
    Route::get('/forum-redirect', [ForumSSOController::class, 'redirectToForum']);
    Route::get('/api/forum/status', [ForumSSOController::class, 'getForumStatus']);
    Route::post('/api/forum/sync', [ForumSSOController::class, 'forceSyncUser']);
});

// Token验证（供论坛调用）
Route::get('/sso/validate', [ForumSSOController::class, 'validateSSOToken']);
```

### 主要API方法

#### 1. `/forum-redirect` - 论坛重定向
触发用户同步并跳转到论坛

#### 2. `/api/forum/status` - 获取论坛状态
返回用户在论坛的状态信息

#### 3. `/sso/validate` - Token验证
论坛用于验证SSO Token的API

## ⚡ 自动同步机制

### 用户注册时同步
```php
// app/Providers/EventServiceProvider.php
protected $listen = [
    Registered::class => [
        SendEmailVerificationNotification::class,
        SyncUserToForum::class, // 自动同步到论坛
    ],
];
```

### 手动同步
用户可通过API手动触发同步：
```javascript
fetch('/api/forum/sync', { method: 'POST' })
```

## 🔍 故障排除

### 常见问题

1. **跳转失败**
   - 检查数据库连接配置
   - 确认论坛用户表存在
   - 查看Laravel日志

2. **用户同步失败**
   - 检查 `fl_users` 表结构
   - 确认用户邮箱唯一性
   - 查看队列任务状态

3. **Token验证失败**
   - 检查Laravel APP_KEY配置
   - 确认Token未过期（5分钟）
   - 验证网络连接

### 日志查看
```bash
# Laravel日志
tail -f storage/logs/laravel.log

# 论坛SSO日志
tail -f flarum/storage/logs/flarum.log
```

## 🎨 自定义配置

### 修改Token有效期
```php
// app/Services/ForumSyncService.php
'timestamp' => time(),
// 修改验证逻辑中的时间差
if (time() - $payload['timestamp'] > 300) // 300秒 = 5分钟
```

### 自定义用户名规则
```php
// app/Services/ForumSyncService.php
private function sanitizeUsername(string $name): string
{
    // 在这里修改用户名处理逻辑
}
```

## 📞 技术支持

如有问题，请检查：
1. 数据库连接是否正常
2. 路由是否正确注册  
3. 用户是否已登录
4. 论坛是否正常运行

---

*Created with ❤️ for seamless forum integration*