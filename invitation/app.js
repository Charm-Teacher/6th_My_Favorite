/* =========================================================
 * 6학년 · Can you come to the ___? · 듣고 따라 말하기 웹 앱
 * - 음성 출력: Web Speech API (SpeechSynthesis)
 * - 단어 클릭: 단어 발음 + 뜻 풍선(popup)
 * - 내 행사 세트 만들기: 세트 3개(행사 + 약속 장소/시간) + 내 대답(승낙/거절)
 * - 세트 연습: 세트별 대화를 줄마다 말하기 + 역할극(A/B) 채점
 * - 따라 말하기 채점: Web Speech API (SpeechRecognition)
 * ========================================================= */

/* ---------- 음성 합성 (TTS) ---------- */
const synth = window.speechSynthesis;
let enVoice = null;
let speakRate = 0.85;

function pickVoice() {
  const voices = synth.getVoices();
  enVoice =
    voices.find(v => /en[-_]US/i.test(v.lang)) ||
    voices.find(v => /^en/i.test(v.lang)) ||
    null;
  const status = document.querySelector(".toolbar #voice-status");
  if (status) {
    status.textContent = enVoice ? `음성: ${enVoice.name}` : "영어 음성을 찾는 중...";
  }
}
pickVoice();
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = pickVoice;

function speak(text, rate, onStart, onEnd) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate || speakRate;
  u.pitch = 1.05;
  if (enVoice) u.voice = enVoice;
  if (onStart) u.onstart = onStart;
  if (onEnd) u.onend = onEnd;
  synth.speak(u);
}

/* ---------- 단어 뜻 풍선(popup) ---------- */
const popup = document.createElement("div");
popup.className = "word-popup hidden";
popup.innerHTML = `
  <div class="wp-word"></div>
  <div class="wp-meaning"></div>
  <button class="wp-listen">단어 다시 듣기</button>`;
document.body.appendChild(popup);

popup.querySelector(".wp-listen").addEventListener("click", e => {
  e.stopPropagation();
  if (popup.dataset.word) speak(popup.dataset.word, 0.8);
});

function showWordPopup(wordEl, rawWord) {
  const key = wordKey(rawWord);
  const plain = rawWord.replace(/[.,!?]+$/, "");
  const meaning = WORD_MEANINGS[key] || WORD_MEANINGS[plain] || "(뜻 정보 없음)";
  popup.dataset.word = key || rawWord;
  popup.querySelector(".wp-word").textContent = rawWord.replace(/[.,!?]+$/, "");
  popup.querySelector(".wp-meaning").textContent = meaning;

  popup.classList.remove("hidden");
  const r = wordEl.getBoundingClientRect();
  const pw = popup.offsetWidth;
  let left = r.left + r.width / 2 - pw / 2 + window.scrollX;
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
  let top = r.bottom + 8 + window.scrollY;
  popup.style.left = left + "px";
  popup.style.top = top + "px";

  speak(key || rawWord, 0.8);
}

function hidePopup() { popup.classList.add("hidden"); }
document.addEventListener("click", e => {
  if (!popup.contains(e.target) && !e.target.classList.contains("word")) hidePopup();
});

