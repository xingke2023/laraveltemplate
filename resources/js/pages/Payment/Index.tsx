import { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoaderCircle, CreditCard, CheckCircle, XCircle, User, LogIn } from 'lucide-react';
import Layout from '@/layouts/layout';

declare global {
  interface Window {
    WeixinJSBridge: any;
  }
}

interface PaymentData {
  out_trade_no: string;
  prepay_id: string;
  config: {
    appId: string;
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: string;
    paySign: string;
  };
}

interface PaymentResult {
  success: boolean;
  data?: PaymentData;
  message?: string;
}

interface ConfigStatus {
  app_id: string;
  mch_id: string;
  private_key_exists: boolean;
  private_key_path: string;
  notify_url: string;
  app_initialized: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  wechat_openid?: string;
}

interface SharedProps {
  auth?: {
    user: User;
  };
  status: ConfigStatus;
}

export default function PaymentIndex() {
  const { props } = usePage<SharedProps>();
  const { auth, status } = props;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [error, setError] = useState('');
  const [orderNo, setOrderNo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth?.user) {
      setError('请先登录后再进行支付');
      return;
    }
    
    if (!amount || !description) {
      setError('请填写完整的支付信息');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('支付金额必须大于0');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentStatus('processing');

    try {
      // 获取 CSRF 令牌
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      
      const response = await fetch('/wechat/pay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
        }),
      });

      const result: PaymentResult = await response.json();

      if (result.success && result.data) {
        setOrderNo(result.data.out_trade_no);
        
        // 调用微信支付
        if (typeof window.WeixinJSBridge !== 'undefined') {
          window.WeixinJSBridge.invoke('getBrandWCPayRequest', result.data.config, (res: any) => {
            if (res.err_msg === 'get_brand_wcpay_request:ok') {
              setPaymentStatus('success');
            } else {
              setPaymentStatus('failed');
              setError('支付失败: ' + res.err_msg);
            }
          });
        } else {
          // 非微信环境，可以展示二维码或其他支付方式
          setError('请在微信环境中进行支付');
          setPaymentStatus('failed');
        }
      } else {
        setError(result.message || '创建订单失败');
        setPaymentStatus('failed');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      setPaymentStatus('failed');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAmount('');
    setDescription('');
    setError('');
    setPaymentStatus('idle');
    setOrderNo('');
  };

  const queryPaymentStatus = async () => {
    if (!orderNo) return;

    try {
      const response = await fetch(`/wechat/pay/query?out_trade_no=${orderNo}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const { trade_state } = result.data;
        if (trade_state === 'SUCCESS') {
          setPaymentStatus('success');
        } else if (trade_state === 'CLOSED' || trade_state === 'REVOKED') {
          setPaymentStatus('failed');
        }
      }
    } catch (err) {
      console.error('Query payment status error:', err);
    }
  };

  return (
    <Layout>
      <Head title="微信支付" />
      
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              微信支付
            </CardTitle>
            <CardDescription>
              请填写支付信息进行微信支付
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!auth?.user ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <LogIn className="h-16 w-16 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-blue-600">需要登录</h3>
                <p className="text-gray-600">请先登录后再进行支付</p>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href="/login">登录</Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/register">注册</Link>
                  </Button>
                </div>
              </div>
            ) : paymentStatus === 'idle' || paymentStatus === 'processing' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">
                    已登录：{auth.user.name}
                    {auth.user.wechat_openid && (
                      <span className="text-sm text-green-600 ml-2">(已绑定微信)</span>
                    )}
                  </span>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount">支付金额 (元)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="请输入支付金额"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="description">商品描述</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="请输入商品描述"
                    disabled={loading}
                    maxLength={127}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      创建支付订单...
                    </>
                  ) : (
                    '立即支付'
                  )}
                </Button>
              </form>
              </div>
            ) : paymentStatus === 'success' ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-green-600">支付成功</h3>
                <p className="text-gray-600">订单号: {orderNo}</p>
                <p className="text-gray-600">支付金额: ¥{amount}</p>
                <Button onClick={handleReset} className="w-full">
                  继续支付
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-red-600">支付失败</h3>
                {orderNo && (
                  <p className="text-gray-600">订单号: {orderNo}</p>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button onClick={queryPaymentStatus} variant="outline" className="flex-1">
                    查询支付状态
                  </Button>
                  <Button onClick={handleReset} className="flex-1">
                    重新支付
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>配置状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>应用ID:</span>
                <span className="font-mono">{status.app_id}</span>
              </div>
              <div className="flex justify-between">
                <span>商户号:</span>
                <span className="font-mono">{status.mch_id}</span>
              </div>
              <div className="flex justify-between">
                <span>私钥文件:</span>
                <span className={status.private_key_exists ? 'text-green-600' : 'text-red-600'}>
                  {status.private_key_exists ? '✓ 存在' : '✗ 不存在'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>应用初始化:</span>
                <span className={status.app_initialized ? 'text-green-600' : 'text-red-600'}>
                  {status.app_initialized ? '✓ 成功' : '✗ 失败'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>回调地址:</span>
                <span className="font-mono text-xs">{status.notify_url}</span>
              </div>
              {!status.app_initialized && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">
                    ⚠️ 微信支付未正确配置，请检查私钥文件内容
                  </p>
                  <p className="text-red-600 text-xs mt-1">
                    私钥文件路径: {status.private_key_path}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>支付说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• 请确保在微信环境中进行支付</p>
              <p>• 支付金额最低为0.01元</p>
              <p>• 支付成功后会自动更新订单状态</p>
              <p>• 如遇支付问题，请联系客服</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}