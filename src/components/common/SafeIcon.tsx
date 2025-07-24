import { ComponentType } from 'react';
import { Question } from '@phosphor-icons/react';

interface SafeIconProps {
  icon: ComponentType<any> | undefined;
  fallback?: ComponentType<any>;
  className?: string;
  [key: string]: any;
}

export function SafeIcon({ 
  icon: Icon, 
  fallback: Fallback = Question, 
  className = "h-4 w-4",
  ...props 
}: SafeIconProps) {
  const IconComponent = Icon || Fallback;
  
  try {
    return <IconComponent className={className} {...props} />;
  } catch (error) {
    console.warn('SafeIcon: Error rendering icon, using fallback:', error);
    return <Fallback className={className} {...props} />;
  }
}