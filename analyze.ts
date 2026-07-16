// VeriSight AI — heuristic analysis engine.
// Scores news text across multiple credibility signals and produces a verdict,
// explanation, bias score, emotional tone, summary, and fact-check keywords.
// Predictions are advisory and not a substitute for professional fact-checking.

export type Verdict = 'Real' | 'Fake' | 'Uncertain';

export interface AnalysisResult {
  verdict: Verdict;
  confidence: number; // 0-100
  explanation: string;
  biasScore: number; // 0-100 (higher = more biased)
  emotionalTone: string;
  summary: string;
  factCheckKeywords: string[];
  manipulationIndicators: string[];
  suspiciousSentences: { text: string; reason: string }[];
  reliability: number; // 0-100 (higher = more reliable)
  processingTimeMs: number;
}

const CLICKBAIT = [
  'shocking', 'you won\'t believe', 'mind-blowing', 'this will change everything',
  'doctors hate', 'one weird trick', 'they don\'t want you to know', 'breaking',
  'must see', 'what happens next', 'unbelievable', 'exposed', 'the truth about',
  'leaked', 'bombshell', 'gone viral', 'everyone is talking', 'you\'ll be shocked',
];

const HEDGING = [
  'allegedly', 'reportedly', 'supposedly', 'apparently', 'claimed', 'sources say',
  'some say', 'many believe', 'it is said', 'rumored', 'purportedly',
];

const EMOTIONAL = [
  'outrage', 'disgusting', 'terrifying', 'horrifying', 'destroy', 'obliterate',
  'catastrophic', 'meltdown', 'explode', 'panic', 'chaos', 'crisis', 'doom',
  'evil', 'corrupt', 'sinister', 'terrify', 'furious', 'slam', 'blast', 'destroy',
];

const ABSOLUTE = [
  'always', 'never', 'everyone', 'no one', 'nobody', 'all', 'none', 'every',
  'absolutely', 'completely', 'totally', '100%', 'zero', 'impossible',
];

const CONSPIRACY = [
  'deep state', 'new world order', 'cover-up', 'they are hiding', 'wake up',
  'sheeple', 'false flag', 'inside job', 'mind control', 'globalist', 'cabal',
  'the elites', 'secret plan', 'hidden agenda',
];

const CREDIBILITY = [
  'according to', 'study', 'research', 'data', 'report', 'official', 'spokesperson',
  'press release', 'published', 'journal', 'university', 'researchers found',
  'statistics', 'percent', 'survey', 'poll',
];

const SENTENCE_SPLIT = /(?<=[.!?])\s+|\n+/;

function countMatches(text: string, list: string[]): number {
  const lower = text.toLowerCase();
  return list.reduce((acc, term) => acc + (lower.includes(term) ? 1 : 0), 0);
}

function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function extractKeywords(text: string): string[] {
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'this', 'that', 'it',
    'with', 'as', 'by', 'from', 'has', 'have', 'had', 'not', 'will', 'would',
    'could', 'should', 'they', 'their', 'there', 'here', 'said', 'says', 'about',
  'into', 'after', 'before', 'its', 'his', 'her', 'our', 'your', 'you', 'we',
  'he', 'she', 'who', 'which', 'what', 'when', 'where', 'why', 'how', 'more',
    'most', 'than', 'then', 'so', 'such', 'can', 'may', 'might', 'must', 'shall',
  'these', 'those', 'them', 'him', 'us', 'me', 'my', 'mine', 'yours', 'ours',
  'do', 'does', 'did', 'done', 'doing', 'if', 'also', 'just', 'over', 'under',
  'up', 'down', 'out', 'off', 'very', 'too', 'only', 'own', 'same', 'other',
  'some', 'any', 'all', 'each', 'few', 'many', 'much', 'one', 'two', 'three',
  'news', 'report', 'said', 'like', 'well', 'even', 'still', 'now', 'new',
  'because', 'while', 'during', 'between', 'among', 'through', 'since', 'until',
    'without', 'within', 'along', 'being', 'been',
  ]);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stop.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w]) => w);
}