/* ---------- 클릭 가능한 단어로 문장 만들기 ---------- */
function buildWords(sentence) {
  const frag = document.createDocumentFragment();
  sentence.split(/\s+/).forEach((w, i) => {
    if (i > 0) frag.appendChild(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    span.addEventListener("click", e => {
      e.stopPropagation();
      showWordPopup(span, w);
    });
    frag.appendChild(span);
  });
  return frag;
}

/* ---------- 실사 이미지 ---------- */
let imageMode = false; // false: 모든 카드를 같은 이모지 타일로 통일 (true로 바꾸면 AI 실사 사진 시도)
function hashSeed(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 100000;
}
function imageUrl(prompt) {
  const p = encodeURIComponent("a bright, friendly, realistic photo of " + prompt + ", for kids");
  return `https://image.pollinations.ai/prompt/${p}?width=400&height=260&nologo=true&seed=${hashSeed(prompt)}`;
}

/* ---------- 카드 만들기 ---------- */
function makeCard(item, opts) {
  opts = opts || {};
  const div = document.createElement("div");
  div.className = "card" + (opts.tone != null ? " tone-" + opts.tone : "");

  function speakSentence() {
    speak(item.en, null,
      () => div.classList.add("speaking"),
      () => div.classList.remove("speaking"));
  }

  // 윗줄: 태그 + 듣기
  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "card-tag";
  if (opts.index != null) tag.textContent = "CARD " + opts.index;
  const listenAll = document.createElement("button");
  listenAll.className = "listen-all";
  listenAll.textContent = "듣기 ▶";
  listenAll.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  top.append(tag, listenAll);

  // 이모지 또는 실사 이미지
  let visual;
  if (imageMode && item.imgPrompt) {
    visual = document.createElement("img");
    visual.className = "photo";
    visual.loading = "lazy";
    visual.alt = item.en;
    visual.src = imageUrl(item.imgPrompt);
    visual.addEventListener("error", () => {
      const em = document.createElement("div");
      em.className = "emoji";
      em.textContent = item.emoji;
      visual.replaceWith(em);
    });
  } else {
    visual = document.createElement("div");
    visual.className = "emoji";
    visual.textContent = item.emoji;
  }

  // 안쪽 문장 박스: 문장 + 한글 + 스피커
  const box = document.createElement("div");
  box.className = "sentence-box";
  const txt = document.createElement("div");
  txt.className = "sentence-text";
  const en = document.createElement("div");
  en.className = "en";
  en.appendChild(buildWords(item.en));
  const ko = document.createElement("div");
  ko.className = "ko";
  ko.textContent = item.ko;
  txt.append(en, ko);
  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn";
  speakBtn.setAttribute("aria-label", "문장 듣기");
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  box.append(txt, speakBtn);

  div.append(top, visual, box);

  return div;
}

function renderGrid(id, list, opts) {
  opts = opts || {};
  const grid = document.getElementById(id);
  grid.innerHTML = "";
  list.forEach((item, i) => {
    const cardOpts = {};
    if (opts.tones) { cardOpts.tone = i % 6; if (!opts.noIndex) cardOpts.index = i + 1; }
    grid.appendChild(makeCard(item, cardOpts));
  });
}

/* ---------- 난이도(초급/중급/고급) + 활동 종류 ---------- */
let currentLevel = "beginner";
let currentCategory = "all";
function currentSuggestions() { return SUGGESTION_LEVELS[currentLevel]; }

function renderSuggestions() {
  const lvl = currentSuggestions();
  const view = [];
  lvl.forEach((item, i) => {
    if (currentCategory === "all" || SUGGESTION_CATEGORIES[i] === currentCategory) {
      view.push(Object.assign({}, item, { imgPrompt: IMAGE_PROMPTS[i] }));
    }
  });
  renderGrid("suggestion-grid", view, { tones: true });
}

document.querySelectorAll(".level-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentLevel = btn.dataset.level;
    synth.cancel();
    hidePopup();
    renderSuggestions();
  });
});

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    synth.cancel();
    hidePopup();
    renderSuggestions();
  });
});

/* ===========================================================
 * 🎒 내 행사 세트 만들기 (세트 3개: 행사 1 + 약속 장소·시간 1)  +  내 대답 (승낙 1 · 거절 1)
 * =========================================================== */
const SET_COUNT = 3;
let mySets = [];        // [{ event, place, time }] (영어 문구 en 으로 저장)
let myAccept = ACCEPT_EXPRESSIONS[0].en;
let myReason = null;    // REFUSE_REASONS 의 en
let setMode = "accept"; // 위 대화 미리보기: 친구가 승낙("accept") / 거절("refuse")
let curSet = 0;
let stats = {};         // 문장별 정확도 기록

try {
  const saved = JSON.parse(localStorage.getItem("invite_sets") || "null");
  if (saved && Array.isArray(saved.sets)) {
    mySets = saved.sets;
    if (saved.accept) myAccept = saved.accept;
    if (saved.reason) myReason = saved.reason;
    if (saved.mode === "refuse" || saved.mode === "accept") setMode = saved.mode;
  }
} catch (e) {}
while (mySets.length < SET_COUNT) mySets.push({ event: null, place: null, time: null });
try { stats = JSON.parse(localStorage.getItem("invite_stats") || "{}") || {}; } catch (e) {}

function persist() {
  try {
    localStorage.setItem("invite_sets", JSON.stringify({ sets: mySets, accept: myAccept, reason: myReason, mode: setMode }));
    localStorage.setItem("invite_stats", JSON.stringify(stats));
  } catch (e) {}
}
const findEvent = en => BUILD_EVENTS.find(x => x.en === en) || null;
const findPlace = en => PLACE_EXPRESSIONS.find(x => x.en === en) || null;
const findTime  = en => TIME_EXPRESSIONS.find(x => x.en === en) || null;
const findAccept = en => ACCEPT_EXPRESSIONS.find(x => x.en === en) || ACCEPT_EXPRESSIONS[0];
const findReason = en => REFUSE_REASONS.find(x => x.en === en) || null;
function setComplete(s) { return !!(findEvent(s.event) && findPlace(s.place) && findTime(s.time)); }
function completeCount() { return mySets.filter(setComplete).length; }

/* 세트 → 대화 줄 (승낙/거절 버전) */
function setLines(s, mode) {
  const ev = findEvent(s.event), pl = findPlace(s.place), tm = findTime(s.time);
  const acc = findAccept(myAccept), rs = findReason(myReason);
  const lines = [{ who: "A", en: `Can you come to ${ev.en}?`, ko: `${ev.ko}에 올 수 있니?` }];
  if (mode === "refuse") {
    lines.push({ who: "B", en: `Sorry, but I can't. I have a ${rs ? rs.en : "piano lesson"}.`,
                 ko: `미안하지만 못 가. 나 ${rs ? rs.ko : "피아노 수업"}(이)가 있어.` });
  } else {
    lines.push({ who: "B", en: acc.en, ko: acc.ko });
    lines.push({ who: "A", en: `Please come to ${pl.en} at ${tm.en}.`, ko: `${tm.ko}에 ${pl.ko}(으)로 와 줘.` });
  }
  return lines;
}

