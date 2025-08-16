// Create: src/components/test/HybridServiceTest.tsx
import React, { useState } from 'react';
import { hybridMediaService } from '../../services/HybridMediaService';

export const HybridServiceTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('Not tested');

  const runTest = async () => {
    try {
      setTestResult('Testing...');
      const analytics = await hybridMediaService.getStorageAnalytics();
      setTestResult(`Success: ${analytics.totalFiles} files, ${analytics.usagePercentage.toFixed(1)}% usage`);
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded">
      <h3>Hybrid Service Test</h3>
      <button onClick={runTest} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
        Test Service
      </button>
      <p className="mt-2 text-sm">Result: {testResult}</p>
    </div>
  );
};
