/* =========================================================
 * 6학년 · What do you want to be? 데이터
 * - 꿈 말하기(I want to be a ___.) : 초급 / 중급 / 고급 각 15개 (총 45문장)
 * - 카테고리(인덱스별 공통) : book(교과서 직업 7) / fun(인기 직업 8)
 * - 묻는 표현 5개 · 이유(I like ___.) 13개 · 반응 표현 5개
 * - 내 꿈 만들기용 데이터 (직업 + 이유 조합)
 * - 단어 뜻 사전
 *  ※ 직업 이미지: Canva에서 만든 그림을 images/jobs/<id>.png 로 넣으면
 *    자동으로 카드에 표시되고, 파일이 없으면 이모지로 대체됩니다.
 * - 내 꿈 세트(3개) + 내 표현(질문 1 · 반응 1) 은 app.js 에서 localStorage 에 저장
 * ========================================================= */

/* ===== 직업 15개 (모든 탭에서 공통으로 쓰는 기본 목록) =====
 * en  : 관사까지 포함 (a doctor / an artist)
 * img : Canva 이미지 파일 경로
 * canva : Canva 'Magic Media'에 넣을 이미지 생성 프롬프트 */
const JOBS = [
  // 📘 교과서 직업 (7)
  { id: "doctor",         en: "a doctor",         ko: "의사",           emoji: "🧑‍⚕️", cat: "book", reason: "helping people",
    why: "I want to help sick people.",       whyKo: "나는 아픈 사람들을 돕고 싶어.",
    canva: "cute cartoon kid doctor with a stethoscope in a white coat, bright flat illustration, white background" },
  { id: "teacher",        en: "a teacher",        ko: "선생님",         emoji: "🧑‍🏫", cat: "book", reason: "children",
    why: "I want to teach children.",         whyKo: "나는 아이들을 가르치고 싶어.",
    canva: "cute cartoon kid teacher in front of a blackboard, bright flat illustration, white background" },
  { id: "singer",         en: "a singer",         ko: "가수",           emoji: "🧑‍🎤", cat: "book", reason: "singing",
    why: "I want to sing on stage.",          whyKo: "나는 무대에서 노래하고 싶어.",
    canva: "cute cartoon kid singer with a microphone on a colorful stage, bright flat illustration" },
  { id: "scientist",      en: "a scientist",      ko: "과학자",         emoji: "🧑‍🔬", cat: "book", reason: "science",
    why: "I want to make new things.",        whyKo: "나는 새로운 것을 만들고 싶어.",
    canva: "cute cartoon kid scientist with goggles and test tubes in a lab, bright flat illustration" },
  { id: "police-officer", en: "a police officer", ko: "경찰관",         emoji: "👮", cat: "book", reason: "helping people",
    why: "I want to keep people safe.",       whyKo: "나는 사람들을 안전하게 지키고 싶어.",
    canva: "cute cartoon kid police officer in a blue uniform, friendly, bright flat illustration, white background" },
  { id: "cook",           en: "a cook",           ko: "요리사",         emoji: "🧑‍🍳", cat: "book", reason: "cooking",
    why: "I want to make delicious food.",    whyKo: "나는 맛있는 음식을 만들고 싶어.",
    canva: "cute cartoon kid chef with a tall white hat cooking in a kitchen, bright flat illustration" },
  { id: "pilot",          en: "a pilot",          ko: "비행기 조종사",  emoji: "🧑‍✈️", cat: "book", reason: "flying",
    why: "I want to fly around the world.",   whyKo: "나는 세계를 날아다니고 싶어.",
    canva: "cute cartoon kid pilot in uniform in front of an airplane, bright flat illustration, blue sky" },
  // 🌟 인기 직업 (8)
  { id: "firefighter",    en: "a firefighter",    ko: "소방관",         emoji: "🧑‍🚒", cat: "fun", reason: "helping people",
    why: "I want to save people.",            whyKo: "나는 사람들을 구하고 싶어.",
    canva: "cute cartoon kid firefighter with a helmet and a fire truck, bright flat illustration" },
  { id: "artist",         en: "an artist",        ko: "화가",           emoji: "🧑‍🎨", cat: "fun", reason: "drawing",
    why: "I want to draw beautiful pictures.", whyKo: "나는 아름다운 그림을 그리고 싶어.",
    canva: "cute cartoon kid artist painting on a canvas with a palette, bright flat illustration" },
  { id: "writer",         en: "a writer",         ko: "작가",           emoji: "✍️", cat: "fun", reason: "writing stories",
    why: "I want to write fun books.",        whyKo: "나는 재미있는 책을 쓰고 싶어.",
    canva: "cute cartoon kid writer writing a story book at a desk, bright flat illustration" },
  { id: "soccer-player",  en: "a soccer player",  ko: "축구 선수",      emoji: "⚽", cat: "fun", reason: "soccer",
    why: "I want to play in the World Cup.",  whyKo: "나는 월드컵에서 뛰고 싶어.",
    canva: "cute cartoon kid soccer player kicking a ball on a green field, bright flat illustration" },
  { id: "youtuber",       en: "a YouTuber",       ko: "유튜버",         emoji: "📹", cat: "fun", reason: "making videos",
    why: "I want to make fun videos.",        whyKo: "나는 재미있는 영상을 만들고 싶어.",
    canva: "cute cartoon kid video creator talking to a camera with a ring light, bright flat illustration" },
  { id: "game-designer",  en: "a game designer",  ko: "게임 디자이너",  emoji: "🎮", cat: "fun", reason: "games",
    why: "I want to make my own games.",      whyKo: "나는 나만의 게임을 만들고 싶어.",
    canva: "cute cartoon kid game designer at a computer making a video game, bright flat illustration" },
  { id: "vet",            en: "a vet",            ko: "수의사",         emoji: "🐶", cat: "fun", reason: "animals",
    why: "I want to help sick animals.",      whyKo: "나는 아픈 동물들을 돕고 싶어.",
    canva: "cute cartoon kid veterinarian hugging a puppy and a kitten, bright flat illustration" },
  { id: "dancer",         en: "a dancer",         ko: "댄서",           emoji: "💃", cat: "fun", reason: "dancing",
    why: "I want to dance on a big stage.",   whyKo: "나는 큰 무대에서 춤추고 싶어.",
    canva: "cute cartoon kid dancer dancing on a colorful stage, bright flat illustration" },
];
JOBS.forEach(j => { j.img = `images/jobs/${j.id}.png`; });

