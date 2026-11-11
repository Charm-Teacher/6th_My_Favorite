/* =========================================================
 * 6학년 · What do you want to be? · 듣고 따라 말하기 웹 앱
 * - 음성 출력: Web Speech API (SpeechSynthesis)
 * - 단어 클릭: 단어 발음 + 뜻 풍선(popup)
 * - 직업 이미지: Canva에서 만든 그림(images/jobs/*.png), 없으면 이모지
 * - 내 꿈 만들기: 꿈 3개(직업 + 이유) + 내 표현(질문/반응)
 * - 꿈 연습: 꿈별 대화를 줄마다 말하기 + 역할극(A/B) 채점
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


/* ---------- 직업 이미지 (Canva에서 만든 그림) ----------
 * images/jobs/<id>.png 파일이 있으면 그림을, 없으면 이모지를 보여줘요. */
function makeVisual(item, imgCls, emCls) {
  const em = document.createElement("div");
  em.className = emCls || "emoji";
  em.textContent = item.emoji;
  if (!item.img) return em;
  const img = document.createElement("img");
  img.className = imgCls || "photo";
  img.loading = "lazy";
  img.alt = item.en;
  img.src = item.img;
  img.addEventListener("error", () => img.replaceWith(em));
  return img;
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

  // Canva 이미지 또는 이모지
  const visual = makeVisual(item);

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

/* ---------- 난이도(초급/중급/고급) + 직업 종류 ---------- */
let currentLevel = "beginner";
let currentCategory = "all";

function renderSuggestions() {
  const view = SUGGESTION_LEVELS[currentLevel].filter((item, i) =>
    currentCategory === "all" || SUGGESTION_CATEGORIES[i] === currentCategory);
  renderGrid("suggestion-grid", view, { tones: true });
}

document.querySelectorAll(".level-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentLevel = btn.dataset.level;
    synth.cancel(); hidePopup(); renderSuggestions();
  });
});

document.querySelectorAll(".cat-switch .cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-switch .cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    synth.cancel(); hidePopup(); renderSuggestions();
  });
});

/* ===========================================================
 * 🎒 내 꿈 만들기 (꿈 3개: 직업 1 + 이유 1)  +  내 표현 (질문 1 · 반응 1)
 * =========================================================== */
const SET_COUNT = 3;
let mySets = [];        // [{ job, reason }] (job: id, reason: en)
let myQuestion = QUESTION_EXPRESSIONS[0].en;
let myReaction = REACTION_EXPRESSIONS[0].en;
let curSet = 0;
let stats = {};         // 문장별 정확도 기록

try {
  const saved = JSON.parse(localStorage.getItem("dream_sets") || "null");
  if (saved && Array.isArray(saved.sets)) {
    mySets = saved.sets;
    if (saved.question) myQuestion = saved.question;
    if (saved.reaction) myReaction = saved.reaction;
  }
} catch (e) {}
while (mySets.length < SET_COUNT) mySets.push({ job: null, reason: null });
try { stats = JSON.parse(localStorage.getItem("dream_stats") || "{}") || {}; } catch (e) {}

function persist() {
  try {
    localStorage.setItem("dream_sets", JSON.stringify({ sets: mySets, question: myQuestion, reaction: myReaction }));
    localStorage.setItem("dream_stats", JSON.stringify(stats));
  } catch (e) {}
}
const findJob = id => JOBS.find(x => x.id === id) || null;
const findReason = en => REASONS.find(x => x.en === en) || null;
const findQuestion = en => QUESTION_EXPRESSIONS.find(x => x.en === en) || QUESTION_EXPRESSIONS[0];
const findReaction = en => REACTION_EXPRESSIONS.find(x => x.en === en) || REACTION_EXPRESSIONS[0];
function setComplete(s) { return !!(findJob(s.job) && findReason(s.reason)); }
function completeCount() { return mySets.filter(setComplete).length; }

