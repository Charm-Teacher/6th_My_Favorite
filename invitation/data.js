/* =========================================================
 * 6학년 · Can you come to the ___? 데이터
 * - 초대 문장(Can you come to ~?) : 초급 / 중급 / 고급 각 18개
 * - 카테고리(인덱스별 공통) : book(교과서 행사) / fun(재미있는 행사)
 * - 승낙 표현 5개 · 거절 표현(Sorry, but I can't. I have a ~.) 10개
 * - 약속 잡기 : Please come to (장소) at (시간).  장소 10 · 시간 10
 * - 대화 만들기용 데이터 (행사 + 대답 + 장소/시간 조합)
 * - 단어 뜻 사전
 *  ※ 교과서 행사 6개 모두 포함:
 *    my birthday party / taekwondo show / laser show /
 *    book festival / movie festival / cooking class party
 *  ※ 초6이 좋아하는 행사 12개:
 *    K-pop concert · slime festival · magic show · school festival ·
 *    pizza party · robot show · game party · dance contest ·
 *    Halloween party · sleepover party · water park party · fireworks festival
 * - 내 행사 세트(3개) + 내 대답(승낙 1 · 거절 1) 은 app.js 에서 localStorage 에 저장
 * ========================================================= */

/* 카테고리: 같은 인덱스끼리 같은 종류 */
const SUGGESTION_CATEGORIES = [
  "book","book","book","book","book","book",                  // 0~5   📘 교과서 행사 (6)
  "fun","fun","fun","fun","fun","fun","fun","fun","fun","fun","fun","fun", // 6~17 🎈 재미있는 행사 (12)
];

/* 이미지(실사) 검색 키워드 - 인덱스별 공통 */
const IMAGE_PROMPTS = [
  "kids birthday party with a big cake and balloons",
  "children performing taekwondo show in white uniforms on stage",
  "colorful laser light show at night",
  "kids at a book festival with many books and tents",
  "kids watching a movie at an outdoor movie festival",
  "kids cooking class party wearing chef hats",
  "kpop concert stage with colorful lights and cheering fans",
  "kids playing with colorful slime at a festival",
  "magician doing a magic show for children",
  "school festival with balloons and booths",
  "kids having a pizza party",
  "robot show with dancing robots for kids",
  "kids playing video games together at a game party",
  "kids dance contest on a bright stage",
  "kids halloween party with pumpkins and costumes",
  "kids sleepover party with pillows and blankets",
  "kids having fun at a water park party",
  "colorful fireworks festival at night",
];

/* ===== 초대 문장 (모두 "Can you come to ~?" 로 시작) =====
 * 인덱스: book(0-5) · fun(6-17) */