/* 카테고리: 같은 인덱스끼리 같은 종류 */
const SUGGESTION_CATEGORIES = JOBS.map(j => j.cat);

/* ===== 이유 (I like ___.) ===== */
const REASONS = [
  { en: "helping people",  ko: "사람들을 돕는 것", emoji: "🤝" },
  { en: "children",        ko: "아이들",           emoji: "🧒" },
  { en: "singing",         ko: "노래하는 것",      emoji: "🎵" },
  { en: "science",         ko: "과학",             emoji: "🔬" },
  { en: "cooking",         ko: "요리하는 것",      emoji: "🍳" },
  { en: "flying",          ko: "하늘을 나는 것",   emoji: "✈️" },
  { en: "drawing",         ko: "그림 그리는 것",   emoji: "🖍️" },
  { en: "writing stories", ko: "이야기 쓰는 것",   emoji: "📖" },
  { en: "soccer",          ko: "축구",             emoji: "⚽" },
  { en: "making videos",   ko: "영상 만드는 것",   emoji: "🎬" },
  { en: "games",           ko: "게임",             emoji: "🕹️" },
  { en: "animals",         ko: "동물",             emoji: "🐾" },
  { en: "dancing",         ko: "춤추는 것",        emoji: "🩰" },
];
const findReasonByEn = en => REASONS.find(r => r.en === en);

/* 한국어 조사: 받침 있으면 a, 없으면 b (예: josa("선생님","이","가") → "선생님이") */
function josa(word, a, b) {
  const c = word.charCodeAt(word.length - 1);
  const has = c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
  return word + (has ? a : b);
}
const beKo = j => `나는 ${josa(j.ko, "이", "가")} 되고 싶어.`;
const likeKo = r => `나는 ${josa(r.ko, "을", "를")} 좋아해.`;

/* ===== 꿈 말하기 문장 (모두 "I want to be a/an ~." 로 시작) ===== */
const SUGGESTION_LEVELS = {
  beginner: JOBS.map(j => ({
    en: `I want to be ${j.en}.`,
    ko: beKo(j),
    emoji: j.emoji, img: j.img,
  })),
  intermediate: JOBS.map(j => {
    const r = findReasonByEn(j.reason);
    return {
      en: `I want to be ${j.en}. I like ${r.en}.`,
      ko: `${beKo(j)} ${likeKo(r)}`,
      emoji: j.emoji, img: j.img,
    };
  }),
  advanced: JOBS.map(j => {
    const r = findReasonByEn(j.reason);
    return {
      en: `I want to be ${j.en}. I like ${r.en}. ${j.why}`,
      ko: `${beKo(j)} ${likeKo(r)} ${j.whyKo}`,
      emoji: j.emoji, img: j.img,
    };
  }),
};

