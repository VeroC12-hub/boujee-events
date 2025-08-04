import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  CreditCard, 
  Cloud, 
  QrCode, 
  Users, 
  Calendar,
  Image,
  Mail,
  Database,
  Shield,
  BarChart3,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Import the new management components
import PaymentProviderManager from './PaymentProviderManager';
import GoogleDriveManager from './GoogleDriveManager';
import QRTicketValidator from './QRTicketValidator';

interface SystemStatus {
  database: 'connected' | 'disconnected' | 'error';
  payments: 'configured' | 'not_configured' | 'error';
  googleDrive: 'connected' | 'not_connected' | 'error';
  email: 'configured' | 'not_configured' | 'error';
}

export const EnhancedAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock system status
  const [systemStatus] = useState<SystemStatus>({
    database: 'connected',
    payments: 'not_configured',
    googleDrive: 'not_connected',
    email: 'not_configured'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'configured':
        return 'text-green-500';
      case 'not_connected':
      case 'not_configured':
        return 'text-yellow-500';
      case 'error':
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'configured':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'not_connected':
      case 'not_configured':
        return <Badge variant="secondary">Not Configured</Badge>;
      case 'error':
      case 'disconnected':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your Boujee Events platform</p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="google-drive" className="flex items-center space-x-2">
              <Cloud className="h-4 w-4" />
              <span className="hidden sm:inline">Google Drive</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className={`h-4 w-4 ${getStatusColor(systemStatus.database)}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">SQLite</div>
                    {getStatusBadge(systemStatus.database)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Local database ready
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payments</CardTitle>
                  <CreditCard className={`h-4 w-4 ${getStatusColor(systemStatus.payments)}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">0</div>
                    {getStatusBadge(systemStatus.payments)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Providers configured
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Google Drive</CardTitle>
                  <Cloud className={`h-4 w-4 ${getStatusColor(systemStatus.googleDrive)}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">—</div>
                    {getStatusBadge(systemStatus.googleDrive)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Photo storage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Service</CardTitle>
                  <Mail className={`h-4 w-4 ${getStatusColor(systemStatus.email)}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">Resend</div>
                    {getStatusBadge(systemStatus.email)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email notifications
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('payments')}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span>Setup Payments</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('google-drive')}
                  >
                    <Cloud className="h-6 w-6" />
                    <span>Connect Google Drive</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('tickets')}
                  >
                    <QrCode className="h-6 w-6" />
                    <span>Validate Tickets</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="h-6 w-6" />
                    <span>Manage Users</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest system events and user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">Database initialized with default data</div>
                    <div className="text-gray-500">Just now</div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">Admin user created successfully</div>
                    <div className="text-gray-500">Just now</div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">Sample events loaded</div>
                    <div className="text-gray-500">Just now</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Provider Management */}
          <TabsContent value="payments">
            <PaymentProviderManager />
          </TabsContent>

          {/* Google Drive Management */}
          <TabsContent value="google-drive">
            <GoogleDriveManager />
          </TabsContent>

          {/* QR Ticket Validation */}
          <TabsContent value="tickets">
            <QRTicketValidator />
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage platform users and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced user management features will be available here including user roles, 
                    permissions, activity logs, and account management.
                  </p>
                  <Button variant="outline">Coming Soon</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure global platform settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* General Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">General Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Site Name</label>
                        <input 
                          type="text" 
                          defaultValue="Boujee Events" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Default Currency</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="HUF">HUF - Hungarian Forint</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Email Settings */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Email Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Send booking confirmations and receipts</p>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Resend API Key</label>
                        <input 
                          type="password" 
                          placeholder="Enter your Resend API key" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                        </div>
                        <input type="checkbox" className="toggle" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Password Complexity</h4>
                          <p className="text-sm text-gray-600">Enforce strong password requirements</p>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="border-t pt-6">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;