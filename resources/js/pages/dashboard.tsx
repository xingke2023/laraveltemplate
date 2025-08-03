import UserProfileSection from '@/components/user-profile-section';
import MobileLayout from '@/layouts/mobile-layout';
import ForumButton from '@/components/ForumButton';
import AuthDebug from '@/components/AuthDebug';
import { Head, usePage } from '@inertiajs/react';

interface DashboardProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            avatar?: string;
            wechat_openid?: string;
            wechat_nickname?: string;
            wechat_avatar?: string;
        };
    };
}

export default function Dashboard() {
    const { auth } = usePage<DashboardProps>().props;

    return (
        <MobileLayout>
            <Head title="我的" />
            <div className="px-4 py-6 space-y-6">
                <UserProfileSection user={auth.user} />
                
                {/* Debug Section - 临时调试用 */}
                <AuthDebug />
                
                {/* Forum Access Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        社区论坛
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        加入我们的论坛社区，与其他用户交流讨论，分享经验和见解。
                    </p>
                    <ForumButton 
                        variant="default" 
                        size="lg" 
                        className="w-full"
                        showIcon={true}
                    >
                        进入论坛
                    </ForumButton>
                </div>
            </div>
        </MobileLayout>
    );
}
