import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, MessageCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { isWeChatBrowser } from '@/utils/wechat';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const isInWeChat = isWeChatBrowser();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleWeChatLogin = () => {
        window.location.href = '/auth/wechat/redirect';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Head title="登录" />
            
            <div className="flex min-h-screen items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo and Title */}
                    <div className="text-center">
                        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
                            <MessageCircle className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            欢迎回来
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            登录您的账户
                        </p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="rounded-lg bg-green-50 p-4 text-center">
                            <div className="text-sm font-medium text-green-800">{status}</div>
                        </div>
                    )}

                    {/* Login Form */}
                    <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
                        {/* WeChat Login Button */}
                        <div className="mb-6">
                            <Button
                                onClick={handleWeChatLogin}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                <MessageCircle className="h-5 w-5 mr-2" />
                                微信登录
                            </Button>
                            
                            <div className="mt-4 flex items-center">
                                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                                <div className="px-4 text-sm text-gray-500 dark:text-gray-400">或</div>
                                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                        </div>

                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    邮箱地址
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="请输入邮箱地址"
                                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        密码
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink href={route('password.request')} className="text-sm text-blue-600 hover:text-blue-500">
                                            忘记密码?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="请输入密码"
                                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onClick={() => setData('remember', !data.remember)}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <Label htmlFor="remember" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                    记住我
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                登录
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                还没有账户?{' '}
                                <TextLink href={route('register')} className="font-medium text-blue-600 hover:text-blue-500">
                                    立即注册
                                </TextLink>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
