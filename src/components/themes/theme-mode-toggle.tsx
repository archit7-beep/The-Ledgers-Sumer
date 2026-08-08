'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger 
        render={
          <Button
            variant='secondary'
            size='icon'
            className='size-8 bg-background/50 backdrop-blur-md border border-border/50 hover:bg-secondary/80'
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          />
        }
      >
        {mounted && resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className='sr-only'>Toggle theme</span>
      </TooltipTrigger>
      <TooltipContent>
        Toggle theme
      </TooltipContent>
    </Tooltip>
  );
}
