import { Topic } from './supabase';

export const SVOMPT_TABLE = [
  { letter: 'S', name: 'Subject', description: 'Who or what does the action', example: 'She' },
  { letter: 'V', name: 'Verb', description: 'The action itself', example: 'reads' },
  { letter: 'O', name: 'Object', description: 'What receives the action', example: 'a book' },
  { letter: 'M', name: 'Manner', description: 'How the action is done', example: 'carefully' },
  { letter: 'P', name: 'Place', description: 'Where the action happens', example: 'in the library' },
  { letter: 'T', name: 'Time', description: 'When the action happens', example: 'every morning' },
];

export interface SentenceConstructorQuestion {
  id: string;
  topic: Topic;
  instruction: string;
  words: string[];
  correctOrder: string[];
  rule: string;
  translation: string;
}

export const sentenceConstructorQuestions: SentenceConstructorQuestion[] = [
  {
    id: 'sc1',
    topic: 'SVOMPT',
    instruction: 'Build a sentence in SVOMPT order:',
    words: ['every morning', 'carefully', 'She', 'a book', 'reads', 'in the library'],
    correctOrder: ['She', 'reads', 'a book', 'carefully', 'in the library', 'every morning'],
    rule: 'SVOMPT: Subject + Verb + Object + Manner + Place + Time. In English, manner comes before place, and time comes last.',
    translation: 'Она внимательно читает книгу в библиотеке каждое утро.',
  },
  {
    id: 'sc2',
    topic: 'SVOMPT',
    instruction: 'Arrange the words into correct SVOMPT order:',
    words: ['at school', 'quickly', 'The teacher', 'the lesson', 'explains', 'on Monday'],
    correctOrder: ['The teacher', 'explains', 'the lesson', 'quickly', 'at school', 'on Monday'],
    rule: 'Manner (quickly) before Place (at school) before Time (on Monday). Never put manner after place in English.',
    translation: 'Учитель быстро объясняет урок в школе в понедельник.',
  },
  {
    id: 'sc3',
    topic: 'SVOMPT',
    instruction: 'Build the sentence correctly:',
    words: ['yesterday', 'beautifully', 'He', 'a song', 'sang', 'at the concert'],
    correctOrder: ['He', 'sang', 'a song', 'beautifully', 'at the concert', 'yesterday'],
    rule: 'Subject(He) + Verb(sang) + Object(a song) + Manner(beautifully) + Place(at the concert) + Time(yesterday).',
    translation: 'Он красиво спел песню на концерте вчера.',
  },
  {
    id: 'sc4',
    topic: 'ASI',
    instruction: 'Build an ASI question (Auxiliary + Subject + Infinitive):',
    words: ['going', 'Are', 'to the cinema', 'you', 'tonight'],
    correctOrder: ['Are', 'you', 'going', 'to the cinema', 'tonight'],
    rule: 'ASI: Auxiliary(Are) + Subject(you) + main verb(going). Questions start with the auxiliary verb, not the subject.',
    translation: 'Ты идёшь в кино сегодня вечером?',
  },
  {
    id: 'sc5',
    topic: 'ASI',
    instruction: 'Form a yes/no question using ASI rule:',
    words: ['finish', 'Did', 'the project', 'you', 'on time'],
    correctOrder: ['Did', 'you', 'finish', 'the project', 'on time'],
    rule: 'ASI: Auxiliary(Did) + Subject(you) + Infinitive(finish). Use "Did" for past tense questions with the base form of the verb.',
    translation: 'Ты закончил проект вовремя?',
  },
  {
    id: 'sc6',
    topic: 'QUASI',
    instruction: 'Build a QUASI question (Question word + Auxiliary + Subject + Infinitive):',
    words: ['going', 'Where', 'you', 'are', 'tomorrow'],
    correctOrder: ['Where', 'are', 'you', 'going', 'tomorrow'],
    rule: 'QUASI: Question word(Where) + Auxiliary(are) + Subject(you) + main verb(going). Wh-questions place the question word first.',
    translation: 'Куда ты идёшь завтра?',
  },
  {
    id: 'sc7',
    topic: 'QUASI',
    instruction: 'Form a WH-question using QUASI order:',
    words: ['Why', 'she', 'did', 'leave', 'the party'],
    correctOrder: ['Why', 'did', 'she', 'leave', 'the party'],
    rule: 'QUASI: Why(Why) + Auxiliary(did) + Subject(she) + Infinitive(leave). Question word always comes before the auxiliary.',
    translation: 'Почему она ушла с вечеринки?',
  },
];

export interface MultipleChoiceQuestion {
  id: string;
  topic: Topic;
  question: string;
  options: string[];
  correctIndex: number;
  rule: string;
  translation: string;
}

