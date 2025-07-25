import { useEffect } from 'react';

/**
 * SidebarProtector Component
 * Provides JavaScript-based protection against floating UI elements overlapping the sidebar
 */
export function SidebarProtector() {
  useEffect(() => {
    const protectSidebar = () => {
      // Get sidebar dimensions
      const sidebar = document.querySelector('.sidebar, .admin-sidebar, [data-sidebar]') as HTMLElement;
      if (!sidebar) return;
      
      const sidebarRect = sidebar.getBoundingClientRect();
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      
      // Find all floating UI elements
      const floatingSelectors = [
        '[data-radix-popper-content-wrapper]',
        '[data-radix-select-content]',
        '[data-radix-dropdown-menu-content]',
        '[data-radix-popover-content]',
        '[data-radix-tooltip-content]',
        '[data-radix-hover-card-content]',
        '[data-radix-context-menu-content]',
        '[data-floating-ui-portal]',
        '[role="listbox"]',
        '[role="menu"]',
        '[role="tooltip"]',
        '.dropdown-menu',
        '.select-content',
        '.popover-content',
        '.floating-ui'
      ];
      
      floatingSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
        elements.forEach(element => {
          // Skip if element is inside sidebar
          if (sidebar.contains(element)) return;
          
          // Force z-index below sidebar
          element.style.zIndex = '15';
          
          // Force positioning away from sidebar
          if (isRTL) {
            element.style.right = `${sidebarRect.width + 50}px`;
            element.style.left = 'auto';
            element.style.maxWidth = `calc(100vw - ${sidebarRect.width + 70}px)`;
          } else {
            element.style.left = `${sidebarRect.width + 50}px`;
            element.style.right = 'auto';
            element.style.maxWidth = `calc(100vw - ${sidebarRect.width + 70}px)`;
          }
          
          // Prevent any transforms that might move element back
          element.style.transform = 'none';
          element.style.position = 'fixed';
          
          // Add containment
          element.style.contain = 'layout style paint';
          element.style.isolation = 'isolate';
        });
      });
    };
    
    // Run protection immediately
    protectSidebar();
    
    // Set up observers
    const observer = new MutationObserver(() => {
      // Debounce the protection to avoid performance issues
      setTimeout(protectSidebar, 100);
    });
    
    // Watch for new floating elements
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-radix-popper-content-wrapper', 'role', 'aria-expanded']
    });
    
    // Watch for resize events
    const resizeObserver = new ResizeObserver(() => {
      protectSidebar();
    });
    
    const sidebar = document.querySelector('.sidebar, .admin-sidebar, [data-sidebar]');
    if (sidebar) {
      resizeObserver.observe(sidebar);
    }
    
    // Watch for scroll events that might affect floating elements
    const handleScroll = () => {
      protectSidebar();
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', protectSidebar, { passive: true });
    
    // Cleanup
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', protectSidebar);
    };
  }, []);
  
  return null; // This component doesn't render anything
}

/**
 * Enhanced Sidebar Protection Hook
 * Provides protection specifically for admin interfaces
 */
export function useSidebarProtection() {
  useEffect(() => {
    // Enhanced protection with more aggressive positioning
    const enhancedProtection = () => {
      const sidebar = document.querySelector('.sidebar, .admin-sidebar') as HTMLElement;
      if (!sidebar) return;
      
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      const sidebarWidth = sidebar.offsetWidth;
      
      // Apply styles to body to create protection zone
      if (isRTL) {
        document.documentElement.style.setProperty('--sidebar-protection-right', `${sidebarWidth + 20}px`);
      } else {
        document.documentElement.style.setProperty('--sidebar-protection-left', `${sidebarWidth + 20}px`);
      }
      
      // Force all portals to respect boundaries
      const portals = document.querySelectorAll('[data-radix-portal]');
      portals.forEach(portal => {
        (portal as HTMLElement).style.zIndex = '15';
      });
    };
    
    enhancedProtection();
    
    const interval = setInterval(enhancedProtection, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
}