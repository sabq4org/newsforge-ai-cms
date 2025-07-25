import { useEffect } from 'react';

/**
 * ZIndexManager - Component to manage z-index layers and prevent floating UI overlap
 */
export function ZIndexManager() {
  useEffect(() => {
    // Function to adjust floating UI elements positioning
    const adjustFloatingElements = () => {
      const sidebar = document.querySelector('.sidebar, .admin-sidebar');
      const sidebarWidth = sidebar ? sidebar.getBoundingClientRect().width : 280;
      
      // Get all floating UI elements
      const floatingElements = document.querySelectorAll([
        '[data-radix-popper-content-wrapper]',
        '[data-radix-select-content]',
        '[data-radix-dropdown-menu-content]',
        '[data-radix-popover-content]',
        '[data-radix-tooltip-content]',
        '[data-radix-hover-card-content]',
        '[data-radix-context-menu-content]',
        '[data-radix-menubar-content]',
        '[data-radix-navigation-menu-content]'
      ].join(', '));

      floatingElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        const rect = htmlElement.getBoundingClientRect();
        
        // Check if element is positioned over sidebar
        const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
        const sidebarOverlap = isRTL 
          ? rect.right > (window.innerWidth - sidebarWidth)
          : rect.left < sidebarWidth;
        
        if (sidebarOverlap) {
          // Adjust positioning
          htmlElement.style.zIndex = '35';
          htmlElement.style.maxWidth = `calc(100vw - ${sidebarWidth + 40}px)`;
          
          if (isRTL) {
            htmlElement.style.right = `${sidebarWidth + 20}px`;
            htmlElement.style.left = 'auto';
          } else {
            htmlElement.style.left = `${sidebarWidth + 20}px`;
            htmlElement.style.right = 'auto';
          }
        }
      });
    };

    // Run adjustment on mount and when DOM changes
    adjustFloatingElements();

    // Create observer for dynamic elements
    const observer = new MutationObserver((mutations) => {
      let shouldAdjust = false;
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.matches('[data-radix-popper-content-wrapper], [data-radix-select-content], [data-radix-dropdown-menu-content]')) {
              shouldAdjust = true;
            }
          }
        });
      });
      
      if (shouldAdjust) {
        setTimeout(adjustFloatingElements, 0);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also run on window resize
    const handleResize = () => adjustFloatingElements();
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return null; // This component doesn't render anything
}

export default ZIndexManager;