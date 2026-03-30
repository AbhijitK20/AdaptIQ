'use client';

import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ConceptBadge } from '@/components/concept-badge';
import {
  RotateCcw,
  Target,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useLearnerProfile } from '@/hooks/use-learner-profile';
import { useHindsightIdentity } from '@/hooks/use-hindsight-identity';
import { useLiveProgram } from '@/hooks/use-live-program';
import { createClient } from '@/lib/supabase/client';
import { trackHindsightEvent } from '@/lib/hindsight/client';
import type { Concept } from '@/lib/types';

interface MistakeRecord {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  chapter: string;
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  attemptedAt: string;
  isRecovered: boolean;
}

export default function RecoveryPage() {
  const { activeProfileId } = useLearnerProfile();
  const { userId, profileId } = useHindsightIdentity(activeProfileId);
  const { program: activeProgram, stats, isLoading: programLoading } = useLiveProgram(activeProfileId);
  const [authUserId, setAuthUserId] = useState<string | undefined>();
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Get auth user ID
  useEffect(() => {
    const getAuthUser = async () => {
      const { data } = await supabase.auth.getUser();
      setAuthUserId(data.user?.id);
    };
    void getAuthUser();
  }, [supabase]);

  // Fetch mistake data from question_attempts and user_catalog_mastery
  useEffect(() => {
    if (!authUserId || authUserId.startsWith('local:')) {
      setIsLoading(false);
      return;
    }

    const fetchMistakes = async () => {
      setIsLoading(true);
      try {
        // Fetch incorrect attempts
        const { data: incorrectAttempts, error } = await supabase
          .from('question_attempts')
          .select('id, question_id, selected_answer, is_correct, created_at')
          .eq('user_id', authUserId)
          .eq('is_correct', false)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        // Get question details for each mistake
        const questionIds = [...new Set((incorrectAttempts || []).map((a) => a.question_id))];
        
        if (questionIds.length === 0) {
          setMistakes([]);
          setIsLoading(false);
          return;
        }

        // Build mistake records from program data
        const mistakeRecords: MistakeRecord[] = [];
        const conceptMap = new Map(activeProgram.concepts.map((c) => [c.id, c]));
        const questionMap = new Map(activeProgram.questions.map((q) => [q.id, q]));

        for (const attempt of incorrectAttempts || []) {
          const question = questionMap.get(attempt.question_id);
          if (!question) continue;

          const conceptId = question.conceptIds[0];
          const concept = conceptId ? conceptMap.get(conceptId) : undefined;

          // Check if user has since mastered this concept (recovered)
          const isRecovered = concept?.status === 'mastered';

          mistakeRecords.push({
            id: attempt.id,
            conceptId: conceptId || '',
            conceptName: concept?.name || 'Unknown Concept',
            subject: concept?.subject || 'Unknown',
            chapter: concept?.chapter || 'Unknown',
            questionId: question.id,
            questionText: question.questionText,
            selectedAnswer: attempt.selected_answer,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            attemptedAt: attempt.created_at,
            isRecovered,
          });
        }

        setMistakes(mistakeRecords);
      } catch (err) {
        console.error('Failed to fetch mistakes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeProgram.questions.length > 0) {
      void fetchMistakes();
    }
  }, [authUserId, supabase, activeProgram.questions, activeProgram.concepts]);

  // Track page view
  useEffect(() => {
    void trackHindsightEvent({
      eventType: 'concept_interaction',
      userId,
      profileId,
      metadata: {
        page: 'recovery',
        action: 'view',
      },
    });
  }, [userId, profileId]);

  // Group mistakes by concept
  const mistakesByConcept = useMemo(() => {
    const grouped = new Map<string, MistakeRecord[]>();
    for (const mistake of mistakes) {
      const existing = grouped.get(mistake.conceptId) || [];
      existing.push(mistake);
      grouped.set(mistake.conceptId, existing);
    }
    return grouped;
  }, [mistakes]);

  // Get weak concepts that need recovery
  const weakConcepts = useMemo(() => {
    return activeProgram.concepts
      .filter((c) => c.status === 'weak' || c.status === 'missing')
      .filter((c) => mistakesByConcept.has(c.id))
      .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1));
  }, [activeProgram.concepts, mistakesByConcept]);

  // Recovery stats
  const recoveryStats = useMemo(() => {
    const totalMistakes = mistakes.length;
    const recoveredMistakes = mistakes.filter((m) => m.isRecovered).length;
    const pendingMistakes = totalMistakes - recoveredMistakes;
    const recoveryRate = totalMistakes > 0 ? Math.round((recoveredMistakes / totalMistakes) * 100) : 0;
    return { totalMistakes, recoveredMistakes, pendingMistakes, recoveryRate };
  }, [mistakes]);

  const handleStartRecovery = (concept: Concept) => {
    void trackHindsightEvent({
      eventType: 'concept_interaction',
      userId,
      profileId,
      conceptId: concept.id,
      conceptName: concept.name,
      subject: concept.subject,
      chapter: concept.chapter,
      metadata: {
        action: 'start-recovery',
      },
    });
  };

  return (
    <div className="pixel-page min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <RotateCcw className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Recovery Zone
              </h1>
              <p className="text-muted-foreground">
                Practice your past mistakes and strengthen weak areas with Hindsight AI
              </p>
            </div>
          </div>
        </div>

        {/* Recovery Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="pixel-panel">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Mistakes</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : recoveryStats.totalMistakes}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="pixel-panel">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recovered</p>
                  <p className="text-2xl font-bold text-green-600">{isLoading ? '...' : recoveryStats.recoveredMistakes}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="pixel-panel">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{isLoading ? '...' : recoveryStats.pendingMistakes}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="pixel-panel">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recovery Rate</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : `${recoveryStats.recoveryRate}%`}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Progress value={recoveryStats.recoveryRate} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </section>

        {/* Hindsight AI Insights */}
        <Card className="pixel-panel mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Hindsight AI Insights</CardTitle>
            </div>
            <CardDescription>
              Personalized recommendations based on your learning patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weakConcepts.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Focus Area Detected</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You have {weakConcepts.length} concepts that need attention. The most challenging is{' '}
                      <strong>{weakConcepts[0]?.name}</strong> with {Math.round((weakConcepts[0]?.accuracy ?? 0) * 100)}% accuracy.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <Brain className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Recovery Strategy</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enable <strong>Focus Mode</strong> in Practice to target these weak areas. Hindsight will track your progress and adjust recommendations.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-foreground">Great Progress!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You don&apos;t have any major weak areas. Keep practicing to maintain your mastery!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Concepts Needing Recovery */}
        <Card className="pixel-panel mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Concepts Needing Recovery</CardTitle>
                <CardDescription>
                  Focus on these concepts to improve your overall performance
                </CardDescription>
              </div>
              <Link href="/practice?focus=true">
                <Button className="gap-2">
                  <Target className="h-4 w-4" />
                  Start Focus Mode
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading || programLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : weakConcepts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No concepts need recovery at this time. Great job!
              </div>
            ) : (
              <div className="space-y-4">
                {weakConcepts.slice(0, 10).map((concept) => {
                  const conceptMistakes = mistakesByConcept.get(concept.id) || [];
                  const mistakeCount = conceptMistakes.length;
                  return (
                    <div
                      key={concept.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <ConceptBadge status={concept.status} />
                        <div>
                          <p className="font-medium text-foreground">{concept.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {concept.subject} • {concept.chapter}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{Math.round((concept.accuracy ?? 0) * 100)}% accuracy</p>
                          <p className="text-xs text-muted-foreground">{mistakeCount} mistakes</p>
                        </div>
                        <Link
                          href={`/practice?subject=${encodeURIComponent(concept.subject)}&chapter=${encodeURIComponent(concept.chapter)}&concept=${concept.id}&focus=true`}
                          onClick={() => handleStartRecovery(concept)}
                        >
                          <Button variant="outline" size="sm" className="gap-1">
                            Practice
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Mistakes */}
        <Card className="pixel-panel">
          <CardHeader>
            <CardTitle className="text-base">Recent Mistakes</CardTitle>
            <CardDescription>
              Review your incorrect answers and learn from them
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : mistakes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No mistakes recorded yet. Start practicing to track your progress!
              </div>
            ) : (
              <div className="space-y-4">
                {mistakes.slice(0, 10).map((mistake) => (
                  <div
                    key={mistake.id}
                    className={`rounded-lg border p-4 ${
                      mistake.isRecovered
                        ? 'border-green-500/20 bg-green-500/5'
                        : 'border-destructive/20 bg-destructive/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={mistake.isRecovered ? 'default' : 'destructive'}>
                          {mistake.isRecovered ? 'Recovered' : 'Needs Practice'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(mistake.attemptedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {mistake.subject} • {mistake.conceptName}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-2">{mistake.questionText}</p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-muted-foreground">Your answer:</span>
                        <span className="text-destructive">{mistake.selectedAnswer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">Correct:</span>
                        <span className="text-green-600">{mistake.correctAnswer}</span>
                      </div>
                    </div>
                    {mistake.explanation && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        💡 {mistake.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
