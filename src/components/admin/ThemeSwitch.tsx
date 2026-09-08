'use client'

import React, { useEffect, useState } from 'react'
import { Check, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' className='h-9 w-9 rounded-full bg-muted/50 text-foreground border border-border'>
        <Sun className='size-[1.2rem]' />
      </Button>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-9 w-9 rounded-full bg-muted/50 hover:bg-muted text-foreground border border-border'>
          <Sun className='size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
          <Moon className='absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40 rounded-xl shadow-lg border-border bg-card'>
        <DropdownMenuItem onClick={() => setTheme('light')} className='flex items-center gap-2 cursor-pointer font-medium text-foreground'>
          <Sun size={14} className='text-orange-500' />
          Light{' '}
          <Check
            size={14}
            className={cn('ms-auto text-primary', theme !== 'light' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className='flex items-center gap-2 cursor-pointer font-medium text-foreground'>
          <Moon size={14} className='text-blue-500' />
          Dark
          <Check
            size={14}
            className={cn('ms-auto text-primary', theme !== 'dark' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className='flex items-center gap-2 cursor-pointer font-medium text-foreground'>
          <span className='w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center text-[8px] font-bold'>S</span>
          System
          <Check
            size={14}
            className={cn('ms-auto text-primary', theme !== 'system' && 'hidden')}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
