'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { StatCard } from '@/components/stat-card';
import { ConceptCard } from '@/components/concept-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight,
  Brain,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useLearnerProfile } from '@/hooks/use-learner-profile';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { trackHindsightEvent } from '@/lib/hindsight/client';
import { useHindsightIdentity } from '@/hooks/use-hindsight-identity';
import { useLiveProgram } from '@/hooks/use-live-program';

export default function DashboardPage() {
  const { activeProfileId } = useLearnerProfile();
  const { userId, profileId } = useHindsightIdentity(activeProfileId);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const supabase = createClient();
  const { program: activeProgram, stats, weakConcepts, suggestedConcept, adaptiveRecommendation, isLoading } = useLiveProgram(activeProfileId);
  const activeSubject = activeProgram.subjects[0]?.name || 'Selected Subject';
  const activeChapter = activeProgram.chapters[0]?.name || 'General';
  const entryConcept = adaptiveRecommendation?.concept ?? suggestedConcept ?? weakConcepts[0];
  const practiceEntryHref = entryConcept
    ? `/practice?subject=${encodeURIComponent(entryConcept.subject)}&chapter=${encodeURIComponent(entryConcept.chapter)}&concept=${entryConcept.id}`
    : '/practice';
  const knowledgeMapEntryHref = entryConcept
    ? `/knowledge-map?subject=${encodeURIComponent(entryConcept.subject)}&concept=${entryConcept.id}`
    : '/knowledge-map';
  const recommendationReasonLabel = adaptiveRecommendation
    ? {
        'missing-prerequisite': 'Missing prerequisite',
        'weak-concept': 'Weak concept',
        'next-unlocked': 'Next unlocked concept',
      }[adaptiveRecommendation.reason]
    : null;
  const displayName = user
    ? `${user.user_metadata?.first_name ?? ''} ${user.user_metadata?.last_name ?? ''}`.trim() || user.email || 'User'
    : 'User';

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    loadUser();
  }, [supabase.auth]);

  useEffect(() => {
    void trackHindsightEvent({
      eventType: 'progress_snapshot',
      userId,
      profileId,
      subject: activeSubject,
      chapter: activeChapter,
      accuracy: stats.avgAccuracy,
      metadata: {
        page: 'dashboard',
        mastered: String(stats.mastered),
        weak: String(stats.weak),
        missing: String(stats.missing),
      },
    });
  }, [activeChapter, activeSubject, profileId, stats.avgAccuracy, stats.mastered, stats.missing, stats.weak, userId]);

  return (
    <div className="pixel-page min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {displayName}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Continue your learning journey in {activeSubject} - {activeChapter}
              </p>
            </div>
            <Link href={practiceEntryHref}>
              <Button size="lg" className="gap-2 mt-4 sm:mt-0">
                <BookOpen className="h-5 w-5" />
                Start Practice
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Overall Accuracy"
            value={isLoading ? '...' : `${Math.round(stats.avgAccuracy * 100)}%`}
            icon={Target}
            trend={{ value: 5, label: 'vs last week' }}
            variant="default"
            isLoading={isLoading}
          />
          <StatCard
            title="Concepts Mastered"
            value={isLoading ? '...' : stats.mastered}
            subtitle={isLoading ? '' : `of ${stats.total}`}
            icon={TrendingUp}
            variant="success"
            isLoading={isLoading}
          />
          <StatCard
            title="Weak Areas"
            value={isLoading ? '...' : stats.weak}
            subtitle="need attention"
            icon={AlertTriangle}
            variant="warning"
            isLoading={isLoading}
          />
          <StatCard
            title="Missing Concepts"
            value={isLoading ? '...' : stats.missing}
            subtitle="to learn"
            icon={Brain}
            variant="destructive"
            isLoading={isLoading}
          />
        </section>

        <section className="mb-8">
          <Card className="pixel-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profile Content Summary</CardTitle>
              <CardDescription>
                {activeProgram.profile.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Subjects</p>
                <p className="text-lg font-semibold">{activeProgram.subjects.length}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Chapters</p>
                <p className="text-lg font-semibold">{activeProgram.chapters.length}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Modules</p>
                <p className="text-lg font-semibold">{activeProgram.modules.length}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Concepts / Quiz Questions</p>
                <p className="text-lg font-semibold">
                  {activeProgram.concepts.length} / {activeProgram.questions.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Weak Concepts - Takes 2 columns */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Weak Areas</h2>
                <p className="text-sm text-muted-foreground">
                  Focus on these concepts to improve your understanding
                </p>
              </div>
              <Link href={knowledgeMapEntryHref}>
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {weakConcepts.length > 0 ? (
                weakConcepts.slice(0, 4).map((concept) => (
                  <ConceptCard key={concept.id} concept={concept} />
                ))
              ) : (
                <Card className="pixel-panel sm:col-span-2">
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No detailed concept-level data is seeded for this profile yet. Subject/chapter/module scaffolds are available.
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Suggested Next Topic */}
            {suggestedConcept && (
              <Card className="pixel-panel border-primary/20 bg-accent/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <Lightbulb className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-base">Suggested Next</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{suggestedConcept.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {suggestedConcept.description}
                    </p>
                  </div>
                  <Link href={`/practice?subject=${encodeURIComponent(suggestedConcept.subject)}&chapter=${encodeURIComponent(suggestedConcept.chapter)}&concept=${suggestedConcept.id}`}>
                    <Button
                      className="w-full gap-2"
                      onClick={() => {
                        void trackHindsightEvent({
                          eventType: 'recommendation',
                          userId,
                          profileId,
                          subject: suggestedConcept.subject,
                          chapter: suggestedConcept.chapter,
                          conceptId: suggestedConcept.id,
                          conceptName: suggestedConcept.name,
                          recommendationAccepted: true,
                          reasonTag: 'suggested-concept',
                        });
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Start Learning
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {adaptiveRecommendation && (
              <Card className="pixel-panel border-secondary/30 bg-secondary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                      <Sparkles className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Adaptive Next Step</CardTitle>
                      {recommendationReasonLabel && (
                        <CardDescription>{recommendationReasonLabel}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{adaptiveRecommendation.concept.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {adaptiveRecommendation.concept.description}
                    </p>
                  </div>
                  <Link href={`/practice?subject=${encodeURIComponent(adaptiveRecommendation.concept.subject)}&chapter=${encodeURIComponent(adaptiveRecommendation.concept.chapter)}&concept=${adaptiveRecommendation.concept.id}`}>
                    <Button
                      variant="secondary"
                      className="w-full gap-2"
                      onClick={() => {
                        void trackHindsightEvent({
                          eventType: 'recommendation',
                          userId,
                          profileId,
                          subject: adaptiveRecommendation.concept.subject,
                          chapter: adaptiveRecommendation.concept.chapter,
                          conceptId: adaptiveRecommendation.concept.id,
                          conceptName: adaptiveRecommendation.concept.name,
                          recommendationAccepted: true,
                          reasonTag: adaptiveRecommendation.reason,
                        });
                      }}
                    >
                      <BookOpen className="h-4 w-4" />
                      Practice Recommended Concept
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Progress Summary */}
            <Card className="pixel-panel">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Chapter Progress</CardTitle>
                <CardDescription>Force & Laws of Motion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#22C55E]" />
                      <span className="text-muted-foreground">Mastered</span>
                    </div>
                    <span className="font-medium">{stats.masteredPercent}%</span>
                  </div>
                  <Progress value={stats.masteredPercent} className="h-2 [&>div]:bg-[#22C55E]" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                      <span className="text-muted-foreground">Weak</span>
                    </div>
                    <span className="font-medium">{stats.weakPercent}%</span>
                  </div>
                  <Progress value={stats.weakPercent} className="h-2 [&>div]:bg-[#F59E0B]" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#EF4444]" />
                      <span className="text-muted-foreground">Missing</span>
                    </div>
                    <span className="font-medium">{stats.missingPercent}%</span>
                  </div>
                  <Progress value={stats.missingPercent} className="h-2 [&>div]:bg-[#EF4444]" />
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant Promo */}
            <Card className="pixel-panel bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 border-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <Brain className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">AI Study Companion</h3>
                    <p className="text-sm text-muted-foreground">
                      Get personalized explanations and study guidance from our AI assistant.
                    </p>
                    <Link href={practiceEntryHref}>
                      <Button variant="secondary" size="sm" className="mt-2">
                        Try it now
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
