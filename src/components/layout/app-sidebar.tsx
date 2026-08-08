'use client';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsUpDown, User, CreditCard, Bell, LogOut, LayoutDashboard, FileText, Settings, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Invoices', url: '/invoices', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className="flex items-center pt-4 pb-2 group-data-[collapsible=icon]:pt-4">
        <Link href="/" className="flex items-center gap-2 px-2 overflow-hidden hover:opacity-80 transition-opacity">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg overflow-hidden bg-white border border-border/50 p-1">
            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-primary truncate">Ledger of Sumer</span>
            <span className="text-xs text-muted-foreground truncate">Royal Scribes</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-sidebar-accent transition-colors"
              >
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  T
                </div>
                <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden min-w-0 flex-1">
                  <span className="font-medium text-sm whitespace-nowrap">Team Temp__01</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute bottom-full left-0 mb-2 w-64 z-50 rounded-xl border border-border bg-popover p-1 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {/* Profile Header */}
                    <div className="flex items-center gap-3 px-3 py-3 border-b border-border/50">
                      <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                        T
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">Team Temp__01</p>
                        <p className="text-xs text-muted-foreground truncate">admin@royalsovereign.com</p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Profile
                      </Link>
                      <button
                        onClick={() => { setProfileOpen(false); toast.info('Billing is coming soon.'); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        Billing
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); toast.info('No new notifications.'); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        Notifications
                      </button>
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        Help & Support
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-border/50 pt-1">
                      <button
                        onClick={() => { setProfileOpen(false); toast.success('Signed out successfully.'); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
