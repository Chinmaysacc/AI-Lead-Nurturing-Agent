import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { LeadProfile } from '../types';
import { getScoreColor, getCategoryColor } from '../utils/helpers';

interface LeadScoreGaugeProps {
  leadProfile: LeadProfile | null;
}

export default function LeadScoreGauge({ leadProfile }: LeadScoreGaugeProps) {
  const score = leadProfile?.lead_score ?? 0;
  const category = leadProfile?.lead_category ?? 'COLD';
  const breakdown = leadProfile?.score_breakdown ?? {};
  const conversionReadiness = score >= 80 ? 'Ready to Enroll' : score >= 65 ? 'High Interest' : score >= 50 ? 'Nurturing Required' : 'Early Stage';

  // SVG arc params
  const radius = 80;
  const circumference = Math.PI * radius; // semicircle
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const scoreColor = getScoreColor(score);
  const categoryColor = getCategoryColor(category);

  const breakdownItems = [
    { key: 'goal_clarity', label: 'Goal Clarity', max: 25 },
    { key: 'urgency', label: 'Urgency', max: 20 },
    { key: 'budget_readiness', label: 'Budget', max: 20 },
    { key: 'engagement', label: 'Engagement', max: 15 },
    { key: 'career_motivation', label: 'Motivation', max: 10 },
    { key: 'purchase_intent', label: 'Intent', max: 10 },
  ];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary">Lead Intelligence Score</h3>
        <motion.span
          key={category}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`badge-${category.toLowerCase()}`}
        >
          {category}
        </motion.span>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-48 h-28 overflow-hidden">
          <svg viewBox="0 0 200 110" className="absolute inset-0 w-full h-full">
            {/* Track */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <motion.path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke={scoreColor}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor}80)` }}
            />
            {/* Center score */}
            <text x="100" y="95" textAnchor="middle" fill="#F8FAFC" fontSize="28" fontWeight="900">
              {score}
            </text>
            <text x="100" y="110" textAnchor="middle" fill="#94A3B8" fontSize="10">
              out of 100
            </text>
          </svg>
        </div>

        <motion.div
          key={conversionReadiness}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold px-3 py-1 rounded-full mt-2"
          style={{ background: `${scoreColor}15`, color: scoreColor, border: `1px solid ${scoreColor}30` }}
        >
          {conversionReadiness}
        </motion.div>
      </div>

      {/* Breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <div className="space-y-2">
          {breakdownItems.map(({ key, label, max }) => {
            const val = (breakdown as Record<string, number>)[key] ?? 0;
            const pct = (val / max) * 100;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{label}</span>
                  <span className="text-text-primary font-medium">{val}/{max}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #7C3AED, #06B6D4)` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {leadProfile?.escalated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}
        >
          ⚡ Escalated to Senior Counselor · {leadProfile.escalation_priority} Priority
        </motion.div>
      )}
    </div>
  );
}
