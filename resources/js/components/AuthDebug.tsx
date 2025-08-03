import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button } from './ui/button';

export default function AuthDebug() {
    const [debugData, setDebugData] = useState<any>(null);
    const { auth } = usePage<any>();

    const fetchAuthDebug = async () => {
        try {
            const response = await fetch('/debug-auth', {
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });
            const data = await response.json();
            setDebugData(data);
        } catch (error) {
            console.error('Debug fetch failed:', error);
            setDebugData({ error: error.message });
        }
    };

    const testForumAccess = () => {
        console.log('Frontend auth state:', auth);
        router.visit(route('forum.sso.redirect'), {
            onError: (errors) => {
                console.log('Forum access errors:', errors);
                alert('论坛访问失败: ' + JSON.stringify(errors));
            }
        });
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 mb-4">
            <h3 className="text-lg font-semibold mb-3">认证状态调试</h3>
            
            <div className="space-y-2 mb-4">
                <p><strong>前端认证状态:</strong></p>
                <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    {JSON.stringify(auth, null, 2)}
                </pre>
            </div>

            <div className="flex gap-2 mb-4">
                <Button onClick={fetchAuthDebug} variant="outline" size="sm">
                    检查后端认证状态
                </Button>
                <Button onClick={testForumAccess} variant="outline" size="sm">
                    测试论坛访问
                </Button>
            </div>

            {debugData && (
                <div>
                    <p><strong>后端认证状态:</strong></p>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-60">
                        {JSON.stringify(debugData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}