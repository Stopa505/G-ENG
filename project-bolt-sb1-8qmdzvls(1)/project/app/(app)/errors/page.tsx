'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, ErrorLogRow, Topic } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bug,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RotateCcw,
  Trash2,
  Loader2,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ErrorsPage() {
  const { user } = useAuth();
  const [errors, setErrors] = useState<ErrorLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryAnswer, setRetryAnswer] = useState<string | null>(null);
  const [retryResult, setRetryResult] = useState<'correct' | 'incorrect' | null>(null);

  const fetchErrors = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('error_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setErrors((data as ErrorLogRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  const startRetry = (err: ErrorLogRow) => {
    setRetryingId(err.id);
    setRetryAnswer(null);
    setRetryResult(null);
  };

  const cancelRetry = () => {
    setRetryingId(null);
    setRetryAnswer(null);
    setRetryResult(null);
  };

  const checkRetry = async (err: ErrorLogRow) => {
    if (retryAnswer === null) return;
    const isCorrect = retryAnswer === err.correct_answer;

    if (isCorrect) {
      await supabase.from('error_log').delete().eq('id', err.id);
      const { data: prog } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('topic', err.topic)
        .maybeSingle();

      if (prog) {
        await supabase
          .from('progress')
          .update({
            score: (prog as any).score + 5,
            total_attempts: (prog as any).total_attempts + 1,
            correct_attempts: (prog as any).correct_attempts + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', (prog as any).id);
      }

      toast.success('Правильно! Ошибка удалена из журнала.');
      setErrors((prev) => prev.filter((e) => e.id !== err.id));
      cancelRetry();
    } else {
      setRetryResult('incorrect');
      const { data: prog } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('topic', err.topic)
        .maybeSingle();

      if (prog) {
        await supabase
          .from('progress')
          .update({
            total_attempts: (prog as any).total_attempts + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', (prog as any).id);
      }
      toast.error('Всё ещё неправильно — изучите правило и попробуйте снова.');
    }
  };

  const deleteError = async (id: string) => {
    await supabase.from('error_log').delete().eq('id', id);
    setErrors((prev) => prev.filter((e) => e.id !== id));
    toast.success('Ошибка удалена');
  };

  const topicColor: Record<Topic, string> = {
    SVOMPT: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    ASI: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    QUASI: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Bug className="w-4 h-4" />
          Журнал ошибок
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Мои ошибки</h1>
        <p className="text-muted-foreground mt-1">
          Просматривайте свои ошибки, изучайте правильное правило и пересдавайте.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : errors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Ошибок пока нет!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Пройдите несколько уроков и тестов — ваши неверные ответы появятся здесь, чтобы вы могли извлечь из них урок.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {errors.length} {errors.length === 1 ? 'ошибка' : 'ошибок'} к проверке
            </p>
            <Badge variant="outline">{errors.length} в очереди</Badge>
          </div>

          {errors.map((err, i) => (
            <Card
              key={err.id}
              className="animate-slide-up overflow-hidden"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn('text-xs', topicColor[err.topic])}>
                        {err.topic}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(err.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-3">{err.question}</p>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">Ваш ответ: </span>
                          <span className="text-sm line-through text-red-700 dark:text-red-300">{err.user_answer}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Правильно: </span>
                          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{err.correct_answer}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-300">{err.rule}</p>
                    </div>

                    {retryingId === err.id ? (
                      <div className="mt-4 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                        <p className="text-sm font-semibold mb-3">
                          Пересдача: выберите правильный ответ
                        </p>
                        <div className="space-y-2">
                          {generateOptions(err.correct_answer, err.user_answer).map((option) => (
                            <button
                              key={option}
                              onClick={() => !retryResult && setRetryAnswer(option)}
                              disabled={!!retryResult}
                              className={cn(
                                'w-full p-3 rounded-lg border-2 text-left text-sm font-medium transition-all',
                                !retryResult && 'hover:border-primary',
                                retryAnswer === option && !retryResult && 'border-primary bg-primary/10',
                                retryResult && option === err.correct_answer && 'border-emerald-400 bg-emerald-500/10',
                                retryResult && retryAnswer === option && option !== err.correct_answer && 'border-red-400 bg-red-500/10',
                                retryResult && option !== err.correct_answer && option !== retryAnswer && 'border-border opacity-50'
                              )}
                            >
                              {option}
                              {retryResult && option === err.correct_answer && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 inline ml-2" />
                              )}
                              {retryResult && retryAnswer === option && option !== err.correct_answer && (
                                <XCircle className="w-4 h-4 text-red-500 inline ml-2" />
                              )}
                            </button>
                          ))}
                        </div>

                        {retryResult === 'incorrect' && (
                          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-red-700 dark:text-red-300">
                              Всё ещё неправильно. Правильный ответ: <span className="font-bold">{err.correct_answer}</span>
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => checkRetry(err)}
                            disabled={!retryAnswer || !!retryResult}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Проверить
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelRetry}>
                            Отмена
                          </Button>
                          {retryResult === 'incorrect' && (
                            <Button size="sm" variant="outline" onClick={() => { setRetryResult(null); setRetryAnswer(null); }}>
                              <RotateCcw className="w-3 h-3 mr-1" /> Попробовать снова
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" variant="default" onClick={() => startRetry(err)}>
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Пересдать
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteError(err.id)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function generateOptions(correct: string, wrong: string): string[] {
  const options = new Set<string>([correct, wrong]);

  const correctWords = correct.split(' ');
  if (correctWords.length > 2) {
    const variant1 = [...correctWords].reverse().join(' ');
    const variant2 = [correctWords[0], ...correctWords.slice(2), correctWords[1]].join(' ');
    options.add(variant1);
    options.add(variant2);
  }

  const arr = Array.from(options);
  while (arr.length < 4) {
    arr.push('— —');
  }

  return arr.slice(0, 4).sort(() => Math.random() - 0.5);
}