function makeChip(text, cls, isOn, onClick) {
  const c = document.createElement("button");
  c.className = "chip " + cls + (isOn ? " on" : "");
  c.textContent = text;
  c.addEventListener("click", onClick);
  return c;
}
function setBlank(id, en) {
  const el = document.getElementById(id);
  el.classList.toggle("filled", !!en);
  if (en) { el.innerHTML = ""; el.appendChild(buildWords(en)); }
  else el.textContent = "________";
}
function updateSetBadge() {
  const c = document.getElementById("set-count");
  if (c) c.textContent = `${completeCount()}/${SET_COUNT}`;
  document.querySelectorAll("#set-tabs .set-tab").forEach((b, i) => {
    b.classList.toggle("active", i === curSet);
    b.classList.toggle("done", setComplete(mySets[i]));
    const ev = findEvent(mySets[i].event);
    b.textContent = `행사 ${i + 1} ${ev ? ev.emoji : ""}${setComplete(mySets[i]) ? " ✓" : ""}`;
  });
}

function renderBuilder() {
  const s = mySets[curSet];
  const evWrap = document.getElementById("build-events");
  const placeRow = document.getElementById("build-place");
  const timeRow = document.getElementById("build-time");
  const acceptRow = document.getElementById("build-accept");
  const refuseRow = document.getElementById("build-refuse");
  evWrap.innerHTML = ""; placeRow.innerHTML = ""; timeRow.innerHTML = ""; acceptRow.innerHTML = ""; refuseRow.innerHTML = "";

  const usedElsewhere = new Set(mySets.filter((x, i) => i !== curSet).map(x => x.event).filter(Boolean));
  BUILD_CATS.forEach(cat => {
    const items = BUILD_EVENTS.filter(a => a.cat === cat.key);
    const title = document.createElement("div");
    title.className = "chip-group-title";
    title.textContent = cat.label;
    const row = document.createElement("div");
    row.className = "chip-row wrap";
    items.forEach(a => {
      const chip = makeChip(`${a.emoji} ${a.en}`, "act", s.event === a.en, () => {
        s.event = a.en; persist(); renderBuilder(); updateSetPreview(true);
      });
      if (usedElsewhere.has(a.en)) { chip.classList.add("used"); chip.title = "다른 세트에서 이미 골랐어요"; }
      row.appendChild(chip);
    });
    evWrap.append(title, row);
  });
  PLACE_EXPRESSIONS.forEach(p => {
    placeRow.appendChild(makeChip(`${p.emoji} ${p.en}`, "place", s.place === p.en, () => {
      s.place = p.en; persist(); renderBuilder(); updateSetPreview(true);
    }));
  });
  TIME_EXPRESSIONS.forEach(t => {
    timeRow.appendChild(makeChip(`${t.emoji} ${t.en}`, "with", s.time === t.en, () => {
      s.time = t.en; persist(); renderBuilder(); updateSetPreview(true);
    }));
  });
  ACCEPT_EXPRESSIONS.forEach(m => {
    acceptRow.appendChild(makeChip(`${m.emoji} ${m.en}`, "when", myAccept === m.en, () => {
      myAccept = m.en; setMode = "accept"; persist(); renderBuilder(); updateSetPreview(); speak(m.en);
    }));
  });
  REFUSE_REASONS.forEach(r => {
    refuseRow.appendChild(makeChip(`${r.emoji} ${r.en}`, "where", myReason === r.en, () => {
      myReason = r.en; setMode = "refuse"; persist(); renderBuilder(); updateSetPreview();
      speak(`Sorry, but I can't. I have a ${r.en}.`);
    }));
  });
  const rb = document.getElementById("build-refuse-blank");
  rb.classList.toggle("filled", !!myReason);
  rb.textContent = myReason || "________";
  updateSetBadge();
}

let lastSetSpoken = "";
/* 미리보기 대화를 들려줄 수 있는 상태인지 (거절 버전은 약속 문장이 없어 행사만 있으면 됨) */
function setPlayable(s) { return setMode === "refuse" ? !!(findEvent(s.event) && findReason(myReason)) : setComplete(s); }

