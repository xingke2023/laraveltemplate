import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, router } from '@inertiajs/react';
import { 
    User, 
    Users, 
    FileText, 
    Star, 
    Wallet, 
    Settings, 
    LogOut,
    ChevronRight 
} from 'lucide-react';

interface UserProfileSectionProps {
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        wechat_openid?: string;
        wechat_nickname?: string;
        wechat_avatar?: string;
    };
}

export default function UserProfileSection({ user }: UserProfileSectionProps) {
    const handleLogout = () => {
        router.post('/logout');
    };

    const menuItems = [
        {
            icon: User,
            label: '我的资料',
            href: '/settings/profile',
            color: 'text-blue-600 dark:text-blue-400',
        },
        {
            icon: Users,
            label: '我加入的',
            href: '/my-joined',
            color: 'text-green-600 dark:text-green-400',
        },
        {
            icon: FileText,
            label: '我发布的',
            href: '/my-published',
            color: 'text-purple-600 dark:text-purple-400',
        },
        {
            icon: Star,
            label: '我的推荐',
            href: '/my-recommendations',
            color: 'text-yellow-600 dark:text-yellow-400',
        },
        {
            icon: Wallet,
            label: '我的钱包',
            href: '/my-wallet',
            color: 'text-orange-600 dark:text-orange-400',
        },
        {
            icon: Settings,
            label: '设置',
            href: '/settings/profile',
            color: 'text-gray-600 dark:text-gray-400',
        },
    ];

    return (
        <div className="space-y-6">
            {/* User Profile Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-none shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-blue-500 text-white text-xl font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {user.name}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {user.email}
                            </p>
                            {user.wechat_nickname && (
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    微信: {user.wechat_nickname}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Menu Items */}
            <Card className="shadow-sm">
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${item.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                                            {item.label}
                                        </span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </Link>
                            );
                        })}
                        
                        {/* Logout Button */}
                        <Button
                            variant="ghost"
                            className="w-full justify-between p-4 mt-4 rounded-none hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                            onClick={handleLogout}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                    <LogOut className="h-5 w-5" />
                                </div>
                                <span className="font-medium">退出登录</span>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}