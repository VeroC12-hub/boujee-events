import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Shield, CheckCircle, AlertCircle, 
  Clock, DollarSign, Users, Ticket, Lock, Globe,
  Smartphone, Building, RefreshCw, Settings, Eye,
  TrendingUp, BarChart3, Download, Copy, ExternalLink
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'wallet' | 'bank' | 'crypto';
  icon: string;
  fees: {
    percentage: number;
    fixed?: number;
    currency: string;
  };
  supported: boolean;
  popular: boolean;
  countries: string[];
  description: string;
}

interface Transaction {
  id: string;
  eventName: string;
  customerName: string;
  email: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  timestamp: string;
  fees: number;
  ticketCount: number;
}

const PaymentIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'methods' | 'transactions' | 'settings'>('methods');
  const [isTestMode, setIsTestMode] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'card',
      icon: '💳',
      fees: { percentage: 2.9, fixed: 0.30, currency: 'EUR' },
      supported: true,
      popular: true,
      countries: ['Hungary', 'EU', 'Global'],
      description: 'Global payment processor with excellent Hungarian support'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'wallet',
      icon: '🏧',
      fees: { percentage: 3.4, fixed: 0.35, currency: 'EUR' },
      supported: true,
      popular: true,
      countries: ['Hungary', 'Global'],
      description: 'Trusted digital wallet solution'
    },
    {
      id: 'barion',
      name: 'Barion',
      type: 'bank',
      icon: '🏦',
      fees: { percentage: 2.5, currency: 'EUR' },
      supported: true,
      popular: true,
      countries: ['Hungary', 'Czech Republic', 'Slovakia'],
      description: 'Leading Hungarian payment processor'
    },
    {
      id: 'otp-simplepay',
      name: 'OTP SimplePay',
      type: 'bank',
      icon: '🏧',
      fees: { percentage: 1.8, currency: 'EUR' },
      supported: true,
      popular: true,
      countries: ['Hungary'],
      description: 'Major Hungarian bank payment solution'
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      type: 'wallet',
      icon: '📱',
      fees: { percentage: 2.9, fixed: 0.30, currency: 'EUR' },
      supported: true,
      popular: false,
      countries: ['Hungary', 'Global'],
      description: 'Seamless mobile payments for iOS users'
    },
    {
      id: 'google-pay',
      name: 'Google Pay',
      type: 'wallet',
      icon: '📲',
      fees: { percentage: 2.9, fixed: 0.30, currency: 'EUR' },
      supported: true,
      popular: false,
      countries: ['Hungary', 'Global'],
      description: 'Quick payments for Android users'
    },
    {
      id: 'szep-card',
      name: 'SZÉP Card',
      type: 'card',
      icon: '💎',
      fees: { percentage: 0.0, currency: 'EUR' },
      supported: true,
      popular: true,
      countries: ['Hungary'],
      description: 'Hungarian cafeteria card system - perfect for events and entertainment'
    },
    {
      id: 'payu',
      name: 'PayU',
      type: 'wallet',
      icon: '🔷',
      fees: { percentage: 2.9, fixed: 0.20, currency: 'EUR' },
      supported: true,
      popular: true,
      countries: ['Hungary', 'Poland', 'Czech Republic', 'Romania'],
      description: 'Leading payment processor in Central & Eastern Europe'
    },
    {
      id: 'kh-simplepay',
      name: 'K&H SimplePay',
      type: 'bank',
      icon: '🏧',
      fees: { percentage: 1.9, currency: 'EUR' },
      supported: true,
      popular: true,
      countries: ['Hungary'],
      description: 'K&H Bank payment solution - trusted by Hungarians'
    },
    {
      id: 'erste-bank',
      name: 'Erste Bank',
      type: 'bank',
      icon: '🏦',
      fees: { percentage: 2.1, fixed: 0.15, currency: 'EUR' },
      supported: true,
      popular: true,
      countries: ['Hungary', 'Austria', 'Czech Republic', 'Slovakia'],
      description: 'Major Central European bank with secure online payments'
    },
    {
      id: 'unicredit',
      name: 'UniCredit Bank',
      type: 'bank',
      icon: '🏛️',
      fees: { percentage: 2.0, fixed: 0.20, currency: 'EUR' },
      supported: true,
      popular: true,
      countries: ['Hungary', 'Italy', 'Germany', 'Austria'],
      description: 'International bank with strong Hungarian presence'
    },
    {
      id: 'masterpass',
      name: 'Masterpass',
      type: 'wallet',
      icon: '💼',
      fees: { percentage: 2.8, fixed: 0.25, currency: 'EUR' },
      supported: true,
      popular: false,
      countries: ['Hungary', 'Global'],
      description: 'Mastercard digital wallet for quick and secure payments'
    },
    {
      id: 'visa-mastercard',
      name: 'Direct Card Processing',
      type: 'card',
      icon: '💳',
      fees: { percentage: 2.2, fixed: 0.25, currency: 'EUR' },
      supported: false,
      popular: false,
      countries: ['Global'],
      description: 'Direct integration with card networks'
    }
  ];

  const [transactions] = useState<Transaction[]>([
    {
      id: 'txn_001',
      eventName: 'Budapest Summer Music Festival',
      customerName: 'Sarah Johnson',
      email: 'sarah@example.com',
      amount: 267.00,
      currency: 'EUR',
      paymentMethod: 'Stripe',
      status: 'completed',
      timestamp: '2025-08-03T16:45:00Z',
      fees: 8.04,
      ticketCount: 3
    },
    {
      id: 'txn_002',
      eventName: 'Luxury Wine Tasting',
      customerName: 'Péter Nagy',
      email: 'peter.nagy@example.com',
      amount: 150.00,
      currency: 'EUR',
      paymentMethod: 'SZÉP Card',
      status: 'completed',
      timestamp: '2025-08-03T15:20:00Z',
      fees: 0.00,
      ticketCount: 1
    },
    {
      id: 'txn_003',
      eventName: 'Corporate Gala Night',
      customerName: 'Elena Kovács',
      email: 'elena@example.com',
      amount: 600.00,
      currency: 'EUR',
      paymentMethod: 'PayU',
      status: 'pending',
      timestamp: '2025-08-03T14:10:00Z',
      fees: 17.60,
      ticketCount: 3
    },
    {
      id: 'txn_004',
      eventName: 'Tech Conference Budapest',
      customerName: 'Gábor Molnár',
      email: 'gabor.molnar@example.com',
      amount: 299.00,
      currency: 'EUR',
      paymentMethod: 'K&H SimplePay',
      status: 'completed',
      timestamp: '2025-08-03T13:35:00Z',
      fees: 5.68,
      ticketCount: 2
    },
    {
      id: 'txn_005',
      eventName: 'Art Gallery Opening',
      customerName: 'Zsuzsanna Tóth',
      email: 'zsuzsa.toth@example.com',
      amount: 89.00,
      currency: 'EUR',
      paymentMethod: 'Erste Bank',
      status: 'completed',
      timestamp: '2025-08-03T12:15:00Z',
      fees: 2.02,
      ticketCount: 1
    }
  ]);

  const paymentStats = {
    totalRevenue: 142350.00,
    totalTransactions: 1247,
    averageTransaction: 114.15,
    successRate: 98.2,
    totalFees: 4287.65,
    refunds: 2340.00
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'refunded': return <RefreshCw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateFee = (amount: number, method: PaymentMethod) => {
    const percentageFee = (amount * method.fees.percentage) / 100;
    const fixedFee = method.fees.fixed || 0;
    return percentageFee + fixedFee;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Integration</h1>
            <p className="text-gray-600">Manage payment methods and transactions</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Test Mode:</span>
              <button
                onClick={() => setIsTestMode(!isTestMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isTestMode ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isTestMode ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isTestMode ? 'text-yellow-600' : 'text-green-600'}`}>
                {isTestMode ? 'Test' : 'Live'}
              </span>
            </div>
            
            <button className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>
        
        {isTestMode && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                You're in test mode. No real payments will be processed.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">€{paymentStats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-xl font-bold text-blue-600">{paymentStats.totalTransactions}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Transaction</p>
              <p className="text-xl font-bold text-purple-600">€{paymentStats.averageTransaction}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-xl font-bold text-green-600">{paymentStats.successRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fees</p>
              <p className="text-xl font-bold text-red-600">€{paymentStats.totalFees.toLocaleString()}</p>
            </div>
            <CreditCard className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Refunds</p>
              <p className="text-xl font-bold text-gray-600">€{paymentStats.refunds.toLocaleString()}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'methods', label: 'Payment Methods', icon: CreditCard },
              { id: 'transactions', label: 'Transactions', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Payment Methods Tab */}
          {activeTab === 'methods' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Available Payment Methods</h3>
                <span className="text-sm text-gray-600">
                  {paymentMethods.filter(m => m.supported).length} of {paymentMethods.length} enabled
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      method.supported 
                        ? 'border-green-200 bg-green-50 hover:border-green-300' 
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    } ${selectedMethod === method.id ? 'ring-2 ring-amber-500' : ''}`}
                    onClick={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{method.name}</h4>
                          <div className="flex items-center space-x-2">
                            {method.popular && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                Popular
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              method.supported 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {method.supported ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle method
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          method.supported ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            method.supported ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fee:</span>
                        <span className="font-medium">
                          {method.fees.percentage}%
                          {method.fees.fixed && ` + €${method.fees.fixed}`}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Countries:</span>
                        <span className="font-medium">{method.countries.slice(0, 2).join(', ')}
                          {method.countries.length > 2 && '...'}
                        </span>
                      </div>
                    </div>
                    
                    {selectedMethod === method.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Fee Calculator</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>€50: €{calculateFee(50, method).toFixed(2)}</div>
                            <div>€100: €{calculateFee(100, method).toFixed(2)}</div>
                            <div>€200: €{calculateFee(200, method).toFixed(2)}</div>
                            <div>€500: €{calculateFee(500, method).toFixed(2)}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex space-x-2">
                          <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                            Configure
                          </button>
                          <button className="text-xs border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50">
                            Test
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <div className="flex items-center space-x-2">
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                    <option>All Status</option>
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Failed</option>
                  </select>
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                    <option>Last 24 hours</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                            <div className="text-sm text-gray-500">{transaction.eventName}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm text-gray-900">{transaction.customerName}</div>
                            <div className="text-sm text-gray-500">{transaction.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            €{transaction.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.ticketCount} ticket{transaction.ticketCount > 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{transaction.paymentMethod}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 capitalize">{transaction.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <Copy className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Payment Settings</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">General Settings</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Default Currency</label>
                        <p className="text-sm text-gray-500">Primary currency for your events</p>
                      </div>
                      <select className="border border-gray-300 rounded px-3 py-2">
                        <option>EUR (€)</option>
                        <option>HUF (Ft)</option>
                        <option>USD ($)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Payment Timeout</label>
                        <p className="text-sm text-gray-500">How long to hold tickets during checkout</p>
                      </div>
                      <select className="border border-gray-300 rounded px-3 py-2">
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>60 minutes</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Auto-refund Failed Payments</label>
                        <p className="text-sm text-gray-500">Automatically process refunds for failed transactions</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Security & Compliance</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">PCI DSS Compliant</p>
                        <p className="text-sm text-gray-500">All payment data is encrypted and secure</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">GDPR Compliant</p>
                        <p className="text-sm text-gray-500">EU data protection regulations followed</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Lock className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">SSL Encryption</p>
                        <p className="text-sm text-gray-500">256-bit SSL for all transactions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-medium mb-4">Webhook Settings</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <div className="flex space-x-2">
                    <input 
                      type="url" 
                      placeholder="https://your-domain.com/webhooks/payments"
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Test
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Receive real-time notifications about payment events
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentIntegration;
