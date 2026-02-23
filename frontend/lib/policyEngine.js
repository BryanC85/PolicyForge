const baselineChecklist = [
  'harassment & discrimination policies',
  'retaliation protections',
  'leave laws',
  'ADA accommodations',
  'wage & hour compliance',
  'pay transparency',
  'remote work rules',
  'AI usage in the workplace',
  'employee surveillance disclosures',
  'data privacy'
];

export function runLightweightPolicyAudit(text) {
  const lower = text.toLowerCase();
  const missing = baselineChecklist.filter((item) => !lower.includes(item.split(' ')[0]));
  const score = Math.max(0, 100 - missing.length * 8);

  return {
    compliance_score: score,
    missing_required_policies: missing,
    high_risk_legal_exposure: missing.length ? ['Policy gaps detected in required coverage areas.'] : [],
    ambiguous_language: ['Review manager-discretion language to ensure consistency.'],
    suggested_replacement_clauses: ['No retaliation against employees who report concerns in good faith.'],
    state_specific_warnings: ['Validate state meal/rest break and paid leave language.'],
    audit_readiness_status: score > 85 ? 'ready' : score > 65 ? 'conditional' : 'not_ready'
  };
}

export function answerFromPolicy(question, sourceText) {
  if (!sourceText) {
    return {
      answer: "I couldn't find this in current company policy.",
      citations: [],
      escalated: true,
      escalation_reason: 'No policy content indexed.'
    };
  }

  if (question.toLowerCase().includes('pto')) {
    return {
      answer: 'PTO details are defined in your handbook leave section; please confirm accrual schedule on that page.',
      citations: [{ document: 'UploadedPolicy', page: 1 }],
      escalated: false
    };
  }

  return {
    answer: "I couldn't find this in current company policy.",
    citations: [],
    escalated: true,
    escalation_reason: 'No exact policy match.'
  };
}
