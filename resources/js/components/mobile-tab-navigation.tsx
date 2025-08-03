import { cn } from '@/lib/utils';
import { Link, usePage, router } from '@inertiajs/react';
import { Home, MessageSquare, MessageCircle, User } from 'lucide-react';

interface TabItem {
    name: string;
    href: string;
    icon: React.ElementType;
    current: boolean;
    isExternal?: boolean;
    onClick?: () => void;
}

export default function MobileTabNavigation() {
    const { url, auth } = usePage<any>();
    
    const handleForumRedirect = () => {
        // 检查用户是否已登录
        if (!auth?.user) {
            alert('请先登录后再访问论坛');
            router.visit('/login');
            return;
        }
        
        router.visit(route('forum.sso.redirect'));
    };
    
    const tabs: TabItem[] = [
        {
            name: '首页',
            href: '/',
            icon: Home,
            current: url === '/',
        },
        {
            name: '大厅',
            href: '/hall',
            icon: MessageSquare,
            current: url === '/hall',
        },
        {
            name: '论坛',
            href: '#',
            icon: MessageCircle,
            current: false,
            isExternal: true,
            onClick: handleForumRedirect,
        },
        {
            name: '我的',
            href: '/dashboard',
            icon: User,
            current: url === '/dashboard',
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div className="grid grid-cols-4 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    
                    if (tab.isExternal && tab.onClick) {
                        return (
                            <button
                                key={tab.name}
                                onClick={tab.onClick}
                                className={cn(
                                    'flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors',
                                    'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                )}
                            >
                                <Icon className="h-6 w-6 mb-1 text-gray-500 dark:text-gray-400" />
                                {tab.name}
                            </button>
                        );
                    }
                    
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                'flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors',
                                tab.current
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'h-6 w-6 mb-1',
                                    tab.current
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                )}
                            />
                            {tab.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}