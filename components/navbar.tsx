'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Brain, LayoutDashboard, BookOpen, Network, TrendingUp, RotateCcw, Settings, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useLearnerProfile } from '@/hooks/use-learner-profile';
import { trackHindsightEvent } from '@/lib/hindsight/client';
import { useHindsightIdentity } from '@/hooks/use-hindsight-identity';
import { fetchCatalogProfilesFromSupabase } from '@/lib/live-data';
import type { LearnerProfile } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Practice', href: '/practice', icon: BookOpen },
  { name: 'Knowledge Map', href: '/knowledge-map', icon: Network },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Recovery', href: '/recovery', icon: RotateCcw },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<LearnerProfile[]>([]);
  const supabase = createClient();
  const { activeProfileId, setActiveProfileId } = useLearnerProfile();
  const { userId, profileId } = useHindsightIdentity(activeProfileId);
  const schoolProfiles = profiles
    .filter((profile) => profile.trackType === 'school' && profile.classLevel)
    .sort((a, b) => (a.classLevel ?? 0) - (b.classLevel ?? 0));
  const btechProfiles = profiles.filter((profile) => profile.trackType === 'btech');
  const btechBranches = Array.from(
    new Set(
      btechProfiles
        .map((profile) => profile.branch)
        .filter((branch): branch is NonNullable<typeof branch> => Boolean(branch)),
    ),
  );
  const [selectedLevel, setSelectedLevel] = useState<string>('school-9');
  const [selectedBranch, setSelectedBranch] = useState<string>(btechBranches[0] ?? 'CSE');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);

      const catalogProfiles = await fetchCatalogProfilesFromSupabase(supabase).catch(() => null);
      if (catalogProfiles && catalogProfiles.length > 0) {
        setProfiles(catalogProfiles);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const activeProfile = profiles.find((profile) => profile.id === activeProfileId);
    if (!activeProfile) return;

    if (activeProfile.trackType === 'school' && activeProfile.classLevel) {
      setSelectedLevel(`school-${activeProfile.classLevel}`);
      return;
    }

    if (activeProfile.trackType === 'btech') {
      setSelectedLevel('btech');
      if (activeProfile.branch) setSelectedBranch(activeProfile.branch);
      if (activeProfile.semester) setSelectedSemester(String(activeProfile.semester));
    }
  }, [activeProfileId, profiles]);

  const selectBtechProfile = (branch: string, semester: string) => {
    const target = btechProfiles.find(
      (profile) => profile.branch === branch && profile.semester === Number(semester),
    );
    if (target) {
      setActiveProfileId(target.id);
      void trackHindsightEvent({
        eventType: 'concept_interaction',
        userId,
        profileId,
        metadata: {
          action: 'profile-switch',
          next_profile_id: target.id,
          branch,
          semester,
        },
      });
    }
  };

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    if (value === 'btech') {
      selectBtechProfile(selectedBranch, selectedSemester);
      return;
    }
    const classLevel = Number(value.replace('school-', ''));
    const target = schoolProfiles.find((profile) => profile.classLevel === classLevel);
    if (target) {
      setActiveProfileId(target.id);
      void trackHindsightEvent({
        eventType: 'concept_interaction',
        userId,
        profileId,
        metadata: {
          action: 'profile-switch',
          next_profile_id: target.id,
        },
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/landing');
    router.refresh();
  };

  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user.email?.[0].toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    const firstName = user.user_metadata?.first_name;
    const lastName = user.user_metadata?.last_name;
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return user.email || 'User';
  };

  return (
    <header className="app-shell-header sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href={user ? '/' : '/landing'} className="flex items-center gap-2">
          <div className="app-brand-mark flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-semibold text-foreground text-lg sm:inline-block">
            AdaptIQ
          </span>
        </Link>

        {/* Navigation Links - Only show when logged in */}
        {user && (
          <div className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-2',
                      isActive && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}

        {/* User Menu / Auth Buttons */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden items-center gap-2 md:flex">
              <Select value={selectedLevel} onValueChange={handleLevelChange}>
                <SelectTrigger size="sm" className="min-w-[120px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {schoolProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={`school-${profile.classLevel}`}>
                      {profile.classLevel} std
                    </SelectItem>
                  ))}
                  <SelectItem value="btech">BTech</SelectItem>
                </SelectContent>
              </Select>

              {selectedLevel === 'btech' && (
                <>
                  <Select
                    value={selectedBranch}
                    onValueChange={(branch) => {
                      setSelectedBranch(branch);
                      selectBtechProfile(branch, selectedSemester);
                    }}
                  >
                    <SelectTrigger size="sm" className="min-w-[120px]">
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {btechBranches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedSemester}
                    onValueChange={(semester) => {
                      setSelectedSemester(semester);
                      selectBtechProfile(selectedBranch, semester);
                    }}
                  >
                    <SelectTrigger size="sm" className="min-w-[120px]">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 8 }, (_, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)}>
                          Semester {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          )}
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation - Only show when logged in */}
        {user && (
          <div className="flex items-center gap-1 md:hidden">
            <Select value={selectedLevel} onValueChange={handleLevelChange}>
              <SelectTrigger size="sm" className="min-w-[110px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {schoolProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={`school-${profile.classLevel}`}>
                    {profile.classLevel} std
                  </SelectItem>
                ))}
                <SelectItem value="btech">BTech</SelectItem>
              </SelectContent>
            </Select>

            {selectedLevel === 'btech' && (
              <>
                <Select
                  value={selectedBranch}
                  onValueChange={(branch) => {
                    setSelectedBranch(branch);
                    selectBtechProfile(branch, selectedSemester);
                  }}
                >
                  <SelectTrigger size="sm" className="min-w-[90px]">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {btechBranches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedSemester}
                  onValueChange={(semester) => {
                    setSelectedSemester(semester);
                    selectBtechProfile(selectedBranch, semester);
                  }}
                >
                  <SelectTrigger size="sm" className="min-w-[90px]">
                    <SelectValue placeholder="Sem" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, index) => (
                      <SelectItem key={index + 1} value={String(index + 1)}>
                        Sem {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="icon"
                    className={cn(isActive && 'bg-accent text-accent-foreground')}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="sr-only">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
}
