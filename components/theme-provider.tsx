'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="pixel"
      enableSystem={false}
      storageKey="adaptiq.uiThemeMode"
      themes={[
        'pixel',
        'forest',
        'desert',
        'ocean',
        'nether',
        'end',
        'amethyst',
        'cherry',
        'midnight',
        'sunset',
        'icy',
        'ancient',
        'classic',
      ]}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
