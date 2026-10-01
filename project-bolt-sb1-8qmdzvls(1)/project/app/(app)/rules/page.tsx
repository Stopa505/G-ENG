'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookMarked, Lightbulb } from 'lucide-react';
import { SVOMPT_TABLE, TOPICS } from '@/lib/lesson-data';

export default function RulesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <BookMarked className="w-4 h-4" />
          Справочник
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Справочник правил</h1>
        <p className="text-muted-foreground mt-1">
          Полное объяснение грамматических правил и расшифровка названий на русском языке.
        </p>
      </div>

      {/* SVOMPT */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">SVOMPT — Порядок слов в повествовательном предложении</CardTitle>
          <CardDescription>Стандартный порядок слов в английском языке</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">SVOMPT</strong> — это аббревиатура, описывающая правильный порядок слов
            в английском повествовательном предложении. Каждая буква соответствует определённому элементу:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold text-sm">Буква</th>
                  <th className="text-left py-2 px-3 font-semibold text-sm">Англ. термин</th>
                  <th className="text-left py-2 px-3 font-semibold text-sm">Русский термин</th>
                  <th className="text-left py-2 px-3 font-semibold text-sm">Описание</th>
                  <th className="text-left py-2 px-3 font-semibold text-sm">Пример</th>
                </tr>
              </thead>
              <tbody>
                {SVOMPT_TABLE.map((row) => (
                  <tr key={row.letter} className="border-b border-border/40">
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                        {row.letter}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-sm">{row.name}</td>
                    <td className="py-2 px-3 text-sm">{row.nameRu}</td>
                    <td className="py-2 px-3 text-sm text-muted-foreground">{row.description}</td>
                    <td className="py-2 px-3"><code className="text-sm bg-muted px-2 py-0.5 rounded">{row.example}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm">
              <Lightbulb className="w-4 h-4 inline mr-1 text-amber-500" />
              <strong>Ключевое правило:</strong> В английском языке наречие образа действия (M) всегда стоит перед
              наречием места (P), а время (T) — в самом конце предложения. Это отличается от русского языка,
              где порядок слов более свободный.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-semibold mb-1">Пример:</p>
            <p className="text-sm">
              <strong>She</strong> (S) <strong>reads</strong> (V) <strong>a book</strong> (O){' '}
              <strong>carefully</strong> (M) <strong>in the library</strong> (P) <strong>every morning</strong> (T).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ASI */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">ASI — Образование yes/no вопросов</CardTitle>
          <CardDescription>Auxiliary + Subject + Infinitive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">ASI</strong> — аббревиатура для образования вопросов типа «да/нет».
            В английском языке для таких вопросов вспомогательный глагол переносится в начало предложения:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Badge variant="outline" className="mb-2">A — Auxiliary</Badge>
              <p className="text-xs text-muted-foreground">Вспомогательный глагол</p>
              <p className="text-sm font-semibold mt-1">Are / Is / Do / Does / Did</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Badge variant="outline" className="mb-2">S — Subject</Badge>
              <p className="text-xs text-muted-foreground">Подлежащее</p>
              <p className="text-sm font-semibold mt-1">you / she / he / they</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Badge variant="outline" className="mb-2">I — Infinitive</Badge>
              <p className="text-xs text-muted-foreground">Инфинитив (базовая форма)</p>
              <p className="text-sm font-semibold mt-1">go / like / finish</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <p className="text-sm"><span className="font-bold text-primary">Are</span> you <span className="font-bold">coming</span> tonight?</p>
            <p className="text-sm"><span className="font-bold text-primary">Did</span> she <span className="font-bold">finish</span> the project?</p>
            <p className="text-sm"><span className="font-bold text-primary">Does</span> he <span className="font-bold">like</span> coffee?</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm">
              <Lightbulb className="w-4 h-4 inline mr-1 text-amber-500" />
              <strong>Важно:</strong> После "does" и "did" глагол всегда стоит в базовой форме (like, не likes; go, не went).
              Вспомогательный глагол уже показывает время.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QUASI */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">QUASI — Образование WH-вопросов</CardTitle>
          <CardDescription>Question word + Auxiliary + Subject + Infinitive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">QUASI</strong> — аббревиатура для образования специальных вопросов
            (WH-questions). Это расширение правила ASI: перед вспомогательным глаголом ставится вопросительное слово:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Badge variant="outline" className="mb-2">QU — Question word</Badge>
              <p className="text-xs text-muted-foreground">Вопросительное слово</p>
              <p className="text-sm font-semibold mt-1">What / Where / Why / When</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Badge variant="outline" className="mb-2">A — Auxiliary</Badge>
              <p className="text-xs text-muted-foreground">Вспом. глагол</p>
              <p className="text-sm font-semibold mt-1">are / did / does</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Badge variant="outline" className="mb-2">S — Subject</Badge>
              <p className="text-xs text-muted-foreground">Подлежащее</p>
              <p className="text-sm font-semibold mt-1">you / she / they</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Badge variant="outline" className="mb-2">I — Infinitive</Badge>
              <p className="text-xs text-muted-foreground">Инфинитив</p>
              <p className="text-sm font-semibold mt-1">going / live / want</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <p className="text-sm"><span className="font-bold text-primary">Where are</span> you going?</p>
            <p className="text-sm"><span className="font-bold text-primary">Why did</span> she leave?</p>
            <p className="text-sm"><span className="font-bold text-primary">What does</span> he want?</p>
            <p className="text-sm"><span className="font-bold text-primary">When will</span> the train arrive?</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm">
              <Lightbulb className="w-4 h-4 inline mr-1 text-amber-500" />
              <strong>Запомните:</strong> QUASI = вопросительное слово + порядок ASI. Вопросительное слово ВСЕГДА
              стоит первым в предложении.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Краткая шпаргалка</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TOPICS.map((t) => (
              <div key={t.id} className="p-4 rounded-lg border border-border/40 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                  <span className="font-bold">{t.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