const SUGGESTION_LEVELS = {
  beginner: [
    // 📘 교과서 행사
    { en: "Can you come to my birthday party?",       ko: "내 생일 파티에 올 수 있니?",     emoji: "🎂" },
    { en: "Can you come to the taekwondo show?",      ko: "태권도 공연에 올 수 있니?",      emoji: "🥋" },
    { en: "Can you come to the laser show?",          ko: "레이저 쇼에 올 수 있니?",        emoji: "✨" },
    { en: "Can you come to the book festival?",       ko: "책 축제에 올 수 있니?",          emoji: "📚" },
    { en: "Can you come to the movie festival?",      ko: "영화 축제에 올 수 있니?",        emoji: "🎬" },
    { en: "Can you come to the cooking class party?", ko: "요리 교실 파티에 올 수 있니?",   emoji: "🍳" },
    // 🎈 재미있는 행사
    { en: "Can you come to the K-pop concert?",       ko: "케이팝 콘서트에 올 수 있니?",    emoji: "🎤" },
    { en: "Can you come to the slime festival?",      ko: "슬라임 축제에 올 수 있니?",      emoji: "🫧" },
    { en: "Can you come to the magic show?",          ko: "마술 쇼에 올 수 있니?",          emoji: "🎩" },
    { en: "Can you come to the school festival?",     ko: "학교 축제에 올 수 있니?",        emoji: "🏫" },
    { en: "Can you come to the pizza party?",         ko: "피자 파티에 올 수 있니?",        emoji: "🍕" },
    { en: "Can you come to the robot show?",          ko: "로봇 쇼에 올 수 있니?",          emoji: "🤖" },
    { en: "Can you come to the game party?",          ko: "게임 파티에 올 수 있니?",        emoji: "🎮" },
    { en: "Can you come to the dance contest?",       ko: "댄스 대회에 올 수 있니?",        emoji: "💃" },
    { en: "Can you come to the Halloween party?",     ko: "핼러윈 파티에 올 수 있니?",      emoji: "🎃" },
    { en: "Can you come to the sleepover party?",     ko: "파자마 파티에 올 수 있니?",      emoji: "🛌" },
    { en: "Can you come to the water park party?",    ko: "워터파크 파티에 올 수 있니?",    emoji: "💦" },
    { en: "Can you come to the fireworks festival?",  ko: "불꽃 축제에 올 수 있니?",        emoji: "🎆" },
  ],
  intermediate: [
    // 📘 교과서 행사
    { en: "Can you come to my birthday party on Saturday?",     ko: "토요일에 내 생일 파티에 올 수 있니?",   emoji: "🎂" },
    { en: "Can you come to the taekwondo show on Friday?",      ko: "금요일에 태권도 공연에 올 수 있니?",    emoji: "🥋" },
    { en: "Can you come to the laser show tonight?",            ko: "오늘 밤 레이저 쇼에 올 수 있니?",       emoji: "✨" },
    { en: "Can you come to the book festival this weekend?",    ko: "이번 주말에 책 축제에 올 수 있니?",     emoji: "📚" },
    { en: "Can you come to the movie festival on Sunday?",      ko: "일요일에 영화 축제에 올 수 있니?",      emoji: "🎬" },
    { en: "Can you come to the cooking class party tomorrow?",  ko: "내일 요리 교실 파티에 올 수 있니?",     emoji: "🍳" },
    // 🎈 재미있는 행사
    { en: "Can you come to the K-pop concert on Saturday?",     ko: "토요일에 케이팝 콘서트에 올 수 있니?",  emoji: "🎤" },
    { en: "Can you come to the slime festival this weekend?",   ko: "이번 주말에 슬라임 축제에 올 수 있니?", emoji: "🫧" },
    { en: "Can you come to the magic show after school?",       ko: "방과 후에 마술 쇼에 올 수 있니?",       emoji: "🎩" },
    { en: "Can you come to the school festival on Friday?",     ko: "금요일에 학교 축제에 올 수 있니?",      emoji: "🏫" },
    { en: "Can you come to the pizza party tomorrow?",          ko: "내일 피자 파티에 올 수 있니?",          emoji: "🍕" },
    { en: "Can you come to the robot show on Sunday?",          ko: "일요일에 로봇 쇼에 올 수 있니?",        emoji: "🤖" },
    { en: "Can you come to the game party after school?",       ko: "방과 후에 게임 파티에 올 수 있니?",     emoji: "🎮" },
    { en: "Can you come to the dance contest next week?",       ko: "다음 주에 댄스 대회에 올 수 있니?",     emoji: "💃" },
    { en: "Can you come to the Halloween party on Friday?",     ko: "금요일에 핼러윈 파티에 올 수 있니?",    emoji: "🎃" },
    { en: "Can you come to the sleepover party this Saturday?", ko: "이번 토요일에 파자마 파티에 올 수 있니?", emoji: "🛌" },
    { en: "Can you come to the water park party on Sunday?",    ko: "일요일에 워터파크 파티에 올 수 있니?",  emoji: "💦" },
    { en: "Can you come to the fireworks festival tonight?",    ko: "오늘 밤 불꽃 축제에 올 수 있니?",       emoji: "🎆" },
  ],
  advanced: [
    // 📘 교과서 행사
    { en: "Can you come to my birthday party on Saturday? We'll have a big cake.",     ko: "토요일에 내 생일 파티에 올 수 있니? 큰 케이크가 있을 거야.", emoji: "🎂" },
    { en: "Can you come to the taekwondo show on Friday? I'll break a board.",          ko: "금요일에 태권도 공연에 올 수 있니? 내가 격파를 할 거야.",     emoji: "🥋" },
    { en: "Can you come to the laser show tonight? It starts at 8.",                    ko: "오늘 밤 레이저 쇼에 올 수 있니? 8시에 시작해.",              emoji: "✨" },
    { en: "Can you come to the book festival this weekend? We can meet famous writers.", ko: "이번 주말에 책 축제에 올 수 있니? 유명한 작가들을 만날 수 있어.", emoji: "📚" },
    { en: "Can you come to the movie festival on Sunday? They'll show a new movie.",    ko: "일요일에 영화 축제에 올 수 있니? 새 영화를 보여줄 거야.",    emoji: "🎬" },
    { en: "Can you come to the cooking class party tomorrow? We'll make pizza together.", ko: "내일 요리 교실 파티에 올 수 있니? 함께 피자를 만들 거야.",  emoji: "🍳" },
    // 🎈 재미있는 행사
    { en: "Can you come to the K-pop concert on Saturday? My favorite group is coming.", ko: "토요일에 케이팝 콘서트에 올 수 있니? 내가 제일 좋아하는 그룹이 와.", emoji: "🎤" },
    { en: "Can you come to the slime festival this weekend? We can make rainbow slime.", ko: "이번 주말에 슬라임 축제에 올 수 있니? 무지개 슬라임을 만들 수 있어.", emoji: "🫧" },
    { en: "Can you come to the magic show after school? The magician is amazing.",     ko: "방과 후에 마술 쇼에 올 수 있니? 마술사가 정말 대단해.",        emoji: "🎩" },
    { en: "Can you come to the school festival on Friday? Our class will sing.",       ko: "금요일에 학교 축제에 올 수 있니? 우리 반이 노래할 거야.",     emoji: "🏫" },
    { en: "Can you come to the pizza party tomorrow? We'll eat a lot of pizza.",        ko: "내일 피자 파티에 올 수 있니? 피자를 많이 먹을 거야.",         emoji: "🍕" },
    { en: "Can you come to the robot show on Sunday? The robots can dance.",           ko: "일요일에 로봇 쇼에 올 수 있니? 로봇들이 춤을 출 수 있어.",    emoji: "🤖" },
    { en: "Can you come to the game party after school? We'll play new games.",        ko: "방과 후에 게임 파티에 올 수 있니? 새 게임을 할 거야.",         emoji: "🎮" },
    { en: "Can you come to the dance contest next week? I'll dance on stage.",         ko: "다음 주에 댄스 대회에 올 수 있니? 내가 무대에서 춤출 거야.",  emoji: "💃" },
    { en: "Can you come to the Halloween party on Friday? Please wear a costume.",     ko: "금요일에 핼러윈 파티에 올 수 있니? 분장 옷을 입고 와 줘.",    emoji: "🎃" },
    { en: "Can you come to the sleepover party this Saturday? We'll watch movies all night.", ko: "이번 토요일에 파자마 파티에 올 수 있니? 밤새 영화를 볼 거야.", emoji: "🛌" },
    { en: "Can you come to the water park party on Sunday? We'll ride the big slides.", ko: "일요일에 워터파크 파티에 올 수 있니? 큰 슬라이드를 탈 거야.", emoji: "💦" },
    { en: "Can you come to the fireworks festival tonight? The sky will be so beautiful.", ko: "오늘 밤 불꽃 축제에 올 수 있니? 하늘이 정말 아름다울 거야.", emoji: "🎆" },
  ],
};

