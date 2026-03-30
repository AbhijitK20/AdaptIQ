'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    loadUser();
  }, [supabase.auth]);

  const displayName = user
    ? `${user.user_metadata?.first_name ?? ''} ${user.user_metadata?.last_name ?? ''}`.trim() || user.email || 'User'
    : 'User';

  return (
    <div className="pixel-page min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[900px] px-4 py-8 lg:px-8">
        <Card className="pixel-panel">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-medium">Name:</span> {displayName}</p>
            <p><span className="font-medium">Email:</span> {user?.email ?? 'Not signed in'}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
