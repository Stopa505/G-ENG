'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { GraduationCap, Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          toast.success('Аккаунт создан! Добро пожаловать в G-ENGLISH.');
          router.push('/dashboard');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          toast.success('С возвращением!');
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — branding */}
      <div className="flex-1 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">G-ENGLISH</span>
          </div>
          <ThemeSwitcher />
        </div>

        <div className="relative z-10 text-white max-w-md">
          <h1 className="text-3xl lg:text-5xl font-bold leading-tight mb-4">
            Освойте грамматику английского, предложение за предложением.
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Интерактивные уроки SVOMPT, отслеживание прогресса, анализ ошибок и кино-рецензии — всё в одном месте.
          </p>

          <div className="mt-8 space-y-3">
            {['Правила SVOMPT, ASI и QUASI', 'Отслеживание ошибок и пересдача', 'Шаблоны кино-рецензий'].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-white/90">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2026 G-ENGLISH. Платформа для изучения английского языка.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-background relative">
        <div className="absolute top-4 right-4 lg:hidden">
          <ThemeSwitcher />
        </div>
        <div className="w-full max-w-md">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </button>

          <Card className="border-border/60 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {mode === 'signin' ? 'С возвращением' : 'Создайте аккаунт'}
              </CardTitle>
              <CardDescription>
                {mode === 'signin'
                  ? 'Войдите, чтобы продолжить обучение'
                  : 'Начните изучать грамматику английского сегодня'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Электронная почта</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                {mode === 'signin' ? (
                  <span className="text-muted-foreground">
                    Нет аккаунта?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="font-semibold text-primary hover:underline"
                    >
                      Зарегистрироваться
                    </button>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Уже есть аккаунт?{' '}
                    <button
                      onClick={() => setMode('signin')}
                      className="font-semibold text-primary hover:underline"
                    >
                      Войти
                    </button>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
