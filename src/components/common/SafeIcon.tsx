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
  MagnifyingGlass,
  // Additional missing icons from error logs
  Menu,
  ChartLine,
  Filter,
  Edit3,
  Edit,
  LogOut,
  UserX,
  Search,
  Mail,
  Trash2,
  Ban,
  MoreVertical,
  Smartphone,
  TrendingDown,
  LineChart,
  PieChart,
  Cog,
  CloudDownload,
  AlignJustify,
  Contrast,
  Sunset,
  Music,
  Grid3X3,
  Move,
  VolumeHigh,
  Grid,
  VolumeLow,
  VolumeX,
  Tablet,
  Layers,
  Frown,
  Smile,
  Meh,
  Refresh,
  Volume2,
  EyeOff,
  Tags,
  BarChart,
  Send,
  Volume,
  FlaskConical,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bold,
  Italic,
  Underline,
  MessageSquare,
  Share2,
  MousePointer,
  AlertCircle,
  Type,
  RotateCcw,
  Save,
  RefreshCw,
  Sunrise,
  Wifi,
  WifiOff,
  Unlock,
  Question // Fallback icon for missing ones
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
  chartline: ChartLine || ChartBarHorizontal,
  'chart-line': ChartLine || ChartBarHorizontal,
  chartlineup: ChartLine || ChartBarHorizontal,
  'chart-line-up': ChartLine || ChartBarHorizontal,
  chartbarhorizontal: ChartBarHorizontal,
  'chart-bar-horizontal': ChartBarHorizontal,
  trending: TrendingUp,
  trendingup: TrendingUp,
  'trending-up': TrendingUp,
  trendingdown: TrendingDown,
  'trending-down': TrendingDown,
  chart: BarChart3,
  barchart3: BarChart3,
  'bar-chart-3': BarChart3,
  barchart: BarChart,
  'bar-chart': BarChart,
  linechart: LineChart,
  'line-chart': LineChart,
  piechart: PieChart,
  'pie-chart': PieChart,
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
  userx: UserX,
  'user-x': UserX,
  settings: Settings,
  config: Settings,
  cog: Cog,
  sparkles: Sparkles,
  magic: Sparkles,
  eye: Eye,
  view: Eye,
  eyeoff: EyeOff,
  'eye-off': EyeOff,
  calendar: Calendar,
  schedule: Calendar,
  pluscircle: PlusCircle,
  'plus-circle': PlusCircle,
  plus: PlusCircle,
  add: PlusCircle,
  create: PlusCircle,
  magnifyingglass: MagnifyingGlass,
  'magnifying-glass': MagnifyingGlass,
  search: Search || MagnifyingGlass,
  menu: Menu,
  
  // Content icons
  folderopen: FolderOpen,
  'folder-open': FolderOpen,
  folder: FolderOpen,
  tag: Tag,
  tags: Tags || Tag,
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
  smile: Smile,
  frown: Frown,
  meh: Meh,
  
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
  flaskconical: FlaskConical,
  'flask-conical': FlaskConical,
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
  music: Music,
  volume: Volume,
  volume2: Volume2,
  volumehigh: VolumeHigh,
  'volume-high': VolumeHigh,
  volumelow: VolumeLow,
  'volume-low': VolumeLow,
  volumex: VolumeX,
  'volume-x': VolumeX,
  
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
  
  // UI Actions
  edit: Edit,
  edit3: Edit3,
  logout: LogOut,
  'log-out': LogOut,
  mail: Mail,
  email: Mail,
  trash2: Trash2,
  'trash-2': Trash2,
  delete: Trash2,
  ban: Ban,
  morevertical: MoreVertical,
  'more-vertical': MoreVertical,
  more: MoreVertical,
  
  // Layout & Design
  alignjustify: AlignJustify,
  'align-justify': AlignJustify,
  contrast: Contrast,
  sunset: Sunset,
  sunrise: Sunrise,
  grid3x3: Grid3X3,
  'grid-3x3': Grid3X3,
  grid: Grid,
  move: Move,
  layers: Layers,
  
  // Devices
  smartphone: Smartphone,
  tablet: Tablet,
  
  // Network
  wifi: Wifi,
  wifioff: WifiOff,
  'wifi-off': WifiOff,
  clouddownload: CloudDownload,
  'cloud-download': CloudDownload,
  
  // Text Editing
  bold: Bold,
  italic: Italic,
  underline: Underline,
  type: Type,
  
  // Actions
  save: Save,
  refresh: Refresh,
  refreshcw: RefreshCw,
  'refresh-cw': RefreshCw,
  refreshccw: RefreshCcw,
  'refresh-ccw': RefreshCcw,
  rotateccw: RotateCcw,
  'rotate-ccw': RotateCcw,
  send: Send,
  unlock: Unlock,
  
  // UI Elements
  chevrondown: ChevronDown,
  'chevron-down': ChevronDown,
  chevronup: ChevronUp,
  'chevron-up': ChevronUp,
  externallink: ExternalLink,
  'external-link': ExternalLink,
  filter: Filter,
  
  // Communication
  messagesquare: MessageSquare,
  'message-square': MessageSquare,
  share2: Share2,
  'share-2': Share2,
  mousepointer: MousePointer,
  'mouse-pointer': MousePointer,
  alertcircle: AlertCircle,
  'alert-circle': AlertCircle,
  
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