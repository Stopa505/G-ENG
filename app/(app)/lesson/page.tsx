'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Topic, ErrorLogRow, StudySession } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  sentenceConstructorQuestions,
  multipleChoiceQuestions,
  translationQuestions,
  matchingQuestions,
  SVOMPT_TABLE,
  SentenceConstructorQuestion,
  MultipleChoiceQuestion,
  TranslationQuestion,
  MatchingQuestion,
  TOPICS,
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
  Flame,
  Languages,
  Shuffle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type TabValue = 'theory' | 'constructor' | 'quiz';

interface SessionState {
  activeTab: TabValue;
  constructorIndex: number;
  constructorAnswers: boolean[];
  quizIndex: number;
  quizAnswers: boolean[];
  hintsUsed: number;
  hintPerQuestion: number[];
}

const SESSION_KEY = 'g-english-lesson-session';

function loadSessionState(): SessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSessionState(state: SessionState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}

export default function LessonPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('theory');
  const [constructorIndex, setConstructorIndex] = useState(0);
  const [constructorAnswers, setConstructorAnswers] = useState<boolean[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintPerQuestion, setHintPerQuestion] = useState<number[]>([]);
  const [constructorDone, setConstructorDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [activeTopic, setActiveTopic] = useState<Topic>(TOPICS[0].id);

  useEffect(() => {
    const saved = loadSessionState();
    if (saved) {
      setActiveTab(saved.activeTab);
      setConstructorIndex(saved.constructorIndex ?? 0);
      setConstructorAnswers(saved.constructorAnswers ?? []);
      setQuizIndex(saved.quizIndex ?? 0);
      setQuizAnswers(saved.quizAnswers ?? []);
      setHintsUsed(saved.hintsUsed ?? 0);
      setHintPerQuestion(saved.hintPerQuestion ?? []);
    }
  }, []);

  useEffect(() => {
    const state: SessionState = {
      activeTab,
      constructorIndex,
      constructorAnswers,
      quizIndex,
      quizAnswers,
      hintsUsed,
      hintPerQuestion,
    };
    saveSessionState(state);
  }, [activeTab, constructorIndex, constructorAnswers, quizIndex, quizAnswers, hintsUsed, hintPerQuestion]);

  const handleConstructorComplete = async (results: boolean[]) => {
    setConstructorDone(true);
    setConstructorAnswers(results);
    if (user) {
      await recordSessionActivity(user.id, 'constructor');
      await checkAndUpdateStreak(user.id);
    }
    if (quizDone && user) {
      rotateTopic();
    }
  };

  const handleQuizComplete = async (results: boolean[]) => {
    setQuizDone(true);
    setQuizAnswers(results);
    if (user) {
      await recordSessionActivity(user.id, 'quiz');
      await checkAndUpdateStreak(user.id);
    }
    if (constructorDone && user) {
      rotateTopic();
    }
  };

  const rotateTopic = () => {
    const currentIdx = TOPICS.findIndex((t) => t.id === activeTopic);
    const nextIdx = (currentIdx + 1) % TOPICS.length;
    setActiveTopic(TOPICS[nextIdx].id);
    toast.success(`Тема обновлена: ${TOPICS[nextIdx].name}. Продолжайте закрепление!`);
  };

  const resetSession = () => {
    setConstructorIndex(0);
    setConstructorAnswers([]);
    setQuizIndex(0);
    setQuizAnswers([]);
    setHintsUsed(0);
    setHintPerQuestion([]);
    setConstructorDone(false);
    setQuizDone(false);
    sessionStorage.removeItem(SESSION_KEY);
    toast.info('Сессия сброшена. Начните заново!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <BookOpen className="w-4 h-4" />
            Уроки грамматики английского
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Интерактивные уроки</h1>
          <p className="text-muted-foreground mt-1">
            Изучите правила, практикуйтесь в конструкторе и проверьте знания тестом.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {constructorDone ? (
            <Badge className="bg-red-500/15 text-red-500 border-red-500/30">
              <Flame className="w-3.5 h-3.5 mr-1" />
              Стрик активен
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <Flame className="w-3.5 h-3.5 mr-1" />
              Стрик не активен
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={resetSession}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Сбросить
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="theory">Теория</TabsTrigger>
          <TabsTrigger value="constructor">Конструктор</TabsTrigger>
          <TabsTrigger value="quiz">Тест</TabsTrigger>
        </TabsList>

        <TabsContent value="theory" className="mt-6">
          <TheorySection />
        </TabsContent>

        <TabsContent value="constructor" className="mt-6">
          <ConstructorSection
            userId={user?.id}
            currentIndex={constructorIndex}
            setCurrentIndex={setConstructorIndex}
            answers={constructorAnswers}
            setAnswers={setConstructorAnswers}
            onComplete={handleConstructorComplete}
            hintsUsed={hintsUsed}
            setHintsUsed={setHintsUsed}
            hintPerQuestion={hintPerQuestion}
            setHintPerQuestion={setHintPerQuestion}
            activeTopic={activeTopic}
          />
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <QuizSection
            userId={user?.id}
            currentIndex={quizIndex}
            setCurrentIndex={setQuizIndex}
            answers={quizAnswers}
            setAnswers={setQuizAnswers}
            onComplete={handleQuizComplete}
            activeTopic={activeTopic}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Theory Section (Russian) ── */

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
              <CardTitle className="text-xl">Правило SVOMPT</CardTitle>
              <CardDescription>Стандартный порядок слов в английских повествовательных предложениях</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            В английском языке существует строгий порядок слов. Правило SVOMPT определяет позицию каждого элемента в предложении:
            <strong className="text-foreground"> Подлежащее → Глагол → Дополнение → Образ действия → Место → Время</strong>.
            Соблюдение этого порядка необходимо для естественного звучания английской речи.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Позиция</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Буква</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Термин</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Описание</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Пример</th>
                </tr>
              </thead>
              <tbody>
                {SVOMPT_TABLE.map((row, i) => (
                  <tr key={row.letter} className="border-b border-border/40 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-mono">{i + 1}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                        {row.letter}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">{row.name} <span className="text-muted-foreground font-normal">({row.nameRu})</span></td>
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
                <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm mb-1">Пример предложения</p>
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
            <CardTitle className="text-lg">ASI — Yes/No вопросы</CardTitle>
            <CardDescription>Auxiliary + Subject + Infinitive (Вспом. глагол + Подлежащее + Инфинитив)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Для образования вопросов типа «да/нет» вспомогательный глагол ставится перед подлежащим:
            </p>
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm"><span className="font-bold text-primary">Are</span> you coming tonight?</p>
              <p className="text-sm"><span className="font-bold text-primary">Did</span> she finish the project?</p>
              <p className="text-sm"><span className="font-bold text-primary">Does</span> he like coffee?</p>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ASI — это аббревиатура: <strong>A</strong>uxiliary (вспомогательный глагол) + <strong>S</strong>ubject (подлежащее) + <strong>I</strong>nfinitive (инфинитив глагола).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">QUASI — WH-вопросы</CardTitle>
            <CardDescription>Question word + Auxiliary + Subject + Infinitive</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              WH-вопросы начинаются с вопросительного слова, затем идёт порядок ASI:
            </p>
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm"><span className="font-bold text-primary">Where are</span> you going?</p>
              <p className="text-sm"><span className="font-bold text-primary">Why did</span> she leave?</p>
              <p className="text-sm"><span className="font-bold text-primary">What does</span> he want?</p>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              QUASI расшифровывается: <strong>QU</strong>estion word (вопрос. слово) + <strong>A</strong>uxiliary (вспом. глагол) + <strong>S</strong>ubject (подлежащее) + <strong>I</strong>nfinitive (инфинитив).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── Constructor Section (3 exercise types, hints, locked answers) ── */

interface ConstructorProps {
  userId?: string;
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  answers: boolean[];
  setAnswers: (a: boolean[]) => void;
  onComplete: (results: boolean[]) => void;
  hintsUsed: number;
  setHintsUsed: (n: number) => void;
  hintPerQuestion: number[];
  setHintPerQuestion: (a: number[]) => void;
  activeTopic: Topic;
}

type ExerciseType = 'sentence' | 'translation' | 'matching';

function ConstructorSection(props: ConstructorProps) {
  const { userId, currentIndex, setCurrentIndex, answers, setAnswers, onComplete, hintsUsed, setHintsUsed, hintPerQuestion, setHintPerQuestion } = props;

  // Cycle through exercise types: 0-4 sentence, 5-8 translation, 9-11 matching
  const totalQuestions = 12;
  const exerciseType: ExerciseType =
    currentIndex < 5 ? 'sentence' : currentIndex < 9 ? 'translation' : 'matching';

  const handleAnswer = (isCorrect: boolean) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = isCorrect;
    setAnswers(newAnswers);

    if (userId) {
      const topic = getTopicForExercise(currentIndex);
      updateProgress(userId, topic, isCorrect);
      if (!isCorrect) {
        logErrorForExercise(userId, currentIndex);
      }
    }

    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      const finalResults = [...newAnswers];
      onComplete(finalResults);
      toast.success('Конструктор пройден! Все 12 упражнений выполнены.');
    }
  };

  const useHint = () => {
    if (hintsUsed >= 2) {
      toast.error('Лимит подсказок исчерпан (максимум 2 за сессию)');
      return;
    }
    const qHints = hintPerQuestion[currentIndex] ?? 0;
    if (qHints >= 1) {
      toast.error('Уже использована подсказка для этого упражнения');
      return;
    }
    const newHints = [...hintPerQuestion];
    newHints[currentIndex] = qHints + 1;
    setHintPerQuestion(newHints);
    setHintsUsed(hintsUsed + 1);
  };

  const isAnswered = answers[currentIndex] !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Конструктор упражнений</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Упражнение {currentIndex + 1} из {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {exerciseType === 'sentence' && <><Shuffle className="w-3 h-3 mr-1" />Построение</>}
            {exerciseType === 'translation' && <><Languages className="w-3 h-3 mr-1" />Перевод</>}
            {exerciseType === 'matching' && <><Shuffle className="w-3 h-3 mr-1" />Сопоставление</>}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Lightbulb className="w-3 h-3 mr-1" />
            {2 - hintsUsed} подсказок
          </Badge>
        </div>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {exerciseType === 'sentence' && (
        <SentenceExercise
          key={`s-${currentIndex}`}
          question={sentenceConstructorQuestions[currentIndex % sentenceConstructorQuestions.length]}
          onAnswer={handleAnswer}
          isAnswered={isAnswered}
          wasCorrect={answers[currentIndex]}
          hintActive={(hintPerQuestion[currentIndex] ?? 0) > 0}
          onUseHint={useHint}
          hintsRemaining={2 - hintsUsed}
        />
      )}
      {exerciseType === 'translation' && (
        <TranslationExercise
          key={`t-${currentIndex}`}
          question={translationQuestions[(currentIndex - 5) % translationQuestions.length]}
          onAnswer={handleAnswer}
          isAnswered={isAnswered}
          wasCorrect={answers[currentIndex]}
          hintActive={(hintPerQuestion[currentIndex] ?? 0) > 0}
          onUseHint={useHint}
          hintsRemaining={2 - hintsUsed}
        />
      )}
      {exerciseType === 'matching' && (
        <MatchingExercise
          key={`m-${currentIndex}`}
          question={matchingQuestions[(currentIndex - 9) % matchingQuestions.length]}
          onAnswer={handleAnswer}
          isAnswered={isAnswered}
          wasCorrect={answers[currentIndex]}
          hintActive={(hintPerQuestion[currentIndex] ?? 0) > 0}
          onUseHint={useHint}
          hintsRemaining={2 - hintsUsed}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0 || !isAnswered}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Назад
        </Button>
        <span className="text-xs text-muted-foreground">
          Ответов: {answers.filter((a) => a !== undefined).length} / {totalQuestions}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => currentIndex < totalQuestions - 1 && isAnswered && setCurrentIndex(currentIndex + 1)}
          disabled={!isAnswered || currentIndex === totalQuestions - 1}
        >
          Вперёд <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function getTopicForExercise(index: number): Topic {
  if (index < 5) return sentenceConstructorQuestions[index % sentenceConstructorQuestions.length].topic;
  if (index < 9) return translationQuestions[(index - 5) % translationQuestions.length].topic;
  return matchingQuestions[(index - 9) % matchingQuestions.length].topic;
}

async function logErrorForExercise(userId: string, index: number) {
  if (index < 5) {
    const q = sentenceConstructorQuestions[index % sentenceConstructorQuestions.length];
    await logError({ user_id: userId, question: q.instruction, user_answer: '', correct_answer: q.correctOrder.join(' '), rule: q.rule, topic: q.topic });
  } else if (index < 9) {
    const q = translationQuestions[(index - 5) % translationQuestions.length];
    await logError({ user_id: userId, question: q.sourceText, user_answer: '', correct_answer: q.correctAnswer, rule: q.rule, topic: q.topic });
  } else {
    const q = matchingQuestions[(index - 9) % matchingQuestions.length];
    await logError({ user_id: userId, question: q.instruction, user_answer: '', correct_answer: q.rule, rule: q.rule, topic: q.topic });
  }
}

/* ── Sentence Building Exercise ── */

interface SentenceExerciseProps {
  question: SentenceConstructorQuestion;
  onAnswer: (correct: boolean) => void;
  isAnswered: boolean;
  wasCorrect?: boolean;
  hintActive: boolean;
  onUseHint: () => void;
  hintsRemaining: number;
}

function SentenceExercise({ question, onAnswer, isAnswered, wasCorrect, hintActive, onUseHint, hintsRemaining }: SentenceExerciseProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      setAvailableWords([...question.words].sort(() => Math.random() - 0.5));
      initRef.current = true;
    }
  }, [question]);

  // Restore answered state
  useEffect(() => {
    if (isAnswered && !result) {
      setResult(wasCorrect ? 'correct' : 'incorrect');
    }
  }, [isAnswered, wasCorrect, result]);

  const selectWord = (word: string) => {
    if (result) return;
    const idx = availableWords.indexOf(word);
    if (idx === -1) return;
    const newAvail = [...availableWords];
    newAvail.splice(idx, 1);
    setAvailableWords(newAvail);
    setSelectedWords([...selectedWords, word]);
  };

  const deselectWord = (word: string, index: number) => {
    if (result) return;
    const newSel = [...selectedWords];
    newSel.splice(index, 1);
    setSelectedWords(newSel);
    setAvailableWords([...availableWords, word]);
  };

  const check = () => {
    const isCorrect = selectedWords.join(' ') === question.correctOrder.join(' ');
    setResult(isCorrect ? 'correct' : 'incorrect');
    onAnswer(isCorrect);
    if (isCorrect) toast.success('Правильно!');
    else toast.error('Неправильно — проверьте правило ниже.');
  };

  const hintWords = question.correctOrder.slice(0, 3);

  return (
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

        {/* Hint display for sentence building */}
        {showHint && hintActive && !result && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-slide-up">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <Lightbulb className="w-4 h-4 inline mr-1" />
              Первые 3 слова: <strong>{hintWords.join(' ')}</strong>
            </p>
          </div>
        )}

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
          <ResultBlock result={result} correctAnswer={question.correctOrder.join(' ')} rule={question.rule} userAnswer={selectedWords.join(' ')} />
        )}

        <div className="flex items-center gap-3 pt-2">
          {!result ? (
            <>
              <Button
                onClick={check}
                disabled={selectedWords.length !== question.correctOrder.length}
                size="lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Проверить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onUseHint();
                  setShowHint(true);
                }}
                disabled={hintsRemaining <= 0 || hintActive}
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                Подсказка ({hintsRemaining})
              </Button>
            </>
          ) : (
            <Badge variant={wasCorrect ? 'default' : 'destructive'}>
              {wasCorrect ? 'Засчитано' : 'Нельзя перепройти'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Translation Exercise ── */

interface TranslationExerciseProps {
  question: TranslationQuestion;
  onAnswer: (correct: boolean) => void;
  isAnswered: boolean;
  wasCorrect?: boolean;
  hintActive: boolean;
  onUseHint: () => void;
  hintsRemaining: number;
}

function TranslationExercise({ question, onAnswer, isAnswered, wasCorrect, hintActive, onUseHint, hintsRemaining }: TranslationExerciseProps) {
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (isAnswered && !result) {
      setResult(wasCorrect ? 'correct' : 'incorrect');
    }
  }, [isAnswered, wasCorrect, result]);

  const check = () => {
    const normalize = (s: string) => s.trim().toLowerCase().replace(/[.,!?]/g, '').replace(/\s+/g, ' ');
    const isCorrect = normalize(userInput) === normalize(question.correctAnswer);
    setResult(isCorrect ? 'correct' : 'incorrect');
    onAnswer(isCorrect);
    if (isCorrect) toast.success('Правильный перевод!');
    else toast.error('Перевод неточный — смотрите правильный вариант.');
  };

  const directionLabel = question.direction === 'en-ru' ? 'Английский → Русский' : 'Русский → Английский';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Languages className="w-5 h-5 text-amber-500" />
          Перевод предложения
        </CardTitle>
        <CardDescription>{directionLabel}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
          <p className="text-sm text-muted-foreground mb-1">Исходный текст:</p>
          <p className="text-lg font-medium">{question.sourceText}</p>
        </div>

        {showHint && hintActive && !result && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-slide-up">
            <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
              <Lightbulb className="w-4 h-4 inline mr-1" />
              Подсказка по словам:
            </p>
            <div className="flex flex-wrap gap-2">
              {question.hintWords.map((hw, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                  <strong>{hw.word}</strong> → {hw.translation}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold">Ваш перевод:</label>
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={!!result}
            placeholder="Введите перевод..."
            className="text-base"
            onKeyDown={(e) => { if (e.key === 'Enter' && !result && userInput.trim()) check(); }}
          />
        </div>

        {result && (
          <ResultBlock result={result} correctAnswer={question.correctAnswer} rule={question.rule} userAnswer={userInput} />
        )}

        <div className="flex items-center gap-3 pt-2">
          {!result ? (
            <>
              <Button onClick={check} disabled={!userInput.trim()} size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Проверить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onUseHint();
                  setShowHint(true);
                }}
                disabled={hintsRemaining <= 0 || hintActive}
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                Подсказка ({hintsRemaining})
              </Button>
            </>
          ) : (
            <Badge variant={wasCorrect ? 'default' : 'destructive'}>
              {wasCorrect ? 'Засчитано' : 'Нельзя перепройти'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Matching Exercise (6x6) ── */

interface MatchingExerciseProps {
  question: MatchingQuestion;
  onAnswer: (correct: boolean) => void;
  isAnswered: boolean;
  wasCorrect?: boolean;
  hintActive: boolean;
  onUseHint: () => void;
  hintsRemaining: number;
}

function MatchingExercise({ question, onAnswer, isAnswered, wasCorrect, hintActive, onUseHint, hintsRemaining }: MatchingExerciseProps) {
  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [wrongPairs, setWrongPairs] = useState<string[]>([]);

  const shuffledRu = useRef(question.pairs.map((p) => p.russian).sort(() => Math.random() - 0.5));

  useEffect(() => {
    if (isAnswered && !result) {
      setResult(wasCorrect ? 'correct' : 'incorrect');
    }
  }, [isAnswered, wasCorrect, result]);

  const handleEnClick = (word: string) => {
    if (result) return;
    setSelectedEn(word === selectedEn ? null : word);
  };

  const handleRuClick = (word: string) => {
    if (result || !selectedEn) return;
    const correctMatch = question.pairs.find((p) => p.english === selectedEn);
    const newMatches = { ...matches, [selectedEn]: word };
    setMatches(newMatches);
    if (correctMatch && correctMatch.russian !== word) {
      setWrongPairs([...wrongPairs, selectedEn]);
    }
    setSelectedEn(null);
  };

  const check = () => {
    const allCorrect = question.pairs.every((p) => matches[p.english] === p.russian);
    const allMatched = Object.keys(matches).length === question.pairs.length;
    const isCorrect = allCorrect && allMatched;
    setResult(isCorrect ? 'correct' : 'incorrect');
    onAnswer(isCorrect);
    if (isCorrect) toast.success('Все пары сопоставлены верно!');
    else toast.error('Есть ошибки в сопоставлении.');
  };

  const hintPairs = question.pairs.filter((p) => !matches[p.english] || matches[p.english] !== p.russian);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-amber-500" />
          {question.instruction}
        </CardTitle>
        <CardDescription>Нажмите на английское слово, затем выберите перевод</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showHint && hintActive && !result && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-slide-up">
            <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
              <Lightbulb className="w-4 h-4 inline mr-1" />
              {Object.keys(matches).length === 0 ? 'Все сопоставления:' : 'Несопоставленные / неверные пары:'}
            </p>
            <div className="space-y-1">
              {hintPairs.map((p, i) => (
                <p key={i} className="text-xs">
                  <strong>{p.english}</strong> → {p.russian}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* English column */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">English</p>
            {question.pairs.map((pair) => {
              const matched = matches[pair.english];
              const isWrong = wrongPairs.includes(pair.english) && matched;
              return (
                <button
                  key={pair.english}
                  onClick={() => handleEnClick(pair.english)}
                  disabled={!!result || !!matched}
                  className={cn(
                    'w-full p-3 rounded-lg border-2 text-left text-sm font-medium transition-all',
                    selectedEn === pair.english && 'border-primary bg-primary/10',
                    matched && !isWrong && 'border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                    isWrong && 'border-red-400 bg-red-500/10',
                    !selectedEn && !matched && 'border-border hover:border-primary/50',
                  )}
                >
                  {pair.english}
                  {matched && <span className="text-xs text-muted-foreground block mt-1">→ {matched}</span>}
                </button>
              );
            })}
          </div>

          {/* Russian column */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Русский</p>
            {shuffledRu.current.map((word) => {
              const used = Object.values(matches).includes(word);
              return (
                <button
                  key={word}
                  onClick={() => handleRuClick(word)}
                  disabled={!!result || used || !selectedEn}
                  className={cn(
                    'w-full p-3 rounded-lg border-2 text-left text-sm font-medium transition-all',
                    used && 'border-emerald-400 bg-emerald-500/10 opacity-60',
                    !used && selectedEn && 'border-primary/50 hover:border-primary',
                    !used && !selectedEn && 'border-border hover:border-primary/30',
                    !selectedEn && !used && 'cursor-default',
                  )}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {result && (
          <ResultBlock result={result} correctAnswer={question.rule} rule={question.rule} userAnswer="" isMatching />
        )}

        <div className="flex items-center gap-3 pt-2">
          {!result ? (
            <>
              <Button onClick={check} disabled={Object.keys(matches).length < question.pairs.length} size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Проверить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onUseHint();
                  setShowHint(true);
                }}
                disabled={hintsRemaining <= 0 || hintActive}
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                Подсказка ({hintsRemaining})
              </Button>
            </>
          ) : (
            <Badge variant={wasCorrect ? 'default' : 'destructive'}>
              {wasCorrect ? 'Засчитано' : 'Нельзя перепройти'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Quiz Section ── */

interface QuizProps {
  userId?: string;
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  answers: boolean[];
  setAnswers: (a: boolean[]) => void;
  onComplete: (results: boolean[]) => void;
  activeTopic: Topic;
}

function QuizSection({ userId, currentIndex, setCurrentIndex, answers, setAnswers, onComplete }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const question = multipleChoiceQuestions[currentIndex % multipleChoiceQuestions.length];
  const isAnswered = answers[currentIndex] !== undefined;

  useEffect(() => {
    if (isAnswered && !result) {
      setResult(answers[currentIndex] ? 'correct' : 'incorrect');
    }
  }, [isAnswered, answers, result]);

  const selectOption = (index: number) => {
    if (result) return;
    setSelected(index);
    const isCorrect = index === question.correctIndex;
    setResult(isCorrect ? 'correct' : 'incorrect');

    const newAnswers = [...answers];
    newAnswers[currentIndex] = isCorrect;
    setAnswers(newAnswers);

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

    if (isCorrect) toast.success('Правильно!');
    else toast.error('Неверный ответ — ответ нельзя изменить.');

    if (currentIndex < multipleChoiceQuestions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 500);
    } else {
      onComplete(newAnswers);
      toast.success('Тест завершён! Все вопросы пройдены.');
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
                {result === 'correct' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                <span className={cn('font-semibold', result === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                  {result === 'correct' ? 'Правильно!' : 'Неправильно — ответ нельзя изменить'}
                </span>
              </div>
              {result === 'incorrect' && (
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  Правильно: <span className="font-semibold">{question.options[question.correctIndex]}</span>
                </p>
              )}
              <div className="flex items-start gap-2 mt-2">
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80">{question.rule}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Result Block ── */

function ResultBlock({ result, correctAnswer, rule, userAnswer, isMatching }: {
  result: 'correct' | 'incorrect';
  correctAnswer: string;
  rule: string;
  userAnswer: string;
  isMatching?: boolean;
}) {
  return (
    <div className={cn(
      'p-4 rounded-lg animate-slide-up',
      result === 'correct' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
    )}>
      <div className="flex items-center gap-2 mb-2">
        {result === 'correct' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
        <span className={cn('font-semibold', result === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
          {result === 'correct' ? 'Правильно!' : 'Неправильно — ответ нельзя изменить'}
        </span>
      </div>
      {result === 'incorrect' && !isMatching && (
        <p className="text-sm text-red-700 dark:text-red-300 mb-2">
          <span className="line-through opacity-60">{userAnswer}</span>
          <br />
          <span className="font-semibold">{correctAnswer}</span>
        </p>
      )}
      <div className="flex items-start gap-2 mt-2">
        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80">{rule}</p>
      </div>
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

async function recordSessionActivity(userId: string, activity: 'constructor' | 'quiz') {
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  const now = new Date();
  const startKey = `g-english-session-start-${today}`;
  if (typeof window !== 'undefined' && !sessionStorage.getItem(startKey)) {
    sessionStorage.setItem(startKey, now.toISOString());
  }

  let minutes = 5;
  if (typeof window !== 'undefined') {
    const startStr = sessionStorage.getItem(startKey);
    if (startStr) {
      const start = new Date(startStr);
      minutes = Math.max(1, Math.round((now.getTime() - start.getTime()) / 60000));
    }
  }

  if (existing) {
    const update: Record<string, any> = { minutes: Math.max((existing as any).minutes, minutes) };
    if (activity === 'constructor') update.constructor_done = true;
    if (activity === 'quiz') update.quiz_done = true;
    await supabase.from('study_sessions').update(update).eq('id', (existing as any).id);
  } else {
    await supabase.from('study_sessions').insert({
      user_id: userId,
      date: today,
      minutes,
      constructor_done: activity === 'constructor',
      quiz_done: activity === 'quiz',
    });
  }
}

async function checkAndUpdateStreak(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak, last_streak_date')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) return;

  const currentStreak = (profile as any).current_streak ?? 0;
  const lastStreakDate = (profile as any).last_streak_date;

  if (lastStreakDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newStreak = lastStreakDate === yesterdayStr ? currentStreak + 1 : 1;

  await supabase
    .from('profiles')
    .update({ current_streak: newStreak, last_streak_date: today })
    .eq('id', userId);
}
