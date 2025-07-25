import React from 'react';
import { Button } from '@/components/ui/button';

const SafeTestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Safe Test App</h1>
        
        <div className="grid gap-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Basic UI Test</h2>
            <Button>Test Button</Button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Status</h2>
            <p>✅ React is working</p>
            <p>✅ UI components loading</p>
            <p>✅ Styles applied</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Test Arabic Text</h2>
            <p className="font-arabic" dir="rtl">
              مرحباً بك في سبق الذكية - نظام إدارة المحتوى الذكي
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeTestApp;