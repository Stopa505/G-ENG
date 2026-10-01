import { Topic } from './supabase';

export const SVOMPT_TABLE = [
  { letter: 'S', name: 'Subject', nameRu: 'Подлежащее', description: 'Кто или что выполняет действие', example: 'She' },
  { letter: 'V', name: 'Verb', nameRu: 'Сказуемое', description: 'Само действие (глагол)', example: 'reads' },
  { letter: 'O', name: 'Object', nameRu: 'Дополнение', description: 'На что направлено действие', example: 'a book' },
  { letter: 'M', name: 'Manner', nameRu: 'Образ действия', description: 'Как выполняется действие (наречие)', example: 'carefully' },
  { letter: 'P', name: 'Place', nameRu: 'Место', description: 'Где происходит действие', example: 'in the library' },
  { letter: 'T', name: 'Time', nameRu: 'Время', description: 'Когда происходит действие', example: 'every morning' },
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
    instruction: 'Составьте предложение в порядке SVOMPT:',
    words: ['every morning', 'carefully', 'She', 'a book', 'reads', 'in the library'],
    correctOrder: ['She', 'reads', 'a book', 'carefully', 'in the library', 'every morning'],
    rule: 'SVOMPT: Подлежащее + Глагол + Дополнение + Образ действия + Место + Время. В английском языке образ действия стоит перед местом, а время — в конце.',
    translation: 'Она внимательно читает книгу в библиотеке каждое утро.',
  },
  {
    id: 'sc2',
    topic: 'SVOMPT',
    instruction: 'Расположите слова в правильном порядке SVOMPT:',
    words: ['at school', 'quickly', 'The teacher', 'the lesson', 'explains', 'on Monday'],
    correctOrder: ['The teacher', 'explains', 'the lesson', 'quickly', 'at school', 'on Monday'],
    rule: 'Образ действия (quickly) перед Местом (at school) перед Временем (on Monday). Никогда не ставьте образ действия после места в английском.',
    translation: 'Учитель быстро объясняет урок в школе в понедельник.',
  },
  {
    id: 'sc3',
    topic: 'SVOMPT',
    instruction: 'Постройте предложение правильно:',
    words: ['yesterday', 'beautifully', 'He', 'a song', 'sang', 'at the concert'],
    correctOrder: ['He', 'sang', 'a song', 'beautifully', 'at the concert', 'yesterday'],
    rule: 'Подлежащее(He) + Глагол(sang) + Дополнение(a song) + Образ действия(beautifully) + Место(at the concert) + Время(yesterday).',
    translation: 'Он красиво спел песню на концерте вчера.',
  },
  {
    id: 'sc4',
    topic: 'SVOMPT',
    instruction: 'Соберите предложение по правилу SVOMPT:',
    words: ['in the park', 'happily', 'The children', 'played', 'games', 'all day'],
    correctOrder: ['The children', 'played', 'games', 'happily', 'in the park', 'all day'],
    rule: 'Подлежащее + Глагол + Дополнение + Образ действия(happily) + Место(in the park) + Время(all day). Наречие образа действия всегда после дополнения.',
    translation: 'Дети весело играли в игры в парке весь день.',
  },
  {
    id: 'sc5',
    topic: 'ASI',
    instruction: 'Составьте вопрос ASI (Вспом. глагол + Подлежащее + Инфинитив):',
    words: ['going', 'Are', 'to the cinema', 'you', 'tonight'],
    correctOrder: ['Are', 'you', 'going', 'to the cinema', 'tonight'],
    rule: 'ASI: Вспомогательный глагол(Are) + Подлежащее(you) + Основной глагол(going). Вопрос начинается со вспомогательного глагола, а не с подлежащего.',
    translation: 'Ты идёшь в кино сегодня вечером?',
  },
  {
    id: 'sc6',
    topic: 'ASI',
    instruction: 'Образуйте yes/no вопрос по правилу ASI:',
    words: ['finish', 'Did', 'the project', 'you', 'on time'],
    correctOrder: ['Did', 'you', 'finish', 'the project', 'on time'],
    rule: 'ASI: Вспом. глагол(Did) + Подлежащее(you) + Инфинитив(finish). Используйте "Did" + базовую форму глагола для прошедшего времени.',
    translation: 'Ты закончил проект вовремя?',
  },
  {
    id: 'sc7',
    topic: 'ASI',
    instruction: 'Постройте вопрос ASI:',
    words: ['going', 'Is', 'to the party', 'she', 'tomorrow'],
    correctOrder: ['Is', 'she', 'going', 'to the party', 'tomorrow'],
    rule: 'ASI: Вспом. глагол(Is) + Подлежащее(she) + Основной глагол(going). Для Present Continuous вопросов используется "is/are" в начале.',
    translation: 'Она идёт на вечеринку завтра?',
  },
  {
    id: 'sc8',
    topic: 'ASI',
    instruction: 'Составьте вопрос ASI с "Does":',
    words: ['like', 'Does', 'he', 'coffee', 'in the morning'],
    correctOrder: ['Does', 'he', 'like', 'coffee', 'in the morning'],
    rule: 'ASI: Вспом. глагол(Does) + Подлежащее(he) + Инфинитив(like). После "does" используется базовая форма глагола (like, не likes).',
    translation: 'Он любит кофе по утрам?',
  },
  {
    id: 'sc9',
    topic: 'QUASI',
    instruction: 'Составьте QUASI вопрос (Вопрос. слово + Вспом. глагол + Подлежащее + Инфинитив):',
    words: ['going', 'Where', 'you', 'are', 'tomorrow'],
    correctOrder: ['Where', 'are', 'you', 'going', 'tomorrow'],
    rule: 'QUASI: Вопрос. слово(Where) + Вспом. глагол(are) + Подлежащее(you) + Основной глагол(going). Вопросительное слово всегда в начале.',
    translation: 'Куда ты идёшь завтра?',
  },
  {
    id: 'sc10',
    topic: 'QUASI',
    instruction: 'Образуйте WH-вопрос по правилу QUASI:',
    words: ['Why', 'she', 'did', 'leave', 'the party'],
    correctOrder: ['Why', 'did', 'she', 'leave', 'the party'],
    rule: 'QUASI: Почему(Why) + Вспом. глагол(did) + Подлежащее(she) + Инфинитив(leave). Вопросительное слово стоит перед вспомогательным.',
    translation: 'Почему она ушла с вечеринки?',
  },
  {
    id: 'sc11',
    topic: 'QUASI',
    instruction: 'Постройте QUASI вопрос:',
    words: ['What', 'doing', 'are', 'they', 'now'],
    correctOrder: ['What', 'are', 'they', 'doing', 'now'],
    rule: 'QUASI: Что(What) + Вспом. глагол(are) + Подлежащее(they) + Основной глагол(doing). Вопросительное слово + порядок ASI.',
    translation: 'Что они сейчас делают?',
  },
  {
    id: 'sc12',
    topic: 'QUASI',
    instruction: 'Составьте QUASI вопрос с "When":',
    words: ['When', 'will', 'arrive', 'the train', 'at the station'],
    correctOrder: ['When', 'will', 'the train', 'arrive', 'at the station'],
    rule: 'QUASI: Когда(When) + Вспом. глагол(will) + Подлежащее(the train) + Инфинитив(arrive). Вопросительное слово первым, затем ASI.',
    translation: 'Когда поезд прибудет на станцию?',
  },
];