function updateSetPreview(autoSpeak) {
  const s = mySets[curSet];
  const ev = findEvent(s.event), pl = findPlace(s.place), tm = findTime(s.time);
  const acc = findAccept(myAccept), rs = findReason(myReason);
  const refusing = setMode === "refuse";
  setBlank("set-event", ev && ev.en);
  document.getElementById("set-event-ko").textContent = `${ev ? ev.ko : "________"}에 올 수 있니?`;

  // 친구의 대답 줄: 승낙 표현 또는 거절 문장
  document.getElementById("set-mode-accept").classList.toggle("active", !refusing);
  document.getElementById("set-mode-refuse").classList.toggle("active", refusing);
  const answerEn = refusing ? `Sorry, but I can't. I have a ${rs ? rs.en : "________"}.` : acc.en;
  const answerKo = refusing ? `미안하지만 못 가. 나 ${rs ? rs.ko : "________"}(이)가 있어.` : acc.ko;
  const al = document.getElementById("set-answer-line");
  al.innerHTML = ""; al.appendChild(buildWords(answerEn));
  document.getElementById("set-answer-ko").textContent = answerKo;
  document.getElementById("set-answer-row").classList.toggle("refusing", refusing);

  // 약속 문장 줄: 거절하면 말하지 않으므로 흐리게 (거절 버전 대화에서 빠짐)
  setBlank("set-place", pl && pl.en);
  setBlank("set-time", tm && tm.en);
  document.getElementById("set-meet-ko").textContent = `${tm ? tm.ko : "________"}에 ${pl ? pl.ko : "________"}(으)로 와 줘.`;
  document.getElementById("set-meet-row").classList.toggle("dimmed", refusing);

  const status = document.getElementById("set-status");
  const complete = setComplete(s);
  status.className = "dlg-status" + (complete ? " ok" : "");
  if (!ev) status.textContent = `행사 ${curSet + 1} · 1️⃣ 초대할 행사를 골라보세요 👇`;
  else if (refusing && !rs) status.textContent = `행사 ${curSet + 1} · ❌ 거절 버전이에요. 아래에서 ❌ 거절 이유를 골라요 👇`;
  else if (!pl || !tm) status.textContent = `행사 ${curSet + 1} · 2️⃣ 약속 ${!pl ? "📍 장소" : ""}${!pl && !tm ? "와 " : ""}${!tm ? "⏰ 시간" : ""}을 골라요 👇`;
  else if (refusing) status.textContent = `❌ 친구가 거절하면 약속 문장은 말하지 않아요. ⭕ 승낙을 누르면 약속까지 이어져요.`;
  else status.textContent = `✅ 행사 ${curSet + 1} 완성! ${completeCount() < SET_COUNT ? "다음 행사도 만들어 보세요." : "세 행사 모두 완성! 📝 워크시트에 적고 🎤 연습으로 가요."}`;
  renderSheetSummary();
  const listen = document.getElementById("set-listen");
  listen.textContent = refusing ? "🔊 대화 듣기 (거절)" : "🔊 대화 듣기 (승낙)";
  listen.disabled = !setPlayable(s);
  updateSetBadge();
  // 자동 읽기는 사용자가 칩을 눌러 고른 직후에만 (페이지 열기·탭 전환 때는 조용히)
  if (setPlayable(s) && autoSpeak) {
    const en = setLines(s, setMode).map(l => l.en).join(" ");
    if (en !== lastSetSpoken) { lastSetSpoken = en; speak(en); }
  } else if (!setPlayable(s)) lastSetSpoken = "";
}

document.querySelectorAll("#set-mode .cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    setMode = btn.dataset.mode;
    synth.cancel(); lastSetSpoken = "";
    persist(); renderBuilder(); updateSetPreview();
  });
});

document.querySelectorAll("#set-tabs .set-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    curSet = +btn.dataset.set; synth.cancel(); lastSetSpoken = "";
    renderBuilder(); updateSetPreview();
  });
});
document.getElementById("set-speak-invite").addEventListener("click", () => {
  const ev = findEvent(mySets[curSet].event); if (ev) speak(`Can you come to ${ev.en}?`);
});
document.getElementById("set-speak-answer").addEventListener("click", () => {
  const rs = findReason(myReason);
  if (setMode === "refuse") { if (rs) speak(`Sorry, but I can't. I have a ${rs.en}.`); }
  else speak(findAccept(myAccept).en);
});
document.getElementById("set-speak-meet").addEventListener("click", () => {
  const s = mySets[curSet], pl = findPlace(s.place), tm = findTime(s.time);
  if (pl && tm) speak(`Please come to ${pl.en} at ${tm.en}.`);
});
document.getElementById("set-listen").addEventListener("click", () => {
  const s = mySets[curSet];
  if (setPlayable(s)) speak(setLines(s, setMode).map(l => l.en).join(" "));
});
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
document.getElementById("set-random").addEventListener("click", () => {
  const s = mySets[curSet];
  const used = new Set(mySets.filter((x, i) => i !== curSet).map(x => x.event));
  const pool = BUILD_EVENTS.filter(e => !used.has(e.en));
  s.event = pick(pool.length ? pool : BUILD_EVENTS).en;
  s.place = pick(PLACE_EXPRESSIONS).en;
  s.time = pick(TIME_EXPRESSIONS).en;
  if (!myReason) myReason = pick(REFUSE_REASONS).en;
  persist(); renderBuilder(); updateSetPreview(true);
});
document.getElementById("set-clear").addEventListener("click", () => {
  mySets[curSet] = { event: null, place: null, time: null };
  synth.cancel(); persist(); renderBuilder(); updateSetPreview();
});


