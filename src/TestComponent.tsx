import React from 'react';
import { cn } from '@/lib/utils';

export function TestComponent() {
  return (
    <div className={cn("p-4", "bg-white", "text-black")}>
      <h1 className="text-2xl font-bold">النظام يعمل بشكل صحيح</h1>
      <p>تم إصلاح جميع الأخطاء المرجع</p>
    </div>
  );
}

export default TestComponent;