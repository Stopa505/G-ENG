'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, FilmEssay } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Film,
  Save,
  FileText,
  CheckCircle2,
  Circle,
  Sparkles,
  Loader2,
  Trash2,
  Plus,
  Wand2,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VocabItem {
  word: string;
  translation: string;
  example: string;
}

interface MovieData {
  vocabulary: VocabItem[];
  essayQuestions: string[];
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
  const [generating, setGenerating] = useState(false);

  const [filmTitle, setFilmTitle] = useState('American History X');
  const [blocks, setBlocks] = useState<Record<string, string>>({
    introduction: '',
    plot_summary: '',
    character_analysis: '',
    theme_reflection: '',
  });
  const [vocabChecked, setVocabChecked] = useState<string[]>([]);
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [essayQuestions, setEssayQuestions] = useState<string[]>([]);
  const [expandedVocab, setExpandedVocab] = useState<string | null>(null);

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

  useEffect(() => {
    fetchEssays();
  }, [fetchEssays]);

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
    setVocabItems([]);
    setEssayQuestions([]);
  };

  const newEssay = () => {
    setActiveId(null);
    setFilmTitle('');
    setBlocks({ introduction: '', plot_summary: '', character_analysis: '', theme_reflection: '' });
    setVocabChecked([]);
    setVocabItems([]);
    setEssayQuestions([]);
  };

  const generateWithGemini = async () => {
    const title = filmTitle.trim();
    if (!title) {
      toast.error('Введите название фильма');
      return;
    }

    setGenerating(true);
    setVocabItems([]);
    setEssayQuestions([]);
    setVocabChecked([]);

    try {
      const res = await fetch('/api/movie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieTitle: title }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Ошибка генерации');
      }

      const data: MovieData = await res.json();

      if (data.vocabulary && data.vocabulary.length > 0) {
        setVocabItems(data.vocabulary);
      }
      if (data.essayQuestions && data.essayQuestions.length > 0) {
        setEssayQuestions(data.essayQuestions);
      }

      toast.success(`Лексика и вопросы для «${title}» сгенерированы!`);
    } catch (err: any) {
      toast.error(err.message || 'Не удалось сгенерировать материалы');
    } finally {
      setGenerating(false);
    }
  };

  const toggleVocab = (word: string) => {
    setVocabChecked((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
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
      if (error) {
        toast.error('Не удалось сохранить');
      } else {
        toast.success('Эссе сохранено');
        fetchEssays();
      }
    } else {
      const { data, error } = await supabase
        .from('film_essays')
        .insert({ ...payload, user_id: user.id })
        .select()
        .maybeSingle();

      if (error) {
        toast.error('Не удалось создать эссе');
      } else if (data) {
        toast.success('Эссе создано');
        setActiveId((data as FilmEssay).id);
        fetchEssays();
      }
    }
    setSaving(false);
  };

  const deleteEssay = async (id: string) => {
    await supabase.from('film_essays').delete().eq('id', id);
    setEssays((prev) => prev.filter((e) => e.id !== id));
    if (activeId === id) newEssay();
    toast.success('Эссе удалено');
  };

  const vocabList = vocabItems.map((v) => v.word);
  const vocabProgressValue = vocabList.length > 0 ? (vocabChecked.length / vocabList.length) * 100 : 0;
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
            Введите название фильма и сгенерируйте лексику и вопросы через AI для написания эссе.
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
                    activeId === essay.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/80 hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{essay.film_title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(essay.updated_at).toLocaleDateString('ru-RU')}
                      </p>
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
            {/* Movie input + generate button */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-amber-500" />
                  <div>
                    <CardTitle className="text-lg">AI-генерация материалов</CardTitle>
                    <CardDescription>Введите любой фильм — AI подберёт лексику и вопросы для эссе</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={filmTitle}
                    onChange={(e) => setFilmTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !generating) generateWithGemini(); }}
                    className="text-base h-11 flex-1"
                    placeholder="Например: Avatar, Matrix, Titanic..."
                    disabled={generating}
                  />
                  <Button
                    onClick={generateWithGemini}
                    disabled={generating || !filmTitle.trim()}
                    size="lg"
                    className="h-11"
                  >
                    {generating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Генерация...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Сгенерировать</>
                    )}
                  </Button>
                </div>
                {!generating && vocabItems.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3" />
                    Введите название фильма и нажмите «Сгенерировать» — AI создаст лексику и вопросы для эссе.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Vocabulary checklist */}
            {vocabItems.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Required Vocabulary
                      </CardTitle>
                      <CardDescription>Нажмите на слово, чтобы увидеть перевод и пример</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {vocabChecked.length}/{vocabList.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={vocabProgressValue} className="h-2 mb-4" />
                  <div className="space-y-2">
                    {vocabItems.map((item) => {
                      const checked = vocabChecked.includes(item.word);
                      const expanded = expandedVocab === item.word;
                      return (
                        <div key={item.word}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleVocab(item.word)}
                              className={cn(
                                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all flex-shrink-0',
                                checked
                                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                                  : 'border-border hover:border-border/80 text-muted-foreground'
                              )}
                            >
                              {checked ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Circle className="w-3.5 h-3.5" />
                              )}
                              {item.word}
                            </button>
                            <button
                              onClick={() => setExpandedVocab(expanded ? null : item.word)}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                            >
                              {expanded ? 'Скрыть' : 'Показать перевод'}
                            </button>
                          </div>
                          {expanded && (
                            <div className="mt-2 ml-5 p-3 rounded-lg bg-muted/50 border border-border/40 animate-slide-up">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Перевод: </span>
                                <span className="font-medium">{item.translation}</span>
                              </p>
                              <p className="text-sm mt-1">
                                <span className="text-muted-foreground">Пример: </span>
                                <span className="italic">{item.example}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Essay questions */}
            {essayQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Questions for Your Essay
                  </CardTitle>
                  <CardDescription>Используйте эти вопросы как ориентир для каждого блока эссе</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ESSAY_BLOCKS.map((block, i) => (
                      <div key={block.key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                        <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-muted-foreground mb-0.5">{block.label}</p>
                          <p className="text-sm">{essayQuestions[i] || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Essay editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
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
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
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
