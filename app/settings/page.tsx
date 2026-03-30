'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, CheckCircle2, Share } from 'lucide-react';
import { usePwaInstall } from '@/hooks/use-pwa-install';

const themeOptions = [
  { value: 'pixel', label: 'Pixel Plains (Default)' },
  { value: 'forest', label: 'Forest Canopy' },
  { value: 'desert', label: 'Desert Dunes' },
  { value: 'ocean', label: 'Ocean Depths' },
  { value: 'nether', label: 'Nether Forge' },
  { value: 'end', label: 'End Realm' },
  { value: 'amethyst', label: 'Amethyst Cave' },
  { value: 'cherry', label: 'Cherry Grove' },
  { value: 'midnight', label: 'Midnight Stone' },
  { value: 'sunset', label: 'Sunset Mesa' },
  { value: 'icy', label: 'Icy Tundra' },
  { value: 'ancient', label: 'Ancient Ruins' },
  { value: 'classic', label: 'Classic UI' },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isInstallable, isInstalled, isIOSSafari, install } = usePwaInstall();

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = mounted && theme ? theme : 'pixel';

  const handleInstall = async () => {
    const result = await install();
    if (result.outcome === 'accepted') {
      // Installation accepted
    }
  };

  return (
    <div className="pixel-page min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[900px] px-4 py-8 lg:px-8 space-y-6">
        {/* Download App Section */}
        <Card className="pixel-panel">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle>Install AdaptIQ App</CardTitle>
            </div>
            <CardDescription>
              Get the full app experience on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!mounted ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : isInstalled ? (
              <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-foreground">App Installed!</p>
                  <p className="text-sm text-muted-foreground">
                    AdaptIQ is already installed on your device. You can find it in your app drawer or home screen.
                  </p>
                </div>
              </div>
            ) : isIOSSafari ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <Share className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Install on iOS</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      To install AdaptIQ on your iPhone or iPad:
                    </p>
                    <ol className="text-sm text-muted-foreground mt-2 list-decimal list-inside space-y-1">
                      <li>Tap the <strong>Share</strong> button in Safari</li>
                      <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></li>
                      <li>Tap <strong>Add</strong> to confirm</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : isInstallable ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <Download className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Ready to Install</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Install AdaptIQ as a standalone app for a better experience. Works offline and launches faster!
                    </p>
                  </div>
                  <Badge variant="secondary">PWA</Badge>
                </div>
                <Button onClick={handleInstall} className="gap-2">
                  <Download className="h-4 w-4" />
                  Install AdaptIQ
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>
                  AdaptIQ can be installed as an app on supported browsers (Chrome, Edge, Safari). 
                  If you&apos;re on a supported browser and don&apos;t see the install option, try:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Using Chrome, Edge, or Safari browser</li>
                  <li>Making sure you&apos;re on HTTPS</li>
                  <li>Looking for an install icon in your browser&apos;s address bar</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="pixel-panel">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Customize the app appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Theme preview selector</p>
              <div className="max-w-sm">
                <Select value={selectedTheme} onValueChange={setTheme} disabled={!mounted}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p>
              Try any theme from this dropdown. Once you pick your favorite, tell me and I&apos;ll lock it as the final project theme and remove this selector.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}