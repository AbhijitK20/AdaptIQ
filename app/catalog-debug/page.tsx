'use client'

import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLearnerProfile } from '@/hooks/use-learner-profile'
import { useLiveProgram } from '@/hooks/use-live-program'

export default function CatalogDebugPage() {
  const { activeProfileId } = useLearnerProfile()
  const { program } = useLiveProgram(activeProfileId)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Catalog Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Profile:</span> {program.profile.label} ({program.profile.id})</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Subjects: {program.subjects.length}</Badge>
              <Badge variant="outline">Chapters: {program.chapters.length}</Badge>
              <Badge variant="outline">Modules: {program.modules.length}</Badge>
              <Badge variant="outline">Concepts: {program.concepts.length}</Badge>
              <Badge variant="outline">Questions: {program.questions.length}</Badge>
              <Badge variant="outline">Quizzes: {program.quizzes.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subjects</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {program.subjects.slice(0, 30).map((subject) => (
              <div key={subject.id} className="rounded border border-border p-2">
                <p className="font-medium">{subject.name}</p>
                <p className="text-muted-foreground">{subject.id}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Chapters (first 30)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {program.chapters.slice(0, 30).map((chapter) => (
              <div key={chapter.id} className="rounded border border-border p-2">
                <p className="font-medium">{chapter.name}</p>
                <p className="text-muted-foreground">{chapter.id}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Modules (first 30)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {program.modules.slice(0, 30).map((module) => (
              <div key={module.id} className="rounded border border-border p-2">
                <p className="font-medium">{module.name}</p>
                <p className="text-muted-foreground">{module.id}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Concepts (first 20)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {program.concepts.slice(0, 20).map((concept) => (
              <div key={concept.id} className="rounded border border-border p-2">
                <p className="font-medium">{concept.name}</p>
                <p className="text-muted-foreground">{concept.chapter} · {concept.module}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Questions (first 10)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {program.questions.slice(0, 10).map((question) => (
              <div key={question.id} className="rounded border border-border p-2">
                <p className="font-medium">{question.questionText}</p>
                <p className="text-muted-foreground">Answer: {question.correctAnswer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
