'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  UserSquare2,
  Globe2,
  ChevronRight,
  LogOut,
  User,
  Settings,
  ChevronsUpDown,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getSiteLogoAction } from '@/actions/settings'
import { motion } from 'framer-motion'
import { useLayout } from '@/context/LayoutContext'
import { useTheme } from '@/context/ThemeContext'
import { useAdminSettings } from '@/context/AdminSettingsContext'
import { translateSystemLabel } from '@/lib/translations'
import { translateRole } from '@/lib/i18n-utils'

function AdminSidebarSkeleton() {
  return (
    <Sidebar collapsible='icon' className="transition-colors duration-300 bg-card border-border border-r animate-pulse">
      <SidebarHeader className="h-[84px] flex flex-col justify-center transition-all border-b group-data-[collapsible=icon]:px-0 px-6 bg-card border-border">
        <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </SidebarHeader>
      <SidebarContent className='py-4 px-4 space-y-4'>
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border bg-card">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminSidebar({ currentUser, variant: variantProp }: { currentUser?: any, variant?: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, state } = useSidebar()
  const { variant: contextVariant } = useLayout()
  const { resolvedTheme } = useTheme()
  const { t, language } = useAdminSettings()
  const [siteLogo, setSiteLogo] = useState<string | null>(null)

  const variant = variantProp || contextVariant

  // 🚀 Temporary debug logs
  console.log("SIDEBAR_ROLE", currentUser?.role);

  // 🚀 Do not render menu if user is not loaded
  const role = currentUser?.role?.toUpperCase() || 'ADMIN'

  useEffect(() => {
    getSiteLogoAction().then((logo) => setSiteLogo(logo))
  }, [])

  const menuItems = useMemo(() => {
    if (!currentUser) return [];
    const items = [
      {
        key: 'dashboard',
        title: translateSystemLabel('dashboard', language),
        url: '/admin',
        icon: LayoutDashboard,
        roles: ['ADMIN', 'GIAM_DOC'],
      },
      {
        key: 'website',
        title: translateSystemLabel('website', language),
        icon: Globe2,
        items: [
          { title: t.sidebar.websiteHome, url: '/admin/cms/homepage' },
          { title: t.sidebar.websiteAbout, url: '/admin/cms/about' },
          { title: t.sidebar.websiteServices, url: '/admin/cms/services' },
          { title: t.sidebar.websiteArticles, url: '/admin/cms/articles' },
          { title: t.sidebar.websiteContact, url: '/admin/cms/contact' },
          { title: 'Ảnh website', url: '/admin/cms/images' },
        ],
      },
      {
        key: 'inquiries',
        title: 'Liên hệ & Cuộc gọi',
        icon: UserSquare2,
        url: '/admin/cms/inquiries',
      },
      {
        key: 'monitoring',
        title: 'Giám sát hệ thống',
        icon: Activity,
        url: '/admin/monitoring',
      },
    ];

    return items;
  }, [currentUser, role, language, t])

  const isDark = resolvedTheme === 'dark'

  if (!currentUser) {
    return <AdminSidebarSkeleton />;
  }

  const renderMenuItem = (item: any, isSystemAdmin = false) => {
    const isActive = isSystemAdmin 
      ? (pathname === '/admin/system' || pathname.startsWith('/admin/system'))
      : (item.url ? pathname === item.url : item.items?.some((sub: any) => pathname === sub.url || pathname.startsWith(sub.url + '/')));
      
    if (!item.items) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton 
            asChild 
            isActive={isActive} 
            tooltip={item.title}
            className={cn(
              'transition-all relative overflow-hidden',
              isMobile ? 'h-11 rounded-xl' : 'h-10 rounded-lg group-data-[collapsible=icon]:rounded-xl',
              isActive && isMobile ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold border-l-4 border-red-600' : '',
              isActive && !isMobile ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold' : '',
              !isActive ? 'bg-white/0 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-950 dark:hover:text-white font-medium' : ''
            )}
          >
            <Link href={item.url || '#'}>
              {isActive && !isMobile && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#A91D1D] rounded-full" />
              )}
              {item.icon && <item.icon className={cn('size-4 shrink-0', isActive ? 'text-[#A91D1D]' : 'text-slate-400')} />}
              <span className='text-[13px] group-data-[collapsible=icon]:hidden'>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    }

    if (state === 'collapsed') {
      return (
        <SidebarMenuItem key={item.title}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton 
                tooltip={item.title}
                className={cn(
                  'transition-all relative overflow-hidden',
                  isMobile ? 'h-11 rounded-xl' : 'h-10 rounded-lg group-data-[collapsible=icon]:rounded-xl',
                  isActive && isMobile ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold border-l-4 border-red-600' : '',
                  isActive && !isMobile ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold' : '',
                  !isActive ? 'bg-white/0 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-950 dark:hover:text-white font-medium' : ''
                )}
              >
                {isActive && !isMobile && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#A91D1D] rounded-full" />
                )}
                {item.icon && <item.icon className={cn('size-4 shrink-0', isActive ? 'text-[#A91D1D]' : 'text-slate-400')} />}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={12}
              className="w-48 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-md p-1 z-[100]"
            >
              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {item.title}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              {item.items.map((subItem: any) => {
                const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + '/')
                return (
                  <DropdownMenuItem key={subItem.title} asChild>
                    <Link 
                      href={subItem.url}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors cursor-pointer outline-none",
                        isSubActive 
                          ? "bg-slate-50 dark:bg-slate-800 text-[#A91D1D] font-bold" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-white"
                      )}
                    >
                      {subItem.title}
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      )
    }

    return (
      <Collapsible key={item.title} asChild defaultOpen={false} className='group/collapsible'>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton 
              tooltip={item.title}
              className={cn(
                'transition-all relative overflow-hidden',
                isMobile ? 'h-11 rounded-xl' : 'h-10 rounded-lg group-data-[collapsible=icon]:rounded-xl',
                isActive && isMobile ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold border-l-4 border-red-600' : '',
                isActive && !isMobile ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold' : '',
                !isActive ? 'bg-white/0 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-950 dark:hover:text-white font-medium' : ''
              )}
            >
              {isActive && !isMobile && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#A91D1D] rounded-full" />
              )}
              {item.icon && <item.icon className={cn('size-4 shrink-0', isActive ? 'text-[#A91D1D]' : 'text-slate-400')} />}
              <span className='text-[13px] group-data-[collapsible=icon]:hidden'>{item.title}</span>
              <ChevronRight className='ms-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden' />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="mx-4 border-l ml-6 pl-2 mt-1 space-y-0.5 group-data-[collapsible=icon]:hidden border-border">
              {item.items.map((subItem: any) => {
                const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + '/')
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton 
                      asChild 
                      isActive={isSubActive}
                      className={cn(
                        'h-7 px-2.5 rounded-md transition-all relative overflow-hidden',
                        isSubActive 
                          ? 'text-slate-950 dark:text-white font-semibold bg-slate-50 dark:bg-slate-800/50' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                      )}
                    >
                      <Link href={subItem.url}>
                        {isSubActive && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#A91D1D] rounded-full" />
                        )}
                        <span className='text-[12px]'>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  };

  return (
    <Sidebar 
      collapsible='icon' 
      variant={variant as any} 
      className={cn("transition-colors duration-300 border-r", isMobile ? "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" : "bg-card border-border")}
    >
      <SidebarHeader className={cn("shrink-0 h-[84px] flex flex-col justify-center transition-all border-b group-data-[collapsible=icon]:px-0 px-3", isMobile ? "bg-transparent border-slate-200 dark:border-slate-800" : "bg-card border-border")}>
        <Link href='/admin' className='flex items-center gap-2 group overflow-visible transition-all group-data-[collapsible=icon]:justify-center'>
          <div className='relative shrink-0 flex items-center justify-center group-data-[collapsible=icon]:px-0 px-1'>
            <img 
              src={state === 'collapsed' && !isMobile ? '/logo-icon.png' : (siteLogo || '/images/site-logo-maintech.png')} 
              alt='Logo' 
              onError={(e) => {
                if (e.currentTarget.src.includes('logo-icon.png')) {
                  e.currentTarget.src = siteLogo || '/images/site-logo-maintech.png';
                }
              }}
              className='object-contain group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 h-11 w-11' 
            />
          </div>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className='flex flex-col leading-none min-w-0 group-data-[collapsible=icon]:hidden'
          >
            <div className='font-black text-[15px] tracking-tight flex items-baseline select-none uppercase whitespace-nowrap'>
              <span className="text-red-600 drop-shadow-md">MAIN</span>
              <span className="text-[#00A3FF]">TECH</span>
              <span className="ml-1 font-black text-foreground">VIETNAM</span>
            </div>
            <span className="text-[6.5px] font-black uppercase tracking-[0.28em] mt-1 block text-left text-muted-foreground whitespace-nowrap">
              INDUSTRIAL EXCELLENCE
            </span>
          </motion.div>
        </Link>
      </SidebarHeader>

      <SidebarContent className='py-4'>
        <SidebarGroup>
          <SidebarGroupLabel className='px-4 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2 group-data-[collapsible=icon]:hidden'>
            {t.common.mainMenu}
          </SidebarGroupLabel>
          <SidebarMenu className='gap-1 group-data-[collapsible=icon]:px-0 px-2'>
            {menuItems.map((item) => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className={cn(
                    'w-full transition-all rounded-xl p-2 group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto',
                    'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50',
                    'data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 focus:ring-0 focus-visible:ring-0 outline-none ring-0'
                  )}
                >
                  <Avatar className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-800 shrink-0 shadow-none">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} className="object-cover rounded-full" />
                    <AvatarFallback className="font-bold rounded-full text-xs bg-slate-50 text-slate-400">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight overflow-hidden group-data-[collapsible=icon]:hidden'>
                    <span className="truncate font-bold text-foreground">{currentUser?.name || 'Admin'}</span>
                    <span className='truncate text-[10px] font-medium text-muted-foreground uppercase tracking-tight'>{translateRole(currentUser?.role, t)}</span>
                  </div>
                  <ChevronsUpDown className='ms-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-56 rounded-xl'
                side={isMobile ? 'bottom' : 'right'}
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <Avatar className='h-8 w-8 rounded-full'>
                      <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} className="object-cover rounded-full" />
                      <AvatarFallback className='rounded-full bg-slate-100 text-[#64748B] font-bold'>
                        {currentUser?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-bold text-[#0F172A]'>{currentUser?.name}</span>
                      <span className='truncate text-[10px] text-[#64748B]'>{currentUser?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className='cursor-pointer gap-2 font-medium'>
                    <Link href='/admin/profile'>
                      <User className='size-4' /> {t.common.profile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className='cursor-pointer gap-2 font-medium'>
                    <Link href='/admin/profile'>
                      <Settings className='size-4' /> {t.common.settings}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className='cursor-pointer gap-2 font-bold text-[#A91D1D] focus:bg-red-50 focus:text-[#A91D1D]'
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' })
                    router.refresh()
                    router.replace('/login')
                  }}
                >
                  <LogOut className='size-4' /> {t.common.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