export interface TranslationQuestion {
  id: string;
  topic: Topic;
  direction: 'en-ru' | 'ru-en';
  sourceText: string;
  correctAnswer: string;
  hintWords: { word: string; translation: string }[];
  rule: string;
}

export const translationQuestions: TranslationQuestion[] = [
  {
    id: 'tr1',
    topic: 'SVOMPT',
    direction: 'en-ru',
    sourceText: 'She reads a book carefully in the library every morning.',
    correctAnswer: 'Она внимательно читает книгу в библиотеке каждое утро',
    hintWords: [
      { word: 'reads', translation: 'читает' },
      { word: 'carefully', translation: 'внимательно' },
      { word: 'in the library', translation: 'в библиотеке' },
    ],
    rule: 'SVOMPT: порядок слов сохраняется. Подлежащее → Глагол → Дополнение → Образ действия → Место → Время.',
  },
  {
    id: 'tr2',
    topic: 'SVOMPT',
    direction: 'ru-en',
    sourceText: 'Учитель быстро объясняет урок в школе в понедельник.',
    correctAnswer: 'The teacher explains the lesson quickly at school on Monday',
    hintWords: [
      { word: 'объясняет', translation: 'explains' },
      { word: 'быстро', translation: 'quickly' },
      { word: 'в школе', translation: 'at school' },
    ],
    rule: 'В английском: Subject + Verb + Object + Manner + Place + Time. Образ действия (quickly) перед местом (at school).',
  },
  {
    id: 'tr3',
    topic: 'ASI',
    direction: 'en-ru',
    sourceText: 'Are you coming to the party tonight?',
    correctAnswer: 'Ты придёшь на вечеринку сегодня вечером',
    hintWords: [
      { word: 'Are', translation: '(вспом. глагол)' },
      { word: 'coming', translation: 'придёшь' },
      { word: 'tonight', translation: 'сегодня вечером' },
    ],
    rule: 'ASI: Вспом. глагол + Подлежащее + Глагол. На русский переводится обычным порядком слов.',
  },
  {
    id: 'tr4',
    topic: 'ASI',
    direction: 'ru-en',
    sourceText: 'Ты закончил проект вовремя?',
    correctAnswer: 'Did you finish the project on time',
    hintWords: [
      { word: 'закончил', translation: 'finish (базовая форма!)' },
      { word: 'вовремя', translation: 'on time' },
      { word: '?', translation: 'Did (для прош. времени)' },
    ],
    rule: 'ASI для прошлого времени: Did + Подлежащее + Инфинитив. Глагол в базовой форме (finish, не finished).',
  },
  {
    id: 'tr5',
    topic: 'QUASI',
    direction: 'en-ru',
    sourceText: 'Where are you going tomorrow?',
    correctAnswer: 'Куда ты идёшь завтра',
    hintWords: [
      { word: 'Where', translation: 'Куда' },
      { word: 'are', translation: '(вспом. глагол)' },
      { word: 'going', translation: 'идёшь' },
    ],
    rule: 'QUASI: Вопрос. слово + Вспом. глагол + Подлежащее + Глагол. На русский переводится естественно.',
  },
  {
    id: 'tr6',
    topic: 'QUASI',
    direction: 'ru-en',
    sourceText: 'Почему она ушла с вечеринки?',
    correctAnswer: 'Why did she leave the party',
    hintWords: [
      { word: 'Почему', translation: 'Why' },
      { word: 'ушла', translation: 'leave (базовая форма!)' },
      { word: 'с вечеринки', translation: 'the party' },
    ],
    rule: 'QUASI: Why + Did + Подлежащее(she) + Инфинитив(leave). Глагол в базовой форме.',
  },
];

