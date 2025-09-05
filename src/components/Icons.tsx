import {
  Calculator,
  DollarSign,
  Calendar,
  Home,
  TrendingUp,
  ChartLine,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Save,
  Printer,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  RefreshCw,
  FileText,
  CreditCard,
  Building,
  Table,
  Eye,
  EyeOff,
  Download,
  Star,
  GitBranch,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  TrendingDown,
  PlusCircle,
  MinusCircle,
  Heart,
  Target,
  Zap,
  Sun,
  Moon,
  Monitor,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  Play,
  Pause,
  BarChart,
  PieChart,
  Activity,
  Briefcase,
  Globe,
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Edit,
  Edit2,
  Trash,
  Trash2,
  Copy,
  Share,
  Share2,
  Link,
  Bookmark,
  Flag,
  Tag,
  Clock,
  Timer,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type IconName =
  | "calculator"
  | "dollar"
  | "dollar-sign"
  | "calendar"
  | "home"
  | "trending-up"
  | "trending-down"
  | "chart"
  | "alert"
  | "check"
  | "check-circle"
  | "x-circle"
  | "info"
  | "save"
  | "print"
  | "bar-chart"
  | "pie-chart"
  | "activity"
  | "users"
  | "settings"
  | "logout"
  | "menu"
  | "x"
  | "chevron-right"
  | "chevron-down"
  | "chevron-up"
  | "plus"
  | "plus-circle"
  | "minus"
  | "minus-circle"
  | "refresh"
  | "file-text"
  | "credit-card"
  | "building"
  | "table"
  | "eye"
  | "eye-off"
  | "download"
  | "star"
  | "git-branch"
  | "arrow-down"
  | "arrow-right"
  | "arrow-left"
  | "more-horizontal"
  | "heart"
  | "target"
  | "zap"
  | "sun"
  | "moon"
  | "monitor"
  | "book"
  | "book-open"
  | "help"
  | "help-circle"
  | "question"
  | "support"
  | "message"
  | "phone"
  | "mail"
  | "external-link"
  | "play"
  | "pause"
  | "briefcase"
  | "globe"
  | "shield"
  | "lock"
  | "unlock"
  | "key"
  | "database"
  | "server"
  | "cloud"
  | "wifi"
  | "wifi-off"
  | "search"
  | "filter"
  | "sort-asc"
  | "sort-desc"
  | "edit"
  | "edit-2"
  | "trash"
  | "trash-2"
  | "copy"
  | "share"
  | "share-2"
  | "link"
  | "bookmark"
  | "flag"
  | "tag"
  | "clock"
  | "timer"
  | "stopwatch"
  | "compare"
  | "dashboard"
  | "user"
  | "login";

const iconMap: Record<IconName, LucideIcon> = {
  calculator: Calculator,
  dollar: DollarSign,
  "dollar-sign": DollarSign,
  calendar: Calendar,
  home: Home,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  chart: ChartLine,
  alert: AlertCircle,
  check: CheckCircle,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
  info: Info,
  save: Save,
  print: Printer,
  "bar-chart": BarChart3,
  "pie-chart": PieChart,
  activity: Activity,
  users: Users,
  settings: Settings,
  logout: LogOut,
  menu: Menu,
  x: X,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  plus: Plus,
  "plus-circle": PlusCircle,
  minus: Minus,
  "minus-circle": MinusCircle,
  refresh: RefreshCw,
  "file-text": FileText,
  "credit-card": CreditCard,
  building: Building,
  table: Table,
  eye: Eye,
  "eye-off": EyeOff,
  download: Download,
  star: Star,
  "git-branch": GitBranch,
  "arrow-down": ArrowDown,
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  "more-horizontal": MoreHorizontal,
  heart: Heart,
  target: Target,
  zap: Zap,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  book: BookOpen,
  "book-open": BookOpen,
  help: HelpCircle,
  "help-circle": HelpCircle,
  question: HelpCircle,
  support: MessageCircle,
  message: MessageCircle,
  phone: Phone,
  mail: Mail,
  "external-link": ExternalLink,
  play: Play,
  pause: Pause,
  briefcase: Briefcase,
  globe: Globe,
  shield: Shield,
  lock: Lock,
  unlock: Unlock,
  key: Key,
  database: Database,
  server: Server,
  cloud: Cloud,
  wifi: Wifi,
  "wifi-off": WifiOff,
  search: Search,
  filter: Filter,
  "sort-asc": SortAsc,
  "sort-desc": SortDesc,
  edit: Edit,
  "edit-2": Edit2,
  trash: Trash,
  "trash-2": Trash2,
  copy: Copy,
  share: Share,
  "share-2": Share2,
  link: Link,
  bookmark: Bookmark,
  flag: Flag,
  tag: Tag,
  clock: Clock,
  timer: Timer,
  stopwatch: Timer, // Use Timer as fallback for Stopwatch
  compare: BarChart,
  dashboard: BarChart3,
  user: Users,
  login: LogOut,
};

export interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?:
    | "default"
    | "muted"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error";
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

// Semantic color variants using CSS custom properties for Tailwind v4
const variantClasses = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
};

export function Icon({
  name,
  size = "md",
  variant = "default",
  className,
  ...props
}: IconProps) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        "transition-colors duration-200", // Smooth color transitions
        className,
      )}
      {...props}
    />
  );
}

// Export specific icons for direct use
export {
  Calculator as CalculatorIcon,
  DollarSign as DollarIcon,
  Calendar as CalendarIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  ChartLine as ChartIcon,
  AlertCircle as AlertIcon,
  CheckCircle as CheckIcon,
  XCircle as XCircleIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Printer as PrintIcon,
  BarChart3 as BarChartIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  X as XIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  RefreshCw as RefreshIcon,
  FileText as FileTextIcon,
  BookOpen as BookIcon,
  HelpCircle as HelpIcon,
  MessageCircle as SupportIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  ExternalLink as ExternalLinkIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Shield as ShieldIcon,
  Globe as GlobeIcon,
  Database as DatabaseIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Copy as CopyIcon,
  Share as ShareIcon,
  Link as LinkIcon,
  Clock as ClockIcon,
};
