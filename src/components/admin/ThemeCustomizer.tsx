// 📍 File: src/components/admin/ThemeCustomizer.tsx
'use client'

import React from 'react'
import { 
  Settings, 
  RotateCcw, 
  CheckCircle2
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useLayout } from '@/context/LayoutContext'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/ui/sidebar'
import { useAdminSettings } from '@/context/AdminSettingsContext'

// --- Layout Preview Icons (Simplified SVGs like shadcn-admin) ---

const SidebarIcon = ({ active }: { active?: boolean }) => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="100" height="60" rx="4" fill={active ? "#F8FAFC" : "#F1F5F9"} />
    <rect x="4" y="4" width="20" height="52" rx="2" fill={active ? "#0F172A" : "#CBD5E1"} />
    <rect x="28" y="4" width="68" height="8" rx="2" fill={active ? "#E2E8F0" : "#E2E8F0"} />
    <rect x="28" y="16" width="68" height="40" rx="2" fill="white" stroke={active ? "#E2E8F0" : "#E2E8F0"} />
  </svg>
)

const InsetIcon = ({ active }: { active?: boolean }) => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="100" height="60" rx="4" fill={active ? "#F8FAFC" : "#F1F5F9"} />
    <rect x="4" y="4" width="20" height="52" rx="2" fill={active ? "#0F172A" : "#CBD5E1"} />
    <rect x="28" y="8" width="64" height="44" rx="4" fill="white" stroke={active ? "#0F172A" : "#E2E8F0"} strokeWidth="1" />
    <rect x="36" y="16" width="48" height="4" rx="1" fill="#E2E8F0" />
  </svg>
)

const FloatingIcon = ({ active }: { active?: boolean }) => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="100" height="60" rx="4" fill={active ? "#F8FAFC" : "#F1F5F9"} />
    <rect x="6" y="6" width="18" height="48" rx="3" fill={active ? "#0F172A" : "#CBD5E1"} />
    <rect x="30" y="4" width="66" height="52" rx="4" fill="white" stroke="#E2E8F0" />
  </svg>
)

const LayoutDefaultIcon = ({ active }: { active?: boolean }) => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="100" height="60" rx="4" fill={active ? "#F8FAFC" : "#F1F5F9"} />
    <rect x="4" y="4" width="16" height="52" rx="2" fill={active ? "#0F172A" : "#CBD5E1"} />
    <rect x="24" y="4" width="72" height="52" rx="2" fill="white" stroke="#E2E8F0" />
    <rect x="30" y="10" width="20" height="2" rx="1" fill="#E2E8F0" />
    <rect x="30" y="16" width="60" height="34" rx="2" fill="#F8FAFC" />
  </svg>
)

const LayoutCompactIcon = ({ active }: { active?: boolean }) => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="100" height="60" rx="4" fill={active ? "#F8FAFC" : "#F1F5F9"} />
    <rect x="4" y="4" width="6" height="52" rx="1" fill={active ? "#0F172A" : "#CBD5E1"} />
    <rect x="14" y="4" width="82" height="52" rx="2" fill="white" stroke="#E2E8F0" />
  </svg>
)

const LayoutFullIcon = ({ active }: { active?: boolean }) => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="100" height="60" rx="4" fill={active ? "#F8FAFC" : "#F1F5F9"} />
    <rect x="4" y="4" width="92" height="52" rx="2" fill="white" stroke={active ? "#0F172A" : "#E2E8F0"} />
    <rect x="10" y="10" width="80" height="40" rx="2" fill="#F8FAFC" />
  </svg>
)

