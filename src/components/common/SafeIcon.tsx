import React from 'react';

// Safe icon component that provides fallbacks for missing icons
interface SafeIconProps {
  name: string;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}

// Simple SVG icon fallbacks for common missing icons
const createSimpleIcon = (path: string, viewBox: string = "0 0 256 256") => 
  ({ size = 20, className = '' }: { size?: number; className?: string }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox={viewBox} 
      className={className}
      fill="currentColor"
    >
      <path d={path} />
    </svg>
  );

// Built-in icon fallbacks
const iconFallbacks: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Trophy: createSimpleIcon("M232,64H208V48a8,8,0,0,0-8-8H56a8,8,0,0,0-8,8V64H24A16,16,0,0,0,8,80V96a40,40,0,0,0,40,40h3.65A80.13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.61A80.13,80.13,0,0,0,204.35,136H208a40,40,0,0,0,40-40V80A16,16,0,0,0,232,64Z"),
  Award: createSimpleIcon("M232,64H208V48a8,8,0,0,0-8-8H56a8,8,0,0,0-8,8V64H24A16,16,0,0,0,8,80V96a40,40,0,0,0,40,40h3.65A80.13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.61A80.13,80.13,0,0,0,204.35,136H208a40,40,0,0,0,40-40V80A16,16,0,0,0,232,64Z"),
  ChartLine: createSimpleIcon("M224,208H32V48a8,8,0,0,0-16,0V208a16,16,0,0,0,16,16H224a8,8,0,0,0,0-16ZM60,176a8,8,0,0,0,11.31,0L96,151.31l26.34,26.35a8,8,0,0,0,11.32,0L192,119.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-32-32a8,8,0,0,0-11.32,0L128,160.69l-26.34-26.35a8,8,0,0,0-11.32,0l-32,32A8,8,0,0,0,60,176Z"),
  Chart: createSimpleIcon("M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16Z"),
  ChartBar: createSimpleIcon("M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16Z"),
  Gear: createSimpleIcon("M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3.12-3.12L186.05,40.54a8,8,0,0,0-3.93-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.56-3.12,3.12L40.54,69.94a8,8,0,0,0-6,3.93,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.48,1.56,3.12,3.12L69.95,215.46a8,8,0,0,0,3.93,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3.12-3.12L215.46,186.05a8,8,0,0,0,6-3.93,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06ZM128,192a64,64,0,1,1,64-64A64.07,64.07,0,0,1,128,192Z"),
  Users: createSimpleIcon("M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z")
};

const SafeIcon: React.FC<SafeIconProps> = ({ 
  name, 
  size = 20, 
  weight = 'regular', 
  className = '' 
}) => {
  try {
    // Try to dynamically import the specific icon
    let IconComponent: any = null;
    
    try {
      // Try to get the icon from phosphor-icons if available
      const PhosphorIcons = require('@phosphor-icons/react');
      IconComponent = PhosphorIcons[name];
    } catch {
      // Phosphor icons not available, use fallback
    }
    
    if (IconComponent && typeof IconComponent === 'function') {
      return <IconComponent size={size} weight={weight} className={className} />;
    }
    
    // Try built-in fallbacks
    if (iconFallbacks[name]) {
      const FallbackIcon = iconFallbacks[name];
      return <FallbackIcon size={size} className={className} />;
    }
    
    // Generic fallback
    console.warn(`SafeIcon: No valid icon provided, using fallback`);
    return (
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ 
          width: size, 
          height: size,
          fontSize: Math.max(12, size * 0.6),
          backgroundColor: '#f3f4f6',
          borderRadius: '2px',
          color: '#6b7280'
        }}
      >
        ?
      </div>
    );
  } catch (error) {
    console.warn(`SafeIcon: Error loading icon "${name}":`, error);
    // Ultimate fallback
    return (
      <span 
        className={className}
        style={{ 
          display: 'inline-block',
          width: size, 
          height: size,
          fontSize: Math.max(12, size * 0.6),
          textAlign: 'center',
          lineHeight: `${size}px`,
          backgroundColor: '#f3f4f6',
          borderRadius: '2px',
          color: '#6b7280'
        }}
      >
        ?
      </span>
    );
  }
};

// Icon name mapping for common missing icons
const iconNameMappings: Record<string, string> = {
  'Trophy': 'Trophy',
  'Award': 'Award',
  'ChartLine': 'ChartLine',
  'Chart': 'ChartBar',
  'ChartBar': 'ChartBar',
  'Users': 'Users',
  'LineChart': 'ChartLine',
  'BarChart': 'ChartBar',
  'PieChart': 'ChartPie',
};

// Enhanced safe icon that handles name variations
export const EnhancedSafeIcon: React.FC<SafeIconProps> = ({ name, ...props }) => {
  // Try original name first
  let iconName = name;
  
  // Try mapped name if original doesn't exist
  if (iconNameMappings[name]) {
    iconName = iconNameMappings[name];
  }
  
  return <SafeIcon name={iconName} {...props} />;
};

// Export common icons with safe fallbacks
export const SafeTrophy: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <SafeIcon name="Trophy" {...props} />;

export const SafeAward: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <SafeIcon name="Award" {...props} />;

export const SafeChartLine: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <SafeIcon name="ChartLine" {...props} />;

export const SafeChart: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <SafeIcon name="ChartBar" {...props} />;

export const SafeUsers: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <SafeIcon name="Users" {...props} />;

// Also create specific components for the problematic icons
export const Trophy: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <SafeIcon name="Trophy" {...props} />;

export const Award: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <SafeIcon name="Award" {...props} />;

export const ChartLine: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <SafeIcon name="ChartLine" {...props} />;

export const ChartBar: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <SafeIcon name="ChartBar" {...props} />;

export const Users: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <SafeIcon name="Users" {...props} />;

export { SafeIcon };
export default SafeIcon;