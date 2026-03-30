'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/navbar';
import { StatCard } from '@/components/stat-card';
import { ConceptBadge } from '@/components/concept-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp, 
  Calendar,
  Clock,
  Trophy,
  Sparkles,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { useLearnerProfile } from '@/hooks/use-learner-profile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trackHindsightEvent } from '@/lib/hindsight/client';
import { useHindsightIdentity } from '@/hooks/use-hindsight-identity';
import { useLiveProgram } from '@/hooks/use-live-program';
import { useUserActivityMetrics } from '@/hooks/use-user-activity-metrics';
import { useAccuracyOverTime } from '@/hooks/use-accuracy-over-time';
import { useOverallAccuracy } from '@/hooks/use-overall-accuracy';

const insights = [
  {
    type: 'improvement' as const,
    title: 'Great progress!',
    description: "You've improved your accuracy by 23% in Newton's Third Law this week.",
    trend: 'up',
    value: '+23%',
  },
  {
    type: 'focus' as const,
    title: 'Focus needed',
    description: "Newton's First Law needs more practice. Consider reviewing Inertia first.",
    trend: 'down',
    value: '28%',
  },
  {
    type: 'achievement' as const,
    title: 'Milestone reached',
    description: 'You have mastered 4 out of 10 concepts in Force & Laws of Motion!',
    trend: 'up',
    value: '40%',
  },
];

