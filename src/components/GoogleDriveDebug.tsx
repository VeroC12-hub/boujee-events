import React, { useEffect, useState } from 'react';

interface EnvironmentCheck {
  name: string;
  value: string | undefined;
  status: 'present' | 'missing';
  masked?: boolean;
}

export const GoogleDriveDebug: React.FC = () => {
  const [envVars, setEnvVars] = useState<EnvironmentCheck[]>([]);
  const [currentEnv, setCurrentEnv] = useState<string>('unknown');

  useEffect(() => {
    // Check environment variables
    const checks: EnvironmentCheck[] = [
      {
        name: 'VITE_GOOGLE_CLIENT_ID',
        value: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        status: import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'present' : 'missing',
        masked: true
      },
      {
        name: 'VITE_GOOGLE_DRIVE_API_KEY',
        value: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
        status: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY ? 'present' : 'missing',
        masked: true
      },
      {
        name: 'VITE_GOOGLE_DRIVE_FOLDER_ID',
        value: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID,
        status: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID ? 'present' : 'missing',
        masked: true
      },
      {
        name: 'NODE_ENV',
        value: import.meta.env.MODE,
        status: 'present',
        masked: false
      },
      {
        name: 'VITE_APP_ENV',
        value: import.meta.env.VITE_APP_ENV,
        status: import.meta.env.VITE_APP_ENV ? 'present' : 'missing',
        masked: false
      }
    ];

    setEnvVars(checks);
    setCurrentEnv(import.meta.env.MODE || 'unknown');

    // Log detailed environment info
    console.log('🔍 Environment Debug Information:');
    console.log('Current Mode:', import.meta.env.MODE);
    console.log('Node Environment:', import.meta.env.NODE_ENV);
    console.log('Production:', import.meta.env.PROD);
    console.log('Development:', import.meta.env.DEV);
    console.log('All Vite Env:', import.meta.env);
  }, []);

  const maskValue = (value: string | undefined, mask: boolean = true): string => {
    if (!value) return 'Not Set';
    if (!mask) return value;
    return value.length > 10 ? `${value.substring(0, 6)}...${value.substring(value.length - 4)}` : '***masked***';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">🔍 Environment Debug Information</h2>
      
      {/* Current Environment */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Current Environment</h3>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          currentEnv === 'production' 
            ? 'bg-green-100 text-green-800' 
            : currentEnv === 'development'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {currentEnv.toUpperCase()}
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          <div>Mode: {import.meta.env.MODE}</div>
          <div>Production: {import.meta.env.PROD ? 'Yes' : 'No'}</div>
          <div>Development: {import.meta.env.DEV ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-4">Environment Variables Status</h3>
        <div className="space-y-3">
          {envVars.map((envVar, index) => (
            <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
              envVar.status === 'present' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${
                  envVar.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className="font-medium text-gray-900">{envVar.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                {maskValue(envVar.value, envVar.masked)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Drive Specific Checks */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-4">Google Drive Integration Status</h3>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium text-blue-900">Required for Google Drive:</div>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• VITE_GOOGLE_CLIENT_ID {envVars.find(v => v.name === 'VITE_GOOGLE_CLIENT_ID')?.status === 'present' ? '✅' : '❌'}</li>
              <li>• VITE_GOOGLE_DRIVE_API_KEY {envVars.find(v => v.name === 'VITE_GOOGLE_DRIVE_API_KEY')?.status === 'present' ? '✅' : '❌'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Issues Detection */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-4">Detected Issues</h3>
        <div className="space-y-2">
          {currentEnv === 'development' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="font-medium text-yellow-900">⚠️ Running in Development Mode</div>
              <div className="text-sm text-yellow-800 mt-1">
                Your Vercel deployment is running in development mode. This should be production.
              </div>
            </div>
          )}
          
          {!envVars.find(v => v.name === 'VITE_GOOGLE_CLIENT_ID')?.value && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-medium text-red-900">❌ Missing Google Client ID</div>
              <div className="text-sm text-red-800 mt-1">
                VITE_GOOGLE_CLIENT_ID is not set in Vercel environment variables.
              </div>
            </div>
          )}
          
          {!envVars.find(v => v.name === 'VITE_GOOGLE_DRIVE_API_KEY')?.value && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-medium text-red-900">❌ Missing Google Drive API Key</div>
              <div className="text-sm text-red-800 mt-1">
                VITE_GOOGLE_DRIVE_API_KEY is not set in Vercel environment variables.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Solutions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">🔧 Quick Fixes</h3>
        <div className="space-y-2 text-sm text-blue-800">
          {currentEnv === 'development' && (
            <div>
              <strong>Fix Development Mode:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Check Vercel Environment Variables are set for "Production"</li>
                <li>Redeploy from Vercel dashboard</li>
                <li>Ensure NODE_ENV is not manually set to "development"</li>
              </ul>
            </div>
          )}
          
          {(!envVars.find(v => v.name === 'VITE_GOOGLE_CLIENT_ID')?.value || 
            !envVars.find(v => v.name === 'VITE_GOOGLE_DRIVE_API_KEY')?.value) && (
            <div>
              <strong>Fix Missing Environment Variables:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                <li>Add missing variables for "Production" environment</li>
                <li>Redeploy your application</li>
                <li>Verify variables are available in production</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