/* ---- 음성 인식 (정확도 측정) ---- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const srSupported = !!SR;
let rec = srSupported ? new SR() : null;
if (rec) { rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5; }
let recBusy = false;

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z\s']/g, "").replace(/\s+/g, " ").trim();
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function wordsClose(a, b) {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return true;
  return Math.abs(a.length - b.length) <= 1 && levenshtein(a, b) <= 1;
}
const STOPWORDS = new Set(["a", "an", "the", "to", "of", "on", "in", "at", "for", "but", "i", "i'm", "i'll"]);
function scoreMatch(target, heard) {
  const t = normalize(target).split(" ").filter(Boolean);
  const h = normalize(heard).split(" ").filter(Boolean);
  let content = t.filter(w => !STOPWORDS.has(w));
  if (!content.length) content = t;
  let hit = 0;
  content.forEach(w => { if (h.some(x => wordsClose(x, w))) hit++; });
  let score = hit / content.length;
  if (score >= 0.5) score = Math.min(1, score + 0.12);
  return score;
}
function practiceAttempt(target, cb) {
  if (!rec || recBusy) { cb.onend && cb.onend(); return; }
  recBusy = true;
  let score = 0, heard = "", errCode = null;
  rec.onresult = e => {
    const alts = e.results[0];
    for (let i = 0; i < alts.length; i++) {
      const s = scoreMatch(target, alts[i].transcript);
      if (s > score) { score = s; heard = alts[i].transcript; }
    }
  };
  rec.onerror = ev => { errCode = ev.error; };
  rec.onend = () => {
    recBusy = false;
    if (errCode && score === 0) cb.onerror && cb.onerror(errCode);
    else cb.onresult && cb.onresult(Math.round(score * 100), heard);
    cb.onend && cb.onend();
  };
  try { rec.start(); } catch (e) { recBusy = false; cb.onend && cb.onend(); }
}

/* ---- 말한 뒤 콜백 (음성이 없어도 넘어가도록 안전장치) ---- */
function speakThen(text, cb) {
  let done = false;
  const finish = () => { if (!done) { done = true; cb(); } };
  const timer = setTimeout(finish, Math.min(9000, 1500 + text.length * 90));
  speak(text, null, null, () => { clearTimeout(timer); finish(); });
}

function statsText(en, last) {
  const s = stats[en] || { attempts: 0, best: 0 };
  return `정확도 <b class="acc">${last != null ? last + "%" : "--"}</b>` +
    ` · 최고 <b class="best">${s.best ? s.best + "%" : "--"}</b>` +
    ` · <b>${s.attempts}</b>회`;
}
function recordScore(en, score) {
  const s = stats[en] || { attempts: 0, best: 0 };
  s.attempts++; s.best = Math.max(s.best, score); stats[en] = s; persist();
}
function feedbackHtml(score, heard) {
  const h = `<span class="heard">내 발음: ${heard || "(못 들었어요)"}</span>`;
  if (score >= 75) return ["good", `⭐ 훌륭해요! ${score}% ${h}`];
  if (score >= 45) return ["good", `👍 좋아요! 한 번 더! ${score}% ${h}`];
  return ["bad", `🔁 다시 또박또박! ${score}% ${h}`];
}

/* 한 문장 연습 줄: [🔊] 문장/뜻 [🎙️ 말하기] 점수 → 피드백 */
function makeSpeakRow(en, ko, who) {
  const row = document.createElement("div");
  row.className = "prow" + (who ? " who-" + who.toLowerCase() : "");

  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn small";
  speakBtn.setAttribute("aria-label", "듣기");
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", () => speak(en));

  const txt = document.createElement("div");
  txt.className = "prow-text";
  if (who) { const w = document.createElement("span"); w.className = "prow-who"; w.textContent = who; txt.appendChild(w); }
  const enEl = document.createElement("div"); enEl.className = "en"; enEl.appendChild(buildWords(en));
  const koEl = document.createElement("div"); koEl.className = "ko"; koEl.textContent = ko;
  txt.append(enEl, koEl);

  const mic = document.createElement("button");
  mic.className = "mic-btn";
  mic.innerHTML = '<span class="mic-ico">🎙️</span><span class="mic-txt">말하기</span>';
  const score = document.createElement("div");
  score.className = "pstats";
  score.innerHTML = statsText(en, null);
  const fb = document.createElement("div");
  fb.className = "mic-feedback";

  if (!srSupported) { mic.disabled = true; mic.title = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; }

  function attempt(after) {
    if (recBusy || !srSupported) { after && after(); return; }
    mic.classList.add("recording");
    row.classList.add("active");
    fb.className = "mic-feedback"; fb.textContent = "🔴 듣고 있어요... 또박또박 말해보세요!";
    practiceAttempt(en, {
      onresult: (s, heard) => {
        recordScore(en, s);
        score.innerHTML = statsText(en, s);
        const [cls, html] = feedbackHtml(s, heard);
        fb.className = "mic-feedback " + cls; fb.innerHTML = html;
      },
      onerror: err => {
        fb.className = "mic-feedback bad";
        fb.textContent = err === "not-allowed" ? "마이크 권한을 허용해 주세요." : "다시 시도해 주세요.";
      },
      onend: () => { mic.classList.remove("recording"); row.classList.remove("active"); after && after(); }
    });
  }
  mic.addEventListener("click", () => attempt());

  const main = document.createElement("div");
  main.className = "prow-main";
  main.append(speakBtn, txt, mic, score);
  row.append(main, fb);
  row._attempt = attempt;
  row._who = who;
  row._en = en;
  return row;
}