const DirLTRIcon = ({ active }: { active?: boolean }) => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="100" height="60" rx="4" fill={active ? "#F8FAFC" : "#F1F5F9"} />
    <rect x="10" y="15" width="60" height="4" rx="2" fill={active ? "#0F172A" : "#CBD5E1"} />
    <rect x="10" y="25" width="40" height="4" rx="2" fill={active ? "#0F172A" : "#CBD5E1"} />
    <rect x="10" y="35" width="50" height="4" rx="2" fill={active ? "#0F172A" : "#CBD5E1"} />
    <path d="M80 20L90 30L80 40" stroke={active ? "#0F172A" : "#CBD5E1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DirRTLIcon = ({ active }: { active?: boolean }) => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="100" height="60" rx="4" fill={active ? "#F8FAFC" : "#F1F5F9"} />
    <rect x="30" y="15" width="60" height="4" rx="2" fill={active ? "#0F172A" : "#CBD5E1"} />
    <rect x="50" y="25" width="40" height="4" rx="2" fill={active ? "#0F172A" : "#CBD5E1"} />
    <rect x="40" y="35" width="50" height="4" rx="2" fill={active ? "#0F172A" : "#CBD5E1"} />
    <path d="M20 20L10 30L20 40" stroke={active ? "#0F172A" : "#CBD5E1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function ThemeCustomizer() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const { t, language } = useAdminSettings()

  const { 
    variant, setVariant, 
    layout, setLayout, 
    direction, setDirection, 
    resetLayout 
  } = useLayout()
  const { setOpen } = useSidebar()

  const handleReset = () => {
    resetLayout()
    setOpen(true)
  }

  // Define sidebarItems, layoutItems, and directionItems using translations dynamically
  const sidebarItems = React.useMemo(() => [
    { id: 'sidebar', label: t.themeCustomizer?.options?.sidebar || 'Sidebar', icon: SidebarIcon },
    { id: 'inset', label: t.themeCustomizer?.options?.inset || 'Inset', icon: InsetIcon },
    { id: 'floating', label: t.themeCustomizer?.options?.floating || 'Floating', icon: FloatingIcon },
  ], [t])

  const layoutItems = React.useMemo(() => [
    { id: 'default', label: t.themeCustomizer?.options?.default || 'Default', icon: LayoutDefaultIcon },
    { id: 'compact', label: t.themeCustomizer?.options?.compact || 'Compact', icon: LayoutCompactIcon },
    { id: 'full', label: t.themeCustomizer?.options?.full || 'Full Layout', icon: LayoutFullIcon },
  ], [t])

  const directionItems = React.useMemo(() => [
    { id: 'ltr', label: t.themeCustomizer?.options?.ltr || 'Left to Right', icon: DirLTRIcon },
    { id: 'rtl', label: t.themeCustomizer?.options?.rtl || 'Right to Left', icon: DirRTLIcon },
  ], [t])

  if (!mounted) {
    return (
      <Button
        size='icon'
        variant='ghost'
        className='h-9 w-9 rounded-full bg-slate-100/50 hover:bg-slate-100 text-slate-600 border border-slate-200/50'
      >
        <Settings className='h-4 w-4' />
      </Button>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          className='h-9 w-9 rounded-full bg-slate-100/50 hover:bg-slate-100 text-slate-600 border border-slate-200/50'
        >
          <Settings className='h-4 w-4' />
        </Button>
      </SheetTrigger>
      <SheetContent className='w-[340px] sm:w-[400px] flex flex-col p-0 border-l border-border shadow-2xl bg-card'>
        <SheetHeader className='p-6 pb-4 text-start border-b border-border'>
          <SheetTitle className='text-lg font-bold text-foreground'>
            {t.themeCustomizer?.title || 'Theme Settings'}
          </SheetTitle>
          <SheetDescription className='text-[13px] text-muted-foreground leading-relaxed'>
            {t.themeCustomizer?.subtitle || 'Adjust the appearance and layout to suit your preferences.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-6 space-y-10'>
          {/* SIDEBAR SECTION */}
          <section className='space-y-3'>
             <h4 className='text-sm font-semibold text-foreground'>
               {t.themeCustomizer?.sidebar || 'Sidebar'}
             </h4>
             <div className='grid grid-cols-3 gap-3'>
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setVariant(item.id as any)}
                  className='group flex flex-col items-start gap-2 outline-none'
                >
                  <div className={cn(
                    'relative w-full rounded-lg border-[2px] transition-all overflow-hidden p-1 bg-muted/50',
                    variant === item.id ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30'
                  )}>
                    {variant === item.id && (
                      <div className='absolute top-2 right-2 z-10'>
                        <div className='bg-primary rounded-full p-0.5'>
                          <CheckCircle2 className='h-3.5 w-3.5 text-primary-foreground' />
                        </div>
                      </div>
                    )}
                    <item.icon active={variant === item.id} />
                  </div>
                  <span className='text-[11px] font-medium text-muted-foreground text-left leading-tight'>{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* LAYOUT SECTION */}
          <section className='space-y-3'>
             <h4 className='text-sm font-semibold text-foreground'>
               {t.themeCustomizer?.layout || 'Layout'}
             </h4>
             <div className='grid grid-cols-3 gap-3'>
              {layoutItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setLayout(item.id as any)
                    if (item.id === 'compact') setOpen(false)
                    else setOpen(true)
                  }}
                  className='group flex flex-col items-start gap-2 outline-none'
                >
                  <div className={cn(
                    'relative w-full rounded-lg border-[2px] transition-all overflow-hidden p-1 bg-muted/50',
                    layout === item.id ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30'
                  )}>
                    {layout === item.id && (
                      <div className='absolute top-2 right-2 z-10'>
                        <div className='bg-primary rounded-full p-0.5'>
                          <CheckCircle2 className='h-3.5 w-3.5 text-primary-foreground' />
                        </div>
                      </div>
                    )}
                    <item.icon active={layout === item.id} />
                  </div>
                  <span className='text-[11px] font-medium text-muted-foreground text-left leading-tight'>{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* DIRECTION SECTION */}
          <section className='space-y-3'>
             <h4 className='text-sm font-semibold text-foreground'>
               {t.themeCustomizer?.direction || 'Direction'}
             </h4>
             <div className='grid grid-cols-3 gap-3'>
              {directionItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDirection(item.id as any)}
                  className='group flex flex-col items-start gap-2 outline-none'
                >
                  <div className={cn(
                    'relative w-full rounded-lg border-[2px] transition-all overflow-hidden p-1 bg-muted/50',
                    direction === item.id ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30'
                  )}>
                    {direction === item.id && (
                      <div className='absolute top-2 right-2 z-10'>
                        <div className='bg-primary rounded-full p-0.5'>
                          <CheckCircle2 className='h-3.5 w-3.5 text-primary-foreground' />
                        </div>
                      </div>
                    )}
                    <item.icon active={direction === item.id} />
                  </div>
                  <span className='text-[11px] font-medium text-muted-foreground text-left leading-tight'>{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <SheetFooter className='p-6 border-t border-border mt-auto'>
          <Button
            variant='destructive'
            onClick={handleReset}
            className='w-full bg-[#A91D1D] hover:bg-[#8B1818] text-white font-bold uppercase tracking-widest text-[11px] h-11 rounded-lg transition-all shadow-md'
          >
            {t.themeCustomizer?.reset || 'Đặt lại'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