const beEn = j => `I want to be ${j.en}.`;
const whyEn = j => `Why do you want to be ${j.en}?`;
const whyKo = j => `너는 왜 ${josa(j.ko, "이", "가")} 되고 싶니?`;
const likeEn = r => `I like ${r.en}.`;

/* 꿈 → 대화 줄 (A: 묻는 사람, B: 꿈을 말하는 사람) */
function setLines(s) {
  const j = findJob(s.job), r = findReason(s.reason);
  const q = findQuestion(myQuestion), re = findReaction(myReaction);
  return [
    { who: "A", en: q.en, ko: q.ko },
    { who: "B", en: beEn(j), ko: beKo(j) },
    { who: "A", en: whyEn(j), ko: whyKo(j) },
    { who: "B", en: likeEn(r), ko: likeKo(r) },
    { who: "A", en: re.en, ko: re.ko },
  ];
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
    const j = findJob(mySets[i].job);
    b.textContent = `꿈 ${i + 1} ${j ? j.emoji : ""}${setComplete(mySets[i]) ? " ✓" : ""}`;
  });
}

function renderBuilder() {
  const s = mySets[curSet];
  const jobWrap = document.getElementById("build-events");
  const reasonRow = document.getElementById("build-place");
  const qRow = document.getElementById("build-accept");
  const reRow = document.getElementById("build-refuse");
  jobWrap.innerHTML = ""; reasonRow.innerHTML = ""; qRow.innerHTML = ""; reRow.innerHTML = "";

  const usedElsewhere = new Set(mySets.filter((x, i) => i !== curSet).map(x => x.job).filter(Boolean));
  BUILD_CATS.forEach(cat => {
    const title = document.createElement("div");
    title.className = "chip-group-title";
    title.textContent = cat.label;
    const row = document.createElement("div");
    row.className = "chip-row wrap";
    JOBS.filter(j => j.cat === cat.key).forEach(j => {
      const chip = makeChip(`${j.emoji} ${j.en}`, "act", s.job === j.id, () => {
        s.job = j.id;
        if (!s.reason) s.reason = j.reason;   // 이유가 비어 있으면 어울리는 이유를 먼저 채워 줌
        persist(); renderBuilder(); updateSetPreview(true);
      });
      if (usedElsewhere.has(j.id)) { chip.classList.add("used"); chip.title = "다른 꿈에서 이미 골랐어요"; }
      row.appendChild(chip);
    });
    jobWrap.append(title, row);
  });
  REASONS.forEach(r => {
    reasonRow.appendChild(makeChip(`${r.emoji} ${r.en}`, "place", s.reason === r.en, () => {
      s.reason = r.en; persist(); renderBuilder(); updateSetPreview(true);
    }));
  });
  QUESTION_EXPRESSIONS.forEach(q => {
    qRow.appendChild(makeChip(`${q.emoji} ${q.en}`, "when", myQuestion === q.en, () => {
      myQuestion = q.en; persist(); renderBuilder(); updateSetPreview(); speak(q.en);
    }));
  });
  REACTION_EXPRESSIONS.forEach(re => {
    reRow.appendChild(makeChip(`${re.emoji} ${re.en}`, "where", myReaction === re.en, () => {
      myReaction = re.en; persist(); renderBuilder(); updateSetPreview(); speak(re.en);
    }));
  });
  updateSetBadge();
}

let lastSetSpoken = "";