/* ===========================================================
 * 📝 워크시트에 적기 (2번 표와 같은 순서)
 * =========================================================== */
function sheetRow(label, en, ko) {
  const row = document.createElement("div");
  row.className = "sheet-row" + (en ? "" : " empty");
  const lab = document.createElement("div"); lab.className = "sheet-label"; lab.textContent = label;
  const val = document.createElement("div"); val.className = "sheet-val";
  if (en) {
    const e = document.createElement("div"); e.className = "en"; e.appendChild(buildWords(en));
    const k = document.createElement("div"); k.className = "ko"; k.textContent = ko;
    val.append(e, k);
  } else val.textContent = "아직 고르지 않았어요";
  const btn = document.createElement("button");
  btn.className = "speak-btn small"; btn.textContent = "🔊"; btn.disabled = !en;
  btn.addEventListener("click", () => en && speak(en));
  row.append(lab, val, btn);
  return row;
}
function renderSheetSummary() {
  const box = document.getElementById("sheet-summary");
  if (!box) return;
  box.innerHTML = "";
  mySets.forEach((s, i) => {
    const ev = findEvent(s.event), pl = findPlace(s.place), tm = findTime(s.time);
    box.appendChild(sheetRow(`내가 선택한 행사 ${i + 1}`, ev && `Can you come to ${ev.en}?`, ev && `${ev.ko}에 올 수 있니?`));
    box.appendChild(sheetRow(`약속 시간과 장소 ${i + 1}`, pl && tm && `Please come to ${pl.en} at ${tm.en}.`, pl && tm && `${tm.ko}에 ${pl.ko}(으)로 와 줘.`));
  });
  const rs = findReason(myReason);
  box.appendChild(sheetRow("초대 거절 할 때", rs && `Sorry, but I can't. I have a ${rs.en}.`, rs && `미안하지만 못 가. 나 ${rs.ko}(이)가 있어.`));
  const acc = findAccept(myAccept);
  box.appendChild(sheetRow("초대 승낙 할 때 (말하기용)", acc.en, acc.ko));
}

/* ===========================================================
 * 👫 짝 활동 카드 (행사별 초대 문장 크게 + 친구 대답 안내)
 * =========================================================== */
function renderPairCards() {
  const box = document.getElementById("pair-cards");
  box.innerHTML = "";
  const done = mySets.map((s, i) => [s, i]).filter(([s]) => setComplete(s));
  if (!done.length) {
    const p = document.createElement("p"); p.className = "practice-empty";
    p.innerHTML = "아직 만든 행사가 없어요! <b>🎒 내 행사 만들기</b>에서 먼저 만들어요.";
    box.appendChild(p); return;
  }
  const rs = findReason(myReason), acc = findAccept(myAccept);
  done.forEach(([s, i]) => {
    const ev = findEvent(s.event), pl = findPlace(s.place), tm = findTime(s.time);
    const card = document.createElement("div");
    card.className = "pair-card tone-" + (i % 6);
    const head = document.createElement("div"); head.className = "pair-head";
    head.innerHTML = `<span class="card-tag tag-combo">행사 ${i + 1}</span><span class="pair-emoji">${ev.emoji}</span>`;
    const invite = document.createElement("div"); invite.className = "pair-line me";
    invite.innerHTML = `<div class="pair-who">🙋 나</div>`;
    const inv = document.createElement("div"); inv.className = "pair-en"; inv.appendChild(buildWords(`Can you come to ${ev.en}?`));
    invite.appendChild(inv);
    const ans = document.createElement("div"); ans.className = "pair-line friend";
    ans.innerHTML = `<div class="pair-who">🙆 친구 (승낙 ○ / 거절 ×)</div>
      <div class="pair-choice"><span class="pair-ok">○ ${acc.en}</span><span class="pair-no">× Sorry, but I can't. I have a ___.</span></div>`;
    const meet = document.createElement("div"); meet.className = "pair-line me";
    meet.innerHTML = `<div class="pair-who">🙋 나 (승낙했을 때)</div>`;
    const m = document.createElement("div"); m.className = "pair-en"; m.appendChild(buildWords(`Please come to ${pl.en} at ${tm.en}.`));
    meet.appendChild(m);
    const tools = document.createElement("div"); tools.className = "ptools";
    const b1 = document.createElement("button"); b1.className = "btn small primary"; b1.textContent = "🔊 초대 듣기";
    b1.addEventListener("click", () => speak(`Can you come to ${ev.en}?`));
    const b2 = document.createElement("button"); b2.className = "btn small"; b2.textContent = "🔊 약속 듣기";
    b2.addEventListener("click", () => speak(`Please come to ${pl.en} at ${tm.en}.`));
    tools.append(b1, b2);
    card.append(head, invite, ans, meet, tools);
    box.appendChild(card);
  });
  const note = document.createElement("p"); note.className = "hint pair-note";
  note.innerHTML = `💬 내가 초대받았을 때: 승낙 <b>${acc.en}</b> · 거절 <b>${rs ? `Sorry, but I can't. I have a ${rs.en}.` : "(거절 문장을 정해요)"}</b>`;
  box.appendChild(note);
}

