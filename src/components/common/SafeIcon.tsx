import React from 'react';
import { 
  Medal,
  Star,
  Crown,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  ChartBarHorizontal,
  ChartLine,
  Trophy,
  Award,
  House,
  FileText,
  Brain,
  Users,
  Gear as Settings,
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
  Coffee,
  Drop,
  Bell,
  BellRinging,
  Cpu,
  PlusCircle,
  MagnifyingGlass,
  Question,
  Robot,
  Target,
  Lightbulb,
  Network,
  CircuitBoard,
  Desktop,
  Warning,
  ClockCounterClockwise,
  Timer,
  CloudArrowDown,
  ShareNetwork,
  UserCircle,
  Graph,
  PaintBrush,
  Nut,
  ColorFilter,
  Sun,
  Moon,
  Atom
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
  chartline: ChartLine,
  'chart-line': ChartLine,
  chartlineup: ChartLine,
  'chart-line-up': ChartLine,
  chartbarhorizontal: ChartBarHorizontal,
  'chart-bar-horizontal': ChartBarHorizontal,
  trending: TrendingUp,
  trendingup: TrendingUp,
  'trending-up': TrendingUp,
  trendingdown: Question,
  'trending-down': Question,
  chart: ChartLine,
  barchart3: ChartBarHorizontal,
  'bar-chart-3': ChartBarHorizontal,
  barchart: ChartBarHorizontal,
  'bar-chart': ChartBarHorizontal,
  linechart: ChartLine,
  'line-chart': ChartLine,
  piechart: ChartBarHorizontal,
  'pie-chart': ChartBarHorizontal,
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
  userx: Question,
  'user-x': Question,
  settings: Settings,
  config: Settings,
  cog: Settings,
  sparkles: Sparkles,
  magic: Sparkles,
  eye: Eye,
  view: Eye,
  eyeoff: Question,
  'eye-off': Question,
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
  menu: Question,
  
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
  smile: Smiley,
  frown: Question,
  meh: Question,
  
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
  flaskconical: TestTube,
  'flask-conical': TestTube,
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
  music: Question,
  volume: Question,
  volume2: Question,
  volumehigh: Question,
  'volume-high': Question,
  volumelow: Question,
  'volume-low': Question,
  volumex: Question,
  'volume-x': Question,
  
  // Trends and analytics
  trendup: TrendingUp,
  'trend-up': TrendingUp,
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
  memorystick: Question,
  'memory-stick': Question,
  memory: Question,
  
  // UI Actions - Using Question as fallback for missing icons
  edit: Question,
  edit3: Question,
  logout: Question,
  'log-out': Question,
  mail: Question,
  email: Question,
  trash2: Question,
  'trash-2': Question,
  delete: Question,
  ban: Question,
  morevertical: Question,
  'more-vertical': Question,
  more: Question,
  
  // Layout & Design
  alignjustify: Question,
  'align-justify': Question,
  contrast: Question,
  sunset: Question,
  sunrise: Question,
  grid3x3: Question,
  'grid-3x3': Question,
  grid: Question,
  move: Question,
  layers: Question,
  
  // Devices
  smartphone: Question,
  tablet: Question,
  
  // Network
  wifi: Question,
  wifioff: Question,
  'wifi-off': Question,
  clouddownload: Question,
  'cloud-download': Question,
  
  // Text Editing
  bold: Question,
  italic: Question,
  underline: Question,
  type: Question,
  
  // Actions
  save: Question,
  refresh: Question,
  refreshcw: Question,
  'refresh-cw': Question,
  refreshccw: Question,
  'refresh-ccw': Question,
  rotateccw: Question,
  'rotate-ccw': Question,
  send: Question,
  unlock: Question,
  
  // UI Elements
  chevrondown: Question,
  'chevron-down': Question,
  chevronup: Question,
  'chevron-up': Question,
  externallink: Question,
  'external-link': Question,
  filter: Question,
  
  // Communication
  messagesquare: Question,
  'message-square': Question,
  share2: Question,
  'share-2': Question,
  mousepointer: Question,
  'mouse-pointer': Question,
  alertcircle: AlertTriangle,
  'alert-circle': AlertTriangle,
  
  // Fallback
  question: Question,
  fallback: Question,
  default: Question
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
  fallback = Question 
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