// Simple heuristic analysis and change-point estimation
const medicalTerms = [
  'diagnosis','disorder','clinical','therapy','therapist','psychiatry','psychiatric','medication','prescription','dose','symptoms','treatment','diagnose','clinician','patient','assessment','dsm','icd','bipolar','depression','anxiety','adhd','autism','ssri','antidepressant','antipsychotic'
];

const hedgingWords = ['might','could','perhaps','possibly','seems','appears','may','suggests'];
const politenessWords = ['please','thank you','thanks','appreciate'];
const safetyTerms = ['self-harm','suicide','kill myself','hurt myself','minor','violence','abuse'];
const disclosureTerms = ['diagnosed','my diagnosis','on meds','medication','therapy','therapist','psychiatrist','panic attack','depressed','anxious'];

function countMatches(text, list) {
  const lc = (text || '').toLowerCase();
  return list.reduce((acc, term) => acc + (lc.includes(term) ? 1 : 0), 0);
}

function estimateSentiment(text) {
  const pos = ['great','love','excited','happy','glad','good','awesome','excellent'];
  const neg = ['hate','sad','angry','upset','bad','terrible','awful','anxious','depressed'];
  const p = countMatches(text, pos);
  const n = countMatches(text, neg);
  const total = p + n;
  const valence = total === 0 ? 0 : (p - n) / total;
  return { valence, confidence: Math.min(1, total / 5) };
}

function emojiCount(text) {
  // Basic emoji pattern (not exhaustive)
  const regex = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}]/u;
  return (text || '').split('').filter(ch => regex.test(ch)).length;
}

function estimateFormality(text) {
  const lc = (text || '').trim();
  if (!lc) return 0.5;
  const hasGreetings = /(dear|regards|sincerely)/i.test(lc);
  const exclam = (lc.match(/!/g) || []).length;
  const contractions = /(\b(i'm|don't|can't|it's|we're|they're)\b)/i.test(lc);
  let score = 0.5 + (hasGreetings ? 0.2 : 0) - (exclam > 1 ? 0.1 : 0) - (contractions ? 0.1 : 0);
  return Math.max(0, Math.min(1, score));
}

function estimateClinicalRegister(text) {
  const mt = countMatches(text, medicalTerms);
  const lengthFactor = Math.min(1, (text || '').split(/\s+/).length / 100);
  const punctuation = ((text || '').match(/[;:]/g) || []).length > 0 ? 0.1 : 0;
  const score = Math.max(0, Math.min(1, (mt ? 0.4 + 0.1 * mt : 0) + lengthFactor * 0.3 + punctuation));
  return score > 1 ? 1 : score;
}

function estimateHedging(text) {
  const count = countMatches(text, hedgingWords);
  return Math.max(0, Math.min(1, count / 5));
}

function estimatePoliteness(text) {
  return Math.max(0, Math.min(1, countMatches(text, politenessWords) / 3));
}

function detectSafety(text) {
  const flags = [];
  for (const term of safetyTerms) {
    if ((text || '').toLowerCase().includes(term)) flags.push(term.split(' ').join('_'));
  }
  return flags;
}

function detectDisclosure(prompt, response, metadata = {}) {
  const text = `${prompt || ''}\n${response || ''}`;
  const flags = [];
  for (const term of disclosureTerms) {
    if (text.toLowerCase().includes(term)) flags.push(term.replace(/\s+/g, '_'));
  }
  // crude indirect heuristic: mention inside quotes or attachments present
  const indirect = /"(diagnosed|medication|therapist|psychiatrist)"/i.test(text) || (metadata.attachments && metadata.attachments.length > 0);
  return { flags, indirect };
}

function classifyStance(text) {
  const lc = (text || '').toLowerCase();
  const evaluatorCues = ['should','must','recommend','advise','caution','you need to'];
  const coCreatorCues = ['let\'s','we could','explore','co-create','imagine','together'];

  const evalScore = countMatches(lc, evaluatorCues) + (estimateFormality(lc) > 0.7 ? 1 : 0);
  const coScore = countMatches(lc, coCreatorCues) + (emojiCount(lc) > 0 ? 1 : 0);

  let stance = 'neutral';
  let conf = 0.5;
  if (evalScore - coScore >= 2) { stance = 'evaluator'; conf = 0.7; }
  else if (coScore - evalScore >= 2) { stance = 'co_creator'; conf = 0.7; }
  else if (estimateClinicalRegister(lc) > 0.6 && estimateFormality(lc) > 0.7) { stance = 'gatekeeper'; conf = 0.7; }
  return { stance, stance_conf: conf };
}

function analyzeTurnHeuristics(prompt, response, history = [], metadata = {}) {
  const combined = `${response || ''}`; // focus on assistant reply
  const sentiment = estimateSentiment(combined);
  const formality = estimateFormality(combined);
  const clinical_register = estimateClinicalRegister(combined);
  const emojis = emojiCount(combined);
  const hedging_index = estimateHedging(combined);
  const politeness = estimatePoliteness(combined);
  const safety_flags = detectSafety(combined);
  const { flags: disclosure_flags } = detectDisclosure(prompt, response, metadata);
  const { stance, stance_conf } = classifyStance(combined);

  // Simple change-point: compare to average of last K
  const K = Math.min(history.length, 5);
  let prevClinical = 0; let prevCoCreator = 0;
  if (K > 0) {
    prevClinical = history.slice(-K).reduce((a, e) => a + (e.analysis?.clinical_register || 0), 0) / K;
    prevCoCreator = history.slice(-K).reduce((a, e) => a + (e.analysis?.stance === 'co_creator' ? 1 : 0), 0) / K;
  }
  const signal = (clinical_register - (stance === 'co_creator' ? 0.2 : 0)) - (prevClinical - prevCoCreator * 0.2);
  const change_point_score = Math.max(0, Math.min(1, Math.abs(signal)));
  const pivot_detected = change_point_score > 0.4 && (disclosure_flags.length > 0);

  return {
    sentiment,
    formality,
    clinical_register,
    emoji_count: emojis,
    hedging_index,
    politeness,
    safety_flags,
    disclosure_flags,
    stance,
    stance_conf,
    toxicity: 0, // placeholder
    change_point_score,
    pivot_detected
  };
}

module.exports = {
  analyzeTurnHeuristics
};

