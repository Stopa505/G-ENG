'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, FilmEssay } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Film, Save, Loader2, Trash2, Plus, Upload, ScanText, CheckCircle2, XCircle, Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OCRResult {
  grammarErrors: { error: string; correction: string; explanation: string }[];
  spellingErrors: { word: string; correction: string }[];
  styleSuggestions: string[];
  overallFeedback: string;
}

const ESSAY_BLOCKS = [
  { key: 'introduction', label: '1. Introduction', placeholder: 'Introduce the film, its director, and the main themes...' },
  { key: 'plot_summary', label: '2. Plot Summary', placeholder: 'Summarize the main events of the film...' },
  { key: 'character_analysis', label: '3. Character Analysis', placeholder: 'Analyze the main characters and their development...' },
  { key: 'theme_reflection', label: '4. Themes & Reflection', placeholder: 'Discuss the key themes and your personal reflection...' },
] as const;

export default function FilmsPage() {
  const { user } = useAuth();
  const [essays, setEssays] = useState<FilmEssay[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filmTitle, setFilmTitle] = useState('');
  const [blocks, setBlocks] = useState<Record<string, string>>({
    introduction: '', plot_summary: '', character_analysis: '', theme_reflection: '',
  });
  const [vocabChecked, setVocabChecked] = useState<string[]>([]);

  const fetchEssays = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('film_essays')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    const essaysData = (data as FilmEssay[]) ?? [];
    setEssays(essaysData);
    if (essaysData.length > 0) {
      loadEssay(essaysData[0]);
    } else {
      newEssay();
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEssays(); }, [fetchEssays]);

  const loadEssay = (essay: FilmEssay) => {
    setActiveId(essay.id);
    setFilmTitle(essay.film_title);
    setBlocks({
      introduction: essay.introduction,
      plot_summary: essay.plot_summary,
      character_analysis: essay.character_analysis,
      theme_reflection: essay.theme_reflection,
    });
    setVocabChecked(essay.vocabulary_checked ?? []);
    setOcrResult(null);
    setUploadedImage(null);
  };

  const newEssay = () => {
    setActiveId(null);
    setFilmTitle('');
    setBlocks({ introduction: '', plot_summary: '', character_analysis: '', theme_reflection: '' });
    setVocabChecked([]);
    setOcrResult(null);
    setUploadedImage(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл слишком большой (макс. 10 МБ)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setUploadedImage(base64);
      setOcrResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async () => {
    if (!uploadedImage) {
      toast.error('Сначала загрузите фото');
      return;
    }

    setAnalyzing(true);
    setOcrResult(null);

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadedImage }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Ошибка анализа');
      }

      const data: OCRResult = await res.json();
      setOcrResult(data);
      toast.success('Анализ завершён! Проверьте результаты ниже.');
    } catch (err: any) {
      toast.error(err.message || 'Не удалось проанализировать фото');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleVocab = (word: string) => {
    setVocabChecked((prev) => prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      film_title: filmTitle,
      introduction: blocks.introduction,
      plot_summary: blocks.plot_summary,
      character_analysis: blocks.character_analysis,
      theme_reflection: blocks.theme_reflection,
      vocabulary_checked: vocabChecked,
      updated_at: new Date().toISOString(),
    };

    if (activeId) {
      const { error } = await supabase.from('film_essays').update(payload).eq('id', activeId);
      if (error) toast.error('Не удалось сохранить');
      else { toast.success('Эссе сохранено'); fetchEssays(); }
    } else {
      const { data, error } = await supabase
        .from('film_essays')
        .insert({ ...payload, user_id: user.id })
        .select()
        .maybeSingle();
      if (error) toast.error('Не удалось создать эссе');
      else if (data) { toast.success('Эссе создано'); setActiveId((data as FilmEssay).id); fetchEssays(); }
    }
    setSaving(false);
  };

  const deleteEssay = async (id: string) => {
    await supabase.from('film_essays').delete().eq('id', id);
    setEssays((prev) => prev.filter((e) => e.id !== id));
    if (activeId === id) newEssay();
    toast.success('Эссе удалено');
  };

  const totalWords = Object.values(blocks).reduce((sum, text) => sum + text.trim().split(/\s+/).filter(Boolean).length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Film className="w-4 h-4" />
            Кино-рецензии
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Эссе по фильмам</h1>
          <p className="text-muted-foreground mt-1">
            Пишите структурированные рецензии и загружайте фото эссе для AI-анализа грамматики.
          </p>
        </div>
        <Button onClick={newEssay} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Новое эссе
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {essays.length > 0 && (
            <div className="lg:col-span-1 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Ваши эссе</h3>
              {essays.map((essay) => (
                <div
                  key={essay.id}
                  onClick={() => loadEssay(essay)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all cursor-pointer',
                    activeId === essay.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80 hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{essay.film_title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(essay.updated_at).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <span
                      onClick={(e) => { e.stopPropagation(); deleteEssay(essay.id); }}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={cn('space-y-6', essays.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4')}>
            {/* OCR Photo Upload */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ScanText className="w-5 h-5 text-amber-500" />
                  <div>
                    <CardTitle className="text-lg">AI-анализ фото эссе</CardTitle>
                    <CardDescription>Загрузите фото рукописного или печатного эссе для проверки грамматики, орфографии и стиля</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={analyzing}
                    className="h-11"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadedImage ? 'Заменить фото' : 'Загрузить фото'}
                  </Button>
                  <Button
                    onClick={analyzePhoto}
                    disabled={analyzing || !uploadedImage}
                    size="lg"
                    className="h-11"
                  >
                    {analyzing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Анализ...</>
                    ) : (
                      <><ScanText className="w-4 h-4 mr-2" /> Проверить эссе</>
                    )}
                  </Button>
                </div>

                {uploadedImage && (
                  <div className="relative rounded-lg overflow-hidden border border-border/40 max-h-48">
                    <img src={uploadedImage} alt="Загруженное эссе" className="w-full h-auto max-h-48 object-contain" />
                  </div>
                )}

                {!uploadedImage && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3" />
                    Сделайте фото рукописного эссе или загрузите скриншот печатного текста — AI проверит грамматику и стиль.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* OCR Results */}
            {ocrResult && (
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                    Результаты AI-анализа
                  </CardTitle>
                  <CardDescription>Проверка грамматики, орфографии и стиля</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ocrResult.overallFeedback && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm">{ocrResult.overallFeedback}</p>
                    </div>
                  )}

                  {ocrResult.grammarErrors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        Грамматические ошибки ({ocrResult.grammarErrors.length})
                      </h4>
                      <div className="space-y-2">
                        {ocrResult.grammarErrors.map((err, i) => (
                          <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                            <p className="text-sm">
                              <span className="line-through text-red-600 dark:text-red-400">{err.error}</span>
                              {' → '}
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{err.correction}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{err.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ocrResult.spellingErrors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-amber-500" />
                        Орфографические ошибки ({ocrResult.spellingErrors.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {ocrResult.spellingErrors.map((err, i) => (
                          <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <span className="line-through text-red-600 dark:text-red-400">{err.word}</span>
                            {' → '}
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{err.correction}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ocrResult.styleSuggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-sky-500" />
                        Рекомендации по стилю
                      </h4>
                      <ul className="space-y-1">
                        {ocrResult.styleSuggestions.map((sug, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-sky-500 mt-0.5">•</span>
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ocrResult.grammarErrors.length === 0 && ocrResult.spellingErrors.length === 0 && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Грамматических и орфографических ошибок не найдено!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Essay editor */}
            <Card>
              <CardHeader>
                <div className="flex-1">
                  <Label htmlFor="film-title" className="text-xs text-muted-foreground">Название фильма</Label>
                  <Input
                    id="film-title"
                    value={filmTitle}
                    onChange={(e) => setFilmTitle(e.target.value)}
                    className="mt-1 text-lg font-semibold h-11"
                    placeholder="Введите название фильма..."
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {ESSAY_BLOCKS.map((block) => (
                  <div key={block.key} className="space-y-2">
                    <Label className="text-sm font-semibold">{block.label}</Label>
                    <Textarea
                      value={blocks[block.key]}
                      onChange={(e) => setBlocks((prev) => ({ ...prev, [block.key]: e.target.value }))}
                      placeholder={block.placeholder}
                      className="min-h-28 resize-y leading-relaxed"
                    />
                    <p className="text-xs text-muted-foreground">
                      {blocks[block.key].trim().split(/\s+/).filter(Boolean).length} слов
                    </p>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="text-sm text-muted-foreground">
                    Всего: <span className="font-semibold text-foreground">{totalWords} слов</span>
                  </div>
                  <Button onClick={save} disabled={saving} size="lg">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {activeId ? 'Сохранить изменения' : 'Сохранить эссе'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
