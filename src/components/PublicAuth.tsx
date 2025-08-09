import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import LoadingSpinner from './common/LoadingSpinner';

interface PublicAuthProps {
  onClose?: () => void;
  redirectPath?: string;
}

export function PublicAuth({ onClose, redirectPath }: PublicAuthProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'reset'>('signin');

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  // Reset Password Form State
  const [resetEmail, setResetEmail] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;

    setError('');
    setMessage('');
    setAuthLoading(true);

    try {
      const result = await signIn(signInData.email, signInData.password);
      
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        setMessage('Sign in successful!');
        if (onClose) {
          setTimeout(onClose, 1000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;

    setError('');
    setMessage('');

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setAuthLoading(true);

    try {
      const result = await signUp(signUpData.email, signUpData.password, signUpData.fullName);
      
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        setMessage('Account created successfully! Please check your email for verification.');
        // Clear form
        setSignUpData({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: ''
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;

    setError('');
    setMessage('');
    setAuthLoading(true);

    try {
      const result = await resetPassword(resetEmail);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Password reset email sent! Check your inbox.');
        setResetEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred sending reset email');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Boujee Events
          </CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{message}</p>
              </div>
            )}

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                    disabled={authLoading}
                  />
                </div>
                <div>
                  <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    disabled={authLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                    required
                    disabled={authLoading}
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                    disabled={authLoading}
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    disabled={authLoading}
                    minLength={6}
                  />
                </div>
                <div>
                  <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    required
                    disabled={authLoading}
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                </Button>
              </form>
            </TabsContent>

            {/* Reset Password Tab */}
            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={authLoading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We'll send you a link to reset your password
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Close Button */}
          {onClose && (
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
                disabled={authLoading}
              >
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
