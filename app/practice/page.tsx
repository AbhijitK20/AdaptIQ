'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { QuestionCard } from '@/components/question-card';
import { DiagnosisPanel } from '@/components/diagnosis-panel';
import { AIChatPanel } from '@/components/ai-chat-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { diagnoseErrorFromProgram, recordUserConceptAttempt, recordQuestionAttempt, startPracticeSession, endPracticeSession } from '@/lib/live-data';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, XCircle, RotateCcw, Trophy, Target } from 'lucide-react';
import Link from 'next/link';
import { useLearnerProfile } from '@/hooks/use-learner-profile';
import { trackHindsightEvent } from '@/lib/hindsight/client';
import { useHindsightIdentity } from '@/hooks/use-hindsight-identity';
import { useLiveProgram } from '@/hooks/use-live-program';

interface ChapterOption {
  id: string;
  name: string;
}

function normalizeQuestionText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const array = [...items];
  let state = seed >>> 0;
  for (let i = array.length - 1; i > 0; i -= 1) {
    state = (1664525 * state + 1013904223) >>> 0;
    const j = state % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function PracticePage() {
  const supabase = createClient();
  const { activeProfileId } = useLearnerProfile();
  const { userId, profileId } = useHindsightIdentity(activeProfileId);
  const { program: activeProgram, adaptiveRecommendation } = useLiveProgram(activeProfileId);
  const allQuestions = activeProgram.questions;
  const concepts = activeProgram.concepts;
  const subjectOptions = activeProgram.subjects.map((subject) => subject.name);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [requestedConceptId, setRequestedConceptId] = useState<string | null>(null);
  const [returnToKnowledgeMap, setReturnToKnowledgeMap] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [lastIncorrect, setLastIncorrect] = useState(false);
  const [shuffleVersion, setShuffleVersion] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const initializedProfileIdRef = useRef<string | null>(null);
  const sessionStartedRef = useRef(false);

  // Start a practice session when user begins practice
  useEffect(() => {
    const isValidAuthUser = userId && !userId.startsWith('local:');
    if (isValidAuthUser && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      void startPracticeSession(supabase, userId).then((id) => {
        if (id) setSessionId(id);
      });
    }
  }, [userId, supabase]);

  // End session when leaving the page
  useEffect(() => {
    return () => {
      if (sessionId && answers.length > 0) {
        const correct = answers.filter((a) => a.correct).length;
        void endPracticeSession(supabase, sessionId, answers.length, correct);
      }
    };
  }, [sessionId, answers, supabase]);

  const conceptById = useMemo(
    () => new Map(concepts.map((concept) => [concept.id, concept])),
    [concepts],
  );
  const subjectNameById = useMemo(
    () => new Map(activeProgram.subjects.map((subject) => [subject.id, subject.name])),
    [activeProgram.subjects],
  );

  const chapterById = useMemo(
    () => new Map(activeProgram.chapters.map((chapter) => [chapter.id, chapter])),
    [activeProgram.chapters],
  );

  const chapterOptions = useMemo<ChapterOption[]>(() => {
    return activeProgram.chapters
      .filter((chapter) => {
        if (selectedSubject === 'all') return true;
        const chapterSubjectName = subjectNameById.get(chapter.subjectId);
        return chapterSubjectName === selectedSubject;
      })
      .map((chapter) => ({
        id: chapter.id,
        name: chapter.name,
      }));
  }, [activeProgram.chapters, selectedSubject, subjectNameById]);

  // Get weak/missing concept IDs for Focus Mode
  const weakConceptIds = useMemo(() => {
    return new Set(
      concepts
        .filter((c) => c.status === 'weak' || c.status === 'missing')
        .map((c) => c.id)
    );
  }, [concepts]);

  const questions = useMemo(() => {
    const questionById = new Map(allQuestions.map((question) => [question.id, question]));
    const selectedChapter = selectedChapterId ? chapterById.get(selectedChapterId) : undefined;

    const chapterQuizQuestions = selectedChapter
      ? activeProgram.quizzes
          .filter((quiz) => quiz.scopeType === 'chapter' && quiz.scopeId === selectedChapter.id)
          .flatMap((quiz) => quiz.questionIds.map((questionId) => questionById.get(questionId)).filter((item) => item !== undefined))
      : [];

    let candidateQuestions = chapterQuizQuestions.length > 0
      ? chapterQuizQuestions
      : allQuestions.filter((question) => {
          if (selectedSubject === 'all' && !selectedChapterId) return true;
          const relatedConcepts = question.conceptIds
            .map((conceptId) => conceptById.get(conceptId))
            .filter((concept) => concept !== undefined);
          if (relatedConcepts.length === 0) return false;

          const subjectMatches = selectedSubject === 'all'
            ? true
            : relatedConcepts.some((concept) => concept.subject === selectedSubject);
          if (!subjectMatches) return false;

          if (!selectedChapterId) return true;
          const chapterName = selectedChapter?.name;
          if (!chapterName) return false;
          return relatedConcepts.some((concept) => concept.chapter === chapterName);
        });

    // Focus Mode: Filter to only questions related to weak/missing concepts
    if (focusMode && weakConceptIds.size > 0) {
      candidateQuestions = candidateQuestions.filter((question) =>
        question.conceptIds.some((conceptId) => weakConceptIds.has(conceptId))
      );
    }

    const seenQuestionIds = new Set<string>();
    const seenNormalizedText = new Set<string>();
    const deduped = candidateQuestions.filter((question) => {
      if (seenQuestionIds.has(question.id)) return false;
      const normalizedText = normalizeQuestionText(question.questionText);
      if (seenNormalizedText.has(normalizedText)) return false;
      seenQuestionIds.add(question.id);
      seenNormalizedText.add(normalizedText);
      return true;
    });

    const stableSeedInput = `${activeProfileId}|${selectedSubject}|${selectedChapterId}|${shuffleVersion}|${focusMode}`;
    const stableSeed = [...stableSeedInput].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = seededShuffle(deduped, stableSeed);
    return shuffled.slice(0, 20);
  }, [
    allQuestions,
    conceptById,
    selectedSubject,
    selectedChapterId,
    activeProfileId,
    shuffleVersion,
    activeProgram.quizzes,
    chapterById,
    focusMode,
    weakConceptIds,
  ]);

  useEffect(() => {
    if (initializedProfileIdRef.current === activeProfileId) return;
    initializedProfileIdRef.current = activeProfileId;

    const params = new URLSearchParams(window.location.search);
    const requestedSubject = params.get('subject');
    const requestedChapter = params.get('chapter');
    const conceptId = params.get('concept');
    const returnTo = params.get('returnTo');
    const focusParam = params.get('focus');

    // Set focus mode from URL parameter
    if (focusParam === 'true') {
      setFocusMode(true);
      // Track focus mode activation with Hindsight
      void trackHindsightEvent({
        eventType: 'concept_interaction',
        userId,
        profileId,
        metadata: {
          action: 'focus-mode-activated',
          source: 'url-param',
        },
      });
    }

    let nextSubject = 'all';
    if (requestedSubject && subjectOptions.includes(requestedSubject)) {
      nextSubject = requestedSubject;
    }
    setSelectedSubject(nextSubject);

    const chapterPool = activeProgram.chapters
      .filter((chapter) => {
        if (nextSubject === 'all') return true;
        const chapterSubjectName = subjectNameById.get(chapter.subjectId);
        return chapterSubjectName === nextSubject;
      })
      .map((chapter) => ({
        id: chapter.id,
        name: chapter.name,
      }));

    if (requestedChapter) {
      const requested = chapterPool.find((chapter) => chapter.name === requestedChapter);
      if (requested) {
        setSelectedChapterId(requested.id);
      } else {
        setSelectedChapterId(chapterPool[0]?.id ?? '');
      }
    } else {
      setSelectedChapterId(chapterPool[0]?.id ?? '');
    }

    setRequestedConceptId(conceptId);
    setReturnToKnowledgeMap(returnTo === 'knowledge-map');
  }, [activeProfileId, activeProgram.chapters, subjectOptions, subjectNameById, userId, profileId]);

  useEffect(() => {
    if (chapterOptions.length === 0) {
      if (selectedChapterId !== '') setSelectedChapterId('');
      return;
    }
    if (!chapterOptions.some((chapter) => chapter.id === selectedChapterId)) {
      setSelectedChapterId(chapterOptions[0].id);
    }
  }, [chapterOptions, selectedChapterId]);

  useEffect(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setShowDiagnosis(false);
    setLastIncorrect(false);
    setShuffleVersion((prev) => prev + 1);
  }, [selectedSubject, selectedChapterId, activeProfileId, focusMode]);

  useEffect(() => {
    if (!requestedConceptId || questions.length === 0) return;
    const index = questions.findIndex((question) => question.conceptIds.includes(requestedConceptId));
    if (index >= 0) setCurrentIndex(index);
    setRequestedConceptId(null);
  }, [questions, requestedConceptId]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
  const isComplete = questions.length === 0 || currentIndex >= questions.length;

  const stats = useMemo(() => {
    const correct = answers.filter((a) => a.correct).length;
    const incorrect = answers.filter((a) => !a.correct).length;
    const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;
    return { correct, incorrect, accuracy };
  }, [answers]);

  const handleAnswer = (isCorrect: boolean, selectedAnswer: string) => {
    const focusedConceptId = currentQuestion.conceptIds[0];
    const focusedConcept = focusedConceptId ? conceptById.get(focusedConceptId) : undefined;
    setAnswers((prev) => [...prev, { questionId: currentQuestion.id, correct: isCorrect }]);
    setLastIncorrect(!isCorrect);

    // Only record to database if we have a valid auth user ID (not local)
    const isValidAuthUser = userId && !userId.startsWith('local:');

    if (isValidAuthUser && focusedConceptId) {
      void recordUserConceptAttempt(supabase, userId, activeProfileId, focusedConceptId, isCorrect);
    }

    // Record question attempt for accuracy tracking (progress page graphs)
    if (isValidAuthUser) {
      void recordQuestionAttempt(supabase, userId, currentQuestion.id, isCorrect, selectedAnswer);
    }

    void trackHindsightEvent({
      eventType: 'quiz_result',
      userId,
      profileId,
      subject: focusedConcept?.subject,
      chapter: focusedConcept?.chapter,
      conceptId: focusedConcept?.id,
      conceptName: focusedConcept?.name,
      isCorrect,
      metadata: {
        question_id: currentQuestion.id,
        difficulty: currentQuestion.difficulty,
      },
    });

    if (!isCorrect) {
      setShowDiagnosis(true);
      const diagnosisNow = diagnoseErrorFromProgram(
        currentQuestion.id,
        questions,
        concepts,
        activeProgram.conceptDependencies,
      );
      if (diagnosisNow) {
        void trackHindsightEvent({
          eventType: 'diagnosis',
          userId,
          profileId,
          subject: diagnosisNow.missingConcept.subject,
          chapter: diagnosisNow.missingConcept.chapter,
          conceptId: diagnosisNow.missingConcept.id,
          conceptName: diagnosisNow.missingConcept.name,
          reasonTag: 'incorrect-answer',
          metadata: {
            suggestion: diagnosisNow.suggestion,
          },
        });
      }
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setShowDiagnosis(false);
    setLastIncorrect(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setShowDiagnosis(false);
    setLastIncorrect(false);
    setShuffleVersion((prev) => prev + 1);
  };

  const diagnosis = showDiagnosis && currentQuestion
    ? diagnoseErrorFromProgram(currentQuestion.id, questions, concepts, activeProgram.conceptDependencies)
    : null;
  const recommendationReasonLabel = adaptiveRecommendation
    ? {
        'missing-prerequisite': 'Missing prerequisite first',
        'weak-concept': 'Weak concept focus',
        'next-unlocked': 'Next unlocked concept',
      }[adaptiveRecommendation.reason]
    : null;

  // Focus Mode toggle handler
  const handleFocusModeToggle = (enabled: boolean) => {
    setFocusMode(enabled);
    void trackHindsightEvent({
      eventType: 'concept_interaction',
      userId,
      profileId,
      metadata: {
        action: enabled ? 'focus-mode-enabled' : 'focus-mode-disabled',
        weakConceptCount: String(weakConceptIds.size),
      },
    });
  };

  // Get the current concept for context
  const currentConcept = currentQuestion?.conceptIds[0] 
    ? concepts.find((c) => c.id === currentQuestion.conceptIds[0]) 
    : null;
  const activeSubject = selectedSubject === 'all' ? currentConcept?.subject || 'All Subjects' : selectedSubject;
  const activeChapter = chapterOptions.find((chapter) => chapter.id === selectedChapterId)?.name || currentConcept?.chapter || 'Selected Chapter';

  return (
    <div className="pixel-page min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Practice Session
            </h1>
            <p className="text-muted-foreground">
              {activeSubject} - {activeChapter}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <div className="w-[220px]">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {subjectOptions.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[260px]">
              <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Choose chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapterOptions.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {returnToKnowledgeMap && (
              <Link
                href={`/knowledge-map?subject=${encodeURIComponent(selectedSubject === 'all' ? activeSubject : selectedSubject)}${currentConcept ? `&concept=${currentConcept.id}` : ''}`}
                className="text-xs text-primary underline-offset-2 hover:underline"
              >
                Back to prerequisites
              </Link>
            )}
            {/* Focus Mode Toggle */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${focusMode ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/30'}`}>
              <Target className={`h-4 w-4 ${focusMode ? 'text-primary' : 'text-muted-foreground'}`} />
              <Label htmlFor="focus-mode" className={`text-sm font-medium cursor-pointer ${focusMode ? 'text-primary' : 'text-muted-foreground'}`}>
                Focus Mode
              </Label>
              <Switch
                id="focus-mode"
                checked={focusMode}
                onCheckedChange={handleFocusModeToggle}
                disabled={weakConceptIds.size === 0}
              />
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
              <span className="font-medium text-foreground">{stats.correct}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-[#EF4444]" />
              <span className="font-medium text-foreground">{stats.incorrect}</span>
            </div>
            <Badge variant="outline" className="text-sm">
              {stats.accuracy}% Accuracy
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{questions.length === 0 ? 0 : Math.min(currentIndex + 1, questions.length)} of {questions.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Focus Mode Banner */}
        {focusMode && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
            <Target className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Focus Mode Active</p>
              <p className="text-xs text-muted-foreground">
                Practicing {weakConceptIds.size} weak concept{weakConceptIds.size !== 1 ? 's' : ''} • Hindsight is tracking your recovery progress
              </p>
            </div>
            <Link href="/recovery" className="text-xs text-primary hover:underline">
              View Recovery →
            </Link>
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Question Area */}
          <div className="lg:col-span-2 space-y-6">
            {!isComplete ? (
              <>
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  totalQuestions={questions.length}
                  onAnswer={handleAnswer}
                  onNext={handleNext}
                />

                {/* Diagnosis Panel */}
                {diagnosis && (
                  <DiagnosisPanel
                    missingConcept={diagnosis.missingConcept}
                    dependencyChain={diagnosis.chain}
                    suggestion={diagnosis.suggestion}
                  />
                )}
              </>
            ) : (
              /* Completion Screen */
              <Card className="pixel-panel overflow-hidden">
                <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 via-[#22C55E]/5 to-[#38BDF8]/5">
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#22C55E]/10">
                      <Trophy className="h-10 w-10 text-[#22C55E]" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Practice Complete!</CardTitle>
                      <p className="text-muted-foreground mt-1">
                        {questions.length > 0 ? 'Great job finishing this session' : 'No quiz content available for this profile yet'}
                      </p>
                      {questions.length === 0 && adaptiveRecommendation && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Start with <span className="font-medium text-foreground">{adaptiveRecommendation.concept.name}</span>
                          {recommendationReasonLabel ? ` (${recommendationReasonLabel})` : ''}.
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-3 mb-8">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-[#22C55E]">{stats.correct}</p>
                      <p className="text-sm text-muted-foreground">Correct</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-[#EF4444]">{stats.incorrect}</p>
                      <p className="text-sm text-muted-foreground">Incorrect</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-primary">{stats.accuracy}%</p>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button onClick={handleRestart} variant="outline" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Practice Again
                    </Button>
                    {adaptiveRecommendation && (
                      <Link href={`/practice?concept=${adaptiveRecommendation.concept.id}`}>
                        <Button
                          variant="secondary"
                          className="w-full sm:w-auto"
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
                          Recommended: {adaptiveRecommendation.concept.name}
                        </Button>
                      </Link>
                    )}
                    <Link href="/knowledge-map">
                      <Button className="w-full sm:w-auto">
                        View Knowledge Map
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Chat Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 h-[calc(100dvh-6rem)] min-h-0">
              <AIChatPanel
                currentQuestion={currentQuestion}
                currentConcept={currentConcept}
                isAnswerIncorrect={lastIncorrect}
                userId={userId}
                profileId={profileId}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
