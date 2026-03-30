'use client';

import type { Concept } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ConceptBadge } from './concept-badge';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ConceptCardProps {
  concept: Concept;
  showAction?: boolean;
}

export function ConceptCard({ concept, showAction = true }: ConceptCardProps) {
  const accuracy = concept.accuracy || 0;
  const accuracyPercent = Math.round(accuracy * 100);

  return (
    <Card className="pixel-panel group transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base font-semibold text-foreground">
              {concept.name}
            </CardTitle>
            <p className="text-xs font-medium text-muted-foreground/90">
              {concept.subject}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {concept.chapter}
              {concept.module ? ` · ${concept.module}` : ''}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {concept.description}
            </p>
          </div>
          <ConceptBadge status={concept.status || 'missing'} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Accuracy</span>
            <span className="font-medium text-foreground">{accuracyPercent}%</span>
          </div>
          <Progress 
            value={accuracyPercent} 
            className="h-2"
          />
        </div>
        {showAction && (
          <Link href={`/practice?subject=${encodeURIComponent(concept.subject)}&chapter=${encodeURIComponent(concept.chapter)}&concept=${concept.id}&returnTo=knowledge-map`}>
            <Button variant="ghost" size="sm" className="w-full gap-2 text-primary">
              <BookOpen className="h-4 w-4" />
              Practice This Concept
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
