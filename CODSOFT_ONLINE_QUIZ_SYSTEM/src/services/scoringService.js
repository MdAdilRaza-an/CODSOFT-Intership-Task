const crypto = require('crypto');

function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scoreAttempt({ questions, answers, quiz }) {
  let totalMarks = 0;
  let obtainedMarks = 0;
  const answerMap = new Map(answers.map(a => [String(a.question_id), String(a.option_id)]));

  for (const question of questions) {
    const marks = Number(question.marks);
    totalMarks += marks;
    const selected = answerMap.get(String(question.id));
    if (!selected) continue;
    const correct = question.options.find(o => Number(o.is_correct) === 1);
    if (correct && String(correct.id) === selected) obtainedMarks += marks;
    else obtainedMarks -= Number(quiz.negative_marks || 0);
  }

  if (!quiz.allow_negative_score && obtainedMarks < 0) obtainedMarks = 0;
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 10000) / 100 : 0;
  const passed = obtainedMarks >= Number(quiz.passing_marks || 0);
  const certificateEligible = percentage >= Number(quiz.certificate_threshold || 80);
  return {
    totalMarks: Math.round(totalMarks * 100) / 100,
    obtainedMarks: Math.round(obtainedMarks * 100) / 100,
    percentage: Math.max(0, Math.min(100, percentage)),
    passed,
    certificateEligible
  };
}

module.exports = { shuffle, scoreAttempt };