/* ===== 묻는 표현 (장래 희망 묻기) ===== */
const QUESTION_EXPRESSIONS = [
  { en: "What do you want to be?",                  ko: "너는 무엇이 되고 싶니?",          emoji: "🤔" },
  { en: "What do you want to be in the future?",    ko: "너는 미래에 무엇이 되고 싶니?",   emoji: "🔮" },
  { en: "What do you want to be when you grow up?", ko: "너는 커서 무엇이 되고 싶니?",     emoji: "🌱" },
  { en: "What's your dream job?",                   ko: "네 꿈의 직업은 뭐니?",            emoji: "💭" },
  { en: "What job do you want to have?",            ko: "너는 어떤 직업을 갖고 싶니?",     emoji: "💼" },
];

/* ===== 반응 표현 (친구의 꿈을 듣고) ===== */
const REACTION_EXPRESSIONS = [
  { en: "That's great!",   ko: "멋지다!",           emoji: "👍" },
  { en: "Cool!",           ko: "멋있다!",           emoji: "😎" },
  { en: "Sounds great!",   ko: "좋은데!",           emoji: "🤩" },
  { en: "Good for you!",   ko: "잘됐다!",           emoji: "👏" },
  { en: "You can do it!",  ko: "너는 할 수 있어!",  emoji: "💪" },
];

/* ===== 내 꿈 만들기 (직업 + 이유 조합) ===== */
const BUILD_CATS = [
  { key: "book", label: "📘 교과서 직업" },
  { key: "fun",  label: "🌟 인기 직업" },
];

/* ===== 단어 뜻 사전 ===== */
function wordKey(w) {
  return w.toLowerCase().replace(/^[^a-z0-9':]+/, "").replace(/[^a-z0-9':]+$/, "");
}

const WORD_MEANINGS = {
  "what": "무엇",
  "what's": "~은 무엇이니 (what is)",
  "do": "(의문문을 만드는 말) / 하다",
  "you": "너, 너희",
  "your": "너의",
  "want": "원하다",
  "to": "~하는 것 (want to: ~하고 싶다)",
  "be": "~이 되다",
  "i": "나는",
  "a": "하나의 (자음 소리 앞)",
  "an": "하나의 (모음 소리 앞: an artist)",
  "in": "~에, ~안에",
  "the": "그 (특정한 것)",
  "future": "미래",
  "when": "~할 때",
  "grow": "자라다 (grow up: 어른이 되다)",
  "up": "위로 (grow up: 어른이 되다)",
  "dream": "꿈",
  "job": "직업, 일",
  "have": "가지다",
  "why": "왜",
  "like": "좋아하다",
  "doctor": "의사",
  "teacher": "선생님",
  "singer": "가수",
  "scientist": "과학자",
  "police": "경찰",
  "officer": "관리, 경관 (police officer: 경찰관)",
  "cook": "요리사; 요리하다",
  "pilot": "비행기 조종사",
  "firefighter": "소방관",
  "artist": "화가, 예술가",
  "writer": "작가",
  "soccer": "축구",
  "player": "선수",
  "youtuber": "유튜버",
  "game": "게임",
  "games": "게임 (여러 개)",
  "designer": "디자이너",
  "vet": "수의사",
  "dancer": "댄서, 무용가",
  "helping": "돕는 것 (help)",
  "help": "돕다",
  "people": "사람들",
  "children": "아이들",
  "singing": "노래하는 것",
  "sing": "노래하다",
  "science": "과학",
  "cooking": "요리하는 것",
  "flying": "나는 것, 비행",
  "fly": "날다",
  "drawing": "그림 그리기",
  "draw": "그리다",
  "writing": "쓰는 것",
  "write": "쓰다",
  "stories": "이야기들",
  "making": "만드는 것",
  "make": "만들다",
  "videos": "영상들",
  "animals": "동물들",
  "dancing": "춤추는 것",
  "dance": "춤추다",
  "sick": "아픈",
  "teach": "가르치다",
  "on": "~위에서",
  "stage": "무대",
  "new": "새로운",
  "things": "것들",
  "keep": "지키다, 유지하다",
  "safe": "안전한",
  "delicious": "맛있는",
  "food": "음식",
  "around": "~ 곳곳에",
  "world": "세계",
  "save": "구하다",
  "beautiful": "아름다운",
  "pictures": "그림들",
  "fun": "재미있는",
  "books": "책들",
  "play": "경기하다, 놀다",
  "cup": "컵, 우승컵 (World Cup: 월드컵)",
  "my": "나의",
  "own": "자신의",
  "big": "큰",
  "that's": "그것은 ~이다 (that is)",
  "great": "멋진, 훌륭한",
  "cool": "멋진",
  "sounds": "~하게 들리다",
  "good": "좋은",
  "for": "~에게, ~을 위해",
  "can": "~할 수 있다",
  "it": "그것",
};
