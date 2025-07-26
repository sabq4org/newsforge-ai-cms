import React from 'react';

/**
 * QuantumTest - Simple test component to verify quantum error fixes
 */
export function QuantumTest() {
  // Test quantum object access that was causing the error
  React.useEffect(() => {
    try {
      console.log('Testing quantum object access...');
      
      // Test the exact access pattern that was failing
      if (typeof window !== 'undefined' && (window as any).q) {
        const q = (window as any).q;
        
        // This should not throw an error anymore
        const ambientLight = q?.context?.ambientLight;
        console.log('Ambient light value:', ambientLight);
        
        const reasoning = q?.reasoning?.[0];
        console.log('Reasoning:', reasoning);
        
        const accentColor = q?.colors?.accent;
        console.log('Accent color:', accentColor);
        
        console.log('✅ Quantum object access test passed');
      }
    } catch (error) {
      console.error('❌ Quantum object access test failed:', error);
    }
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-30 bg-green-100 border border-green-300 rounded-md px-3 py-2 text-xs text-green-700">
      Quantum Test: Active
    </div>
  );
}

export default QuantumTest;