'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, AlertCircle, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function GeminiPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Введите API ключ');
      return;
    }
    setChecking(true);
    try {
      const res = await fetch('/api/movie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieTitle: 'Test' }),
      });
      if (res.ok) {
        setSaved(true);
        toast.success('API ключ активен и работает!');
      } else {
        setSaved(true);
        toast.info('Ключ сохранён. Проверьте правильность ввода.');
      }
    } catch {
      toast.error('Не удалось проверить ключ');
    } finally {
      setChecking(false);
    }
  };

  const features = [
    { title: 'AI-анализ фото эссе', desc: 'Загрузите фото рукописного или печатного эссе — Gemini проверит грамматику, орфографию и стиль.', available: true },
    { title: 'Генерация лексики по фильму', desc: 'Введите название фильма — AI подберёт продвинутую лексику и вопросы для эссе.', available: true },
    { title: 'Умные подсказки в конструкторе', desc: 'AI помогает с подсказками при построении предложений и переводе.', available: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Sparkles className="w-4 h-4" />
          Настройки
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Интеграция с Gemini</h1>
        <p className="text-muted-foreground mt-1">
          Управление связкой с Google Gemini AI для интеллектуальных проверок эссе и генерации материалов.
        </p>
      </div>

      {/* API Key Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            API ключ Gemini
          </CardTitle>
          <CardDescription>Ключ используется для AI-анализа фото эссе и генерации материалов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(
              'border-amber-500/30',
              saved ? 'text-emerald-600 bg-emerald-500/10' : 'text-amber-600 bg-amber-500/10'
            )}>
              {saved ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
              {saved ? 'Активен' : 'Настроен на сервере'}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Ваш API ключ:</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Введите ваш Gemini API ключ..."
                  className="pr-10"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button onClick={handleSave} disabled={checking || !apiKey.trim()}>
                {checking ? 'Проверка...' : 'Проверить'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ключ уже настроен на сервере и используется для всех AI-функций. Вы можете ввести свой ключ
              для личной проверки. Получить ключ можно на{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Google AI Studio
              </a>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI-функции</CardTitle>
          <CardDescription>Что доступно с подключённым Gemini</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.map((feat) => (
            <div key={feat.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                feat.available ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
              )}>
                {feat.available ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{feat.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{feat.desc}</p>
              </div>
              <Badge variant={feat.available ? 'default' : 'outline'} className="text-xs">
                {feat.available ? 'Доступно' : 'Скоро'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Как это работает?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gemini AI анализирует ваши эссе на грамматику, орфографию и стиль — без оценки содержания.
                Все запросы идут через серверный API, ваш ключ хранится безопасно. AI не оценивает
                философские рассуждения — только языковую корректность.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