function summarize(text: string, max = 3): string {
  const sentences = splitSentences(text);
  if (sentences.length <= max) return text.trim().slice(0, 600);
  const freq = new Map<string, number>();
  for (const s of sentences) {
    for (const w of s.toLowerCase().split(/\W+/)) {
      if (w.length > 4) freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  const scored = sentences.map((s, i) => {
    const words = s.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
    const score = words.reduce((acc, w) => acc + (freq.get(w) ?? 0), 0) / (words.length || 1);
    return { s, score: score + (i === 0 ? 1.5 : 0), i };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s)
    .join(' ');
}

function detectTone(text: string): string {
  const lower = text.toLowerCase();
  const emotional = countMatches(lower, EMOTIONAL);
  const hedging = countMatches(lower, HEDGING);
  const exclamations = (text.match(/!/g) ?? []).length;
  const caps = (text.match(/\b[A-Z]{4,}\b/g) ?? []).length;

  if (emotional + exclamations + caps > 5) return 'Highly Emotional / Sensational';
  if (emotional > 2) return 'Emotional';
  if (hedging > 2) return 'Cautious / Speculative';
  if (exclamations > 3) return 'Alarmist';
  return 'Neutral / Informative';
}

export function analyzeContent(rawText: string): AnalysisResult {
  const start = performance.now();
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const sentences = splitSentences(text);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Signal scoring
  const clickbaitHits = countMatches(lower, CLICKBAIT);
  const hedgingHits = countMatches(lower, HEDGING);
  const emotionalHits = countMatches(lower, EMOTIONAL);
  const absoluteHits = countMatches(lower, ABSOLUTE);
  const conspiracyHits = countMatches(lower, CONSPIRACY);
  const credibilityHits = countMatches(lower, CREDIBILITY);

  const exclamations = (text.match(/!/g) ?? []).length;
  const allCapsWords = (text.match(/\b[A-Z]{4,}\b/g) ?? []).length;
  const questionMarks = (text.match(/\?/g) ?? []).length;

  // Suspicious sentence detection
  const suspiciousSentences = sentences
    .map((s) => {
      const sl = s.toLowerCase();
      const reasons: string[] = [];
      if (CLICKBAIT.some((c) => sl.includes(c))) reasons.push('Clickbait phrasing');
      if (EMOTIONAL.some((c) => sl.includes(c))) reasons.push('Emotional manipulation');
      if (ABSOLUTE.some((c) => sl.includes(c))) reasons.push('Absolute / unverifiable claim');
      if (CONSPIRACY.some((c) => sl.includes(c))) reasons.push('Conspiracy framing');
      if (/\b[A-Z]{4,}\b/.test(s)) reasons.push('Excessive capitalization');
      if (/[!?]{2,}/.test(s)) reasons.push('Sensational punctuation');
      if (HEDGING.some((c) => sl.includes(c)) && !CREDIBILITY.some((c) => sl.includes(c)))
        reasons.push('Unsourced speculation');
      return reasons.length ? { text: s, reason: reasons.join(', ') } : null;
    })
    .filter((x): x is { text: string; reason: string } => x !== null)
    .slice(0, 8);

  // Composite manipulation score (0-100)
  const manipulationRaw =
    clickbaitHits * 14 +
    emotionalHits * 9 +
    absoluteHits * 7 +
    conspiracyHits * 16 +
    hedgingHits * 5 +
    Math.min(exclamations, 8) * 4 +
    Math.min(allCapsWords, 8) * 5 +
    Math.min(questionMarks, 6) * 2;
  const manipulationScore = Math.min(100, Math.round(manipulationRaw));

  // Credibility score (0-100)
  const credibilityRaw =
    credibilityHits * 10 +
    Math.min(wordCount, 400) * 0.08 +
    (sentences.length > 3 ? 8 : 0) -
    manipulationScore * 0.35;
  const credibilityScore = Math.max(0, Math.min(100, Math.round(credibilityRaw)));

  // Reliability meter
  const reliability = Math.max(0, Math.min(100, credibilityScore - manipulationScore * 0.2));

  // Verdict
  let verdict: Verdict;
  let confidence: number;
  if (manipulationScore >= 55 && credibilityScore < 45) {
    verdict = 'Fake';
    confidence = Math.min(98, 60 + (manipulationScore - 55) * 0.8);
  } else if (credibilityScore >= 55 && manipulationScore < 35) {
    verdict = 'Real';
    confidence = Math.min(97, 55 + (credibilityScore - 55) * 0.8);
  } else {
    verdict = 'Uncertain';
    confidence = Math.max(40, 100 - Math.abs(credibilityScore - manipulationScore));
  }
  confidence = Math.round(confidence);

  // Bias score
  const biasScore = Math.min(
    100,
    Math.round(emotionalHits * 12 + absoluteHits * 10 + clickbaitHits * 10 + hedgingHits * 6),
  );

  // Manipulation indicators
  const manipulationIndicators: string[] = [];
  if (clickbaitHits) manipulationIndicators.push(`${clickbaitHits} clickbait phrase(s)`);
  if (emotionalHits) manipulationIndicators.push(`${emotionalHits} emotionally charged term(s)`);
  if (absoluteHits) manipulationIndicators.push(`${absoluteHits} absolute / unverifiable claim(s)`);
  if (conspiracyHits) manipulationIndicators.push(`${conspiracyHits} conspiracy framing phrase(s)`);
  if (hedgingHits) manipulationIndicators.push(`${hedgingHits} speculative / unsourced hedging`);
  if (allCapsWords > 2) manipulationIndicators.push(`${allCapsWords} all-caps word(s)`);
  if (exclamations > 3) manipulationIndicators.push(`${exclamations} exclamation mark(s)`);
  if (!manipulationIndicators.length) manipulationIndicators.push('No strong manipulation signals detected');

  // Explanation
  const parts: string[] = [];
  if (verdict === 'Fake') {
    parts.push(
      `This content shows multiple markers of misinformation. The analysis engine detected a high manipulation score (${manipulationScore}/100) driven by ${manipulationIndicators.slice(0, 3).join(', ')}.`,
    );
    parts.push(
      `Credibility signals such as attributed sources, data references, and neutral phrasing were low (${credibilityScore}/100).`,
    );
  } else if (verdict === 'Real') {
    parts.push(
      `This content reads as credible. It shows a good balance of attributed sourcing and neutral, informative tone (credibility ${credibilityScore}/100) with low manipulation indicators (${manipulationScore}/100).`,
    );
  } else {
    parts.push(
      `This content is mixed. It contains some credibility signals (${credibilityScore}/100) alongside manipulation indicators (${manipulationScore}/100), making a definitive verdict difficult.`,
    );
  }
  if (suspiciousSentences.length) {
    parts.push(
      `${suspiciousSentences.length} sentence(s) were flagged for closer review.`,
    );
  }
  parts.push(
    'AI predictions are advisory and not a substitute for professional fact-checking.',
  );
  const explanation = parts.join(' ');

  const summary = summarize(text);
  const factCheckKeywords = extractKeywords(text);
  const emotionalTone = detectTone(text);

  return {
    verdict,
    confidence,
    explanation,
    biasScore,
    emotionalTone,
    summary,
    factCheckKeywords,
    manipulationIndicators,
    suspiciousSentences,
    reliability,
    processingTimeMs: Math.round(performance.now() - start),
  };
}
