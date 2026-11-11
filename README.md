# What are you going to do? · 나의 계획 말하기 🍁

6학년 **천재(함) 9단원 What are you going to do?** 수업용 웹앱입니다. (가을 테마)
설치 없이 `index.html`을 열거나 GitHub Pages로 바로 쓸 수 있어요.

| 역할 | 표현 |
|------|------|
| 묻기 | **What are you going to do ___?** (this afternoon · tonight · tomorrow · this weekend · this winter vacation) |
| 대답 | **I'm going to ___.** |

> 이전 단원 앱: [dream-job/](dream-job/) (What do you want to be?) · [invitation/](invitation/) (Can you come to the ___?)

## 기능

### 🎨 활동 카드 (초급) · 🎨 활동 카드 (중급)
1. **1️⃣ 질문을 골라요** — Q1~Q5 버튼(번호·이모지·한국어·영어). 계획을 고른 질문엔 ✓와 활동 이모지.
2. **말풍선 대화** — 🙋 친구 “What are you going to do this afternoon?” / 🙆 나 “I'm going to ____.”
   한국어 뜻, 줄마다 🔊, [🔊 대화 듣기] [다음 질문 ▶] [🎤 연습하기로 가기], 상태 안내 문구.
3. **2️⃣ 할 일 고르기** — 필터 [전체] [📘 교과서 표현] [종류 5개] [⭐ (지금 질문)에 어울리는 것만]
4. **카드** — 종류 태그(+📘 교과서, +⭐ 추천), Canva 그림, 문장(단어를 누르면 **뜻 풍선 + 발음**), 한국어, 🔊,
   **✅ 오늘 오후에 할래요** → 지금 질문의 대답이 되어 말풍선 빈칸이 채워지고, 질문+대답을 읽어 주고, 연습하기에 담깁니다.
   다시 누르면 빠지고, 다른 카드를 누르면 바뀝니다(질문 하나당 계획 1개).
- 초급: `I'm going to fly a kite.` / 중급: 누구와·어디서·무엇을 하러를 붙인 문장 `I'm going to fly a kite on the hill.`
- 초급·중급 어느 탭에서 골라도 **같은 계획표**에 저장됩니다(질문별 `{활동 id, level}`).

### 🎤 연습하기 (탭 배지에 담은 개수 `2/5`)
- 맨 위 **연습 기록**: 🎙️ 총 연습 n회 · 📊 평균 정확도 % · ✅ 연습한 문장 n/5, [🧹 기록 지우기] [🔊 전체 듣기] [🖨️ 인쇄하기]
- **📅 나의 계획표 · My Plans**: 질문 5줄(언제, Q 문장, A 문장, 한국어, 그림, 🔊, ✕ 빼기). 비어 있으면 “활동 카드에서 골라요”.
- 줄마다 **[🎙️ 말하기] [▶ 내 목소리]** “이번 % · 평균 % · 최고 % · n회”
  - Web Speech API 음성 인식(en-US, 중간 결과 표시, 후보 5개, 9초 제한) + MediaRecorder 녹음을 동시에 합니다.
  - 말하는 동안 **👂 들리는 말**이 실시간으로 보이고, 끝나면 ▶ 내 목소리로 녹음을 들을 수 있어요.
  - 기록(횟수·최고·점수 합계)은 브라우저(localStorage)에 저장, 녹음은 새로고침하면 사라집니다.
  - 음성 인식이 없는 브라우저는 4초 녹음만, 둘 다 없으면 버튼 비활성 + “Chrome 권장”.
- **인쇄**하면 계획표만 나옵니다(버튼·마이크 도구 숨김).

## 정교한 발음 채점

1. **정리**: 줄임말 펼치기(I'm→i am, I'll→i will, gonna→going to …), 동음어 통일(too/two→to, four→for),
   한 글자씩 들린 말 붙이기(“p c”→pc, “t v”→tv), 군말(um, uh) 빼기.
