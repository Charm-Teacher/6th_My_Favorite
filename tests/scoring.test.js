// 채점 함수 단위 테스트:  node tests/scoring.test.js
const S = require("../app.js");
const T = "I'm going to fly a kite.";
let fail = 0;
function near(name, got, want, tol = 2) {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${name}: ${got} (기대 ≈${want})`);
}
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${name}: ${JSON.stringify(got)}`);
}
near("정확", S.scoreOne(T, "I'm going to fly a kite").percent, 100, 0);
near("줄임말 펼침(I am)", S.scoreOne(T, "I am going to fly a kite").percent, 100, 0);
near("fly a cat", S.scoreOne(T, "I'm going to fly a cat").percent, 73);
near("fly a kite 만", S.scoreOne(T, "fly a kite").percent, 55);
near("순서 뒤섞임", S.scoreOne(T, "kite a fly to going am I").percent, 14);
near("동음어 two→to", S.scoreOne(T, "I'm going two fly a kite").percent, 100, 0);
near("gonna", S.scoreOne(T, "I'm gonna fly a kite").percent, 100, 0);
near("PC 한 글자씩", S.scoreOne("I'm going to go to a PC room.", "I'm going to go to a p c room").percent, 100, 0);
near("덧붙인 말 감점(최대 10%)", S.scoreOne(T, "I'm going to fly a kite yes yes yes yes yes").percent, 90, 0);
near("빈 말", S.scoreOne(T, "").percent, 0, 0);
eq("kite≠cat", S.wordSim("kite", "cat"), 0);
eq("fly~fry(1글자)", S.wordSim("fly", "fry"), 0.85);
eq("소리 비슷(r/l·v/b)", S.wordSim("library", "liblaly"), 0.7);
eq("I'm 은 한 칩", S.scoreOne(T, "I'm going to fly a cat").chips.map((c) => c.status),
  ["ok", "ok", "ok", "ok", "ok", "miss"]);
const best = S.scoreBest(T, ["I'm going to fly a cat", "I'm going to fly a kite", "kite"]);
near("후보 중 최고", best.percent, 100, 0);
const jeju = S.buildTarget("I'm going to travel to Jeju Island.").tokens.map((t) => t.t + ":" + t.weight).join(" ");
eq("가중치(지명 0.6·작은 단어 0.3)", jeju, "i:0.3 am:0.3 going:1 to:0.3 travel:1 to:0.3 jeju:0.6 island:0.6");
console.log(fail ? `\n${fail}개 실패` : "\n모두 통과");
process.exit(fail ? 1 : 0);
