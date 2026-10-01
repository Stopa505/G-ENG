import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

interface GrammarError { error: string; correction: string; explanation: string; }
interface SpellingError { word: string; correction: string; }
interface OCRResult {
  grammarErrors: GrammarError[];
  spellingErrors: SpellingError[];
  styleSuggestions: string[];
  overallFeedback: string;
}

const PROMPT = `You are an English language teacher analyzing a student's film essay from a photo.
The photo may be handwritten or printed text. Read the text and analyze ONLY:
1. Grammar errors (wrong tense, word order, articles, prepositions, etc.)
2. Spelling errors
3. Style suggestions (vocabulary, sentence structure, clarity)

DO NOT evaluate the philosophical content, opinions, or arguments of the essay.

Return ONLY valid JSON with this exact structure:
{
  "grammarErrors": [
    { "error": "the incorrect phrase as written", "correction": "the corrected version", "explanation": "brief explanation in Russian of why it's wrong" }
  ],
  "spellingErrors": [
    { "word": "misspelled word", "correction": "correct spelling" }
  ],
  "styleSuggestions": [
    "a style improvement suggestion in Russian"
  ],
  "overallFeedback": "1-2 sentence overall feedback in Russian about the writing quality (not content)"
}

Rules:
- Explanations and suggestions must be in Russian
- Be specific and constructive
- If no errors found in a category, return an empty array
- Return ONLY the JSON, no markdown or commentary`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const image: string = body?.image;

    if (!image || !image.startsWith('data:image')) {
      return NextResponse.json({ error: 'Необходимо загрузить фото' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API ключ Gemini не настроен' }, { status: 500 });
    }

    const base64Data = image.split(',')[1];
    const mimeType = image.match(/data:(image\/\w+);/)?.[1] ?? 'image/jpeg';

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: mimeType, data: base64Data } },
          ],
          role: 'user',
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return NextResponse.json({ error: 'Ошибка при обращении к Gemini API' }, { status: 502 });
    }

    const geminiData = await response.json();
    const text: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      return NextResponse.json({ error: 'Пустой ответ от Gemini' }, { status: 502 });
    }

    let parsed: OCRResult;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse Gemini response');
      }
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('OCR API error:', err);
    return NextResponse.json({ error: err.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