/* ===== 승낙 (Yes) ===== */
const ACCEPT_EXPRESSIONS = [
  { en: "Of course.",           ko: "물론이지.",            emoji: "😊", imgPrompt: "happy child giving thumbs up" },
  { en: "Sure.",                ko: "그럼(당연하지).",       emoji: "👍", imgPrompt: "smiling kid nodding yes" },
  { en: "Yes, I can.",          ko: "응, 갈 수 있어.",       emoji: "🙋", imgPrompt: "excited child raising hand" },
  { en: "Sounds fun!",          ko: "재미있겠다!",           emoji: "🤩", imgPrompt: "kids cheering with joy" },
  { en: "Okay, I'll be there.", ko: "좋아, 거기로 갈게.",    emoji: "🏃", imgPrompt: "child waving and running to friends" },
];

/* ===== 거절 (No) : Sorry, but I can't. I have a ~. ===== */
const REFUSE_REASONS = [
  { en: "piano lesson",         ko: "피아노 수업",     emoji: "🎹", imgPrompt: "child taking a piano lesson" },
  { en: "taekwondo class",      ko: "태권도 수업",     emoji: "🥋", imgPrompt: "kids in a taekwondo class" },
  { en: "swimming lesson",      ko: "수영 수업",       emoji: "🏊", imgPrompt: "child taking a swimming lesson" },
  { en: "math test",            ko: "수학 시험",       emoji: "📝", imgPrompt: "student studying for a math test" },
  { en: "soccer game",          ko: "축구 경기",       emoji: "⚽", imgPrompt: "kids playing a soccer game" },
  { en: "family dinner",        ko: "가족 저녁 식사",  emoji: "🍽️", imgPrompt: "family having dinner together" },
  { en: "dentist appointment",  ko: "치과 예약",       emoji: "🦷", imgPrompt: "child at the dentist" },
  { en: "cold",                 ko: "감기",            emoji: "🤧", imgPrompt: "child with a cold in bed" },
  { en: "headache",             ko: "두통",            emoji: "🤕", imgPrompt: "child with a headache" },
  { en: "lot of homework",      ko: "많은 숙제",       emoji: "📚", imgPrompt: "child doing a lot of homework" },
];
/* ===== 약속 잡기 : 장소 (Where) ===== */
const PLACE_EXPRESSIONS = [
  { en: "my house",           ko: "우리 집",       emoji: "🏠", imgPrompt: "a cozy house with a front door" },
  { en: "the school gym",     ko: "학교 체육관",   emoji: "🏀", imgPrompt: "school gym" },
  { en: "the school gate",    ko: "학교 정문",     emoji: "🚪", imgPrompt: "school front gate" },
  { en: "the park",           ko: "공원",          emoji: "🌳", imgPrompt: "sunny park with trees" },
  { en: "the playground",     ko: "놀이터",        emoji: "🛝", imgPrompt: "kids playground with slides" },
  { en: "the library",        ko: "도서관",        emoji: "📖", imgPrompt: "public library building" },
  { en: "the bus stop",       ko: "버스 정류장",   emoji: "🚌", imgPrompt: "bus stop on a street" },
  { en: "the subway station", ko: "지하철역",      emoji: "🚇", imgPrompt: "subway station entrance" },
  { en: "the shopping mall",  ko: "쇼핑몰",        emoji: "🛍️", imgPrompt: "bright shopping mall" },
  { en: "the movie theater",  ko: "영화관",        emoji: "🎟️", imgPrompt: "movie theater entrance" },
];

