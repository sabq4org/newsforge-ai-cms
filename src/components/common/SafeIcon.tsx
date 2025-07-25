import React from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';

// Safe icon component that provides fallbacks for missing icons
interface SafeIconProps {
  name: string;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}

const SafeIcon: React.FC<SafeIconProps> = ({ 
  name, 
  size = 20, 
  weight = 'regular', 
  className = '' 
}) => {
  try {
    // Get the icon component from PhosphorIcons
    const IconComponent = (PhosphorIcons as any)[name];
    
    if (IconComponent && typeof IconComponent === 'function') {
      return <IconComponent size={size} weight={weight} className={className} />;
    }
    
    // Fallback for missing icons
    console.warn(`SafeIcon: Icon "${name}" not found, using fallback`);
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
  'Award': 'Medal',
  'ChartLine': 'ChartLine',
  'Chart': 'ChartBar',
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
  <EnhancedSafeIcon name="Trophy" {...props} />;

export const SafeAward: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <EnhancedSafeIcon name="Award" {...props} />;

export const SafeChartLine: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <EnhancedSafeIcon name="ChartLine" {...props} />;

export const SafeChart: React.FC<Omit<SafeIconProps, 'name'>> = (props) => 
  <EnhancedSafeIcon name="ChartBar" {...props} />;

export { SafeIcon };
export default SafeIcon;