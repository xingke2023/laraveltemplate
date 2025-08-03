import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, MessageCircle, UserPlus } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isWeChatBrowser } from '@/utils/wechat';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const isInWeChat = isWeChatBrowser();

    useEffect(() => {
        // Auto-redirect to WeChat login if in WeChat browser
        if (isInWeChat) {
            window.location.href = '/auth/wechat/redirect';
        }
    }, [isInWeChat]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleWeChatLogin = () => {
        window.location.href = '/auth/wechat/redirect';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Head title="注册" />
            
            <div className="flex min-h-screen items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo and Title */}
                    <div className="text-center">
                        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <UserPlus className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            创建账户
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            加入我们的社区
                        </p>
                    </div>

                    {/* Register Form */}
                    <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
                        {/* WeChat Login Button */}
                        {!isInWeChat && (
                            <div className="mb-6">
                                <Button
                                    onClick={handleWeChatLogin}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                    <MessageCircle className="h-5 w-5 mr-2" />
                                    微信快速注册
                                </Button>
                                
                                <div className="mt-4 flex items-center">
                                    <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                                    <div className="px-4 text-sm text-gray-500 dark:text-gray-400">或</div>
                                    <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                                </div>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    姓名
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    placeholder="请输入您的姓名"
                                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    邮箱地址
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                    placeholder="请输入邮箱地址"
                                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    密码
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
                                    placeholder="请输入密码"
                                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    确认密码
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    disabled={processing}
                                    placeholder="请再次输入密码"
                                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                创建账户
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                已有账户?{' '}
                                <TextLink href={route('login')} className="font-medium text-purple-600 hover:text-purple-500">
                                    立即登录
                                </TextLink>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
