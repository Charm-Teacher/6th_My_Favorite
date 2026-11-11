# Can you come to the ___? · 내가 선택한 행사에 친구 초대하기

6학년 영어 **초대하고 대답하기** 단원 학습용 웹앱입니다.
교과서의 행사 표현(`Can you come to my birthday party?` 등)뿐 아니라 **초등학생이 좋아할 행사**로
초대하고, **승낙·거절**하고, **약속 장소·시간**까지 말하며 익힐 수 있도록 만들었습니다.
(5학년 *What will you do this summer?* 페이지와 같은 구성, 🎉 파티 테마 디자인)

## 주요 표현

| 역할 | 표현 |
|------|------|
| 초대 | **Can you come to (the) ___?** |
| 승낙 | **Of course.** · Sure. · Yes, I can. · Sounds fun! · Okay, I'll be there. |
| 거절 | **Sorry, but I can't. I have a ___.** |
| 약속 | **Please come to (장소) at (시간).** |

## 기능

- 🎉 **초대하기 (Can you come to ~?)** — 초급·중급·고급 난이도 × 2가지 행사 종류, **총 54문장**
  - 📘 교과서 행사 6개: my birthday party · taekwondo show · laser show · book festival · movie festival · cooking class party
  - 🎈 재미있는 행사 12개: K-pop concert · slime festival · magic show · school festival · pizza party · robot show · game party · dance contest · Halloween party · sleepover party · water park party · fireworks festival
- 💬 **대답하기** — 승낙 5개 카드 · 거절은 `Sorry, but I can't. I have a ___.` 빈칸에 이유 10개 중 골라 채우기
- 📍 **약속 잡기** — `Please come to ___ at ___.` 빈칸에 장소 10개 · 시간 10개를 골라 채우고 듣기
- 🎒 **내 행사 만들기** (워크시트 2번 · 내가 선택한 행사) — **행사 3개**(행사마다 행사 1개 + 약속 장소·시간 1개)와 **내 대답**(승낙 표현 1개 · 거절 문장 1개)을 고름
  - 행사 탭을 눌러 가며 만들고, 말풍선 대화 빈칸이 채워지는 것을 확인 · 🎲 무작위 채우기 · 브라우저에 저장
  - 📝 **워크시트에 적기** 표: 워크시트 2번 표와 같은 순서로 영어 문장을 보여 줌
- 🎤 **연습 · 짝 활동** (워크시트 3번) — 👫 짝 활동 카드(행사별 초대·약속 문장 크게, 친구 대답 ○/× 안내) + 컴퓨터와 미리 연습
  - 만든 행사마다 `초대 → 대답 → 약속` 대화를 연습
  - 친구가 **승낙**할 때 / **거절**할 때 두 버전, 줄마다 🎙️ 말하기로 정확도 측정
  - 🎭 역할극: 내가 A(초대) 또는 B(대답)를 맡으면 컴퓨터가 상대 역할을 읽어 주고 내 차례에 마이크가 켜짐 (Chrome 권장)
- 단어 클릭 시 **뜻 풍선 + 발음**, 말하기 **속도 조절** 슬라이더

브라우저 내장 **Web Speech API**(음성 합성·음성 인식)를 사용합니다.
내 행사 세트·대답과 연습 기록은 브라우저(localStorage)에 저장됩니다.

## 사용 방법

`index.html`을 브라우저(크롬 권장)에서 열면 됩니다. 별도 설치가 필요 없습니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 화면 구조(탭·섹션) |
| `style.css`  | 디자인·파티 테마 |
| `data.js`    | 초대·대답·장소·시간 문장, 단어 뜻, 세트 만들기 데이터 |
| `app.js`     | 음성·단어 풍선·세트 만들기·세트 연습(역할극) 채점 로직 |