export default function ProgressPage() {
  const { activeProfileId } = useLearnerProfile();
  const { userId, profileId } = useHindsightIdentity(activeProfileId);
  const { program: activeProgram, stats: fullStats, isLoading: programLoading } = useLiveProgram(activeProfileId);
  const [authUserId, setAuthUserId] = useState<string | undefined>();
  
  // Get the real Supabase auth user ID for queries
  useEffect(() => {
    const getAuthUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setAuthUserId(data.user?.id);
    }
    void getAuthUser();
  }, []);

  const { questionsAnswered, studyStreak, hoursSpentThisWeek, isLoading: metricsLoading } = useUserActivityMetrics(authUserId);
  const { data: accuracyOverTime } = useAccuracyOverTime(authUserId);
  const { overallAccuracy: questionBasedAccuracy, totalAttempts } = useOverallAccuracy(authUserId, profileId);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const subjectOptions = activeProgram.subjects.map((subject) => subject.name);
  const concepts = useMemo(
    () => (selectedSubject === 'all'
      ? activeProgram.concepts
      : activeProgram.concepts.filter((concept) => concept.subject === selectedSubject)),
    [activeProgram.concepts, selectedSubject],
  );
  const activeSubject = selectedSubject === 'all' ? activeProgram.subjects[0]?.name || 'Selected Subject' : selectedSubject;
  const activeChapter = activeProgram.chapters[0]?.name || 'General';

  // Use concept mastery-based accuracy if no question attempts, otherwise use question-based accuracy
  const overallAccuracy = totalAttempts > 0 
    ? questionBasedAccuracy 
    : Math.round(fullStats.avgAccuracy * 100);
  const accuracySubtitle = totalAttempts > 0 
    ? `out of ${totalAttempts} attempts` 
    : fullStats.total > 0 ? `from ${fullStats.total} concepts` : 'No data yet';

  const stats = useMemo(() => {
    if (selectedSubject === 'all') return fullStats;
    const total = concepts.length;
    const mastered = concepts.filter((concept) => concept.status === 'mastered').length;
    const weak = concepts.filter((concept) => concept.status === 'weak').length;
    const missing = concepts.filter((concept) => concept.status === 'missing').length;
    const avgAccuracy = total > 0
      ? concepts.reduce((sum, concept) => sum + (concept.accuracy ?? 0), 0) / total
      : 0;

    return {
      total,
      mastered,
      weak,
      missing,
      avgAccuracy,
      masteredPercent: total > 0 ? Math.round((mastered / total) * 100) : 0,
      weakPercent: total > 0 ? Math.round((weak / total) * 100) : 0,
      missingPercent: total > 0 ? Math.round((missing / total) * 100) : 0,
    };
  }, [concepts, fullStats, selectedSubject]);

  const conceptMastery = useMemo(
    () =>
      concepts.map((concept) => ({
        name: concept.name.length > 12 ? `${concept.name.substring(0, 10)}...` : concept.name,
        fullName: concept.name,
        accuracy: Math.round((concept.accuracy || 0) * 100),
        status: concept.status,
      })),
    [concepts],
  );

  const masteryData = [
    { name: 'Mastered', value: stats.mastered, color: '#22C55E' },
    { name: 'Weak', value: stats.weak, color: '#F59E0B' },
    { name: 'Missing', value: stats.missing, color: '#EF4444' },
  ];

  useEffect(() => {
    void trackHindsightEvent({
      eventType: 'progress_snapshot',
      userId,
      profileId,
      subject: selectedSubject === 'all' ? activeSubject : selectedSubject,
      chapter: activeChapter,
      accuracy: stats.avgAccuracy,
      metadata: {
        page: 'progress',
        mastered: String(stats.mastered),
        weak: String(stats.weak),
        missing: String(stats.missing),
      },
    });
  }, [activeChapter, activeSubject, profileId, selectedSubject, stats.avgAccuracy, stats.mastered, stats.missing, stats.weak, userId]);

  return (
    <div className="pixel-page min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Your Progress
          </h1>
          <p className="text-muted-foreground">
            Track your learning journey in {activeSubject} - {activeChapter}
          </p>
          <div className="mt-3 w-[220px]">
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
        </div>

        {/* Stats Grid */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Overall Accuracy"
            value={programLoading ? '...' : `${overallAccuracy}%`}
            subtitle={programLoading ? '' : accuracySubtitle}
            icon={Target}
            trend={{ value: 5, label: 'vs all time' }}
            variant="default"
            isLoading={programLoading}
          />
          <StatCard
            title="Questions Answered"
            value={metricsLoading ? '...' : questionsAnswered}
            subtitle="this month"
            icon={TrendingUp}
            variant="success"
            isLoading={metricsLoading}
          />
          <StatCard
            title="Study Streak"
            value={metricsLoading ? '...' : studyStreak}
            subtitle="days"
            icon={Calendar}
            variant="warning"
            isLoading={metricsLoading}
          />
          <StatCard
            title="Time Spent"
            value={metricsLoading ? '...' : `${hoursSpentThisWeek}`}
            subtitle="hours this week"
            icon={Clock}
            variant="default"
            isLoading={metricsLoading}
          />
        </section>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Accuracy Over Time */}
          <Card className="pixel-panel">
            <CardHeader>
              <CardTitle className="text-base">Accuracy Over Time</CardTitle>
              <CardDescription>Your performance this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#64748B"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#64748B"
                      fontSize={12}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Accuracy']}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Concept Mastery Distribution */}
          <Card className="pixel-panel">
            <CardHeader>
              <CardTitle className="text-base">Mastery Distribution</CardTitle>
              <CardDescription>Breakdown of your concept progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={masteryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {masteryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Concept Accuracy Chart */}
        <Card className="pixel-panel mb-8">
          <CardHeader>
            <CardTitle className="text-base">Concept Accuracy Breakdown</CardTitle>
            <CardDescription>Your accuracy level for each concept</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={conceptMastery}
                  layout="vertical"
                  margin={{ left: 10, right: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    stroke="#64748B"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#64748B"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                    }}
                    formatter={(value, _name, item) => {
                      const fullName = (item?.payload as { fullName?: string } | undefined)?.fullName ?? 'Concept'
                      return [`${value}%`, fullName]
                    }}
                  />
                  <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                    {conceptMastery.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.status === 'mastered' ? '#22C55E' :
                          entry.status === 'weak' ? '#F59E0B' :
                          '#EF4444'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Insights and Concept List */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Insights */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Learning Insights</h2>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <Card 
                  key={index}
                  className={
                    insight.type === 'improvement' ? 'pixel-panel border-[#22C55E]/30 bg-[#22C55E]/5' :
                    insight.type === 'focus' ? 'pixel-panel border-[#F59E0B]/30 bg-[#F59E0B]/5' :
                    'pixel-panel border-primary/30 bg-primary/5'
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        insight.type === 'improvement' ? 'bg-[#22C55E]' :
                        insight.type === 'focus' ? 'bg-[#F59E0B]' :
                        'bg-primary'
                      }`}>
                        {insight.type === 'improvement' ? (
                          <TrendingUp className="h-5 w-5 text-white" />
                        ) : insight.type === 'focus' ? (
                          <Target className="h-5 w-5 text-white" />
                        ) : (
                          <Trophy className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {insight.title}
                          </h3>
                          <Badge 
                            variant="outline"
                            className={
                              insight.trend === 'up' 
                                ? 'text-[#22C55E] border-[#22C55E]/30' 
                                : 'text-[#EF4444] border-[#EF4444]/30'
                            }
                          >
                            <span className="flex items-center gap-1">
                              {insight.trend === 'up' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )}
                              {insight.value}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Concept Progress List */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">All Concepts</h2>
            <Card className="pixel-panel">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {concepts.map((concept) => {
                    const accuracy = Math.round((concept.accuracy || 0) * 100);
                    return (
                      <div 
                        key={concept.id}
                        className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-foreground truncate">
                              {concept.name}
                            </h3>
                            <ConceptBadge status={concept.status || 'missing'} />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Progress 
                                value={accuracy} 
                                className={`h-2 ${
                                  concept.status === 'mastered' ? '[&>div]:bg-[#22C55E]' :
                                  concept.status === 'weak' ? '[&>div]:bg-[#F59E0B]' :
                                  '[&>div]:bg-[#EF4444]'
                                }`}
                              />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                              {accuracy}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
