// E2E 테스트:  node tests/e2e.js   (python3 -m http.server 8765 를 먼저 켜 두기)
const { chromium } = require("playwright");
const URL = process.env.APP_URL || "http://localhost:8765/index.html";
const OUT = process.env.SHOT_DIR || "tests/shots";
let fail = 0;
const ok = (name, cond, extra = "") => { if (!cond) fail++; console.log(`${cond ? "✅" : "❌"} ${name}${extra ? " — " + extra : ""}`); };

const FAKE_SR = () => {
  // 가짜 음성 인식: window.__say 문장을 중간 결과 → 최종 결과(후보 여러 개)로 돌려준다
  class FakeSR {
    start() {
      const say = window.__say || "";
      const alts = window.__alts || [say];
      setTimeout(() => {
        const r = [{ transcript: say.split(" ").slice(0, 3).join(" ") }]; r.isFinal = false;
        this.onresult && this.onresult({ results: [r] });
      }, 200);
      setTimeout(() => {
        const r = alts.map((t) => ({ transcript: t })); r.isFinal = true;
        this.onresult && this.onresult({ results: [r] });
      }, 600);
      setTimeout(() => this.onend && this.onend(), 900);
    }
    stop() {}
  }
  window.SpeechRecognition = FakeSR;
  window.webkitSpeechRecognition = FakeSR;
  window.__printed = 0;
  window.print = () => { window.__printed++; };
};

