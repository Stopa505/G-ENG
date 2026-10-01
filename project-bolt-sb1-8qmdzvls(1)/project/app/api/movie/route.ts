import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

interface VocabItem {
  word: string;
  translation: string;
  example: string;
}

interface MovieData {
  vocabulary: VocabItem[];
  essayQuestions: string[];
}

const SYSTEM_PROMPT = `You are an English language teacher specializing in film-based ESL lessons.
Given a movie title, generate educational content for a student writing a film report essay.

Return ONLY valid JSON (no markdown, no code fences, no commentary) with this exact structure:
{
  "vocabulary": [
    { "word": "advanced English word or idiom related to the film's themes", "translation": "Russian translation of the word", "example": "An example sentence using the word in the context of the film" }
  ],
  "essayQuestions": [
    "A thought-provoking essay question about the film"
  ]
}

Requirements:
- Exactly 4 vocabulary items (advanced/intermediate words or idioms relevant to the film's themes)
- Each vocabulary item must have an English word/phrase, a Russian translation, and an example sentence
- Exactly 4 essay questions (one per essay block: introduction, plot, character analysis, themes)
- All content in the vocabulary "word" and "example" fields must be in English
- All "translation" fields must be in Russian
- All essay questions must be in English
- Keep examples concise (1-2 sentences)
- Return ONLY the JSON object, nothing else`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const movieTitle: string = body?.movieTitle?.trim();

    if (!movieTitle || movieTitle.length < 1) {
      return NextResponse.json(
        { error: 'Необходимо указать название фильма' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API ключ Gemini не настроен' },
        { status: 500 }
      );
    }

    const userPrompt = `Generate ESL lesson content for a film report essay about the movie "${movieTitle}".`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: SYSTEM_PROMPT }],
            role: 'user',
          },
          {
            parts: [{ text: userPrompt }],
            role: 'user',
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return NextResponse.json(
        { error: 'Ошибка при обращении к Gemini API' },
        { status: 502 }
      );
    }

    const geminiData = await response.json();
    const text: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      return NextResponse.json(
        { error: 'Пустой ответ от Gemini' },
        { status: 502 }
      );
    }

    let parsed: MovieData;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from the text if it's wrapped in markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse Gemini response as JSON');
      }
    }

    if (!parsed.vocabulary || !Array.isArray(parsed.vocabulary) || parsed.vocabulary.length === 0) {
      return NextResponse.json(
        { error: 'Некорректный формат ответа' },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('Movie API error:', err);
    return NextResponse.json(
      { error: err.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
