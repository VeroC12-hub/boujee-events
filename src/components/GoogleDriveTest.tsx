import React, { useState, useEffect } from 'react';
import { googleDriveService } from '../services/googleDriveService';

interface ConnectionStatus {
  isConnected: boolean;
  isInitialized: boolean;
  hasToken: boolean;
  error?: string;
  userInfo?: any;
}

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: string;
}

export const GoogleDriveTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isInitialized: false,
    hasToken: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setLogs(prev => [...prev, `${timestamp}: ${emoji} ${message}`]);
  };

  const addTestResult = (test: string, status: 'success' | 'error', message: string) => {
    const result: TestResult = {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
  };

  const checkEnvironmentVariables = () => {
    addLog('Checking environment variables...', 'info');
    
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
    const folderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;
    
    addLog(`VITE_GOOGLE_CLIENT_ID: ${clientId ? '✅ Set' : '❌ Missing'}`, clientId ? 'success' : 'error');
    addLog(`VITE_GOOGLE_DRIVE_API_KEY: ${apiKey ? '✅ Set' : '❌ Missing'}`, apiKey ? 'success' : 'error');
    addLog(`VITE_GOOGLE_DRIVE_FOLDER_ID: ${folderId ? '✅ Set' : 'ℹ️ Optional'}`, folderId ? 'success' : 'info');
    
    if (!clientId) {
      addTestResult('Environment Variables', 'error', 'VITE_GOOGLE_CLIENT_ID is missing');
    }
    if (!apiKey) {
      addTestResult('Environment Variables', 'error', 'VITE_GOOGLE_DRIVE_API_KEY is missing');
    }
    if (clientId && apiKey) {
      addTestResult('Environment Variables', 'success', 'All required variables are set');
    }
    
    return !!(clientId && apiKey);
  };

  const testInitialization = async () => {
    setIsLoading(true);
    addLog('Testing Google Drive API initialization...', 'info');
    
    try {
      const initialized = await googleDriveService.initialize();
      if (initialized) {
        addLog('Google Drive API initialized successfully', 'success');
        setStatus(prev => ({ ...prev, initialized: true }));
        addTestResult('API Initialization', 'success', 'Google Drive API initialized successfully');
      } else {
        addLog('Failed to initialize Google Drive API', 'error');
        setStatus(prev => ({ ...prev, error: 'Initialization failed' }));
        addTestResult('API Initialization', 'error', 'Failed to initialize Google Drive API');
      }
    } catch (error: any) {
      addLog(`Initialization error: ${error.message}`, 'error');
      setStatus(prev => ({ ...prev, error: error.message }));
      addTestResult('API Initialization', 'error', error.message);
    }
    
    setIsLoading(false);
  };

  const testAuthentication = async () => {
    setIsLoading(true);
    addLog('Testing Google Drive authentication...', 'info');
    
    try {
      const authenticated = await googleDriveService.authenticate();
      if (authenticated) {
        addLog('Successfully authenticated with Google Drive', 'success');
        setStatus(prev => ({ ...prev, authenticated: true }));
        addTestResult('Authentication', 'success', 'Successfully authenticated with Google Drive');
        
        // Get user info
        const user = await googleDriveService.getUserInfo();
        if (user) {
          setUserInfo(user);
          addLog(`Logged in as: ${user.name} (${user.email})`, 'success');
        }
        
        // Test connection
        const connectionTest = await googleDriveService.testConnection();
        if (connectionTest) {
          addLog('Connection test passed', 'success');
          addTestResult('Connection Test', 'success', 'Successfully connected to Google Drive');
        } else {
          addLog('Connection test failed', 'error');
          addTestResult('Connection Test', 'error', 'Failed to connect to Google Drive');
        }
      } else {
        addLog('Authentication failed', 'error');
        setStatus(prev => ({ ...prev, error: 'Authentication failed' }));
        addTestResult('Authentication', 'error', 'Authentication failed or was cancelled');
      }
    } catch (error: any) {
      addLog(`Authentication error: ${error.message}`, 'error');
      setStatus(prev => ({ ...prev, error: error.message }));
      addTestResult('Authentication', 'error', error.message);
    }
    
    setIsLoading(false);
  };

  const testFolderCreation = async () => {
    if (!status.authenticated) {
      addLog('Please authenticate first', 'error');
      return;
    }

    setIsLoading(true);
    addLog('Testing folder creation...', 'info');
    
    try {
      const testEventName = `Test Event ${Date.now()}`;
      const testEventId = `test-${Date.now()}`;
      
      const eventFolder = await googleDriveService.createEventFolder(testEventName, testEventId);
      
      if (eventFolder) {
        addLog(`Event folder created: ${eventFolder.eventName || 'Unnamed Event'}`, 'success');
        addLog(`Main folder ID: ${eventFolder.eventFolderId}`, 'info');
        addLog(`Photos folder ID: ${eventFolder.photosFolderId}`, 'info');
        addLog(`Videos folder ID: ${eventFolder.videosFolderId}`, 'info');
        addLog(`View link: ${eventFolder.webViewLink || 'No link available'}`, 'info');
        
        addTestResult('Folder Creation', 'success', `Created test event folder: ${eventFolder.eventName || 'Unnamed Event'}`);
      } else {
        addLog('Event folder creation returned null', 'error');
        addTestResult('Folder Creation', 'error', 'Folder creation returned null');
      }
    } catch (error: any) {
      addLog(`Folder creation error: ${error.message}`, 'error');
      addTestResult('Folder Creation', 'error', error.message);
    }
    
    setIsLoading(false);
  };

  const signOut = async () => {
    addLog('Signing out...', 'info');
    await googleDriveService.signOut();
    setStatus({ initialized: status.initialized, authenticated: false });
    setUserInfo(null);
    addLog('Signed out successfully', 'success');
    addTestResult('Sign Out', 'success', 'Successfully signed out from Google Drive');
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults([]);
  };

  const runAllTests = async () => {
    clearLogs();
    addLog('Starting comprehensive Google Drive test...', 'info');
    
    // Test 1: Environment Variables
    const envCheck = checkEnvironmentVariables();
    if (!envCheck) {
      addLog('Cannot proceed with tests due to missing environment variables', 'error');
      return;
    }

    // Test 2: API Initialization
    await testInitialization();
    if (!status.initialized) {
      addLog('Cannot proceed with tests due to initialization failure', 'error');
      return;
    }

    // Test 3: Authentication
    await testAuthentication();
    if (!status.authenticated) {
      addLog('Cannot proceed with tests due to authentication failure', 'error');
      return;
    }

    // Test 4: Folder Creation
    await testFolderCreation();
    
    addLog('All tests completed!', 'success');
  };

  useEffect(() => {
    // Check initial status
    const currentStatus = googleDriveService.getConnectionStatus();
    setStatus(currentStatus);
    
    // Check environment variables on mount
    checkEnvironmentVariables();
  }, []);

  const getStatusColor = (status: boolean) => status ? 'text-green-600' : 'text-red-600';
  const getStatusIcon = (status: boolean) => status ? '✅' : '❌';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Google Drive Integration Test</h2>
        
        {/* Quick Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Environment</h3>
            <div className="space-y-1 text-sm">
              <div className={`flex items-center space-x-2 ${import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'text-green-600' : 'text-red-600'}`}>
                <span>{getStatusIcon(!!import.meta.env.VITE_GOOGLE_CLIENT_ID)}</span>
                <span>Client ID</span>
              </div>
              <div className={`flex items-center space-x-2 ${import.meta.env.VITE_GOOGLE_DRIVE_API_KEY ? 'text-green-600' : 'text-red-600'}`}>
                <span>{getStatusIcon(!!import.meta.env.VITE_GOOGLE_DRIVE_API_KEY)}</span>
                <span>API Key</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Initialization</h3>
            <div className={`flex items-center space-x-2 ${getStatusColor(status.initialized)}`}>
              <span>{getStatusIcon(status.initialized)}</span>
              <span>{status.initialized ? 'Ready' : 'Not Ready'}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Authentication</h3>
            <div className={`flex items-center space-x-2 ${getStatusColor(status.authenticated)}`}>
              <span>{getStatusIcon(status.authenticated)}</span>
              <span>{status.authenticated ? 'Connected' : 'Not Connected'}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">User</h3>
            {userInfo ? (
              <div className="text-sm">
                <div className="font-medium">{userInfo.name}</div>
                <div className="text-gray-600 truncate">{userInfo.email}</div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Not logged in</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={runAllTests}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={testInitialization}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Test Initialization
          </button>
          
          <button
            onClick={testAuthentication}
            disabled={isLoading || !status.initialized}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Test Authentication
          </button>
          
          <button
            onClick={testFolderCreation}
            disabled={isLoading || !status.authenticated}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Test Folder Creation
          </button>
          
          {status.authenticated && (
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          )}
          
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Logs
          </button>
        </div>

        {/* Test Results Summary */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Test Results Summary</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded ${
                  result.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span>{result.status === 'success' ? '✅' : '❌'}</span>
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>{result.message}</span>
                    <span className="ml-2 text-xs">{result.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {status.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Error Details</h3>
            <p className="text-red-700 break-words">{status.error}</p>
          </div>
        )}

        {/* Logs Console */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Live Console</h3>
            <span className="text-xs text-gray-400">{logs.length} entries</span>
          </div>
          <div className="h-64 overflow-y-auto border border-gray-700 rounded p-3">
            {logs.length === 0 ? (
              <p className="text-gray-500 italic">No logs yet... Click "Run All Tests" to start</p>
            ) : (
              <div className="space-y-1 text-sm font-mono">
                {logs.map((log, index) => (
                  <div key={index} className="hover:bg-gray-800 p-1 rounded">{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3">🔧 Troubleshooting Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 text-sm">
            <div>
              <h4 className="font-medium mb-2">Environment Issues:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Check .env.local file exists in project root</li>
                <li>Verify VITE_GOOGLE_CLIENT_ID is set</li>
                <li>Verify VITE_GOOGLE_DRIVE_API_KEY is set</li>
                <li>Restart development server after changes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">API Issues:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Check Google Cloud Console OAuth settings</li>
                <li>Verify authorized origins include localhost:8080</li>
                <li>Ensure Google Drive API is enabled</li>
                <li>Check browser console for CSP errors</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-100 rounded">
            <p className="text-blue-800 text-sm">
              <strong>Quick Check:</strong> Open browser DevTools → Console tab to see detailed error messages.
              Network tab shows failed API requests.
            </p>
          </div>
        </div>

        {/* Success Message */}
        {status.initialized && status.authenticated && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">🎉 Success!</h3>
            <p className="text-green-700">
              Google Drive integration is working correctly. You can now upload files and manage event media.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
