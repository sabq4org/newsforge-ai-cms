import React from 'react';
import { 
  Medal,
  Star,
  Crown,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Activity,
  ChartLineUp
} from '@phosphor-icons/react';
import { safeToLowerCase } from '@/lib/utils';

// Safe icon mapping to prevent runtime errors
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  medal: Medal,
  star: Star,
  trophy: Medal, // Use Medal instead of Trophy to fix runtime error
  award: Medal, // Use Medal instead of Award to fix runtime error
  crown: Crown,
  check: CheckCircle,
  alert: AlertTriangle,
  chartline: ChartLineUp, // Add ChartLine mapping
  'chart-line': ChartLineUp,
  chartlineup: ChartLineUp,
  trending: TrendingUp,
  chart: BarChart3,
  activity: Activity,
  fallback: Medal
};

interface SafeIconProps {
  name?: string;
  icon?: React.ComponentType<any>; // Direct icon component
  size?: number;
  className?: string;
  fallback?: React.ComponentType<any>;
}

/**
 * SafeIcon component that safely renders icons with fallback
 * Prevents runtime errors from missing icon imports
 */
export function SafeIcon({ 
  name, 
  icon,
  size = 16, 
  className = '', 
  fallback = Medal 
}: SafeIconProps) {
  // Handle direct icon component first
  if (icon && typeof icon === 'function') {
    try {
      const IconComponent = icon;
      return <IconComponent size={size} className={className} />;
    } catch (error) {
      console.warn(`SafeIcon: Error rendering direct icon component, using fallback:`, error);
      const FallbackIcon = fallback;
      return <FallbackIcon size={size} className={className} />;
    }
  }
  
  // Handle named icon with safe checking
  if (name && typeof name === 'string') {
    try {
      const safeName = safeToLowerCase(name);
      const IconComponent = ICON_MAP[safeName] || fallback;
      return <IconComponent size={size} className={className} />;
    } catch (error) {
      console.warn(`SafeIcon: Error rendering named icon "${name}", using fallback:`, error);
      const FallbackIcon = fallback;
      return <FallbackIcon size={size} className={className} />;
    }
  }
  
  // No valid icon provided, use fallback (reduce console noise)
  const FallbackIcon = fallback;
  return <FallbackIcon size={size} className={className} />;
}

export default SafeIcon;