/* ===== 약속 잡기 : 시간 (What time) ===== */
const TIME_EXPRESSIONS = [
  { en: "10 o'clock", ko: "10시",     emoji: "🕙", imgPrompt: "clock showing ten o'clock" },
  { en: "11 o'clock", ko: "11시",     emoji: "🕚", imgPrompt: "clock showing eleven o'clock" },
  { en: "noon",       ko: "정오(12시)", emoji: "🕛", imgPrompt: "clock showing twelve noon" },
  { en: "1 o'clock",  ko: "1시",      emoji: "🕐", imgPrompt: "clock showing one o'clock" },
  { en: "2 o'clock",  ko: "2시",      emoji: "🕑", imgPrompt: "clock showing two o'clock" },
  { en: "2:30",       ko: "2시 30분", emoji: "🕝", imgPrompt: "clock showing half past two" },
  { en: "3 o'clock",  ko: "3시",      emoji: "🕒", imgPrompt: "clock showing three o'clock" },
  { en: "4 o'clock",  ko: "4시",      emoji: "🕓", imgPrompt: "clock showing four o'clock" },
  { en: "5 o'clock",  ko: "5시",      emoji: "🕔", imgPrompt: "clock showing five o'clock" },
  { en: "6 o'clock",  ko: "6시",      emoji: "🕕", imgPrompt: "clock showing six o'clock" },
];
/* ===== 대화 만들기 (행사 + 대답 + 장소/시간 조합) ===== */
const BUILD_CATS = [
  { key: "book", label: "📘 교과서 행사" },
  { key: "fun",  label: "🎈 재미있는 행사" },
];

