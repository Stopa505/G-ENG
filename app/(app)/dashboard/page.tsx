'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase, ProgressRow, StudyTime } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Bug, Film, Sun, Moon, TrendingUp, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TOPICS } from '@/lib/lesson-data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [essayCount, setEssayCount] = useState(0);
  const [studyTime, setStudyTime] = useState<StudyTime>(profile?.study_time ?? 'morning');
  const [savingTime, setSavingTime] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [progRes, errRes, essayRes] = await Promise.all([
      supabase.from('progress').select('*').eq('user_id', user.id),
      supabase.from('error_log').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('film_essays').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    setProgress(progRes.data as ProgressRow[] ?? []);
    setErrorCount(errRes.count ?? 0);
    setEssayCount(essayRes.count ?? 0);
    setStudyTime(profile?.study_time ?? 'morning');
    setLoading(false);
  }, [user, profile]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleStudyTimeChange = async (time: StudyTime) => {
    setStudyTime(time);
    setSavingTime(true);
    const { error } = await supabase
      .from('profiles')
      .update({ study_time: time })
      .eq('id', user!.id);
    if (error) {
      toast.error('Не удалось сохранить время обучения');
    } else {
      toast.success('Время обучения обновлено');
      await refreshProfile();
    }
    setSavingTime(false);
  };

  const chartData = TOPICS.map((t) => {
    const p = progress.find((p) => p.topic === t.id);
    const accuracy = p && p.total_attempts > 0
      ? Math.round((p.correct_attempts / p.total_attempts) * 100)
      : 0;
    return {
      name: t.name,
      score: p?.score ?? 0,
      accuracy,
      color: t.color,
    };
  });

  const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
  const totalAttempts = progress.reduce((sum, p) => sum + p.total_attempts, 0);
  const totalCorrect = progress.reduce((sum, p) => sum + p.correct_attempts, 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const stats = [
    { label: 'Общий балл', value: totalScore, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Точность', value: `${overallAccuracy}%`, icon: CheckCircle2, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: 'Ошибки', value: errorCount, icon: Bug, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Кино-рецензии', value: essayCount, icon: Film, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            С возвращением{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">Отслеживайте прогресс и продолжайте обучение.</p>
        </div>
        <Button onClick={() => router.push('/lesson')} size="lg">
          <BookOpen className="w-4 h-4 mr-2" />
          Продолжить обучение
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.bg)}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
              </div>
              <div className="text-2xl font-bold">{loading ? '—' : stat.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress chart + Study time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Прогресс по грамматике</CardTitle>
            <CardDescription>Балл и точность по темам SVOMPT, ASI и QUASI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    className="text-sm fill-muted-foreground"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    className="text-sm fill-muted-foreground"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                    }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} name="Балл">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="accuracy" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} name="Точность %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Topic legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/40">
              {TOPICS.map((t) => {
                const p = progress.find((p) => p.topic === t.id);
                return (
                  <div key={t.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                    <span className="text-sm font-medium">{t.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {p ? `${p.score} очк.` : 'Не начато'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Study time selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Время обучения</CardTitle>
            <CardDescription>Когда вам удобнее заниматься?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => handleStudyTimeChange('morning')}
              disabled={savingTime}
              className={cn(
                'w-full p-4 rounded-lg border-2 text-left transition-all',
                studyTime === 'morning'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  studyTime === 'morning' ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'
                )}>
                  <Sun className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Утро</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> До колледжа · 07:30
                  </div>
                </div>
                {studyTime === 'morning' && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </div>
            </button>

            <button
              onClick={() => handleStudyTimeChange('evening')}
              disabled={savingTime}
              className={cn(
                'w-full p-4 rounded-lg border-2 text-left transition-all',
                studyTime === 'evening'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  studyTime === 'evening' ? 'bg-indigo-100 text-indigo-600' : 'bg-muted text-muted-foreground'
                )}>
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Вечер</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> После тренировки · 18:30
                  </div>
                </div>
                {studyTime === 'evening' && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">К урокам</h3>
                <p className="text-sm text-muted-foreground">Практика грамматики</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="absolute inset-0" onClick={() => router.push('/lesson')} />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Bug className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Мои ошибки</h3>
                <p className="text-sm text-muted-foreground">{errorCount} к проверке</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="absolute inset-0" onClick={() => router.push('/errors')} />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Film className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Кино-рецензии</h3>
                <p className="text-sm text-muted-foreground">Написать эссе</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="absolute inset-0" onClick={() => router.push('/films')} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
