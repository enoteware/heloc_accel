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
  | "target";

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
};

export interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

export function Icon({ name, size = "md", className, ...props }: IconProps) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent className={cn(sizeClasses[size], className)} {...props} />
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
};
