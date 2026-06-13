export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatScore(score: number): string {
  return `${score}/100`;
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'HOT': return '#EF4444';
    case 'WARM': return '#F59E0B';
    case 'COLD': return '#94A3B8';
    default: return '#94A3B8';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#EF4444';
  if (score >= 50) return '#F59E0B';
  return '#94A3B8';
}

export function getAgentColor(type: string): string {
  switch (type) {
    case 'gemini': return '#7C3AED';
    case 'rule-based': return '#10B981';
    case 'json-lookup': return '#06B6D4';
    default: return '#94A3B8';
  }
}

export function formatTimestamp(ts: string): string {
  return ts;
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}