export const multipleChoiceQuestions: MultipleChoiceQuestion[] = [
  {
    id: 'mc1',
    topic: 'SVOMPT',
    question: 'Choose the correct SVOMPT sentence:',
    options: [
      'He plays football well at the stadium on Sunday.',
      'He plays well football at the stadium on Sunday.',
      'He at the stadium plays football well on Sunday.',
      'He on Sunday plays football well at the stadium.',
    ],
    correctIndex: 0,
    rule: 'SVOMPT: Subject(He) + Verb(plays) + Object(football) + Manner(well) + Place(at the stadium) + Time(on Sunday). Manner always comes before Place.',
    translation: 'Он хорошо играет в футбол на стадионе в воскресенье.',
  },
  {
    id: 'mc2',
    topic: 'SVOMPT',
    question: 'Which sentence follows the SVOMPT rule correctly?',
    options: [
      'She every morning drinks coffee slowly at home.',
      'She drinks coffee slowly at home every morning.',
      'She slowly drinks coffee at home every morning.',
      'She drinks slowly coffee at home every morning.',
    ],
    correctIndex: 1,
    rule: 'Correct order: Subject(She) + Verb(drinks) + Object(coffee) + Manner(slowly) + Place(at home) + Time(every morning). Manner before Place before Time.',
    translation: 'Она медленно пьёт кофе дома каждое утро.',
  },
  {
    id: 'mc3',
    topic: 'ASI',
    question: 'Choose the correct ASI question form:',
    options: [
      'You are coming to the party?',
      'Are you coming to the party?',
      'Coming you are to the party?',
      'You coming are to the party?',
    ],
    correctIndex: 1,
    rule: 'ASI: Auxiliary(Are) + Subject(you) + main verb(coming). In English questions, the auxiliary verb moves to the front.',
    translation: 'Ты придёшь на вечеринку?',
  },
  {
    id: 'mc4',
    topic: 'ASI',
    question: 'Which is the correct yes/no question?',
    options: [
      'Does she likes ice cream?',
      'She does like ice cream?',
      'Does she like ice cream?',
      'Like she does ice cream?',
    ],
    correctIndex: 2,
    rule: 'ASI: Auxiliary(Does) + Subject(she) + Infinitive(like). After "does", use the base form of the verb (like, not likes).',
    translation: 'Она любит мороженое?',
  },
  {
    id: 'mc5',
    topic: 'QUASI',
    question: 'Choose the correct QUASI question:',
    options: [
      'What you are doing now?',
      'What are you doing now?',
      'What doing are you now?',
      'Are you what doing now?',
    ],
    correctIndex: 1,
    rule: 'QUASI: Question word(What) + Auxiliary(are) + Subject(you) + main verb(doing). The question word always starts the sentence.',
    translation: 'Что ты сейчас делаешь?',
  },
  {
    id: 'mc6',
    topic: 'QUASI',
    question: 'Which WH-question is formed correctly?',
    options: [
      'Where she does live?',
      'Where does she live?',
      'Does where she live?',
      'She does where live?',
    ],
    correctIndex: 1,
    rule: 'QUASI: Where + Auxiliary(does) + Subject(she) + Infinitive(live). Question word first, then auxiliary, then subject, then base verb.',
    translation: 'Где она живёт?',
  },
  {
    id: 'mc7',
    topic: 'SVOMPT',
    question: 'Identify the SVOMPT-correct sentence:',
    options: [
      'They watched the movie quietly in the cinema last night.',
      'They quietly watched the movie in the cinema last night.',
      'They in the cinema watched the movie quietly last night.',
      'They last night watched the movie quietly in the cinema.',
    ],
    correctIndex: 0,
    rule: 'Subject(They) + Verb(watched) + Object(the movie) + Manner(quietly) + Place(in the cinema) + Time(last night). Adverb of manner goes immediately after the object.',
    translation: 'Они тихо смотрели фильм в кинотеатре прошлой ночью.',
  },
  {
    id: 'mc8',
    topic: 'ASI',
    question: 'Which past tense question uses ASI correctly?',
    options: [
      'Went you to the store yesterday?',
      'You went to the store yesterday?',
      'Did you go to the store yesterday?',
      'Did you went to the store yesterday?',
    ],
    correctIndex: 2,
    rule: 'ASI: Auxiliary(Did) + Subject(you) + Infinitive(go). Use "did" + base verb (go, not went) for past tense questions.',
    translation: 'Ты ходил в магазин вчера?',
  },
];

export const FILM_VOCABULARY = [
  'vicious cycle of hatred',
  'character redemption',
  'ideological influence',
];

export const ESSAY_TEMPLATE = {
  introduction: 'The film "American History X" directed by Tony Kaye (1998) is a powerful drama that explores themes of racism, hatred, and the possibility of change. The story follows Derek Vinyard, a former white supremacist who tries to prevent his younger brother Danny from following the same path.',
  plot_summary: 'The narrative unfolds through a series of flashbacks showing Derek\'s transformation from a bright student into the leader of a neo-Nazi gang. After serving time in prison for manslaughter, Derek returns home a changed man, determined to save Danny from the vicious cycle of hatred that consumed him.',
  character_analysis: 'Derek Vinyard\'s character redemption arc is the emotional core of the film. In prison, he confronts the reality of his beliefs and experiences the hypocrisy of the ideology he once championed. His relationship with Lamont, a Black inmate, and the guidance of his former teacher Dr. Sweeney play crucial roles in his transformation.',
  theme_reflection: 'The film powerfully illustrates the ideological influence of extremist groups on vulnerable youth. It shows how hatred destroys families and communities, while also suggesting that redemption is possible through empathy and critical thinking. The tragic ending reinforces the consequences of the vicious cycle of hatred.',
};

export const TOPICS: { id: Topic; name: string; description: string; color: string }[] = [
  { id: 'SVOMPT', name: 'SVOMPT', description: 'Subject + Verb + Object + Manner + Place + Time', color: 'hsl(var(--chart-2))' },
  { id: 'ASI', name: 'ASI', description: 'Auxiliary + Subject + Infinitive (yes/no questions)', color: 'hsl(var(--chart-1))' },
  { id: 'QUASI', name: 'QUASI', description: 'Question word + Auxiliary + Subject + Infinitive', color: 'hsl(var(--chart-3))' },
];
