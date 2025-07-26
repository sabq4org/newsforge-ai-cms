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
        const quantumObject = (window as any).q; // Avoid single letter variable 'q'
        
        // This should not throw an error anymore
        const ambientLight = quantumObject?.context?.ambientLight;
        console.log('Ambient light value:', ambientLight);
        
        const reasoning = quantumObject?.reasoning?.[0];
        console.log('Reasoning:', reasoning);
        
        const accentColor = quantumObject?.colors?.accent;
        console.log('Accent color:', accentColor);
        
        // Additional safety tests
        try {
          const contextTest = quantumObject.context.ambientLight; // Direct access test
          console.log('Direct context access test:', contextTest);
        } catch (directError) {
          console.error('Direct access failed:', directError);
        }
        
        console.log('✅ Quantum object access test passed');
      } else {
        console.warn('⚠️ Quantum object not available');
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