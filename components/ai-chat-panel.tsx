'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Question, Concept } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Brain, Send, Sparkles, User, BookOpen, HelpCircle, Lightbulb } from 'lucide-react';
import { reflectWithHindsight, trackHindsightEvent } from '@/lib/hindsight/client';

interface AIChatPanelProps {
  currentQuestion?: Question | null;
  currentConcept?: Concept | null;
  isAnswerIncorrect?: boolean;
  userId: string;
  profileId: string;
}

const quickActions = [
  { label: 'Explain this concept', icon: BookOpen },
  { label: 'Why did I get this wrong?', icon: HelpCircle },
  { label: 'Give me a hint', icon: Lightbulb },
];

function buildContextualReply(
  userInput: string,
  currentQuestion?: Question | null,
  currentConcept?: Concept | null,
) {
  const normalizedInput = userInput.toLowerCase();
  const subject = currentConcept?.subject ?? 'this subject';
  const chapter = currentConcept?.chapter ?? 'this chapter';
  const conceptName = currentConcept?.name ?? 'this concept';
  const questionText = currentQuestion?.questionText ?? '';
  const questionExplanation = currentQuestion?.explanation ?? '';
  const isHindiContext = subject.toLowerCase().includes('hindi');

  const asksWhyWrong = normalizedInput.includes('why') || normalizedInput.includes('wrong') || normalizedInput.includes('mistake');
  const asksHint = normalizedInput.includes('hint');
  const asksExplain = normalizedInput.includes('explain') || normalizedInput.includes('concept');

  if (isHindiContext) {
    if (asksWhyWrong) {
      return `यह प्रश्न ${subject} (${chapter}) के "${conceptName}" से जुड़ा है, Physics से नहीं। आपने शायद प्रश्न की मुख्य मांग पर ध्यान नहीं दिया। सही सोच यह है: ${questionExplanation || 'पहले प्रश्न का मुख्य भाव पहचानें, फिर विकल्पों में सबसे सटीक उत्तर चुनें।'}`
    }
    if (asksHint) {
      return `Hint (${subject}): पहले प्रश्न में मुख्य शब्द पहचानिए, फिर 2 गलत विकल्प हटाइए। अंत में वही विकल्प चुनिए जो "${conceptName}" और प्रसंग (${chapter}) दोनों से सबसे अधिक मेल खाता हो।`
    }
    return `यह ${subject} का प्रश्न है। "${conceptName}" को सरल तरीके से समझें: प्रश्न के प्रसंग (${chapter}) से मुख्य विचार निकालें, फिर उसी के आधार पर उत्तर चुनें।${questionText ? `\n\nQuestion focus: "${questionText}"` : ''}`
  }

  if (asksWhyWrong) {
    return `This is a ${subject} question from "${chapter}" (concept: ${conceptName}), not Physics. You likely missed the core intent of the question. Focus on what is being asked first, then validate your choice against the concept. ${questionExplanation || ''}`.trim()
  }

  if (asksHint) {
    return `Hint (${subject}): identify the key term in the question, eliminate two clearly wrong options, and choose the option that best matches "${conceptName}" in "${chapter}".`
  }

  if (asksExplain) {
    return `Sure — this is about "${conceptName}" in ${subject} (${chapter}).\n\nSimple approach:\n1) identify the core idea,\n2) connect it to the question,\n3) choose the option that best matches the concept.\n\n${questionText ? `Current question: "${questionText}"` : ''}`
  }

  return `I can help with this ${subject} topic (${chapter}, ${conceptName}). Ask me to explain, give a hint, or analyze why the previous answer was incorrect.`;
}

export function AIChatPanel({
  currentQuestion,
  currentConcept,
  isAnswerIncorrect,
  userId,
  profileId,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI study companion. I can help explain concepts, analyze your mistakes, and suggest what to study next. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  // Add context-aware message when answer is incorrect
  useEffect(() => {
    if (isAnswerIncorrect && currentQuestion) {
      const diagnosisMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I noticed you had trouble with that question about "${currentQuestion.questionText.substring(0, 50)}...". Would you like me to explain the concept in more detail, or would you prefer a different approach to understanding this topic?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, diagnosisMessage]);
    }
  }, [isAnswerIncorrect, currentQuestion]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const baseReply = buildContextualReply(userMessage.content, currentQuestion, currentConcept);

    const hindsight = await reflectWithHindsight({
      userId,
      profileId,
      query: userMessage.content,
      subject: currentConcept?.subject,
    });

    const insightText =
      typeof hindsight?.insight === 'string' && hindsight.insight.trim().length > 0
        ? hindsight.insight.trim()
        : null;

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: insightText ? `${baseReply}\n\nMemory insight: ${insightText}` : baseReply,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);

    void trackHindsightEvent({
      eventType: 'concept_interaction',
      userId,
      profileId,
      subject: currentConcept?.subject,
      chapter: currentConcept?.chapter,
      conceptId: currentConcept?.id,
      conceptName: currentConcept?.name,
      metadata: {
        action: 'chat-message',
        prompt: userMessage.content,
      },
    });
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <Card className="pixel-panel flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">AI Study Companion</CardTitle>
            <p className="text-xs text-muted-foreground">Powered by AI</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        {/* Messages */}
        <ScrollArea className="min-h-0 flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={cn(
                    message.role === 'assistant' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {message.role === 'assistant' ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'rounded-lg px-4 py-3 text-sm max-w-[80%]',
                    message.role === 'assistant'
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  <p className="leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="border-t border-border px-4 py-3">
          <p className="mb-2 text-xs text-muted-foreground">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => handleQuickAction(action.label)}
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
