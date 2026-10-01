'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { CustomTimePicker } from '@/components/custom-time-picker';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase, ProgressRow, StudySession } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Bug, Film, TrendingUp, ArrowRight, CheckCircle2, Flame, Clock, Calendar } from 'lucide-react';
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
  const [essayCount, setEssayCount] = useState(0);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [todaySession, setTodaySession] = useState<StudySession | null>(null);
  const [weekMinutes, setWeekMinutes] = useState(0);
  const [streakActive, setStreakActive] = useState(false);
  const [studyTimeValue, setStudyTimeValue] = useState(
    profile?.study_time_value ??
      (typeof window !== 'undefined' ? localStorage.getItem('g-english-study-time') : null) ??
      '07:30'
  );
  const [savingTime, setSavingTime] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [progRes, essayRes, sessRes] = await Promise.all([
      supabase.from('progress').select('*').eq('user_id', user.id),
      supabase.from('film_essays').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('study_sessions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
    ]);

    setProgress(progRes.data as ProgressRow[] ?? []);
    setEssayCount(essayRes.count ?? 0);
    const sessData = (sessRes.data as StudySession[]) ?? [];
    setSessions(sessData);

    const today = new Date().toISOString().split('T')[0];
    const todaySess = sessData.find((s) => s.date === today);
    setTodaySession(todaySess ?? null);
    setStreakActive(todaySess?.constructor_done ?? false);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekMins = sessData
      .filter((s) => new Date(s.date) >= weekStart)
      .reduce((sum, s) => sum + s.minutes, 0);
    setWeekMinutes(weekMins);

    setStudyTimeValue(profile?.study_time_value ?? '07:30');
    setLoading(false);
  }, [user, profile]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const handleTimeChange = (value: string) => {
    setStudyTimeValue(value);
    try { localStorage.setItem('g-english-study-time', value); } catch {}
    if (saveTimer.current) clearTimeout(saveTimer.current);
    // debounce: wheel/swipe fire many events, save once user stops
    saveTimer.current = setTimeout(async () => {
      if (!user) return;
      setSavingTime(true);
      const { error } = await supabase
        .from('profiles')
        .update({ study_time_value: value })
        .eq('id', user.id);
      if (error) {
        toast.error('Не удалось сохранить время');
      } else {
        toast.success(`Время обучения: ${value}`, { id: 'study-time' });
        await refreshProfile();
      }
      setSavingTime(false);
    }, 700);
  };

  const chartData = TOPICS.map((t) => {
    const p = progress.find((p) => p.topic === t.id);
    const accuracy = p && p.total_attempts > 0
      ? Math.round((p.correct_attempts / p.total_attempts) * 100)
      : 0;
    return { name: t.name, score: p?.score ?? 0, accuracy, color: t.color };
  });

  const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
  const totalAttempts = progress.reduce((sum, p) => sum + p.total_attempts, 0);
  const totalCorrect = progress.reduce((sum, p) => sum + p.correct_attempts, 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const currentStreak = profile?.current_streak ?? 0;

  const stats = [
    { label: 'Общий балл', value: totalScore, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Точность', value: `${overallAccuracy}%`, icon: CheckCircle2, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: 'Кино-рецензии', value: essayCount, icon: Film, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Стрик', value: `${currentStreak} дн.`, icon: Flame, color: streakActive ? 'text-red-500' : 'text-muted-foreground', bg: streakActive ? 'bg-red-500/10' : 'bg-muted' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {streakActive ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <Flame className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-sm font-bold text-red-500">Стрик активен!</p>
                <p className="text-xs text-muted-foreground">{currentStreak} дней подряд</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border/40">
              <Flame className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold text-muted-foreground">Стрик неактивен</p>
                <p className="text-xs text-muted-foreground">Пройдите конструктор</p>
              </div>
            </div>
          )}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              С возвращением{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-1">Отслеживайте прогресс и продолжайте обучение.</p>
          </div>
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
                  <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-sm fill-muted-foreground" />
                  <YAxis tickLine={false} axisLine={false} className="text-sm fill-muted-foreground" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
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
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/40">
              {TOPICS.map((t) => {
                const p = progress.find((p) => p.topic === t.id);
                return (
                  <div key={t.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                    <span className="text-sm font-medium">{t.name}</span>
                    <Badge variant="secondary" className="text-xs">{p ? `${p.score} очк.` : 'Не начато'}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time picker + Study journal */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Время обучения
              </CardTitle>
              <CardDescription>Выберите удобное время для занятий</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <CustomTimePicker value={studyTimeValue} onChange={handleTimeChange} />
                <p className="text-center text-xs text-muted-foreground h-4">
                  {savingTime ? 'Сохранение…' : 'Колёсико мыши, свайп или стрелки ▲ / ▼'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Время сохраняется автоматически. Напоминания будут приходить в указанное время.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Журнал занятий
              </CardTitle>
              <CardDescription>Время, уделённое учёбе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Сегодня</p>
                    <p className="text-xs text-muted-foreground">
                      {todaySession?.constructor_done ? 'Конструктор пройден' : 'Не начат'}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">{todaySession?.minutes ?? 0}<span className="text-sm text-muted-foreground ml-1">мин</span></span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">За неделю</p>
                    <p className="text-xs text-muted-foreground">{sessions.length} занятий</p>
                  </div>
                </div>
                <span className="text-lg font-bold">{weekMinutes}<span className="text-sm text-muted-foreground ml-1">мин</span></span>
              </div>
            </CardContent>
          </Card>
        </div>
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
                <p className="text-sm text-muted-foreground">Архив ошибок</p>
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
