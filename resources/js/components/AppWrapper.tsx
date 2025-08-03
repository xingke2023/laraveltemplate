import { ReactNode } from 'react';
import WeChatLoginPrompt from './WeChatLoginPrompt';
import WeChatLoginSuccess from './WeChatLoginSuccess';

interface AppWrapperProps {
    children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
    return (
        <>
            {children}
            <WeChatLoginPrompt />
            <WeChatLoginSuccess />
        </>
    );
}