const BUILD_EVENTS = [
  // 📘 교과서 행사
  { en: "my birthday party",       ko: "내 생일 파티",    emoji: "🎂", cat: "book" },
  { en: "the taekwondo show",      ko: "태권도 공연",     emoji: "🥋", cat: "book" },
  { en: "the laser show",          ko: "레이저 쇼",       emoji: "✨", cat: "book" },
  { en: "the book festival",       ko: "책 축제",         emoji: "📚", cat: "book" },
  { en: "the movie festival",      ko: "영화 축제",       emoji: "🎬", cat: "book" },
  { en: "the cooking class party", ko: "요리 교실 파티",  emoji: "🍳", cat: "book" },
  // 🎈 재미있는 행사
  { en: "the K-pop concert",       ko: "케이팝 콘서트",   emoji: "🎤", cat: "fun" },
  { en: "the slime festival",      ko: "슬라임 축제",     emoji: "🫧", cat: "fun" },
  { en: "the magic show",          ko: "마술 쇼",         emoji: "🎩", cat: "fun" },
  { en: "the school festival",     ko: "학교 축제",       emoji: "🏫", cat: "fun" },
  { en: "the pizza party",         ko: "피자 파티",       emoji: "🍕", cat: "fun" },
  { en: "the robot show",          ko: "로봇 쇼",         emoji: "🤖", cat: "fun" },
  { en: "the game party",          ko: "게임 파티",       emoji: "🎮", cat: "fun" },
  { en: "the dance contest",       ko: "댄스 대회",       emoji: "💃", cat: "fun" },
  { en: "the Halloween party",     ko: "핼러윈 파티",     emoji: "🎃", cat: "fun" },
  { en: "the sleepover party",     ko: "파자마 파티",     emoji: "🛌", cat: "fun" },
  { en: "the water park party",    ko: "워터파크 파티",   emoji: "💦", cat: "fun" },
  { en: "the fireworks festival",  ko: "불꽃 축제",       emoji: "🎆", cat: "fun" },
];

/* ===== 단어 뜻 사전 ===== */
function wordKey(w) {
  return w.toLowerCase().replace(/^[^a-z0-9':]+/, "").replace(/[^a-z0-9':]+$/, "");
}