export interface MatchingQuestion {
  id: string;
  topic: Topic;
  instruction: string;
  pairs: { english: string; russian: string }[];
  rule: string;
}

export const matchingQuestions: MatchingQuestion[] = [
  {
    id: 'mt1',
    topic: 'SVOMPT',
    instruction: 'Сопоставьте английские слова с их переводом:',
    pairs: [
      { english: 'Subject', russian: 'Подлежащее' },
      { english: 'Manner', russian: 'Образ действия' },
      { english: 'Verb', russian: 'Глагол' },
      { english: 'Place', russian: 'Место' },
      { english: 'Object', russian: 'Дополнение' },
      { english: 'Time', russian: 'Время' },
    ],
    rule: 'SVOMPT расшифровывается как: Subject (Подлежащее) → Verb (Глагол) → Object (Дополнение) → Manner (Образ действия) → Place (Место) → Time (Время).',
  },
  {
    id: 'mt2',
    topic: 'ASI',
    instruction: 'Сопоставьте элементы вопроса ASI с переводом:',
    pairs: [
      { english: 'Auxiliary', russian: 'Вспомогательный глагол' },
      { english: 'Subject', russian: 'Подлежащее' },
      { english: 'Infinitive', russian: 'Инфинитив (базовая форма)' },
      { english: 'Are', russian: 'Настоящее время (мн.ч.)' },
      { english: 'Did', russian: 'Прошедшее время' },
      { english: 'Does', russian: 'Настоящее время (3-е л.)' },
    ],
    rule: 'ASI = Auxiliary + Subject + Infinitive. Вспомогательный глагол определяется по времени и лицу: Are/Is/Am (Present), Did (Past), Does (Present 3rd person).',
  },
  {
    id: 'mt3',
    topic: 'QUASI',
    instruction: 'Сопоставьте вопросительные слова с переводом:',
    pairs: [
      { english: 'What', russian: 'Что' },
      { english: 'Where', russian: 'Где / Куда' },
      { english: 'When', russian: 'Когда' },
      { english: 'Why', russian: 'Почему' },
      { english: 'Who', russian: 'Кто' },
      { english: 'How', russian: 'Как' },
    ],
    rule: 'QUASI = Question word + Auxiliary + Subject + Infinitive. Вопросительное слово ставится в начало, затем порядок ASI.',
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
    question: 'Выберите правильное предложение SVOMPT:',
    options: [
      'He plays football well at the stadium on Sunday.',
      'He plays well football at the stadium on Sunday.',
      'He at the stadium plays football well on Sunday.',
      'He on Sunday plays football well at the stadium.',
    ],
    correctIndex: 0,
    rule: 'SVOMPT: Подлежащее(He) + Глагол(plays) + Дополнение(football) + Образ действия(well) + Место(at the stadium) + Время(on Sunday). Образ действия всегда перед местом.',
    translation: 'Он хорошо играет в футбол на стадионе в воскресенье.',
  },
  {
    id: 'mc2',
    topic: 'SVOMPT',
    question: 'Какое предложение следует правилу SVOMPT?',
    options: [
      'She every morning drinks coffee slowly at home.',
      'She drinks coffee slowly at home every morning.',
      'She slowly drinks coffee at home every morning.',
      'She drinks slowly coffee at home every morning.',
    ],
    correctIndex: 1,
    rule: 'Правильный порядок: Подлежащее(She) + Глагол(drinks) + Дополнение(coffee) + Образ действия(slowly) + Место(at home) + Время(every morning).',
    translation: 'Она медленно пьёт кофе дома каждое утро.',
  },
  {
    id: 'mc3',
    topic: 'ASI',
    question: 'Выберите правильную форму вопроса ASI:',
    options: [
      'You are coming to the party?',
      'Are you coming to the party?',
      'Coming you are to the party?',
      'You coming are to the party?',
    ],
    correctIndex: 1,
    rule: 'ASI: Вспом. глагол(Are) + Подлежащее(you) + Глагол(coming). В английских вопросах вспом. глагол переносится в начало.',
    translation: 'Ты придёшь на вечеринку?',
  },
  {
    id: 'mc4',
    topic: 'ASI',
    question: 'Какой yes/no вопрос составлен правильно?',
    options: [
      'Does she likes ice cream?',
      'She does like ice cream?',
      'Does she like ice cream?',
      'Like she does ice cream?',
    ],
    correctIndex: 2,
    rule: 'ASI: Вспом. глагол(Does) + Подлежащее(she) + Инфинитив(like). После "does" используется базовая форма глагола (like, не likes).',
    translation: 'Она любит мороженое?',
  },
  {
    id: 'mc5',
    topic: 'QUASI',
    question: 'Выберите правильный QUASI вопрос:',
    options: [
      'What you are doing now?',
      'What are you doing now?',
      'What doing are you now?',
      'Are you what doing now?',
    ],
    correctIndex: 1,
    rule: 'QUASI: Вопрос. слово(What) + Вспом. глагол(are) + Подлежащее(you) + Глагол(doing). Вопросительное слово всегда в начале.',
    translation: 'Что ты сейчас делаешь?',
  },
  {
    id: 'mc6',
    topic: 'QUASI',
    question: 'Какой WH-вопрос образован правильно?',
    options: [
      'Where she does live?',
      'Where does she live?',
      'Does where she live?',
      'She does where live?',
    ],
    correctIndex: 1,
    rule: 'QUASI: Where + Вспом. глагол(does) + Подлежащее(she) + Инфинитив(live). Вопрос. слово → вспом. глагол → подлежащее → базовый глагол.',
    translation: 'Где она живёт?',
  },
  {
    id: 'mc7',
    topic: 'SVOMPT',
    question: 'Найдите предложение, правильное по SVOMPT:',
    options: [
      'They watched the movie quietly in the cinema last night.',
      'They quietly watched the movie in the cinema last night.',
      'They in the cinema watched the movie quietly last night.',
      'They last night watched the movie quietly in the cinema.',
    ],
    correctIndex: 0,
    rule: 'Подлежащее(They) + Глагол(watched) + Дополнение(the movie) + Образ действия(quietly) + Место(in the cinema) + Время(last night). Наречие образа действия сразу после дополнения.',
    translation: 'Они тихо смотрели фильм в кинотеатре прошлой ночью.',
  },
  {
    id: 'mc8',
    topic: 'ASI',
    question: 'Какой прошедший вопрос использует ASI правильно?',
    options: [
      'Went you to the store yesterday?',
      'You went to the store yesterday?',
      'Did you go to the store yesterday?',
      'Did you went to the store yesterday?',
    ],
    correctIndex: 2,
    rule: 'ASI: Вспом. глагол(Did) + Подлежащее(you) + Инфинитив(go). Используйте "did" + базовый глагол (go, не went).',
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
