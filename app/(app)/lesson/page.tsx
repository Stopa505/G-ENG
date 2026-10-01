'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Topic, ErrorLogRow } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  sentenceConstructorQuestions,
  multipleChoiceQuestions,
  SVOMPT_TABLE,
  SentenceConstructorQuestion,
  MultipleChoiceQuestion,
} from '@/lib/lesson-data';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Lightbulb,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function LessonPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'theory' | 'constructor' | 'quiz'>('theory');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <BookOpen className="w-4 h-4" />
          Уроки грамматики английского
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Интерактивные уроки</h1>
        <p className="text-muted-foreground mt-1">
          Изучите правило SVOMPT, практикуйте построение предложений и проверьте свои знания.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="theory">Теория</TabsTrigger>
          <TabsTrigger value="constructor">Конструктор</TabsTrigger>
          <TabsTrigger value="quiz">Тест</TabsTrigger>
        </TabsList>

        <TabsContent value="theory" className="mt-6">
          <TheorySection />
        </TabsContent>

        <TabsContent value="constructor" className="mt-6">
          <SentenceConstructorSection userId={user?.id} />
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <MultipleChoiceSection userId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Theory Section ── */

function TheorySection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-xl">The SVOMPT Rule</CardTitle>
              <CardDescription>The standard English word order for declarative sentences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            English follows a strict word order. The SVOMPT rule defines the position of each element in a sentence:
            <strong className="text-foreground"> Subject → Verb → Object → Manner → Place → Time</strong>.
            Getting this order right is essential for natural-sounding English.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Position</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Letter</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Example</th>
                </tr>
              </thead>
              <tbody>
                {SVOMPT_TABLE.map((row, i) => (
                  <tr
                    key={row.letter}
                    className="border-b border-border/40 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-mono">{i + 1}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                        {row.letter}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">{row.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{row.description}</td>
                    <td className="py-3 px-4">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{row.example}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm mb-1">Example sentence</p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <span className="font-bold">She</span> (S){' '}
                  <span className="font-bold">reads</span> (V){' '}
                  <span className="font-bold">a book</span> (O){' '}
                  <span className="font-bold">carefully</span> (M){' '}
                  <span className="font-bold">in the library</span> (P){' '}
                  <span className="font-bold">every morning</span> (T).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ASI — Yes/No Questions</CardTitle>
            <CardDescription>Auxiliary + Subject + Infinitive</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              To form yes/no questions, invert the auxiliary verb and the subject:
            </p>
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm"><span className="font-bold text-primary">Are</span> you coming tonight?</p>
              <p className="text-sm"><span className="font-bold text-primary">Did</span> she finish the project?</p>
              <p className="text-sm"><span className="font-bold text-primary">Does</span> he like coffee?</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">QUASI — WH-Questions</CardTitle>
            <CardDescription>Question word + Auxiliary + Subject + Infinitive</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              WH-questions start with a question word, followed by ASI order:
            </p>
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm"><span className="font-bold text-primary">Where are</span> you going?</p>
              <p className="text-sm"><span className="font-bold text-primary">Why did</span> she leave?</p>
              <p className="text-sm"><span className="font-bold text-primary">What does</span> he want?</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── Sentence Constructor ── */

function SentenceConstructorSection({ userId }: { userId?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showRule, setShowRule] = useState(false);

  const question = sentenceConstructorQuestions[currentIndex];

  const loadQuestion = (index: number) => {
    const q = sentenceConstructorQuestions[index];
    setSelectedWords([]);
    setAvailableWords([...q.words].sort(() => Math.random() - 0.5));
    setResult(null);
    setShowRule(false);
  };

  if (availableWords.length === 0 && !result) {
    setAvailableWords([...question.words].sort(() => Math.random() - 0.5));
  }

  const selectWord = (word: string) => {
    if (result) return;
    const idx = availableWords.indexOf(word);
    if (idx === -1) return;
    const newAvailable = [...availableWords];
    newAvailable.splice(idx, 1);
    setAvailableWords(newAvailable);
    setSelectedWords([...selectedWords, word]);
  };

  const deselectWord = (word: string, index: number) => {
    if (result) return;
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  };

  const checkAnswer = async () => {
    const isCorrect = selectedWords.join(' ') === question.correctOrder.join(' ');
    setResult(isCorrect ? 'correct' : 'incorrect');
    setShowRule(true);

    if (userId) {
      await updateProgress(userId, question.topic, isCorrect);
      if (!isCorrect) {
        await logError({
          user_id: userId,
          question: question.instruction + ' — ' + question.words.join(' / '),
          user_answer: selectedWords.join(' '),
          correct_answer: question.correctOrder.join(' '),
          rule: question.rule,
          topic: question.topic,
        });
      }
    }

    if (isCorrect) {
      toast.success('Правильно! Отличная работа.');
    } else {
      toast.error('Не совсем — проверьте правило ниже.');
    }
  };

  const nextQuestion = () => {
    if (currentIndex < sentenceConstructorQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      loadQuestion(currentIndex + 1);
    } else {
      toast.success('Вы прошли все упражнения конструктора!');
      setCurrentIndex(0);
      loadQuestion(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Конструктор предложений</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Вопрос {currentIndex + 1} из {sentenceConstructorQuestions.length}
          </p>
        </div>
        <Badge variant="outline">{question.topic}</Badge>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / sentenceConstructorQuestions.length) * 100}%` }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.instruction}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Volume2 className="w-3 h-3" />
            {question.translation}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={cn(
            'min-h-20 rounded-lg border-2 border-dashed p-4 flex flex-wrap gap-2 transition-colors',
            result === 'correct' ? 'border-emerald-300 bg-emerald-500/10' :
            result === 'incorrect' ? 'border-red-300 bg-red-500/10' :
            'border-border bg-muted/30'
          )}>
            {selectedWords.length === 0 && (
              <span className="text-sm text-muted-foreground self-center mx-auto">
                Нажимайте на слова ниже, чтобы составить предложение...
              </span>
            )}
            {selectedWords.map((word, i) => (
              <button
                key={i}
                onClick={() => deselectWord(word, i)}
                disabled={!!result}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors animate-scale-in"
              >
                {word}
              </button>
            ))}
          </div>

          <div className="min-h-16 flex flex-wrap gap-2">
            {availableWords.map((word, i) => (
              <button
                key={i}
                onClick={() => selectWord(word)}
                disabled={!!result}
                className="px-3 py-2 bg-card border-2 border-border rounded-lg text-sm font-medium hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50"
              >
                {word}
              </button>
            ))}
            {availableWords.length === 0 && !result && (
              <span className="text-sm text-muted-foreground self-center">
                Все слова размещены — проверьте ответ!
              </span>
            )}
          </div>

          {result && (
            <div className={cn(
              'p-4 rounded-lg animate-slide-up',
              result === 'correct' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
            )}>
              <div className="flex items-center gap-2 mb-2">
                {result === 'correct' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={cn(
                  'font-semibold',
                  result === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {result === 'correct' ? 'Правильно!' : 'Неправильно'}
                </span>
              </div>
              {result === 'incorrect' && (
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  <span className="line-through opacity-60">{selectedWords.join(' ')}</span>
                  <br />
                  <span className="font-semibold">{question.correctOrder.join(' ')}</span>
                </p>
              )}
              <div className="flex items-start gap-2 mt-2">
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80">{question.rule}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            {!result ? (
              <Button
                onClick={checkAnswer}
                disabled={selectedWords.length !== question.correctOrder.length}
                size="lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Проверить ответ
              </Button>
            ) : (
              <Button onClick={nextQuestion} size="lg" variant={result === 'correct' ? 'default' : 'secondary'}>
                {currentIndex < sentenceConstructorQuestions.length - 1 ? (
                  <><ArrowRight className="w-4 h-4 ml-2" /> Следующий</>
                ) : (
                  <><RotateCcw className="w-4 h-4 mr-2" /> Заново</>
                )}
              </Button>
            )}
            {result && (
              <Button variant="ghost" onClick={() => loadQuestion(currentIndex)}>
                <RotateCcw className="w-4 h-4 mr-2" /> Попробовать снова
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Multiple Choice Quiz ── */

function MultipleChoiceSection({ userId }: { userId?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const question = multipleChoiceQuestions[currentIndex];

  const selectOption = (index: number) => {
    if (result) return;
    setSelected(index);
    const isCorrect = index === question.correctIndex;
    setResult(isCorrect ? 'correct' : 'incorrect');

    if (userId) {
      updateProgress(userId, question.topic, isCorrect);
      if (!isCorrect) {
        logError({
          user_id: userId,
          question: question.question,
          user_answer: question.options[index],
          correct_answer: question.options[question.correctIndex],
          rule: question.rule,
          topic: question.topic,
        });
      }
    }

    if (isCorrect) {
      toast.success('Правильно!');
    } else {
      toast.error('Неверный ответ — смотрите объяснение ниже.');
    }
  };

  const next = () => {
    if (currentIndex < multipleChoiceQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setResult(null);
    } else {
      toast.success('Вы прошли все тестовые вопросы!');
      setCurrentIndex(0);
      setSelected(null);
      setResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Тест с выбором ответа</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Вопрос {currentIndex + 1} из {multipleChoiceQuestions.length}
          </p>
        </div>
        <Badge variant="outline">{question.topic}</Badge>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / multipleChoiceQuestions.length) * 100}%` }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.question}</CardTitle>
          <CardDescription>{question.translation}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option, i) => {
            const isCorrect = i === question.correctIndex;
            const isSelected = i === selected;

            return (
              <button
                key={i}
                onClick={() => selectOption(i)}
                disabled={!!result}
                className={cn(
                  'w-full p-4 rounded-lg border-2 text-left text-sm font-medium transition-all flex items-center justify-between',
                  !result && 'hover:border-primary hover:bg-primary/5',
                  result && isCorrect && 'border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                  result && isSelected && !isCorrect && 'border-red-400 bg-red-500/10 text-red-700 dark:text-red-300',
                  result && !isCorrect && !isSelected && 'border-border opacity-60'
                )}
              >
                <span className="flex items-center gap-3">
                  <span className={cn(
                    'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0',
                    !result && 'bg-muted text-muted-foreground',
                    result && isCorrect && 'bg-emerald-500 text-white',
                    result && isSelected && !isCorrect && 'bg-red-500 text-white',
                    result && !isCorrect && !isSelected && 'bg-muted text-muted-foreground'
                  )}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </span>
                {result && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {result && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}

          {result && (
            <div className={cn(
              'p-4 rounded-lg animate-slide-up',
              result === 'correct' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
            )}>
              <div className="flex items-center gap-2 mb-2">
                {result === 'correct' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={cn(
                  'font-semibold',
                  result === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {result === 'correct' ? 'Правильно!' : 'Неправильно'}
                </span>
              </div>
              {result === 'incorrect' && (
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  Ваш ответ: <span className="line-through opacity-60">{question.options[selected!]}</span>
                  <br />
                  Правильно: <span className="font-semibold">{question.options[question.correctIndex]}</span>
                </p>
              )}
              <div className="flex items-start gap-2 mt-2">
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80">{question.rule}</p>
              </div>
            </div>
          )}

          {result && (
            <Button onClick={next} size="lg" className="w-full">
              {currentIndex < multipleChoiceQuestions.length - 1 ? (
                <><ArrowRight className="w-4 h-4 ml-2" /> Следующий вопрос</>
              ) : (
                <><RotateCcw className="w-4 h-4 mr-2" /> Начать заново</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Helper functions ── */

async function updateProgress(userId: string, topic: Topic, isCorrect: boolean) {
  const { data: existing } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic', topic)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('progress')
      .update({
        score: (existing as any).score + (isCorrect ? 10 : 0),
        total_attempts: (existing as any).total_attempts + 1,
        correct_attempts: (existing as any).correct_attempts + (isCorrect ? 1 : 0),
        updated_at: new Date().toISOString(),
      })
      .eq('id', (existing as any).id);
  } else {
    await supabase.from('progress').insert({
      user_id: userId,
      topic,
      score: isCorrect ? 10 : 0,
      total_attempts: 1,
      correct_attempts: isCorrect ? 1 : 0,
    });
  }
}

async function logError(err: Omit<ErrorLogRow, 'id' | 'created_at'>) {
  await supabase.from('error_log').insert({
    user_id: err.user_id,
    question: err.question,
    user_answer: err.user_answer,
    correct_answer: err.correct_answer,
    rule: err.rule,
    topic: err.topic,
  });
}