/* ===========================================================
 * 🎤 컴퓨터와 미리 연습하기 (행사별 대화: 줄마다 말하기 + 역할극)
 * =========================================================== */
function makeSetCard(s, idx) {
  const card = document.createElement("div");
  card.className = "pcard pcard-dialog";
  const ev = findEvent(s.event);

  const top = document.createElement("div");
  top.className = "card-top";
  const left = document.createElement("div"); left.className = "ptag-left";
  const tag = document.createElement("span"); tag.className = "card-tag tag-combo"; tag.textContent = `🎒 행사 ${idx + 1}`;
  const title = document.createElement("span"); title.className = "pset-title"; title.textContent = `${ev.emoji} ${ev.en}`;
  left.append(tag, title);
  const modeWrap = document.createElement("div"); modeWrap.className = "mode-switch";
  const mAcc = document.createElement("button"); mAcc.className = "cat-btn active"; mAcc.textContent = "⭕ 친구가 승낙";
  const mRef = document.createElement("button"); mRef.className = "cat-btn"; mRef.textContent = "❌ 친구가 거절";
  modeWrap.append(mAcc, mRef);
  top.append(left, modeWrap);
  card.appendChild(top);

  const body = document.createElement("div");
  const tools = document.createElement("div"); tools.className = "ptools";
  const roleNote = document.createElement("div"); roleNote.className = "role-note";
  card.append(body, tools, roleNote);

  let mode = "accept";
  let rows = [];
  let playing = false;

  function render() {
    mAcc.classList.toggle("active", mode === "accept");
    mRef.classList.toggle("active", mode === "refuse");
    body.innerHTML = "";
    rows = setLines(s, mode).map(l => makeSpeakRow(l.en, l.ko, l.who));
    rows.forEach(r => body.appendChild(r));
    tools.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.className = "btn small"; allBtn.textContent = "🔊 전체 듣기";
    allBtn.addEventListener("click", () => speak(rows.map(r => r._en).join(" ")));
    const roleA = document.createElement("button");
    roleA.className = "btn small primary"; roleA.textContent = "🎭 내가 A (초대하기)";
    const roleB = document.createElement("button");
    roleB.className = "btn small primary"; roleB.textContent = "🎭 내가 B (대답하기)";
    roleA.addEventListener("click", () => rolePlay("A", [roleA, roleB]));
    roleB.addEventListener("click", () => rolePlay("B", [roleA, roleB]));
    tools.append(allBtn, roleA, roleB);
    roleNote.textContent = "";
  }

  function rolePlay(me, btns) {
    if (playing || recBusy) return;
    if (!srSupported) { roleNote.textContent = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; return; }
    playing = true; btns.forEach(b => b.disabled = true);
    let i = 0;
    const step = () => {
      rows.forEach(r => r.classList.remove("turn"));
      if (i >= rows.length) {
        playing = false; btns.forEach(b => b.disabled = false);
        roleNote.textContent = "🎉 역할극 끝! 잘했어요. 다른 역할이나 거절 버전도 해 볼까요?";
        return;
      }
      const r = rows[i]; i++;
      r.classList.add("turn");
      if (r._who === me) {
        roleNote.textContent = `🎙️ 내 차례! "${r._en}" 라고 말해보세요.`;
        r._attempt(() => setTimeout(step, 500));
      } else {
        roleNote.textContent = `👂 컴퓨터(${r._who})가 말해요. 잘 들어보세요.`;
        speakThen(r._en, () => setTimeout(step, 400));
      }
    };
    step();
  }

  mAcc.addEventListener("click", () => { if (!playing) { mode = "accept"; render(); } });
  mRef.addEventListener("click", () => { if (!playing) { mode = "refuse"; render(); } });
  render();
  return card;
}

