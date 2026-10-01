'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { GraduationCap, BookOpen, TrendingUp, FileText, Bug, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Интерактивные уроки',
      description: 'Изучайте грамматические правила SVOMPT, ASI и QUASI через конструктор предложений и тесты.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Прогресс',
      description: 'Отслеживайте mastery грамматики с наглядными графиками прогресса по всем темам.',
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
    },
    {
      icon: Bug,
      title: 'Журнал ошибок',
      description: 'Просматривайте свои ошибки, изучайте правильные правила и пересдавайте до полного усвоения.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: FileText,
      title: 'Кино-рецензии',
      description: 'Пишите структурированные эссе по фильмам с шаблонами и обязательным списком лексики.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-500/5 via-background to-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">G-ENGLISH</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {loading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <Button onClick={() => router.push('/dashboard')}>
                В личный кабинет <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push('/auth')}>
                  Войти
                </Button>
                <Button onClick={() => router.push('/auth')}>
                  Начать
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          Изучайте грамматику английского языка легко
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6 animate-slide-up">
          Освойте грамматику английского с
          <span className="block bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            интерактивными структурированными уроками
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up text-balance">
          Стройте правильные предложения по правилу SVOMPT, отслеживайте ошибки и пишите кино-рецензии — всё на одной красивой платформе.
        </p>
        <div className="flex items-center justify-center gap-4 animate-slide-up">
          <Button
            size="lg"
            className="h-12 px-8 text-base"
            onClick={() => router.push(user ? '/dashboard' : '/auth')}
          >
            {user ? 'В личный кабинет' : 'Начать обучение бесплатно'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <Card
              key={feat.title}
              className="border-border/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center mb-4`}>
                  <feat.icon className={`w-6 h-6 ${feat.color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-12 text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4 text-balance">
              Готовы улучшить свой английский?
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Присоединяйтесь к G-ENGLISH сегодня и начните строить идеальные предложения на английском.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-8 text-base bg-white text-amber-600 hover:bg-white/90"
              onClick={() => router.push('/auth')}
            >
              Начать сейчас
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © 2026 G-ENGLISH. Платформа для изучения английского языка.
      </footer>
    </div>
  );
}
