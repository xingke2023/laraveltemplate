import MobileTabNavigation from '@/components/mobile-tab-navigation';
import { type ReactNode } from 'react';

interface MobileLayoutProps {
    children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Main Content */}
            <div className="pb-20">
                {children}
            </div>
            
            {/* Mobile Tab Navigation */}
            <MobileTabNavigation />
        </div>
    );
}