const WORD_MEANINGS = {
  "can": "~할 수 있다",
  "can't": "~할 수 없다 (cannot)",
  "you": "너, 너희",
  "come": "오다",
  "to": "~에, ~으로",
  "the": "그 (특정한 것)",
  "my": "나의",
  "i": "나는",
  "i'll": "나는 ~할 거야 (I will)",
  "we'll": "우리는 ~할 거야 (we will)",
  "it'll": "그것은 ~할 거야 (it will)",
  "they'll": "그들은 ~할 거야 (they will)",
  "we": "우리는",
  "our": "우리의",
  "it": "그것",
  "they": "그들은",
  "birthday": "생일",
  "party": "파티",
  "taekwondo": "태권도",
  "show": "쇼, 공연; 보여주다",
  "laser": "레이저",
  "book": "책",
  "festival": "축제",
  "movie": "영화",
  "movies": "영화 (여러 편)",
  "cooking": "요리",
  "class": "수업, 반",
  "k-pop": "케이팝 (K-pop)",
  "kpop": "케이팝",
  "concert": "콘서트, 공연",
  "slime": "슬라임",
  "magic": "마술",
  "magician": "마술사",
  "school": "학교",
  "pizza": "피자",
  "robot": "로봇",
  "robots": "로봇들",
  "game": "게임, 경기",
  "games": "게임 (여러 개)",
  "dance": "춤; 춤추다",
  "contest": "대회, 경연",
  "halloween": "핼러윈",
  "sleepover": "친구 집에서 자며 노는 것 (파자마 파티)",
  "water": "물 (water park: 워터파크)",
  "fireworks": "불꽃놀이",
  "ride": "타다",
  "slides": "미끄럼틀, 슬라이드",
  "sky": "하늘",
  "will": "~할 것이다",
  "so": "정말, 아주",
  "beautiful": "아름다운",
  "on": "~에 (요일 앞에)",
  "saturday": "토요일",
  "sunday": "일요일",
  "friday": "금요일",
  "tonight": "오늘 밤",
  "tomorrow": "내일",
  "this": "이, 이번",
  "next": "다음",
  "week": "주",
  "weekend": "주말",
  "after": "~후에",
  "have": "가지고 있다, (일정이) 있다",
  "a": "하나의",
  "an": "하나의",
  "big": "큰",
  "cake": "케이크",
  "break": "부수다, 격파하다",
  "board": "판자, 송판",
  "starts": "시작하다 (start)",
  "at": "~에 (시간·장소 앞에)",
  "meet": "만나다",
  "famous": "유명한",
  "writers": "작가들",
  "new": "새로운",
  "make": "만들다",
  "together": "함께",
  "favorite": "가장 좋아하는",
  "group": "그룹, 무리",
  "is": "~이다",
  "coming": "오고 있는 (come)",
  "rainbow": "무지개",
  "amazing": "놀라운, 대단한",
  "sing": "노래하다",
  "eat": "먹다",
  "lot": "많음 (a lot of: 많은)",
  "of": "~의",
  "play": "(게임·운동을) 하다, 놀다",
  "stage": "무대",
  "please": "제발, ~해 주세요",
  "wear": "입다",
  "costume": "분장 옷, 의상",
  "watch": "보다",
  "all": "모든, 내내",
  "night": "밤",
  "course": "물론 (of course: 물론이지)",
  "sure": "물론, 그럼",
  "yes": "응, 네",
  "sounds": "~하게 들리다 (sound)",
  "fun": "재미있는; 재미",
  "okay": "좋아, 알았어",
  "be": "~이다, (be there) 거기 가다",
  "there": "거기에",
  "sorry": "미안해",
  "but": "하지만, 그런데",
  "piano": "피아노",
  "lesson": "수업, 레슨",
  "swimming": "수영",
  "math": "수학",
  "test": "시험",
  "soccer": "축구",
  "family": "가족",
  "dinner": "저녁 식사",
  "dentist": "치과 의사, 치과",
  "appointment": "예약, 약속",
  "cold": "감기; 추운",
  "headache": "두통",
  "homework": "숙제",
  "house": "집",
  "gym": "체육관",
  "gate": "정문, 문",
  "park": "공원",
  "playground": "놀이터",
  "library": "도서관",
  "bus": "버스",
  "stop": "정류장; 멈추다",
  "subway": "지하철",
  "station": "역",
  "shopping": "쇼핑",
  "mall": "쇼핑몰",
  "theater": "극장, 영화관",
  "o'clock": "~시 (정각)",
  "noon": "정오, 낮 12시",
  "1": "하나, 1",
  "2": "둘, 2",
  "3": "셋, 3",
  "4": "넷, 4",
  "5": "다섯, 5",
  "6": "여섯, 6",
  "8": "여덟, 8",
  "10": "열, 10",
  "11": "열하나, 11",
  "2:30": "2시 30분 (two thirty)",
};
