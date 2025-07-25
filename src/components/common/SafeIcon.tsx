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
  ChartBarHorizontal,
  Trophy,
  Award,
  House,
  FileText,
  Brain,
  Users,
  Settings,
  Sparkles,
  Eye,
  Calendar,
  FolderOpen,
  Tag,
  Images,
  Shield,
  Globe,
  Heart,
  Smiley,
  Code,
  Package,
  BookOpen,
  Palette,
  Play,
  PlayCircle,
  TestTube,
  GitMerge,
  Wrench,
  Microphone,
  FileAudio,
  TrendUp,
  Coffee,
  Drop,
  Bell,
  BellRinging,
  Cpu,
  MemoryStick,
  PlusCircle,
  MagnifyingGlass
} from '@phosphor-icons/react';
import { safeToLowerCase } from '@/lib/utils';

// Safe icon mapping to prevent runtime errors
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  // Common icons
  medal: Medal,
  star: Star,
  trophy: Trophy,
  award: Award,
  crown: Crown,
  check: CheckCircle,
  alert: AlertTriangle,
  
  // Chart icons
  chartline: ChartBarHorizontal,
  'chart-line': ChartBarHorizontal,
  chartlineup: ChartBarHorizontal,
  'chart-line-up': ChartBarHorizontal,
  chartbarhorizontal: ChartBarHorizontal,
  'chart-bar-horizontal': ChartBarHorizontal,
  trending: TrendingUp,
  chart: BarChart3,
  activity: Activity,
  
  // Navigation icons
  house: House,
  home: House,
  dashboard: House,
  filetext: FileText,
  'file-text': FileText,
  articles: FileText,
  brain: Brain,
  ai: Brain,
  users: Users,
  user: Users,
  settings: Settings,
  config: Settings,
  sparkles: Sparkles,
  magic: Sparkles,
  eye: Eye,
  view: Eye,
  calendar: Calendar,
  schedule: Calendar,
  pluscircle: PlusCircle,
  'plus-circle': PlusCircle,
  plus: PlusCircle,
  add: PlusCircle,
  create: PlusCircle,
  magnifyingglass: MagnifyingGlass,
  'magnifying-glass': MagnifyingGlass,
  search: MagnifyingGlass,
  
  // Content icons
  folderopen: FolderOpen,
  'folder-open': FolderOpen,
  folder: FolderOpen,
  tag: Tag,
  tags: Tag,
  images: Images,
  media: Images,
  shield: Shield,
  moderation: Shield,
  globe: Globe,
  world: Globe,
  heart: Heart,
  sentiment: Heart,
  smiley: Smiley,
  emoji: Smiley,
  
  // Technical icons
  code: Code,
  debug: Code,
  package: Package,
  export: Package,
  bookopen: BookOpen,
  'book-open': BookOpen,
  book: BookOpen,
  palette: Palette,
  theme: Palette,
  color: Palette,
  play: Play,
  demo: Play,
  playcircle: PlayCircle,
  'play-circle': PlayCircle,
  
  // Testing and collaboration
  testtube: TestTube,
  'test-tube': TestTube,
  testing: TestTube,
  gitmerge: GitMerge,
  'git-merge': GitMerge,
  collaboration: GitMerge,
  wrench: Wrench,
  maintenance: Wrench,
  
  // Audio and media
  microphone: Microphone,
  audio: Microphone,
  fileaudio: FileAudio,
  'file-audio': FileAudio,
  podcast: FileAudio,
  
  // Trends and analytics
  trendup: TrendUp,
  'trend-up': TrendUp,
  coffee: Coffee,
  dose: Drop,
  drop: Drop,
  
  // Notifications
  bell: Bell,
  notification: Bell,
  bellringing: BellRinging,
  'bell-ringing': BellRinging,
  alerts: BellRinging,
  
  // System
  cpu: Cpu,
  processor: Cpu,
  memorystick: MemoryStick,
  'memory-stick': MemoryStick,
  memory: MemoryStick,
  
  // Fallback
  fallback: Medal,
  default: Medal
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
  // Handle direct icon component first with better validation
  if (icon) {
    // Check if it's a valid React component function
    if (typeof icon === 'function') {
      try {
        const IconComponent = icon;
        return <IconComponent size={size} className={className} />;
      } catch (error) {
        console.warn(`SafeIcon: Error rendering direct icon component, using fallback:`, error);
        const FallbackIcon = fallback;
        return <FallbackIcon size={size} className={className} />;
      }
    } else {
      // Invalid icon type provided
      console.warn(`SafeIcon: Invalid icon type provided:`, typeof icon, icon);
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
  
  // No valid icon provided, use fallback with console warning
  console.warn('SafeIcon: No valid icon provided, using fallback');
  const FallbackIcon = fallback;
  return <FallbackIcon size={size} className={className} />;
}

export default SafeIcon;