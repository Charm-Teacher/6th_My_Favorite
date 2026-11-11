/* =========================================================
 * 6학년 9단원 · What are you going to do?  (app.js)
 *  1) 발음 채점 함수 (Node 에서도 require 해서 테스트 가능)
 *  2) 화면: 활동 카드(초급·중급) · 연습하기(나의 계획표 + 말하기)
 * ========================================================= */

/* =========================================================
 * 1. 정교한 발음 채점
 * ========================================================= */
const Scoring = (() => {
  const CONTRACTIONS = {
    "i'm": "i am", "im": "i am", "i'll": "i will", "i've": "i have", "i'd": "i would",
    "you're": "you are", "we're": "we are", "they're": "they are", "he's": "he is", "she's": "she is",
    "it's": "it is", "that's": "that is", "what's": "what is", "let's": "let us",
    "don't": "do not", "doesn't": "does not", "can't": "can not", "cannot": "can not",
    "won't": "will not", "isn't": "is not", "aren't": "are not",
    "gonna": "going to", "wanna": "want to",
  };
  const HOMOPHONES = { too: "to", two: "to", "2": "to", four: "for", fore: "for", "4": "for", eye: "i" };
  const FILLERS = new Set(["um", "uh", "er", "ah", "hmm", "mm", "erm"]);
  const SMALL = new Set(["a", "an", "the", "to", "my", "i", "am", "at", "in", "on", "with", "for",
    "of", "by", "and", "is", "are", "your", "me"]);

  // 문장/단어 → 기본 토큰(소문자, 문장부호 제거)
  function rawTokens(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[^a-z0-9'\s-]/g, " ")
      .replace(/-/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  // 줄임말 펼치기 + 동음어 통일 + 군말 빼기
  function expand(tokens) {
    const out = [];
    for (let t of tokens) {
      t = t.replace(/^'+|'+$/g, "");
      if (!t || FILLERS.has(t)) continue;
      if (CONTRACTIONS[t]) { out.push(...CONTRACTIONS[t].split(" ")); continue; }
      if (HOMOPHONES[t]) { out.push(HOMOPHONES[t]); continue; }
      out.push(t.replace(/'/g, ""));
    }
    return out;
  }

  // 한 글자씩 들린 말 붙이기 ("p c" → "pc", "t v" → "tv"). a, i 는 단어이므로 제외
  function joinLetters(tokens) {
    const out = [];
    let run = [];
    const flush = () => {
      if (run.length >= 2) out.push(run.join(""));
      else out.push(...run);
      run = [];
    };
    for (const t of tokens) {
      if (/^[a-z]$/.test(t) && t !== "a" && t !== "i") run.push(t);
      else { flush(); out.push(t); }
    }
    flush();
    return out;
  }

  function normalize(text) {
    return joinLetters(expand(rawTokens(text)));
  }

  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  // 소리 비슷하게: 자음만 통일하고 모음은 그대로 둔다(kite ≠ cat)
  function phon(w) {
    return w
      .replace(/ph/g, "f").replace(/th/g, "s").replace(/ck/g, "k")
      .replace(/c/g, "k").replace(/q/g, "k").replace(/x/g, "ks").replace(/z/g, "s")
      .replace(/v/g, "b").replace(/f/g, "p").replace(/r/g, "l")
      .replace(/(.)\1+/g, "$1");
  }

  // 단어 점수: 같음 1 · 철자 1글자 차이 0.85 · 소리 비슷 0.7 · 비슷한 편 0.5 · 그 외 0
  function wordSim(t, h) {
    if (t === h) return 1;
    if (Math.min(t.length, h.length) >= 3 && lev(t, h) === 1) return 0.85;
    const pt = phon(t), ph = phon(h);
    if (pt === ph) return 0.7;
    if (Math.max(pt.length, ph.length) >= 4 && lev(pt, ph) === 1) return 0.5;
    return 0;
  }

  // 목표 문장 → 원래 단어(칩) 단위 + 토큰(가중치 포함)
  function buildTarget(sentence) {
    const words = String(sentence).trim().split(/\s+/);
    const chips = [];
    const tokens = [];
    words.forEach((orig, wi) => {
      const clean = orig.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, "");
      const toks = expand(rawTokens(clean));
      const isProper = wi > 0 && /^[A-Z][a-z]/.test(clean) && clean !== "I'm";
      const chip = { text: orig, clean, tokenIdx: [] };
      toks.forEach((t) => {
        const weight = isProper ? 0.6 : SMALL.has(t) ? 0.3 : 1;
        chip.tokenIdx.push(tokens.length);
        tokens.push({ t, weight, chip: chips.length });
      });
      chips.push(chip);
    });
    return { chips, tokens };
  }

  // 단어 "순서대로" 동적 계획법 정렬 (가중 LCS)
  function align(target, heard) {
    const n = target.length, m = heard.length;
    const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
    const sim = Array.from({ length: n }, (_, i) => heard.map((h) => wordSim(target[i].t, h)));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        let best = Math.max(dp[i - 1][j], dp[i][j - 1]);
        const s = sim[i - 1][j - 1];
        if (s > 0) best = Math.max(best, dp[i - 1][j - 1] + target[i - 1].weight * s);
        dp[i][j] = best;
      }
    }
    // 되짚기
    const tokScore = new Array(n).fill(0);
    let used = 0;
    let i = n, j = m;
    while (i > 0 && j > 0) {
      const s = sim[i - 1][j - 1];
      if (s > 0 && Math.abs(dp[i][j] - (dp[i - 1][j - 1] + target[i - 1].weight * s)) < 1e-9) {
        tokScore[i - 1] = s; used++; i--; j--;
      } else if (dp[i][j] === dp[i - 1][j]) i--;
      else j--;
    }
    return { matched: dp[n][m], tokScore, used };
  }

  function scoreOne(sentence, heardText) {
    const { chips, tokens } = buildTarget(sentence);
    const heard = normalize(heardText);
    const total = tokens.reduce((a, t) => a + t.weight, 0);
    const { matched, tokScore, used } = align(tokens, heard);
    const extras = Math.max(0, heard.length - used);
    const penalty = Math.min(0.10, 0.03 * extras);
    const raw = total ? matched / total - penalty : 0;
    const percent = Math.max(0, Math.min(100, Math.round(raw * 100)));
    const chipResults = chips.map((c) => {
      const sc = c.tokenIdx.map((k) => tokScore[k]);
      let status = "miss";
      if (sc.length && sc.every((s) => s === 1)) status = "ok";
      else if (sc.some((s) => s > 0)) status = "near";
      return { text: c.text, word: c.clean, status };
    });
    return { percent, chips: chipResults, heard: heardText, extras };
  }

  // 후보(최대 5개) 중 최고 점수
  function scoreBest(sentence, candidates) {
    const list = (candidates || []).filter((c) => c && c.trim()).slice(0, 5);
    if (!list.length) return null;
    let best = null;
    for (const c of list) {
      const r = scoreOne(sentence, c);
      if (!best || r.percent > best.percent) best = r;
    }
    return best;
  }

  return { normalize, wordSim, phon, buildTarget, scoreOne, scoreBest };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Scoring;

/* =========================================================
 * 2. 화면
 * ========================================================= */
if (typeof document !== "undefined") (function () {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ACT = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));
  const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));
  const QMAP = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

  /* ---------- 저장 ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 무시 */ } },
  };
  const PLAN_KEY = "g6u9_plans_v1", STAT_KEY = "g6u9_stats_v1";
  let plans = store.get(PLAN_KEY, {});      // { qid: { id, level } }
  let stats = store.get(STAT_KEY, {});      // { "qid|id|level": { n, best, sum, last } }
  QUESTIONS.forEach((q) => { if (plans[q.id] && !ACT[plans[q.id].id]) delete plans[q.id]; });

  const ui = {
    tab: "beg",
    curQ: { beg: "afternoon", mid: "afternoon" },
    filter: { beg: "all", mid: "all" },
    status: { beg: "", mid: "" },
  };
  const recordings = {};   // qid → blob URL (새로고침하면 사라짐)
  const lastResult = {};   // qid → 채점 결과
  let listening = null;    // 지금 말하기 중인 qid

  /* ---------- 문장 ---------- */
  const qSentence = (q) => `What are you going to do ${q.en}?`;
  const qKorean = (q) => `너는 ${q.koAt} 무엇을 할 거니?`;
  const phrase = (a, level) => (level === "mid" ? a.mid.en : a.en);
  const phraseKo = (a, level) => (level === "mid" ? a.mid.ko : a.ko);
  const aSentence = (a, level) => `I'm going to ${phrase(a, level)}.`;
  const aKorean = (a, level) => `나는 ${phraseKo(a, level)} 거야.`;
  const planCount = () => QUESTIONS.filter((q) => plans[q.id]).length;
  const statKey = (qid) => (plans[qid] ? `${qid}|${plans[qid].id}|${plans[qid].level}` : null);

  /* ---------- 음성 (TTS) ---------- */
  let voices = [];
  const loadVoices = () => { if (window.speechSynthesis) voices = speechSynthesis.getVoices(); };
  loadVoices();
  if (window.speechSynthesis && "onvoiceschanged" in speechSynthesis) speechSynthesis.onvoiceschanged = loadVoices;
  function pickVoice() {
    return voices.find((v) => v.lang === "en-US" && /Google|Samantha|Jenny|Aria/.test(v.name)) ||
      voices.find((v) => v.lang === "en-US") || voices.find((v) => /^en/.test(v.lang)) || null;
  }
  function speakList(items) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    items.forEach((it) => {
      const text = typeof it === "string" ? it : it.text;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.85;
      u.pitch = (it && it.pitch) || 1;
      const v = pickVoice();
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    });
  }
  const speak = (t) => speakList([t]);

  /* ---------- 단어 뜻 풍선 ---------- */
  function wordsHTML(sentence) {
    return sentence.split(/\s+/).map((w) => {
      const key = w.toLowerCase().replace(/[^a-z']/g, "");
      if (!key) return esc(w);
      const m = w.match(/^([^A-Za-z']*)([A-Za-z']+)([^A-Za-z']*)$/);
      if (!m) return esc(w);
      return `${esc(m[1])}<span class="w" data-w="${esc(key)}" data-say="${esc(m[2])}" tabindex="0">${esc(m[2])}</span>${esc(m[3])}`;
    }).join(" ");
  }
  const bubble = $("#wordBubble");
  function showBubble(el) {
    const key = el.dataset.w;
    const mean = WORDS[key] || "뜻 준비 중";
    bubble.innerHTML = `<b class="en">${esc(el.dataset.say)}</b><span>${esc(mean)}</span>`;
    bubble.hidden = false;
    const r = el.getBoundingClientRect();
    const bw = bubble.offsetWidth;
    let left = r.left + window.scrollX + r.width / 2 - bw / 2;
    left = Math.max(8 + window.scrollX, Math.min(left, window.scrollX + document.documentElement.clientWidth - bw - 8));
    bubble.style.left = left + "px";
    bubble.style.top = r.top + window.scrollY - bubble.offsetHeight - 10 + "px";
    speak(el.dataset.say);
  }
  document.addEventListener("click", (e) => {
    const w = e.target.closest(".w");
    if (w) { e.stopPropagation(); showBubble(w); return; }
    bubble.hidden = true;
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("w")) {
      e.preventDefault(); showBubble(e.target);
    }
  });
  window.addEventListener("scroll", () => { bubble.hidden = true; }, { passive: true });

  /* ---------- 그림 (없으면 이모지 타일) ---------- */
  function imgHTML(a, cls) {
    return `<div class="pic ${cls || ""}" style="--tile:${CAT[a.cat].color}">
      <img src="images/${a.id}.png" alt="${esc(a.en)}" loading="lazy" data-emoji="${esc(a.emoji)}">
    </div>`;
  }
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && img.dataset.emoji) {
      const tile = document.createElement("span");
      tile.className = "emoji-tile";
      tile.textContent = img.dataset.emoji;
      img.replaceWith(tile);
    }
  }, true);

  /* ---------- 탭 ---------- */
  function setTab(tab) {
    ui.tab = tab;
    document.querySelectorAll(".tab").forEach((b) => {
      const on = b.dataset.tab === tab;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + tab));
    if (tab === "practice") renderPractice(); else renderLevel(tab);
    bubble.hidden = true;
    window.scrollTo({ top: 0 });
  }
  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));

  function updateBadge() {
    $("#planBadge").textContent = `${planCount()}/5`;
  }

  function savePlans() {
    store.set(PLAN_KEY, plans);
    updateBadge();
  }

  /* ---------- 활동 카드 탭 ---------- */
  function renderLevel(level) {
    const panel = $("#panel-" + level);
    const qid = ui.curQ[level];
    const q = QMAP[qid];
    const plan = plans[qid];
    const pa = plan ? ACT[plan.id] : null;
    const qi = QUESTIONS.indexOf(q);

    const qBtns = QUESTIONS.map((x, i) => {
      const p = plans[x.id];
      return `<button class="qbtn ${x.id === qid ? "on" : ""} ${p ? "done" : ""}" data-q="${x.id}">
        <span class="qnum">Q${i + 1}</span>
        <span class="qemo">${x.emoji}</span>
        <span class="qko">${esc(x.ko)}</span>
        <span class="qen en">${esc(x.en)}</span>
        ${p ? `<span class="qcheck">✓ ${ACT[p.id].emoji}</span>` : ""}
      </button>`;
    }).join("");

    const answerHTML = pa
      ? `<p class="line en">${wordsHTML(aSentence(pa, plan.level))}</p>
         <p class="ko">${esc(aKorean(pa, plan.level))}</p>`
      : `<p class="line en">I'm going to <span class="blank">______</span>.</p>
         <p class="ko">나는 ______ 거야.</p>`;

    const status = ui.status[level] ||
      (pa ? `✅ ${q.ko} 계획: ${pa.emoji} ${esc(aKorean(pa, plan.level))} — 연습하기에 담겨 있어요.`
          : `👇 아래 카드에서 ${q.koAt} 할 일을 골라요.`);

    const filters = [
      { id: "all", label: "전체" },
      { id: "book", label: "📘 교과서 표현" },
      ...CATS.map((c) => ({ id: c.id, label: `${c.emoji} ${c.ko}` })),
      { id: "rec", label: `⭐ ${q.ko}에 어울리는 것만` },
    ];
    const f = ui.filter[level];
    const list = ACTIVITIES.filter((a) =>
      f === "all" ? true : f === "book" ? a.book : f === "rec" ? a.when.includes(qid) : a.cat === f);

    const cards = list.map((a) => {
      const chosen = plan && plan.id === a.id && plan.level === level;
      const elsewhere = QUESTIONS.filter((x) => x.id !== qid && plans[x.id] && plans[x.id].id === a.id)
        .map((x) => x.ko);
      const sent = aSentence(a, level);
      return `<article class="card ${chosen ? "chosen" : ""}" data-id="${a.id}" style="--cat:${CAT[a.cat].color}">
        <div class="tags">
          <span class="tag cat">${CAT[a.cat].emoji} ${CAT[a.cat].ko}</span>
          ${a.book ? `<span class="tag book">📘 교과서</span>` : ""}
          ${a.when.includes(qid) ? `<span class="tag rec">⭐ 추천</span>` : ""}
        </div>
        ${imgHTML(a)}
        <p class="sent en">${wordsHTML(sent)}</p>
        <p class="ko">${esc(aKorean(a, level))}</p>
        <div class="card-row">
          <button class="icon-btn say" data-say="${esc(sent)}" aria-label="문장 듣기">🔊</button>
          ${elsewhere.length ? `<span class="also">📌 ${esc(elsewhere.join(", "))}</span>` : ""}
        </div>
        <button class="choose ${chosen ? "on" : ""}" data-choose="${a.id}">
          ${chosen ? `✔ ${esc(q.koAt)} 할래요 (다시 누르면 빠져요)` : `✅ ${esc(q.koAt)} 할래요`}
        </button>
      </article>`;
    }).join("");

    panel.innerHTML = `
      <div class="box step">
        <h2>1️⃣ 질문을 골라요</h2>
        <div class="qbtns">${qBtns}</div>
        <div class="dialog">
          <div class="talk friend">
            <span class="who">🙋<small>친구</small></span>
            <div class="speech">
              <p class="line en">${wordsHTML(qSentence(q))}</p>
              <p class="ko">${esc(qKorean(q))}</p>
            </div>
            <button class="icon-btn say" data-say="${esc(qSentence(q))}" aria-label="질문 듣기">🔊</button>
          </div>
          <div class="talk me ${pa ? "filled" : ""}">
            <button class="icon-btn say" ${pa ? `data-say="${esc(aSentence(pa, plan.level))}"` : "disabled"} aria-label="대답 듣기">🔊</button>
            <div class="speech">${answerHTML}</div>
            <span class="who">🙆<small>나</small></span>
          </div>
          <div class="dialog-btns">
            <button class="btn" data-act="dialog">🔊 대화 듣기</button>
            <button class="btn" data-act="next">다음 질문 ▶</button>
            <button class="btn primary" data-act="go">🎤 연습하기로 가기</button>
          </div>
          <p class="status" role="status">${status}</p>
        </div>
      </div>
      <div class="box step">
        <h2>2️⃣ 할 일 고르기 <small>${level === "mid" ? "중급 · 누구와 · 어디서 · 무엇을 하러" : "초급 · 짧은 문장"}</small></h2>
        <div class="filters">${filters.map((x) =>
          `<button class="chip ${x.id === f ? "on" : ""}" data-filter="${x.id}">${esc(x.label)}</button>`).join("")}</div>
        <p class="count">${list.length}개 카드</p>
        <div class="cards">${cards}</div>
      </div>`;
    ui.status[level] = "";
  }

  function choose(level, id) {
    const qid = ui.curQ[level];
    const q = QMAP[qid];
    const a = ACT[id];
    const cur = plans[qid];
    if (cur && cur.id === id && cur.level === level) {
      delete plans[qid];
      delete lastResult[qid];
      savePlans();
      ui.status[level] = `↩️ ${q.ko} 계획을 뺐어요. 다른 카드를 골라요.`;
      renderLevel(level);
      return;
    }
    plans[qid] = { id, level };
    delete lastResult[qid];
    savePlans();
    ui.status[level] = `✅ ${q.ko} 계획을 골랐어요! 🎤 연습하기에 담겼어요. (${planCount()}/5)`;
    renderLevel(level);
    speakList([{ text: qSentence(q), pitch: 1.2 }, { text: aSentence(a, level), pitch: 0.95 }]);
  }

  ["beg", "mid"].forEach((level) => {
    $("#panel-" + level).addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      if (t.dataset.q) { ui.curQ[level] = t.dataset.q; renderLevel(level); return; }
      if (t.dataset.filter) { ui.filter[level] = t.dataset.filter; renderLevel(level); return; }
      if (t.dataset.choose) { choose(level, t.dataset.choose); return; }
      if (t.dataset.say) { speak(t.dataset.say); return; }
      const act = t.dataset.act;
      const q = QMAP[ui.curQ[level]];
      if (act === "dialog") {
        const p = plans[q.id];
        const items = [{ text: qSentence(q), pitch: 1.2 }];
        if (p) items.push({ text: aSentence(ACT[p.id], p.level), pitch: 0.95 });
        speakList(items);
        ui.status[level] = p ? "🔊 대화를 듣고 따라 말해 봐요." : "🔊 질문을 듣고, 카드를 골라 대답을 채워요.";
        renderLevel(level);
      } else if (act === "next") {
        const i = QUESTIONS.indexOf(q);
        const nq = QUESTIONS[(i + 1) % QUESTIONS.length];
        ui.curQ[level] = nq.id;
        ui.status[level] = `Q${QUESTIONS.indexOf(nq) + 1} ${nq.ko} 질문이에요. 카드를 골라 대답해요.`;
        renderLevel(level);
        speak(qSentence(nq));
      } else if (act === "go") {
        setTab("practice");
      }
    });
  });

  /* ---------- 연습하기 탭 ---------- */
  const SR = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  function summary() {
    let n = 0, sum = 0, done = 0;
    Object.values(stats).forEach((s) => { n += s.n; sum += s.sum; });
    QUESTIONS.forEach((q) => { const k = statKey(q.id); if (k && stats[k] && stats[k].n) done++; });
    return { n, avg: n ? Math.round(sum / n) : 0, done };
  }

  function resultHTML(qid) {
    const r = lastResult[qid];
    if (!r) return "";
    if (r.noSR) return `<p class="note">🎧 이 브라우저는 음성 인식이 안 돼서 녹음만 했어요. ▶ 내 목소리로 들어 보세요. (채점은 Chrome 권장)</p>`;
    if (r.empty) return `<p class="note">🙉 잘 안 들렸어요. 마이크 가까이에서 또박또박 다시 말해 봐요.${r.error ? ` <small>(${esc(r.error)})</small>` : ""}</p>`;
    const mark = r.percent >= 85 ? "⭐ 훌륭해요!" : r.percent >= 60 ? "👍 좋아요!" : "🔁 다시 해 봐요!";
    const retry = r.chips.filter((c) => c.status !== "ok").map((c) => c.word)
      .filter((w, i, arr) => w && arr.indexOf(w) === i).slice(0, 5);
    return `<div class="result">
      <p class="score"><b>${mark}</b> <span class="pct">${r.percent}%</span></p>
      <div class="chips">${r.chips.map((c) => `<span class="wchip ${c.status}">${esc(c.text)}</span>`).join("")}</div>
      <p class="legend">🟩 맞음 · 🟨 비슷함 · 🟥 놓침</p>
      ${retry.length ? `<p class="retry">🔁 다시 들어 볼 단어: ${retry.map((w) =>
        `<button class="mini" data-say="${esc(w)}">🔊 ${esc(w)}</button>`).join(" ")}</p>` : ""}
      <p class="heard">컴퓨터가 들은 말: “${esc(r.heard)}”</p>
    </div>`;
  }

  function statLine(qid) {
    const k = statKey(qid);
    const s = k && stats[k];
    if (!s || !s.n) return "아직 연습 기록이 없어요";
    return `이번 ${s.last}% · 평균 ${Math.round(s.sum / s.n)}% · 최고 ${s.best}% · ${s.n}회`;
  }

  function renderPractice() {
    updateBadge();
    const panel = $("#panel-practice");
    const sm = summary();
    const hasSR = !!SR(), hasRec = canRecord();
    const rows = QUESTIONS.map((q, i) => {
      const p = plans[q.id];
      const a = p ? ACT[p.id] : null;
      const tool = !a ? "" : `
        <div class="speak-tool no-print">
          <button class="btn mic ${listening === q.id ? "rec" : ""}" data-speak="${q.id}" ${!hasSR && !hasRec ? "disabled" : ""}>
            ${listening === q.id ? "⏹ 그만" : "🎙️ 말하기"}</button>
          <button class="btn" data-play="${q.id}" ${recordings[q.id] ? "" : "disabled"}>▶ 내 목소리</button>
          <span class="stat" id="st-${q.id}">${statLine(q.id)}</span>
          ${!hasSR && !hasRec ? `<span class="warn">이 브라우저에서는 말하기가 안 돼요 · Chrome 권장</span>` :
            !hasSR ? `<span class="warn">음성 인식이 없어 4초 녹음만 돼요 · Chrome 권장</span>` : ""}
          <p class="live" id="live-${q.id}" ${listening === q.id ? "" : "hidden"}>👂 들리는 말: <span></span></p>
          <div class="res" id="res-${q.id}">${resultHTML(q.id)}</div>
        </div>`;
      return `<div class="plan-row ${a ? "filled" : "empty"}" id="row-${q.id}">
        <div class="when"><span class="qnum">Q${i + 1}</span> ${q.emoji}<b>${esc(q.ko)}</b><span class="en">${esc(q.en)}</span></div>
        <div class="plan-main">
          <div class="plan-text">
            <p class="pq en"><b>Q.</b> ${wordsHTML(qSentence(q))}</p>
            ${a ? `<p class="pa en"><b>A.</b> ${wordsHTML(aSentence(a, p.level))}</p>
                   <p class="ko">${esc(aKorean(a, p.level))} <span class="lv">${p.level === "mid" ? "중급" : "초급"}</span></p>`
                : `<p class="pa en"><b>A.</b> I'm going to <span class="blank">______</span>.</p>
                   <p class="ko hint">활동 카드에서 골라요</p>`}
          </div>
          ${a ? imgHTML(a, "thumb") : `<div class="pic thumb empty-thumb">❔</div>`}
          <div class="row-btns no-print">
            <button class="icon-btn" data-sayrow="${q.id}" aria-label="듣기">🔊</button>
            ${a ? `<button class="icon-btn del" data-del="${q.id}" aria-label="빼기">✕</button>` : ""}
          </div>
        </div>
        ${tool}
      </div>`;
    }).join("");

    panel.innerHTML = `
      <div class="box summary no-print">
        <h2>🎙️ 연습 기록</h2>
        <div class="sum-stats">
          <span>🎙️ 총 연습 <b id="sumN">${sm.n}</b>회</span>
          <span>📊 평균 정확도 <b id="sumAvg">${sm.avg}</b>%</span>
          <span>✅ 연습한 문장 <b id="sumDone">${sm.done}</b>/5</span>
        </div>
        <div class="sum-btns">
          <button class="btn" data-act="clear">🧹 기록 지우기</button>
          <button class="btn" data-act="all">🔊 전체 듣기</button>
          <button class="btn" data-act="print">🖨️ 인쇄하기</button>
        </div>
      </div>
      <div class="box plan-sheet">
        <h2>📅 나의 계획표 · <span class="en">My Plans</span></h2>
        ${rows}
      </div>`;
  }

  function updateSummary() {
    const sm = summary();
    const set = (id, v) => { const el = $("#" + id); if (el) el.textContent = v; };
    set("sumN", sm.n); set("sumAvg", sm.avg); set("sumDone", sm.done);
  }

  function recordStat(qid, percent) {
    const k = statKey(qid);
    if (!k) return;
    const s = stats[k] || { n: 0, best: 0, sum: 0, last: 0 };
    s.n += 1; s.sum += percent; s.last = percent; s.best = Math.max(s.best, percent);
    stats[k] = s;
    store.set(STAT_KEY, stats);
  }

  let session = null;
  async function startSpeak(qid) {
    if (listening) { if (session) session.stop(); return; }
    const p = plans[qid];
    if (!p) return;
    const target = aSentence(ACT[p.id], p.level);
    const Rec = SR();
    if (window.speechSynthesis) speechSynthesis.cancel();
    listening = qid;
    renderPractice();

    let stream = null, mr = null, chunks = [];
    let finished = false, timer = null, recog = null, lastResults = null, interimText = "", errMsg = "";

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (mr && mr.state !== "inactive") { try { mr.stop(); } catch (e) { /* 무시 */ } }
      else if (stream) stream.getTracks().forEach((t) => t.stop());
      if (Rec) {
        const results = lastResults ? Array.from(lastResults) : [];
        const cands = [];
        for (let j = 0; j < 5; j++) {
          const txt = results.map((r) => (r[j] || r[0] || { transcript: "" }).transcript).join(" ").trim();
          if (txt && !cands.includes(txt)) cands.push(txt);
        }
        if (!cands.length && interimText.trim()) cands.push(interimText.trim());
        const best = Scoring.scoreBest(target, cands);
        if (best) { lastResult[qid] = best; recordStat(qid, best.percent); }
        else lastResult[qid] = { empty: true, error: errMsg };
      } else {
        lastResult[qid] = { noSR: true };
      }
      listening = null;
      session = null;
      renderPractice();
      updateSummary();
    };

    session = { stop: () => { if (recog) { try { recog.stop(); } catch (e) { finish(); } } else finish(); } };

    if (canRecord()) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mr = new MediaRecorder(stream);
        mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        mr.onstop = () => {
          if (stream) stream.getTracks().forEach((t) => t.stop());
          if (chunks.length) {
            if (recordings[qid]) URL.revokeObjectURL(recordings[qid]);
            recordings[qid] = URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || "audio/webm" }));
            const b = document.querySelector(`[data-play="${qid}"]`);
            if (b) b.disabled = false;
          }
        };
        mr.start();
      } catch (e) {
        stream = null; mr = null;
        errMsg = "마이크를 허용해 주세요";
      }
    }

    if (Rec) {
      try {
        recog = new Rec();
        recog.lang = "en-US";
        recog.interimResults = true;
        recog.maxAlternatives = 5;
        recog.continuous = false;
        recog.onresult = (e) => {
          lastResults = e.results;
          interimText = Array.from(e.results).map((r) => r[0].transcript).join(" ");
          const live = document.querySelector(`#live-${qid} span`);
          if (live) live.textContent = interimText;
        };
        recog.onerror = (e) => { errMsg = e.error === "not-allowed" ? "마이크를 허용해 주세요" : e.error || ""; };
        recog.onend = finish;
        recog.start();
        timer = setTimeout(() => { try { recog.stop(); } catch (e) { finish(); } }, 9000);
      } catch (e) {
        errMsg = String(e.message || e);
        finish();
      }
    } else if (mr) {
      timer = setTimeout(finish, 4000);
    } else {
      finish();
    }
  }

  let player = null;
  $("#panel-practice").addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.speak) { startSpeak(t.dataset.speak); return; }
    if (t.dataset.play) {
      const url = recordings[t.dataset.play];
      if (url) { if (player) player.pause(); player = new Audio(url); player.play().catch(() => {}); }
      return;
    }
    if (t.dataset.say) { speak(t.dataset.say); return; }
    if (t.dataset.sayrow) {
      const q = QMAP[t.dataset.sayrow];
      const p = plans[q.id];
      const items = [{ text: qSentence(q), pitch: 1.2 }];
      if (p) items.push({ text: aSentence(ACT[p.id], p.level), pitch: 0.95 });
      speakList(items);
      return;
    }
    if (t.dataset.del) {
      delete plans[t.dataset.del];
      delete lastResult[t.dataset.del];
      savePlans();
      renderPractice();
      return;
    }
    const act = t.dataset.act;
    if (act === "clear") {
      if (!confirm("연습 기록(횟수·점수·녹음)을 모두 지울까요? 계획표는 그대로 남아요.")) return;
      stats = {};
      store.set(STAT_KEY, stats);
      Object.keys(lastResult).forEach((k) => delete lastResult[k]);
      Object.keys(recordings).forEach((k) => { URL.revokeObjectURL(recordings[k]); delete recordings[k]; });
      renderPractice();
    } else if (act === "all") {
      const items = [];
      QUESTIONS.forEach((q) => {
        const p = plans[q.id];
        if (!p) return;
        items.push({ text: qSentence(q), pitch: 1.2 }, { text: aSentence(ACT[p.id], p.level), pitch: 0.95 });
      });
      if (items.length) speakList(items);
    } else if (act === "print") {
      window.print();
    }
  });

  /* ---------- 단풍잎 ---------- */
  (function leaves() {
    const box = $(".leaves");
    if (!box) return;
    const kinds = ["🍁", "🍂", "🍁", "🍂"];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span");
      s.textContent = kinds[i % kinds.length];
      s.style.left = (i * 7.3 + Math.random() * 4) % 100 + "%";
      s.style.animationDelay = (-Math.random() * 12).toFixed(1) + "s";
      s.style.animationDuration = (9 + Math.random() * 7).toFixed(1) + "s";
      s.style.fontSize = (16 + Math.random() * 14).toFixed(0) + "px";
      box.appendChild(s);
    }
  })();

  updateBadge();
  renderLevel("beg");
})();