(async () => {
  require("fs").mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"],
  });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, permissions: ["microphone"] });
  await ctx.addInitScript(FAKE_SR);
  // 테스트 환경은 외부망이 막혀 있어 웹폰트 CSS 요청만 빈 응답으로 대신한다(앱 코드 오류만 확인)
  const stubFonts = (c) => c.route(/fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await stubFonts(ctx);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("dialog", (d) => d.accept());
  await page.goto(URL);
  await page.waitForSelector("#panel-beg .card");

  // 카드 수 · 그림
  ok("초급 카드 60개", (await page.$$("#panel-beg .card")).length === 60);
  await page.waitForTimeout(800);
  const broken = await page.$$eval("#panel-beg .card img", (els) => els.filter((i) => i.complete && i.naturalWidth === 0).length);
  ok("그림 깨짐 없음", broken === 0, `${broken}개`);
  // 지연 로딩 그림까지 60장 모두 실제로 불러와지는지
  const loaded = await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll("#panel-beg .card img")];
    await Promise.all(imgs.map((i) => { i.loading = "eager"; return i.decode().catch(() => {}); }));
    return imgs.filter((i) => i.naturalWidth > 0).length;
  });
  ok("그림 60장 모두 불러옴", loaded === 60, `${loaded}/60`);
  await page.screenshot({ path: `${OUT}/desktop-beg.png`, fullPage: false });

  // 카드 선택 → 말풍선 채워짐 + 배지
  await page.click('#panel-beg .card[data-id="fly_kite"] .choose');
  ok("말풍선 빈칸 채움", (await page.textContent("#panel-beg .talk.me .line")).includes("fly a kite"));
  ok("배지 1/5", (await page.textContent("#planBadge")).trim() === "1/5");
  ok("Q1 ✓ 표시", (await page.textContent('#panel-beg .qbtn[data-q="afternoon"]')).includes("✓"));
  ok("선택 버튼 상태", (await page.getAttribute('#panel-beg .card[data-id="fly_kite"]', "class")).includes("chosen"));

  // 같은 질문에 다른 카드 → 교체(질문당 1개)
  await page.click('#panel-beg .card[data-id="study_math"] .choose');
  ok("다른 카드로 교체", (await page.textContent("#panel-beg .talk.me .line")).includes("study math") && (await page.textContent("#planBadge")).trim() === "1/5");
  // 다시 누르면 빠짐
  await page.click('#panel-beg .card[data-id="study_math"] .choose');
  ok("다시 누르면 빠짐", (await page.textContent("#planBadge")).trim() === "0/5" && (await page.$("#panel-beg .talk.me .blank")) !== null);
  await page.click('#panel-beg .card[data-id="fly_kite"] .choose');

  // 다음 질문 ▶
  await page.click('#panel-beg [data-act="next"]');
  ok("다음 질문(오늘 밤)", (await page.textContent("#panel-beg .talk.friend .line")).includes("tonight"));

  // 필터
  await page.click('#panel-beg .chip[data-filter="book"]');
  const bookCards = await page.$$eval("#panel-beg .card", (els) => els.map((e) => e.dataset.id));
  ok("📘 교과서 필터 6개", bookCards.length === 6, bookCards.join(","));
  await page.click('#panel-beg .chip[data-filter="place"]');
  ok("장소 필터 12개", (await page.$$("#panel-beg .card")).length === 12);
  await page.click('#panel-beg .chip[data-filter="rec"]');
  const recOk = await page.$$eval("#panel-beg .card", (els) => els.length > 0 && els.every((e) => e.querySelector(".tag.rec")));
  ok("⭐ 추천 필터", recOk);
  ok("추천 필터 이름에 질문", (await page.textContent('#panel-beg .chip[data-filter="rec"]')).includes("오늘 밤"));
  await page.click('#panel-beg .chip[data-filter="all"]');

  // 단어 뜻 풍선
  await page.click('#panel-beg .card[data-id="fly_kite"] .sent .w[data-w="kite"]');
  ok("단어 뜻 풍선", (await page.isVisible("#wordBubble")) && (await page.textContent("#wordBubble")).includes("연"));

  // 중급 탭에서 다른 질문 선택 → 같은 계획표
  await page.click('.tab[data-tab="mid"]');
  await page.click('#panel-mid .qbtn[data-q="weekend"]');
  ok("중급 문장", (await page.textContent('#panel-mid .card[data-id="go_camping"] .sent')).includes("in the forest"));
  await page.click('#panel-mid .card[data-id="go_camping"] .choose');
  ok("중급 선택 → 배지 2/5", (await page.textContent("#planBadge")).trim() === "2/5");
  await page.click('#panel-mid .qbtn[data-q="afternoon"]');
  ok("초급에서 고른 계획이 중급에도 보임", (await page.textContent("#panel-mid .talk.me .line")).includes("fly a kite"));
  await page.screenshot({ path: `${OUT}/desktop-mid.png` });

  // 연습하기
  await page.click('#panel-mid [data-act="go"]');
  ok("연습하기 탭 열림", await page.isVisible("#panel-practice"));
  const rowA = await page.textContent("#row-afternoon");
  const rowW = await page.textContent("#row-weekend");
  ok("계획표: 오늘 오후", rowA.includes("I'm going to fly a kite."));
  ok("계획표: 이번 주말(중급)", rowW.includes("go camping in the forest with my family"));
  ok("빈 줄 안내", (await page.textContent("#row-tonight")).includes("활동 카드에서 골라요"));
  ok("이름 입력칸 없음", (await page.$("#panel-practice input")) === null);

  // 말하기: 정확
  await page.evaluate(() => { window.__say = "I'm going to fly a kite"; window.__alts = ["I'm going to fly a cat", "I'm going to fly a kite"]; });
  await page.click('[data-speak="afternoon"]');
  await page.waitForSelector("#live-afternoon:not([hidden])");
  ok("👂 들리는 말 표시", (await page.textContent("#live-afternoon")).includes("들리는 말"));
  await page.waitForSelector("#res-afternoon .pct", { timeout: 5000 });
  ok("정확 100%", (await page.textContent("#res-afternoon .pct")).trim() === "100%");
  ok("⭐ 표시", (await page.textContent("#res-afternoon .score")).includes("⭐"));
  // 두 번째: fly a cat
  await page.evaluate(() => { window.__say = "I'm going to fly a cat"; window.__alts = ["I'm going to fly a cat"]; });
  await page.click('[data-speak="afternoon"]');
  await page.waitForFunction(() => document.querySelector("#st-afternoon") && document.querySelector("#st-afternoon").textContent.includes("2회"), null, { timeout: 5000 });
  const st = await page.textContent("#st-afternoon");
  ok("이번·평균·최고·횟수", st.includes("이번 73%") && st.includes("평균 87%") && st.includes("최고 100%") && st.includes("2회"), st);
  ok("🟥 놓친 칩", (await page.$$("#res-afternoon .wchip.miss")).length === 1);
  ok("다시 들어 볼 단어 kite", (await page.textContent("#res-afternoon .retry")).includes("kite"));
  ok("컴퓨터가 들은 말", (await page.textContent("#res-afternoon .heard")).includes("fly a cat"));
  ok("요약: 총 2회", (await page.textContent("#sumN")).trim() === "2");
  ok("요약: 평균 87%", (await page.textContent("#sumAvg")).trim() === "87");
  ok("요약: 1/5", (await page.textContent("#sumDone")).trim() === "1");
  // 녹음 재생
  await page.waitForFunction(() => !document.querySelector('[data-play="afternoon"]').disabled, null, { timeout: 5000 }).catch(() => {});
  ok("▶ 내 목소리 활성", !(await page.$eval('[data-play="afternoon"]', (b) => b.disabled)));
  await page.click('[data-play="afternoon"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/desktop-practice.png`, fullPage: true });

  // 새로고침 → 기록 유지
  await page.reload();
  await page.click('.tab[data-tab="practice"]');
  ok("새로고침 후 기록 유지", (await page.textContent("#st-afternoon")).includes("2회") && (await page.textContent("#planBadge")).trim() === "2/5");

  // 인쇄
  await page.click('[data-act="print"]');
  ok("인쇄 버튼", (await page.evaluate(() => window.__printed)) === 1);
  await page.emulateMedia({ media: "print" });
  ok("인쇄 시 버튼·마이크 숨김", !(await page.isVisible('[data-speak="afternoon"]')) && !(await page.isVisible(".tabs")) && (await page.isVisible("#row-afternoon")));
  await page.pdf({ path: `${OUT}/print.pdf` }).catch(() => {});
  await page.emulateMedia({ media: "screen" });

  // ✕ 빼기
  await page.click('[data-del="weekend"]');
  ok("✕ 빼기", (await page.textContent("#planBadge")).trim() === "1/5" && (await page.textContent("#row-weekend")).includes("활동 카드에서 골라요"));

  // 기록 지우기
  await page.click('[data-act="clear"]');
  ok("기록 지우기", (await page.textContent("#sumN")).trim() === "0" && (await page.textContent("#st-afternoon")).includes("없어요"));

  ok("콘솔 오류 0", errors.length === 0, errors.join(" | "));

  // 휴대폰 390px
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await m.addInitScript(FAKE_SR);
  await stubFonts(m);
  const mp = await m.newPage();
  await mp.goto(URL);
  await mp.waitForSelector("#panel-beg .card");
  const sw = await mp.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  ok("390px 가로 스크롤 없음(카드)", sw[0] <= sw[1], sw.join(" vs "));
  const tabLines = await mp.$$eval(".tab", (els) => els.map((e) => e.getBoundingClientRect().height));
  ok("휴대폰 탭 한 줄", tabLines.every((h) => h < 50), tabLines.join(","));
  ok("짧은 탭 이름", (await mp.textContent('.tab[data-tab="beg"] .short')) === "초급 카드" && await mp.isVisible('.tab[data-tab="beg"] .short'));
  await mp.screenshot({ path: `${OUT}/mobile-beg.png` });
  await mp.click('#panel-beg .card[data-id="pc_room"] .choose');
  await mp.click('.tab[data-tab="practice"]');
  await mp.evaluate(() => { window.__say = "I'm going to go to a p c room"; });
  await mp.click('[data-speak="afternoon"]');
  await mp.waitForSelector("#res-afternoon .pct", { timeout: 5000 });
  ok("휴대폰 PC방 채점 100%", (await mp.textContent("#res-afternoon .pct")).trim() === "100%");
  const sw2 = await mp.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  ok("390px 가로 스크롤 없음(연습)", sw2[0] <= sw2[1], sw2.join(" vs "));
  await mp.screenshot({ path: `${OUT}/mobile-practice.png`, fullPage: true });
  await mp.click('.tab[data-tab="mid"]');
  const sw3 = await mp.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  ok("390px 가로 스크롤 없음(중급)", sw3[0] <= sw3[1], sw3.join(" vs "));
  await mp.screenshot({ path: `${OUT}/mobile-mid.png` });

  await browser.close();
  console.log(fail ? `\n${fail}개 실패` : "\n모두 통과");
  process.exit(fail ? 1 : 0);
})();