function updateSetPreview(autoSpeak) {
  const s = mySets[curSet];
  const j = findJob(s.job), r = findReason(s.reason);
  const q = findQuestion(myQuestion), re = findReaction(myReaction);

  const ql = document.getElementById("set-question-line");
  ql.innerHTML = ""; ql.appendChild(buildWords(q.en));
  document.getElementById("set-question-ko").textContent = q.ko;

  setBlank("set-event", j && j.en);
  document.getElementById("set-event-ko").textContent = j ? beKo(j) : "나는 ________이(가) 되고 싶어.";
  setBlank("set-why", j && j.en);
  document.getElementById("set-why-ko").textContent = j ? whyKo(j) : "너는 왜 ________이(가) 되고 싶니?";
  setBlank("set-place", r && r.en);
  document.getElementById("set-meet-ko").textContent = r ? likeKo(r) : "나는 ________을(를) 좋아해.";

  const al = document.getElementById("set-answer-line");
  al.innerHTML = ""; al.appendChild(buildWords(re.en));
  document.getElementById("set-answer-ko").textContent = re.ko;

  const status = document.getElementById("set-status");
  const complete = setComplete(s);
  status.className = "dlg-status" + (complete ? " ok" : "");
  if (!j) status.textContent = `꿈 ${curSet + 1} · 1️⃣ 되고 싶은 직업을 골라보세요 👇`;
  else if (!r) status.textContent = `꿈 ${curSet + 1} · 2️⃣ 이유(I like ___.)를 골라요 👇`;
  else status.textContent = `✅ 꿈 ${curSet + 1} 완성! ${completeCount() < SET_COUNT ? "다음 꿈도 만들어 보세요." : "세 꿈 모두 완성! 📝 활동지에 적고 🎤 연습으로 가요."}`;
  renderSheetSummary();
  const listen = document.getElementById("set-listen");
  listen.disabled = !complete;
  updateSetBadge();
  // 자동 읽기는 사용자가 칩을 눌러 고른 직후에만
  if (complete && autoSpeak) {
    const en = `${beEn(j)} ${likeEn(r)}`;
    if (en !== lastSetSpoken) { lastSetSpoken = en; speak(en); }
  } else if (!complete) lastSetSpoken = "";
}