function renderPractice() {
  renderPairCards();
  const empty = document.getElementById("practice-empty");
  const list = document.getElementById("practice-list");
  list.innerHTML = "";
  const done = mySets.map((s, i) => [s, i]).filter(([s]) => setComplete(s));
  if (!done.length) { empty.style.display = "block"; return; }
  empty.style.display = "none";
  done.forEach(([s, i]) => list.appendChild(makeSetCard(s, i)));
  if (done.length < SET_COUNT) {
    const note = document.createElement("p");
    note.className = "practice-empty";
    note.innerHTML = `아직 <b>${SET_COUNT - done.length}개</b> 행사가 비어 있어요. <b>🎒 내 행사 만들기</b>에서 마저 만들어 보세요.`;
    list.appendChild(note);
  }
}


/* ---------- 대답 · 약속 카드 ---------- */
function renderAnswerGrids() {
  renderGrid("accept-grid", ACCEPT_EXPRESSIONS, { tones: true, noIndex: true });
  renderRefuseFill();
  renderMeetFill();
}

/* ---------- 빈칸 채우기: 거절 (Sorry, but I can't. I have a ___.) ---------- */
let fillReason = null;
let fillPlace = null;
let fillTime = null;
let lastFillSpoken = "";

function fillActions(wrap, en, ko, emoji, type) {
  wrap.innerHTML = "";
  if (!en) return;
  const listenBtn = document.createElement("button");
  listenBtn.className = "btn primary";
  listenBtn.textContent = "🔊 문장 듣기";
  listenBtn.addEventListener("click", () => speak(en));
  wrap.append(listenBtn);
  if (en !== lastFillSpoken) { lastFillSpoken = en; speak(en); }
}

function renderRefuseFill() {
  const row = document.getElementById("refuse-chips");
  row.innerHTML = "";
  REFUSE_REASONS.forEach(r => {
    row.appendChild(makeChip(`${r.emoji} ${r.en}`, "where", fillReason === r, () => {
      fillReason = r; renderRefuseFill();
    }));
  });
  const blank = document.getElementById("refuse-blank");
  const koEl = document.getElementById("refuse-ko");
  blank.classList.toggle("filled", !!fillReason);
  if (fillReason) {
    blank.innerHTML = ""; blank.appendChild(buildWords(fillReason.en));
    koEl.textContent = `미안하지만 못 가. 나 ${fillReason.ko}(이)가 있어.`;
    fillActions(document.getElementById("refuse-actions"),
      `Sorry, but I can't. I have a ${fillReason.en}.`, koEl.textContent, fillReason.emoji, "answer");
  } else {
    blank.textContent = "________";
    koEl.textContent = "미안하지만 못 가. 나 ________(이)가 있어.";
    fillActions(document.getElementById("refuse-actions"), null);
  }
}

/* ---------- 빈칸 채우기: 약속 (Please come to ___ at ___.) ---------- */
function renderMeetFill() {
  const pRow = document.getElementById("meet-place-chips");
  const tRow = document.getElementById("meet-time-chips");
  pRow.innerHTML = ""; tRow.innerHTML = "";
  PLACE_EXPRESSIONS.forEach(p => {
    pRow.appendChild(makeChip(`${p.emoji} ${p.en}`, "place", fillPlace === p, () => {
      fillPlace = p; renderMeetFill();
    }));
  });
  TIME_EXPRESSIONS.forEach(t => {
    tRow.appendChild(makeChip(`${t.emoji} ${t.en}`, "with", fillTime === t, () => {
      fillTime = t; renderMeetFill();
    }));
  });
  const pb = document.getElementById("meet-place-blank");
  const tb = document.getElementById("meet-time-blank");
  pb.classList.toggle("filled", !!fillPlace);
  tb.classList.toggle("filled", !!fillTime);
  if (fillPlace) { pb.innerHTML = ""; pb.appendChild(buildWords(fillPlace.en)); } else pb.textContent = "________";
  if (fillTime) { tb.innerHTML = ""; tb.appendChild(buildWords(fillTime.en)); } else tb.textContent = "________";
  const koEl = document.getElementById("meet-ko");
  koEl.textContent = `${fillTime ? fillTime.ko : "________"}에 ${fillPlace ? fillPlace.ko : "________"}(으)로 와 줘.`;
  if (fillPlace && fillTime) {
    fillActions(document.getElementById("meet-actions"),
      `Please come to ${fillPlace.en} at ${fillTime.en}.`, koEl.textContent, fillPlace.emoji, "meet");
  } else {
    fillActions(document.getElementById("meet-actions"), null);
  }
}


/* ---------- 초기 렌더 ---------- */
renderSuggestions();
renderAnswerGrids();
renderBuilder();
updateSetPreview();
renderSheetSummary();

/* ---------- 탭 전환 ---------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    synth.cancel();
    hidePopup();
    if (btn.dataset.tab === "practice") renderPractice();
    if (btn.dataset.tab === "build") { lastSetSpoken = ""; renderBuilder(); updateSetPreview(); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------- 속도 조절 ---------- */
document.getElementById("rate").addEventListener("input", e => {
  speakRate = parseFloat(e.target.value);
});
