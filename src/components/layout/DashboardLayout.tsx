import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Baby,
  ClipboardList,
  Utensils,
  Heart,
  Building,
  BarChart3,
  ChevronRight,
  School,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const teacherNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/teacher', icon: Home },
  { label: 'My Classroom', href: '/teacher/classroom', icon: GraduationCap },
  { label: 'Activity Logs', href: '/teacher/activity-logs', icon: ClipboardList },
  { label: 'Meal Tracking', href: '/teacher/meals', icon: Utensils },
  { label: 'Wellbeing Reports', href: '/teacher/wellbeing', icon: Heart },
  { label: 'Announcements', href: '/teacher/announcements', icon: Bell },
  { label: 'Messages', href: '/teacher/messages', icon: MessageSquare },
  { label: 'Documents', href: '/teacher/documents', icon: FileText },
];

const parentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/parent', icon: Home },
  { label: 'Activity Feed', href: '/parent/activities', icon: ClipboardList },
  { label: 'Meal History', href: '/parent/meals', icon: Utensils },
  { label: 'Wellbeing Reports', href: '/parent/wellbeing', icon: Heart },
  { label: 'Documents', href: '/parent/documents', icon: FileText },
  { label: 'Messages', href: '/parent/messages', icon: MessageSquare },
  { label: 'Announcements', href: '/parent/announcements', icon: Bell },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Classrooms', href: '/admin/classrooms', icon: Building },
  { label: 'Students', href: '/admin/students', icon: Baby },
  { label: 'Parents', href: '/admin/parents', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'admin' ? adminNavItems : role === 'teacher' ? teacherNavItems : parentNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'admin':
        return 'role-admin';
      case 'teacher':
        return 'role-teacher';
      case 'parent':
        return 'role-parent';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label='open sidebar'
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center border-2 border-slate-600">
            <School className="h-5 w-5 text-primary-foreground" />
          </div>
          <img className="text-foreground" src="/logo.PNG" alt="ComPo" width="125px" height="auto" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user ? getInitials(user.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl p-1 bg-primary flex items-center justify-center shadow-glow border-2 border-slate-600">
                <School className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <img className="text-foreground" src="/logo.PNG" alt="ComPo" width="60%" height="auto" />
                <p className="text-sm text-muted-foreground">Daycare Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-muted rounded"
              aria-label='Close sidebar'
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn('sidebar-item', isActive && 'sidebar-item-active')}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getInitials(user.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.full_name}</p>
                <span className={cn('status-badge text-xs', getRoleBadgeClass())}>
                  {role?.charAt(0).toUpperCase()}{role?.slice(1)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-4">{children}</div>
      </main>
    </div>
  );
};