2. **정렬**: 목표 문장과 들린 말을 단어 **순서대로** 동적 계획법(가중 최장 공통 부분열)으로 맞춥니다.
3. **단어 점수**: 같음 1 · 철자 1글자 차이 0.85 · 소리 비슷 0.7(자음만 통일: r/l, f/p, v/b, th/s, c/k… 모음은 그대로라 kite≠cat) · 비슷한 편 0.5 · 그 외 0
4. **가중치**: 핵심 단어 1(going 포함) · 작은 단어(a, the, to, my, i, am …) 0.3 · 지명(대문자 고유명사) 0.6
5. **감점**: 덧붙인 말 1개당 3%, 최대 10%. 보너스 점수 없음. 인식 후보 최대 5개 중 최고 점수를 씁니다.
6. **결과**: ⭐ 85% 이상 / 👍 60% 이상 / 🔁 그 아래 · 단어 칩(🟩 맞음 · 🟨 비슷함 · 🟥 놓침, I'm은 한 칩) ·
   “🔁 다시 들어 볼 단어: 🔊 kite” · “컴퓨터가 들은 말: …”

| “I'm going to fly a kite.”에 대해 말한 것 | 점수 |
|---|---|
| I'm going to fly a kite | 100 |
| I'm going to fly a **cat** | 73 |
| fly a kite (앞부분 빠짐) | 55 |
| kite a fly to going am I (순서 뒤섞임) | 14 |

## 활동 60개 (5종류 × 12개)

📘 = 교과서 표현(같은 종류 안에서 맨 앞). 가을 테마라 눈사람·스키 같은 활동은 빼고 사과 따기·밤 줍기·단풍 구경 등을 넣었어요.

### 🏠 집·학교에서

| | 초급 | 중급 | 그림 |
|---|---|---|---|
| 🏠 📘 | I'm going to **stay home**. | … stay home and watch a movie. | `stay_home.png` |
| 🧹 📘 | I'm going to **clean my room**. | … clean my room with my little brother. | `clean_room.png` |
| ➗ 📘 | I'm going to **study math**. | … study math for the test. | `study_math.png` |
| ✏️ | I'm going to **do my homework**. | … do my homework at my desk. | `do_homework.png` |
| 📚 | I'm going to **read a comic book**. | … read a comic book in bed. | `read_comics.png` |
| 🎮 | I'm going to **play computer games**. | … play computer games with my cousin. | `play_games.png` |
| 📺 | I'm going to **watch TV**. | … watch TV with my family. | `watch_tv.png` |
| 🎨 | I'm going to **draw a picture**. | … draw a picture of autumn leaves. | `draw_picture.png` |
| 🎹 | I'm going to **practice the piano**. | … practice the piano for the concert. | `practice_piano.png` |
| 🔖 | I'm going to **make a leaf bookmark**. | … make a leaf bookmark for my teacher. | `leaf_bookmark.png` |
| 🎭 | I'm going to **practice for the school festival**. | … practice a dance for the school festival. | `school_festival.png` |
| 😴 | I'm going to **take a nap**. | … take a nap with my cat. | `take_nap.png` |

### ⚽ 운동·놀이

| | 초급 | 중급 | 그림 |
|---|---|---|---|
| ⚾ 📘 | I'm going to **watch a baseball game**. | … watch a baseball game at the stadium. | `baseball_game.png` |
| ⚽ | I'm going to **play soccer**. | … play soccer with my friends after school. | `play_soccer.png` |
| 🚲 | I'm going to **ride my bike**. | … ride my bike along the river. | `ride_bike.png` |
| 🪁 | I'm going to **fly a kite**. | … fly a kite on the hill. | `fly_kite.png` |
| 🏸 | I'm going to **play badminton**. | … play badminton with my dad in the park. | `play_badminton.png` |
| 🏀 | I'm going to **play basketball**. | … play basketball at the school gym. | `play_basketball.png` |
| 🪢 | I'm going to **jump rope**. | … jump rope in the playground. | `jump_rope.png` |
| 🛼 | I'm going to **go inline skating**. | … go inline skating at the park. | `inline_skate.png` |
| 🤾 | I'm going to **play dodgeball**. | … play dodgeball with my classmates. | `play_dodgeball.png` |
| 🥋 | I'm going to **practice taekwondo**. | … practice taekwondo for the black belt test. | `practice_taekwondo.png` |
| 🏃 | I'm going to **run a race on sports day**. | … run a relay race on sports day. | `sports_day.png` |
| 🎲 | I'm going to **play board games**. | … play board games with my friends. | `board_games.png` |

### 📍 장소에 가기

| | 초급 | 중급 | 그림 |
|---|---|---|---|
| 🖥️ | I'm going to **go to a PC room**. | … go to a PC room with my friends. | `pc_room.png` |
| 📖 | I'm going to **go to a comic book cafe**. | … go to a comic book cafe to read comics. | `comic_cafe.png` |
| 🎤 | I'm going to **go to a coin karaoke room**. | … go to a coin karaoke room to sing songs. | `karaoke.png` |
| 🏛️ | I'm going to **go to the library**. | … go to the library to borrow books. | `library.png` |
| 📕 | I'm going to **go to the bookstore**. | … go to the bookstore to buy a new book. | `bookstore.png` |
| 🛍️ | I'm going to **go to the shopping mall**. | … go to the shopping mall to buy a jacket. | `shopping_mall.png` |
| 🥐 | I'm going to **go to the bakery**. | … go to the bakery to buy bread. | `bakery.png` |
| 🔐 | I'm going to **go to an escape room cafe**. | … go to an escape room cafe with my friends. | `escape_room.png` |
| 🤸 | I'm going to **go to a trampoline park**. | … go to a trampoline park to jump high. | `trampoline.png` |
| 🐱 | I'm going to **go to a cat cafe**. | … go to a cat cafe to play with cats. | `cat_cafe.png` |
| 💇 | I'm going to **go to the hair salon**. | … go to the hair salon to get a haircut. | `hair_salon.png` |
| 🦷 | I'm going to **go to the dentist**. | … go to the dentist with my mom. | `dentist.png` |

### 👨‍👩‍👧 가족과 함께

| | 초급 | 중급 | 그림 |
|---|---|---|---|
| 👵 📘 | I'm going to **visit my grandparents**. | … visit my grandparents in the countryside. | `visit_grandparents.png` |
| ⛺ 📘 | I'm going to **go camping**. | … go camping in the forest with my family. | `go_camping.png` |
| 🍎 | I'm going to **pick apples**. | … pick apples at an apple farm. | `pick_apples.png` |
| 🌰 | I'm going to **pick up chestnuts**. | … pick up chestnuts on the mountain. | `pick_chestnuts.png` |
| 🍠 | I'm going to **dig sweet potatoes**. | … dig sweet potatoes with my grandma. | `dig_sweet_potatoes.png` |
| 🍁 | I'm going to **see the autumn leaves**. | … see the autumn leaves with my parents. | `autumn_leaves.png` |
| ⛰️ | I'm going to **go hiking**. | … go hiking with my dad. | `go_hiking.png` |
| 🎃 | I'm going to **make pumpkin soup**. | … make pumpkin soup with my mom. | `pumpkin_soup.png` |
| 🧺 | I'm going to **have a picnic**. | … have a picnic by the river. | `have_picnic.png` |
| 🚗 | I'm going to **wash the car**. | … wash the car with my dad. | `wash_car.png` |
| 🐕 | I'm going to **walk my dog**. | … walk my dog in the park. | `walk_dog.png` |
| 🍳 | I'm going to **cook dinner**. | … cook dinner for my family. | `cook_dinner.png` |

### ✈️ 가족 여행

| | 초급 | 중급 | 그림 |
|---|---|---|---|
| 🍊 | I'm going to **travel to Jeju Island**. | … travel to Jeju Island by plane. | `jeju.png` |
| 🛕 | I'm going to **visit Gyeongju**. | … visit Gyeongju to see Bulguksa Temple. | `gyeongju.png` |
| 🎆 | I'm going to **go to Busan**. | … go to Busan to see the fireworks festival. | `busan.png` |
| 🏔️ | I'm going to **climb Seoraksan Mountain**. | … climb Seoraksan Mountain with my family. | `seoraksan.png` |
| 🏘️ | I'm going to **go to Jeonju Hanok Village**. | … go to Jeonju Hanok Village to eat bibimbap. | `jeonju.png` |
| 👑 | I'm going to **visit Gyeongbokgung Palace**. | … visit Gyeongbokgung Palace in Seoul. | `gyeongbokgung.png` |
| 🎢 | I'm going to **go to an amusement park**. | … go to an amusement park to ride a roller coaster. | `amusement_park.png` |
| 🐠 | I'm going to **go to the aquarium**. | … go to the aquarium to see sharks. | `aquarium.png` |
| 🚆 | I'm going to **take a train trip**. | … take a train trip to Gangneung. | `train_trip.png` |
| 🗾 | I'm going to **travel to Japan**. | … travel to Japan to eat sushi. | `japan.png` |
| 🍂 | I'm going to **visit Nami Island**. | … visit Nami Island to see the yellow ginkgo trees. | `nami_island.png` |
| 🌾 | I'm going to **go to Suncheon Bay**. | … go to Suncheon Bay to see the reeds. | `suncheon.png` |

## 🎨 그림 바꾸는 법

카드 그림 60장은 **Canva AI(generate-image)** 로 같은 틀의 프롬프트로 만들었습니다(가로 4:3).
Canva 미리보기 크기(약 200×150)로 저장되어 카드에서는 흰 배경에 `object-fit: contain`으로 보여 줍니다.

```
Cute flat vector illustration for an elementary school English flashcard: [장면].
Warm autumn colors, simple clean shapes, white background, no text, no letters.
```

- `[장면]`은 `data.js`의 각 활동 `scene` 값에 들어 있어요(예: 제주도 → 돌하르방·귤나무·비행기).
- 바꾸려면 Canva에서 새로 만든 그림을 **`images/<활동 id>.png`** 로 같은 이름으로 덮어쓰면 됩니다(위 표의 파일 이름).
- 그림 파일이 없거나 못 불러오면 **이모지 타일**로 자동 대체됩니다.
- 활동을 추가할 땐 `data.js`의 `ACTIVITIES`에 항목을 넣고, 새 단어는 `WORDS`(단어 뜻 사전)에 추가하세요.

## 파일 구성

```
index.html        화면 틀(헤더 · 탭 3개)
style.css         가을 테마 디자인 · 휴대폰 대응 · 인쇄 스타일
data.js           질문 5개 · 종류 5개 · 활동 60개 · 단어 뜻 사전
app.js            발음 채점(Scoring) + 화면 동작(카드 · 계획표 · 말하기)
images/<id>.png   Canva 그림 60장
tests/            scoring.test.js(채점 단위 테스트) · e2e.js(Playwright 화면 테스트)
dream-job/        이전 단원 앱(What do you want to be?)
invitation/       그 전 단원 앱(Can you come to the ___?)
```

## 테스트

```bash
node tests/scoring.test.js
```

```bash
python3 -m http.server 8765
```

```bash
node tests/e2e.js
```

## 수업 전 확인할 것

- **Chrome**(PC·안드로이드) 권장. 말하기 채점은 Web Speech API가 있는 브라우저에서만 됩니다(사파리·삼성 인터넷은 다를 수 있음).
- 처음 🎙️ 말하기를 누르면 **마이크 권한 허용**이 필요합니다. 음성 인식은 인터넷 연결이 필요해요.
- 마이크는 `https`(GitHub Pages) 또는 `localhost`에서 열어야 안정적으로 동작합니다.
- 교실 PC의 영어 음성(TTS)이 없으면 🔊가 소리 나지 않을 수 있으니 미리 한 번 눌러 보세요.
