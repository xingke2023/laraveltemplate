import React, { useState } from 'react';
import { Button } from './ui/button';
import { ExternalLink, MessageCircle, Loader2 } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

interface ForumButtonProps {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function ForumButton({
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  children = '进入论坛'
}: ForumButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = usePage<any>().props;

  const handleForumRedirect = () => {
    // 检查用户是否已登录
    if (!auth?.user) {
      alert('请先登录后再访问论坛');
      router.visit('/login');
      return;
    }

    setIsLoading(true);

    // 跳转到SSO控制器
    router.visit(route('forum.sso.redirect'), {
      onError: (errors) => {
        setIsLoading(false);
        console.error('Forum SSO redirect failed:', errors);
        
        // 更详细的错误信息
        if (errors.message) {
          alert('跳转论坛失败：' + errors.message);
        } else if (errors[404]) {
          alert('页面不存在，请检查您是否已登录');
        } else {
          alert('跳转论坛失败，请稍后重试');
        }
      },
      onFinish: () => {
        setIsLoading(false);
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleForumRedirect}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        showIcon && <MessageCircle className="w-4 h-4 mr-2" />
      )}
      {isLoading ? '正在跳转...' : children}
      {!isLoading && <ExternalLink className="w-3 h-3 ml-1" />}
    </Button>
  );
}