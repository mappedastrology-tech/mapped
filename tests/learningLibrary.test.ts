import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_COURSES, DOMAINS, getCoursesByDomain, courseLessons, passThresholdFor } from "../src/lib/learn/registry";
import { sampleQuestions, scoreQuiz, isRecallCorrect, answeredCorrectly } from "../src/lib/learn/quiz";
import type { QuizQuestion } from "../src/lib/learn/types";

function checkQuestion(q: QuizQuestion, where: string) {
  if (q.type === "recall") {
    assert.ok(q.answer && q.answer.trim().length > 0, `${where}: recall question ${q.id} needs an answer`);
    assert.equal(q.options.length, 0, `${where}: recall question ${q.id} should have no options`);
    return;
  }
  assert.ok(q.options.length >= 2, `${where}: question ${q.id} needs >=2 options`);
  const correct = q.options.filter((o) => o.correct);
  assert.equal(correct.length, 1, `${where}: question ${q.id} must have exactly one correct option`);
  const ids = new Set(q.options.map((o) => o.id));
  assert.equal(ids.size, q.options.length, `${where}: question ${q.id} has duplicate option ids`);
}

test("every course has a unique id and a non-empty outline", () => {
  const ids = new Set<string>();
  for (const c of ALL_COURSES) {
    assert.ok(!ids.has(c.id), `duplicate course id ${c.id}`);
    ids.add(c.id);
    assert.ok(c.outline.length > 0, `${c.id} has no outline`);
    assert.ok(c.title && c.summary, `${c.id} missing title/summary`);
  }
});

test("every domain has at least one course", () => {
  for (const d of DOMAINS) {
    assert.ok(getCoursesByDomain(d.id).length > 0, `domain ${d.id} has no courses`);
  }
});

test("published courses have valid lessons, quizzes, and a final test bank", () => {
  const published = ALL_COURSES.filter((c) => c.status === "published");
  assert.ok(published.length >= 1, "expected at least one published flagship course");
  for (const c of published) {
    const lessons = courseLessons(c);
    assert.ok(lessons.length > 0, `${c.id} published but has no lessons`);
    for (const l of lessons) {
      assert.ok(l.objective.length > 0, `${c.id}/${l.id} missing objective`);
      assert.ok(l.blocks.length > 0, `${c.id}/${l.id} has no content blocks`);
      assert.ok(l.quiz.length >= 3, `${c.id}/${l.id} should have >=3 quiz questions`);
      for (const q of l.quiz) checkQuestion(q, `${c.id}/${l.id}`);
    }
    // Final test bank must exist and be larger than the sampled size (so retakes vary).
    assert.ok(c.finalTest && c.finalTest.length > 0, `${c.id} missing final test bank`);
    const size = c.finalTestSize ?? 10;
    assert.ok(c.finalTest!.length >= size, `${c.id} bank (${c.finalTest!.length}) smaller than test size (${size})`);
    for (const q of c.finalTest!) checkQuestion(q, `${c.id} final`);
  }
});

test("final-test sampling returns the requested count and scores correctly", () => {
  const c = ALL_COURSES.find((x) => x.id === "astrology-foundations")!;
  const size = c.finalTestSize ?? 10;
  const sampled = sampleQuestions(c.finalTest!, size);
  assert.equal(sampled.length, size, "sampled wrong number of questions");
  // A perfect answer key scores 100%.
  const answers: Record<string, string> = {};
  for (const q of sampled) answers[q.id] = q.options.find((o) => o.correct)!.id;
  assert.equal(scoreQuiz(sampled, answers).fraction, 1, "perfect answers should score 100%");
});

test("recall questions grade forgivingly and score via scoreQuiz", () => {
  const q: QuizQuestion = { id: "r1", type: "recall", prompt: "Grounded element?", options: [], answer: "Earth", accept: ["earth element"] };
  assert.ok(isRecallCorrect(q, "earth"), "case-insensitive match");
  assert.ok(isRecallCorrect(q, "  EARTH. "), "trims + drops trailing punctuation");
  assert.ok(isRecallCorrect(q, "Earth element"), "accepts listed synonyms");
  assert.ok(!isRecallCorrect(q, "water"), "wrong answer fails");
  assert.ok(answeredCorrectly(q, "Earth"), "answeredCorrectly handles recall");
  assert.equal(scoreQuiz([q], { r1: "earth" }).fraction, 1, "correct recall scores 100%");
  assert.equal(scoreQuiz([q], { r1: "air" }).fraction, 0, "wrong recall scores 0%");
});

test("pass thresholds are sane (0.5–1.0)", () => {
  for (const c of ALL_COURSES) {
    const t = passThresholdFor(c);
    assert.ok(t >= 0.5 && t <= 1, `${c.id} threshold ${t} out of range`);
  }
});
