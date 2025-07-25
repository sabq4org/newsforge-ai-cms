import React from 'react';
import { 
  Medal,
  Star,
  Trophy,
  Award,
  Crown,
  CheckCircle,
  AlertTriangle
} from '@phosphor-icons/react';

// Safe icon mapping to prevent runtime errors
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  medal: Medal,
  star: Star,
  trophy: Trophy,
  award: Award,
  crown: Crown,
  check: CheckCircle,
  alert: AlertTriangle
};

interface SafeIconProps {
  name: string;
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
  size = 16, 
  className = '', 
  fallback = Medal 
}: SafeIconProps) {
  const IconComponent = ICON_MAP[name.toLowerCase()] || fallback;
  
  try {
    return <IconComponent size={size} className={className} />;
  } catch (error) {
    console.warn(`SafeIcon: Error rendering icon "${name}", using fallback:`, error);
    const FallbackIcon = fallback;
    return <FallbackIcon size={size} className={className} />;
  }
}

export default SafeIcon;