document.querySelectorAll("#set-tabs .set-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    curSet = +btn.dataset.set; synth.cancel(); lastSetSpoken = "";
    renderBuilder(); updateSetPreview();
  });
});
document.getElementById("set-speak-question").addEventListener("click", () => speak(findQuestion(myQuestion).en));
document.getElementById("set-speak-invite").addEventListener("click", () => {
  const j = findJob(mySets[curSet].job); if (j) speak(beEn(j));
});
document.getElementById("set-speak-why").addEventListener("click", () => {
  const j = findJob(mySets[curSet].job); if (j) speak(whyEn(j));
});
document.getElementById("set-speak-meet").addEventListener("click", () => {
  const r = findReason(mySets[curSet].reason); if (r) speak(likeEn(r));
});
document.getElementById("set-speak-answer").addEventListener("click", () => speak(findReaction(myReaction).en));
document.getElementById("set-listen").addEventListener("click", () => {
  const s = mySets[curSet];
  if (setComplete(s)) speak(setLines(s).map(l => l.en).join(" "));
});
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
document.getElementById("set-random").addEventListener("click", () => {
  const s = mySets[curSet];
  const used = new Set(mySets.filter((x, i) => i !== curSet).map(x => x.job));
  const pool = JOBS.filter(j => !used.has(j.id));
  const j = pick(pool.length ? pool : JOBS);
  s.job = j.id;
  s.reason = j.reason;
  persist(); renderBuilder(); updateSetPreview(true);
});
document.getElementById("set-clear").addEventListener("click", () => {
  mySets[curSet] = { job: null, reason: null };
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
 * 📝 활동지에 적기
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
  const q = findQuestion(myQuestion);
  box.appendChild(sheetRow("친구에게 묻기", q.en, q.ko));
  mySets.forEach((s, i) => {
    const j = findJob(s.job), r = findReason(s.reason);
    box.appendChild(sheetRow(`내 꿈 ${i + 1}`, j && beEn(j), j && beKo(j)));
    box.appendChild(sheetRow(`이유 ${i + 1}`, r && likeEn(r), r && likeKo(r)));
  });
  const re = findReaction(myReaction);
  box.appendChild(sheetRow("친구에게 반응하기", re.en, re.ko));
}

/* ===========================================================
 * 👫 짝 활동 카드 (꿈별 대답 문장 크게 + 친구에게 묻기 안내)
 * =========================================================== */
function renderPairCards() {
  const box = document.getElementById("pair-cards");
  box.innerHTML = "";
  const done = mySets.map((s, i) => [s, i]).filter(([s]) => setComplete(s));
  if (!done.length) {
    const p = document.createElement("p"); p.className = "practice-empty";
    p.innerHTML = "아직 만든 꿈이 없어요! <b>🎒 내 꿈 만들기</b>에서 먼저 만들어요.";
    box.appendChild(p); return;
  }
  const q = findQuestion(myQuestion), re = findReaction(myReaction);
  done.forEach(([s, i]) => {
    const j = findJob(s.job), r = findReason(s.reason);
    const card = document.createElement("div");
    card.className = "pair-card tone-" + (i % 6);
    const head = document.createElement("div"); head.className = "pair-head";
    const tag = document.createElement("span"); tag.className = "card-tag tag-combo"; tag.textContent = `꿈 ${i + 1}`;
    head.append(tag, makeVisual(j, "pair-img", "pair-emoji"));

    const ask = document.createElement("div"); ask.className = "pair-line friend";
    ask.innerHTML = `<div class="pair-who">🙆 친구</div>`;
    const askEn = document.createElement("div"); askEn.className = "pair-en"; askEn.appendChild(buildWords(q.en));
    ask.appendChild(askEn);

    const ans = document.createElement("div"); ans.className = "pair-line me";
    ans.innerHTML = `<div class="pair-who">🙋 나</div>`;
    const a1 = document.createElement("div"); a1.className = "pair-en"; a1.appendChild(buildWords(`${beEn(j)} ${likeEn(r)}`));
    ans.appendChild(a1);

    const tools = document.createElement("div"); tools.className = "ptools";
    const b1 = document.createElement("button"); b1.className = "btn small primary"; b1.textContent = "🔊 내 꿈 듣기";
    b1.addEventListener("click", () => speak(beEn(j)));
    const b2 = document.createElement("button"); b2.className = "btn small"; b2.textContent = "🔊 이유 듣기";
    b2.addEventListener("click", () => speak(likeEn(r)));
    tools.append(b1, b2);
    card.append(head, ask, ans, tools);
    box.appendChild(card);
  });
  const note = document.createElement("p"); note.className = "hint pair-note";
  note.innerHTML = `💬 내가 친구에게 물을 때: <b>${q.en}</b> → 친구가 대답하면 <b>Why do you want to be a ___?</b> → 마지막에 <b>${re.en}</b>`;
  box.appendChild(note);
}

/* ===========================================================
 * 🎤 컴퓨터와 미리 연습하기 (꿈별 대화: 줄마다 말하기 + 역할극)
 * =========================================================== */
function makeSetCard(s, idx) {
  const card = document.createElement("div");
  card.className = "pcard pcard-dialog";
  const j = findJob(s.job);

  const top = document.createElement("div");
  top.className = "card-top";
  const left = document.createElement("div"); left.className = "ptag-left";
  const tag = document.createElement("span"); tag.className = "card-tag tag-combo"; tag.textContent = `🎒 꿈 ${idx + 1}`;
  const title = document.createElement("span"); title.className = "pset-title"; title.textContent = `${j.emoji} ${j.en}`;
  left.append(tag, title);
  top.append(left);
  card.appendChild(top);

  const body = document.createElement("div");
  const tools = document.createElement("div"); tools.className = "ptools";
  const roleNote = document.createElement("div"); roleNote.className = "role-note";
  card.append(body, tools, roleNote);

  const rows = setLines(s).map(l => makeSpeakRow(l.en, l.ko, l.who));
  rows.forEach(r => body.appendChild(r));
  let playing = false;

  const allBtn = document.createElement("button");
  allBtn.className = "btn small"; allBtn.textContent = "🔊 전체 듣기";
  allBtn.addEventListener("click", () => speak(rows.map(r => r._en).join(" ")));
  const roleA = document.createElement("button");
  roleA.className = "btn small primary"; roleA.textContent = "🎭 내가 A (묻기)";
  const roleB = document.createElement("button");
  roleB.className = "btn small primary"; roleB.textContent = "🎭 내가 B (꿈 말하기)";
  roleA.addEventListener("click", () => rolePlay("A", [roleA, roleB]));
  roleB.addEventListener("click", () => rolePlay("B", [roleA, roleB]));
  tools.append(allBtn, roleA, roleB);

  function rolePlay(me, btns) {
    if (playing || recBusy) return;
    if (!srSupported) { roleNote.textContent = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; return; }
    playing = true; btns.forEach(b => b.disabled = true);
    let i = 0;
    const step = () => {
      rows.forEach(r => r.classList.remove("turn"));
      if (i >= rows.length) {
        playing = false; btns.forEach(b => b.disabled = false);
        roleNote.textContent = "🎉 역할극 끝! 잘했어요. 역할을 바꿔서 한 번 더 해 볼까요?";
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
    note.innerHTML = `아직 <b>${SET_COUNT - done.length}개</b> 꿈이 비어 있어요. <b>🎒 내 꿈 만들기</b>에서 마저 만들어 보세요.`;
    list.appendChild(note);
  }
}


/* ---------- 묻기 · 반응 카드 ---------- */
function renderAnswerGrids() {
  renderGrid("accept-grid", QUESTION_EXPRESSIONS, { tones: true, noIndex: true });
  renderGrid("reaction-grid", REACTION_EXPRESSIONS, { tones: true, noIndex: true });
  renderJobFill();
  renderReasonFill();
}

/* ---------- 빈칸 채우기 ---------- */
let fillJob = null;
let fillReason = null;
let lastFillSpoken = "";

function fillActions(wrap, en) {
  wrap.innerHTML = "";
  if (!en) return;
  const listenBtn = document.createElement("button");
  listenBtn.className = "btn primary";
  listenBtn.textContent = "🔊 문장 듣기";
  listenBtn.addEventListener("click", () => speak(en));
  wrap.append(listenBtn);
  if (en !== lastFillSpoken) { lastFillSpoken = en; speak(en); }
}

/* I want to be ___. */
function renderJobFill() {
  ["book", "fun"].forEach(cat => {
    const row = document.getElementById("refuse-chips-" + cat);
    row.innerHTML = "";
    JOBS.filter(j => j.cat === cat).forEach(j => {
      row.appendChild(makeChip(`${j.emoji} ${j.en}`, "act", fillJob === j, () => {
        fillJob = j; renderJobFill();
      }));
    });
  });
  const blank = document.getElementById("refuse-blank");
  const koEl = document.getElementById("refuse-ko");
  blank.classList.toggle("filled", !!fillJob);
  if (fillJob) {
    blank.innerHTML = ""; blank.appendChild(buildWords(fillJob.en));
    koEl.textContent = beKo(fillJob);
    fillActions(document.getElementById("refuse-actions"), beEn(fillJob));
  } else {
    blank.textContent = "________";
    koEl.textContent = "나는 ________이(가) 되고 싶어.";
    fillActions(document.getElementById("refuse-actions"), null);
  }
}

/* I like ___. */
function renderReasonFill() {
  const row = document.getElementById("meet-place-chips");
  row.innerHTML = "";
  REASONS.forEach(r => {
    row.appendChild(makeChip(`${r.emoji} ${r.en}`, "place", fillReason === r, () => {
      fillReason = r; renderReasonFill();
    }));
  });
  const blank = document.getElementById("meet-place-blank");
  const koEl = document.getElementById("meet-ko");
  blank.classList.toggle("filled", !!fillReason);
  if (fillReason) {
    blank.innerHTML = ""; blank.appendChild(buildWords(fillReason.en));
    koEl.textContent = likeKo(fillReason);
    fillActions(document.getElementById("meet-actions"), likeEn(fillReason));
  } else {
    blank.textContent = "________";
    koEl.textContent = "나는 ________을(를) 좋아해.";
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
