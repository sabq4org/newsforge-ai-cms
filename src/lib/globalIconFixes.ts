/**
 * Global Icon Fixes for Sabq Althakiyah CMS
 * Provides safe fallbacks for missing Phosphor icons
 */

import React from 'react';

// Create fallback components for commonly missing icons
const createIconFallback = (svgPath: string, viewBox: string = "0 0 256 256") => {
  return function SafeFallbackIcon({ size = 20, weight, className = '', ...props }: any) {
    return React.createElement('svg', {
      width: size,
      height: size,
      viewBox: viewBox,
      fill: 'currentColor',
      className: className,
      ...props
    }, React.createElement('path', {
      d: svgPath
    }));
  };
};

// Icon fallback definitions
const iconFallbacks = {
  Trophy: createIconFallback("M232,64H208V48a8,8,0,0,0-8-8H56a8,8,0,0,0-8,8V64H24A16,16,0,0,0,8,80V96a40,40,0,0,0,40,40h3.65A80.13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.61A80.13,80.13,0,0,0,204.35,136H208a40,40,0,0,0,40-40V80A16,16,0,0,0,232,64Z"),
  Award: createIconFallback("M232,64H208V48a8,8,0,0,0-8-8H56a8,8,0,0,0-8,8V64H24A16,16,0,0,0,8,80V96a40,40,0,0,0,40,40h3.65A80.13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.61A80.13,80.13,0,0,0,204.35,136H208a40,40,0,0,0,40-40V80A16,16,0,0,0,232,64Z"),
  ChartLine: createIconFallback("M224,208H32V48a8,8,0,0,0-16,0V208a16,16,0,0,0,16,16H224a8,8,0,0,0,0-16ZM60,176a8,8,0,0,0,11.31,0L96,151.31l26.34,26.35a8,8,0,0,0,11.32,0L192,119.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-32-32a8,8,0,0,0-11.32,0L128,160.69l-26.34-26.35a8,8,0,0,0-11.32,0l-32,32A8,8,0,0,0,60,176Z"),
  ChartBar: createIconFallback("M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16Z"),
  Gear: createIconFallback("M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3.12-3.12L186.05,40.54a8,8,0,0,0-3.93-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.56-3.12,3.12L40.54,69.94a8,8,0,0,0-6,3.93,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.48,1.56,3.12,3.12L69.95,215.46a8,8,0,0,0,3.93,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3.12-3.12L215.46,186.05a8,8,0,0,0,6-3.93,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06ZM128,192a64,64,0,1,1,64-64A64.07,64.07,0,0,1,128,192Z")
};

// Create safe icon getter function
export function getSafeIcon(iconName: string): any {
  try {
    // First try to import from Phosphor Icons
    const PhosphorIcons = require('@phosphor-icons/react');
    if (PhosphorIcons && PhosphorIcons[iconName] && typeof PhosphorIcons[iconName] === 'function') {
      return PhosphorIcons[iconName];
    }
  } catch {
    // Phosphor import failed, continue to fallback
  }

  // Use local fallback if available
  if (iconFallbacks[iconName as keyof typeof iconFallbacks]) {
    return iconFallbacks[iconName as keyof typeof iconFallbacks];
  }

  // Return a generic fallback
  return function GenericIconFallback({ size = 20, className = '' }: any) {
    return React.createElement('div', {
      className: `inline-flex items-center justify-center ${className}`,
      style: {
        width: size,
        height: size,
        fontSize: Math.max(12, size * 0.6),
        backgroundColor: '#f3f4f6',
        borderRadius: '2px',
        color: '#6b7280'
      }
    }, '?');
  };
}

// Register global icon fallbacks
if (typeof window !== 'undefined') {
  try {
    // Attempt to register global icon variables
    (window as any).Trophy = getSafeIcon('Trophy');
    (window as any).Award = getSafeIcon('Award');
    (window as any).ChartLine = getSafeIcon('ChartLine');
    (window as any).ChartBar = getSafeIcon('ChartBar');
    (window as any).Gear = getSafeIcon('Gear');
    console.log('Global icon fallbacks registered successfully');
  } catch (error) {
    console.warn('Could not register global icon fallbacks:', error);
  }
}

export { iconFallbacks };
export default {
  getSafeIcon,
  iconFallbacks,
  Trophy: getSafeIcon('Trophy'),
  Award: getSafeIcon('Award'),
  ChartLine: getSafeIcon('ChartLine'),
  ChartBar: getSafeIcon('ChartBar'),
  Gear: getSafeIcon('Gear')
};