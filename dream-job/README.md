# What do you want to be? · 내 꿈 말하기

6학년 영어 **장래 희망 묻고 답하기** 단원 학습용 웹앱입니다.
이전 단원 *Can you come to the ___?* 웹앱([invitation/](../invitation/))과 **같은 구성·같은 방식**(5개 탭, 난이도, 내 세트 만들기, 말하기 채점, 역할극)으로 만들었습니다.

## 주요 표현

| 역할 | 표현 |
|------|------|
| 묻기 | **What do you want to be?** · What do you want to be in the future? · What do you want to be when you grow up? · What's your dream job? · What job do you want to have? |
| 대답 | **I want to be a ___.** (모음 소리 앞은 *an*: I want to be **an** artist.) |
| 이유 | Why do you want to be a ___? → **I like ___.** |
| 반응 | That's great! · Cool! · Sounds great! · Good for you! · You can do it! |

## 직업 15개

- 📘 교과서 직업 7개: doctor · teacher · singer · scientist · police officer · cook · pilot
- 🌟 인기 직업 8개: firefighter · artist · writer · soccer player · YouTuber · game designer · vet · dancer

## 기능

- 🌟 **꿈 말하기** — 초급(I want to be ~.) · 중급(+ I like ~.) · 고급(+ I want to ~.) × 2가지 직업 종류, **총 45문장**
- ❓ **묻고 답하기** — 묻는 표현 5개 카드 · `I want to be ___.` 빈칸에 직업 15개 중 골라 채우기
- 💡 **이유 말하기** — `I like ___.` 빈칸에 13개 중 골라 채우기 · 반응 표현 5개 카드
- 🎒 **내 꿈 만들기** — **꿈 3개**(직업 1 + 이유 1)와 **내 표현**(질문 1 · 반응 1)을 고르면 5줄 대화가 완성됨, 🎲 무작위 채우기, 📝 활동지에 적기 표
- 🎤 **연습 · 짝 활동** — 짝 활동 카드 + 줄마다 🎙️ 말하기 정확도 측정 + 🎭 역할극(A: 묻기 / B: 꿈 말하기)
- 단어 클릭 시 **뜻 풍선 + 발음**, 말하기 **속도 조절**

## 🎨 Canva 이미지 넣기

직업 카드 그림 15개는 **Canva AI(Magic Media)로 생성**해 `images/jobs/` 폴더에 넣어 두었습니다. 그림을 바꾸고 싶으면 아래 방법으로 같은 이름의 파일을 덮어쓰면 됩니다. **파일이 없으면 이모지로 자동 대체**되므로, 그림을 하나씩 추가해도 됩니다.

1. Canva → **Magic Media(매직 미디어)** → 이미지 → 아래 프롬프트 붙여넣기 (정사각형 1:1 권장)
2. 마음에 드는 그림을 **PNG로 다운로드**
3. 아래 표의 **파일 이름 그대로** `images/jobs/` 에 저장 (예: `doctor.png`)

| 직업 | 파일 이름 | Canva 프롬프트 |
|------|-----------|----------------|
| 🧑‍⚕️ 의사 | `doctor.png` | cute cartoon kid doctor with a stethoscope in a white coat, bright flat illustration, white background |
| 🧑‍🏫 선생님 | `teacher.png` | cute cartoon kid teacher in front of a blackboard, bright flat illustration, white background |
| 🧑‍🎤 가수 | `singer.png` | cute cartoon kid singer with a microphone on a colorful stage, bright flat illustration |
| 🧑‍🔬 과학자 | `scientist.png` | cute cartoon kid scientist with goggles and test tubes in a lab, bright flat illustration |
| 👮 경찰관 | `police-officer.png` | cute cartoon kid police officer in a blue uniform, friendly, bright flat illustration, white background |
| 🧑‍🍳 요리사 | `cook.png` | cute cartoon kid chef with a tall white hat cooking in a kitchen, bright flat illustration |
| 🧑‍✈️ 비행기 조종사 | `pilot.png` | cute cartoon kid pilot in uniform in front of an airplane, bright flat illustration, blue sky |
| 🧑‍🚒 소방관 | `firefighter.png` | cute cartoon kid firefighter with a helmet and a fire truck, bright flat illustration |
| 🧑‍🎨 화가 | `artist.png` | cute cartoon kid artist painting on a canvas with a palette, bright flat illustration |
| ✍️ 작가 | `writer.png` | cute cartoon kid writer writing a story book at a desk, bright flat illustration |
| ⚽ 축구 선수 | `soccer-player.png` | cute cartoon kid soccer player kicking a ball on a green field, bright flat illustration |
| 📹 유튜버 | `youtuber.png` | cute cartoon kid video creator talking to a camera with a ring light, bright flat illustration |
| 🎮 게임 디자이너 | `game-designer.png` | cute cartoon kid game designer at a computer making a video game, bright flat illustration |
| 🐶 수의사 | `vet.png` | cute cartoon kid veterinarian hugging a puppy and a kitten, bright flat illustration |
| 💃 댄서 | `dancer.png` | cute cartoon kid dancer dancing on a colorful stage, bright flat illustration |

## 사용 방법

`index.html`을 브라우저(크롬 권장)에서 열면 됩니다. 별도 설치가 필요 없습니다.
내 꿈 세트와 연습 기록은 브라우저(localStorage)에 저장됩니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 화면 구조(탭·섹션) |
| `style.css`  | 디자인 (기존 앱 스타일 + 꿈 테마) |
| `data.js`    | 직업 15개·문장·질문·이유·반응·단어 뜻·Canva 프롬프트 |
| `app.js`     | 음성·단어 풍선·꿈 만들기·연습(역할극) 채점 로직 |
| `images/jobs/` | Canva로 만든 직업 그림 (`<id>.png`) |
