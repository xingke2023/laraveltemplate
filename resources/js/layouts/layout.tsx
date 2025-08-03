import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLogoIcon from '@/components/app-logo-icon';
import { Home, CreditCard, Settings, LogOut } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface SharedProps {
    auth?: {
        user: User;
    };
}

export default function Layout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedProps>().props;
    
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-2">
                                <AppLogoIcon className="h-8 w-8" />
                                <span className="text-xl font-bold text-gray-900">微信支付</span>
                            </Link>
                        </div>
                        
                        <nav className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <Home className="h-4 w-4 mr-2" />
                                    首页
                                </Button>
                            </Link>
                            
                            <Link href="/wechat/pay">
                                <Button variant="ghost" size="sm">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    支付
                                </Button>
                            </Link>
                            
                            {auth?.user && (
                                <div className="flex items-center space-x-4">
                                    <Link href="/settings/profile">
                                        <Button variant="ghost" size="sm">
                                            <Settings className="h-4 w-4 mr-2" />
                                            设置
                                        </Button>
                                    </Link>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                            <AvatarFallback>
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{auth.user.name}</span>
                                    </div>
                                    
                                    <Link href="/logout" method="post" as="button">
                                        <Button variant="ghost" size="sm">
                                            <LogOut className="h-4 w-4 mr-2" />
                                            退出
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}