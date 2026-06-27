import { test } from "node:test";
import assert from "node:assert/strict";
import { buildReviewQuiz, buildReviewCards, gradeReview, nextIntervalForGrade, REVIEW_INTERVALS } from "../src/lib/learn/review";

const DUE = [{ courseId: "astrology-foundations", lessonId: "l1-what-astrology-is" }];

test("review intervals are strictly increasing and start at 1 day", () => {
  assert.equal(REVIEW_INTERVALS[0], 1);
  for (let i = 1; i < REVIEW_INTERVALS.length; i++) {
    assert.ok(REVIEW_INTERVALS[i] > REVIEW_INTERVALS[i - 1], "intervals must increase");
  }
});

test("buildReviewQuiz namespaces question ids so lessons never collide", () => {
  const rq = buildReviewQuiz(DUE, 6, 2);
  assert.ok(rq.questions.length > 0, "should produce questions");
  for (const q of rq.questions) {
    assert.ok(q.id.startsWith("astrology-foundations::l1-what-astrology-is::"), `id not namespaced: ${q.id}`);
    assert.ok(rq.lessonOf[q.id], "every question maps back to a lesson");
  }
  const ids = new Set(rq.questions.map((q) => q.id));
  assert.equal(ids.size, rq.questions.length, "question ids must be unique");
});

test("gradeReview passes a lesson only when all its questions are correct", () => {
  const rq = buildReviewQuiz(DUE, 6, 2);

  const allCorrect: Record<string, string> = {};
  for (const q of rq.questions) allCorrect[q.id] = q.options.find((o) => o.correct)!.id;
  assert.ok(gradeReview(rq, allCorrect).every((g) => g.passed), "all-correct should pass");

  const oneWrong = { ...allCorrect };
  const firstQ = rq.questions[0];
  oneWrong[firstQ.id] = firstQ.options.find((o) => !o.correct)!.id;
  assert.ok(gradeReview(rq, oneWrong).some((g) => !g.passed), "a wrong answer should fail its lesson");
});

test("nextIntervalForGrade: again resets, good +1, easy +2 along the schedule", () => {
  // From day 3 (index 1): again→1, good→7 (index 2), easy→14 (index 3)
  assert.equal(nextIntervalForGrade(3, "again"), REVIEW_INTERVALS[0]);
  assert.equal(nextIntervalForGrade(3, "good"), REVIEW_INTERVALS[2]);
  assert.equal(nextIntervalForGrade(3, "easy"), REVIEW_INTERVALS[3]);
  // Easy never overruns the longest interval.
  const last = REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1];
  assert.equal(nextIntervalForGrade(last, "easy"), last);
});

test("buildReviewCards yields front/back flashcards mapped to lessons", () => {
  const cards = buildReviewCards(DUE, 6, 2);
  assert.ok(cards.length > 0, "should build cards");
  for (const c of cards) {
    assert.ok(c.front.length > 0 && c.back.length > 0, "card has a front and back");
    assert.equal(c.review.courseId, "astrology-foundations");
    assert.ok(c.id.startsWith("astrology-foundations::l1-what-astrology-is::"));
  }
});
