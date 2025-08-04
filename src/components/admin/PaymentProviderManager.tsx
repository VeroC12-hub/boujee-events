import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Trash2, Eye, EyeOff, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clientApi, PaymentProvider } from '@/lib/clientApi';

export const PaymentProviderManager: React.FC = () => {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('stripe');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Stripe configuration
  const [stripeConfig, setStripeConfig] = useState({
    secretKey: '',
    publicKey: '',
    webhookSecret: '',
    isTestMode: true
  });

  // PayPal configuration
  const [paypalConfig, setPaypalConfig] = useState({
    clientId: '',
    clientSecret: '',
    environment: 'sandbox' as 'sandbox' | 'production',
    isTestMode: true
  });

  // Hungarian Bank configuration
  const [hungarianBankConfig, setHungarianBankConfig] = useState({
    merchantId: '',
    secretKey: '',
    apiEndpoint: '',
    isTestMode: true
  });

  useEffect(() => {
    loadPaymentProviders();
  }, []);

  const loadPaymentProviders = async () => {
    try {
      const response = await clientApi.getPaymentProviders();
      if (response.success && response.data) {
        setProviders(response.data);
      }
    } catch (error) {
      console.error('Failed to load payment providers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load payment providers'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStripeProvider = async () => {
    if (!stripeConfig.secretKey || !stripeConfig.publicKey) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required Stripe fields'
      });
      return;
    }

    setSaving(true);
    try {
      const credentials = {
        secretKey: stripeConfig.secretKey,
        publicKey: stripeConfig.publicKey,
        webhookSecret: stripeConfig.webhookSecret
      };

      const response = await clientApi.savePaymentProvider('stripe', credentials, stripeConfig.isTestMode);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Stripe configuration saved successfully'
        });
        loadPaymentProviders();
        // Clear form
        setStripeConfig({
          secretKey: '',
          publicKey: '',
          webhookSecret: '',
          isTestMode: true
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error || 'Failed to save Stripe configuration'
        });
      }
    } catch (error) {
      console.error('Error saving Stripe provider:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save Stripe configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  const savePayPalProvider = async () => {
    if (!paypalConfig.clientId || !paypalConfig.clientSecret) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required PayPal fields'
      });
      return;
    }

    setSaving(true);
    try {
      const credentials = {
        clientId: paypalConfig.clientId,
        clientSecret: paypalConfig.clientSecret,
        environment: paypalConfig.environment
      };

      const response = await clientApi.savePaymentProvider('paypal', credentials, paypalConfig.isTestMode);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'PayPal configuration saved successfully'
        });
        loadPaymentProviders();
        // Clear form
        setPaypalConfig({
          clientId: '',
          clientSecret: '',
          environment: 'sandbox',
          isTestMode: true
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error || 'Failed to save PayPal configuration'
        });
      }
    } catch (error) {
      console.error('Error saving PayPal provider:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save PayPal configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  const saveHungarianBankProvider = async () => {
    if (!hungarianBankConfig.merchantId || !hungarianBankConfig.secretKey || !hungarianBankConfig.apiEndpoint) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required Hungarian Bank fields'
      });
      return;
    }

    setSaving(true);
    try {
      const credentials = {
        merchantId: hungarianBankConfig.merchantId,
        secretKey: hungarianBankConfig.secretKey,
        apiEndpoint: hungarianBankConfig.apiEndpoint
      };

      const response = await clientApi.savePaymentProvider('hungarian_bank', credentials, hungarianBankConfig.isTestMode);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Hungarian Bank configuration saved successfully'
        });
        loadPaymentProviders();
        // Clear form
        setHungarianBankConfig({
          merchantId: '',
          secretKey: '',
          apiEndpoint: '',
          isTestMode: true
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error || 'Failed to save Hungarian Bank configuration'
        });
      }
    } catch (error) {
      console.error('Error saving Hungarian Bank provider:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save Hungarian Bank configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleProvider = async (providerId: string, isActive: boolean) => {
    try {
      const response = await clientApi.togglePaymentProvider(providerId, isActive);
      if (response.success) {
        toast({
          title: 'Success',
          description: `Payment provider ${isActive ? 'activated' : 'deactivated'} successfully`
        });
        loadPaymentProviders();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error || 'Failed to update payment provider'
        });
      }
    } catch (error) {
      console.error('Error toggling provider:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update payment provider'
      });
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const maskSecret = (secret: string, show: boolean) => {
    if (show) return secret;
    return secret.length > 8 ? 
      secret.substring(0, 4) + '•'.repeat(secret.length - 8) + secret.substring(secret.length - 4) :
      '•'.repeat(secret.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <CreditCard className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Provider Management</h1>
          <p className="text-gray-600">Configure and manage payment processing providers</p>
        </div>
      </div>

      {/* Current Providers */}
      {providers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Payment Providers</CardTitle>
            <CardDescription>
              Currently configured payment providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium">{provider.providerName}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={provider.isTestMode ? 'outline' : 'destructive'}>
                          {provider.isTestMode ? 'Test' : 'Live'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={provider.isActive}
                      onCheckedChange={(checked) => toggleProvider(provider.id, checked)}
                    />
                    {provider.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Provider */}
      <Card>
        <CardHeader>
          <CardTitle>Add Payment Provider</CardTitle>
          <CardDescription>
            Configure a new payment processing provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="hungarian_bank">Hungarian Bank</TabsTrigger>
            </TabsList>

            <TabsContent value="stripe" className="space-y-4">
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  Use your Stripe test keys for development and live keys for production. 
                  You can find these in your Stripe Dashboard under Developers → API keys.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-secret-key">Secret Key *</Label>
                  <div className="relative">
                    <Input
                      id="stripe-secret-key"
                      type={showSecrets.stripeSecret ? 'text' : 'password'}
                      value={stripeConfig.secretKey}
                      onChange={(e) => setStripeConfig({ ...stripeConfig, secretKey: e.target.value })}
                      placeholder="sk_test_..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => toggleSecretVisibility('stripeSecret')}
                    >
                      {showSecrets.stripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-public-key">Publishable Key *</Label>
                  <Input
                    id="stripe-public-key"
                    value={stripeConfig.publicKey}
                    onChange={(e) => setStripeConfig({ ...stripeConfig, publicKey: e.target.value })}
                    placeholder="pk_test_..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-webhook-secret">Webhook Secret (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="stripe-webhook-secret"
                      type={showSecrets.stripeWebhook ? 'text' : 'password'}
                      value={stripeConfig.webhookSecret}
                      onChange={(e) => setStripeConfig({ ...stripeConfig, webhookSecret: e.target.value })}
                      placeholder="whsec_..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => toggleSecretVisibility('stripeWebhook')}
                    >
                      {showSecrets.stripeWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="stripe-test-mode"
                    checked={stripeConfig.isTestMode}
                    onCheckedChange={(checked) => setStripeConfig({ ...stripeConfig, isTestMode: checked })}
                  />
                  <Label htmlFor="stripe-test-mode">Test Mode</Label>
                </div>
              </div>

              <Button
                onClick={saveStripeProvider}
                disabled={saving}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {saving ? 'Saving...' : 'Save Stripe Configuration'}
              </Button>
            </TabsContent>

            <TabsContent value="paypal" className="space-y-4">
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  Use PayPal sandbox credentials for testing and live credentials for production.
                  Create your app in the PayPal Developer Console.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paypal-client-id">Client ID *</Label>
                  <Input
                    id="paypal-client-id"
                    value={paypalConfig.clientId}
                    onChange={(e) => setPaypalConfig({ ...paypalConfig, clientId: e.target.value })}
                    placeholder="AXhAy..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paypal-client-secret">Client Secret *</Label>
                  <div className="relative">
                    <Input
                      id="paypal-client-secret"
                      type={showSecrets.paypalSecret ? 'text' : 'password'}
                      value={paypalConfig.clientSecret}
                      onChange={(e) => setPaypalConfig({ ...paypalConfig, clientSecret: e.target.value })}
                      placeholder="EHhb..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => toggleSecretVisibility('paypalSecret')}
                    >
                      {showSecrets.paypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paypal-environment">Environment</Label>
                  <select
                    id="paypal-environment"
                    value={paypalConfig.environment}
                    onChange={(e) => setPaypalConfig({ ...paypalConfig, environment: e.target.value as 'sandbox' | 'production' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="sandbox">Sandbox (Test)</option>
                    <option value="production">Production (Live)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="paypal-test-mode"
                    checked={paypalConfig.isTestMode}
                    onCheckedChange={(checked) => setPaypalConfig({ ...paypalConfig, isTestMode: checked })}
                  />
                  <Label htmlFor="paypal-test-mode">Test Mode</Label>
                </div>
              </div>

              <Button
                onClick={savePayPalProvider}
                disabled={saving}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {saving ? 'Saving...' : 'Save PayPal Configuration'}
              </Button>
            </TabsContent>

            <TabsContent value="hungarian_bank" className="space-y-4">
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  Configure Hungarian bank payment gateway. Contact your bank provider for API credentials.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hungarian-merchant-id">Merchant ID *</Label>
                  <Input
                    id="hungarian-merchant-id"
                    value={hungarianBankConfig.merchantId}
                    onChange={(e) => setHungarianBankConfig({ ...hungarianBankConfig, merchantId: e.target.value })}
                    placeholder="12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hungarian-secret-key">Secret Key *</Label>
                  <div className="relative">
                    <Input
                      id="hungarian-secret-key"
                      type={showSecrets.hungarianSecret ? 'text' : 'password'}
                      value={hungarianBankConfig.secretKey}
                      onChange={(e) => setHungarianBankConfig({ ...hungarianBankConfig, secretKey: e.target.value })}
                      placeholder="your-secret-key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => toggleSecretVisibility('hungarianSecret')}
                    >
                      {showSecrets.hungarianSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hungarian-api-endpoint">API Endpoint *</Label>
                  <Input
                    id="hungarian-api-endpoint"
                    value={hungarianBankConfig.apiEndpoint}
                    onChange={(e) => setHungarianBankConfig({ ...hungarianBankConfig, apiEndpoint: e.target.value })}
                    placeholder="https://api.bank.com/payments"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hungarian-test-mode"
                    checked={hungarianBankConfig.isTestMode}
                    onCheckedChange={(checked) => setHungarianBankConfig({ ...hungarianBankConfig, isTestMode: checked })}
                  />
                  <Label htmlFor="hungarian-test-mode">Test Mode</Label>
                </div>
              </div>

              <Button
                onClick={saveHungarianBankProvider}
                disabled={saving}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {saving ? 'Saving...' : 'Save Hungarian Bank Configuration'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProviderManager;