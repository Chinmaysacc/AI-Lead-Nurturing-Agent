import React from 'react';
import { motion } from 'framer-motion';
import type { LeadProfile } from '../types';
import { Award, TrendingUp } from 'lucide-react';

interface CareerPathTimelineProps {
  leadProfile: LeadProfile | null;
}

export default function CareerPathTimeline({ leadProfile }: CareerPathTimelineProps) {
  const path = leadProfile?.career_path ?? [];
  const course = leadProfile?.recommended_course;
  const confidence = leadProfile?.confidence_score;

  if (!course || path.length === 0) {
    return (
      <div className="glass-card p-5 flex flex-col items-center justify-center min-h-[160px] text-center">
        <TrendingUp className="w-8 h-8 text-text-secondary opacity-40 mb-2" />
        <p className="text-sm text-text-secondary">Career path will appear after course recommendation</p>
      </div>
    );
  }

  const STEP_COLORS = ['#7C3AED', '#8B5CF6', '#06B6D4', '#0EA5E9', '#10B981'];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary">Career Path</h3>
        {confidence && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.2)' }}>
            {confidence}% match
          </span>
        )}
      </div>

      {/* Course badge */}
      <div className="flex items-center gap-2 p-3 rounded-xl mb-5"
        style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
        <Award className="w-4 h-4 flex-shrink-0" style={{ color: '#7C3AED' }} />
        <div>
          <p className="text-xs text-text-secondary">Recommended Course</p>
          <p className="text-sm font-bold text-text-primary">{course}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-3 bottom-3 w-px"
          style={{ background: 'linear-gradient(180deg, #7C3AED40, #06B6D440)' }} />

        <div className="space-y-4">
          {path.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
              className="flex items-start gap-3 pl-1"
            >
              {/* Dot */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                style={{
                  background: `${STEP_COLORS[i] || '#94A3B8'}20`,
                  border: `2px solid ${STEP_COLORS[i] || '#94A3B8'}`,
                  color: STEP_COLORS[i] || '#94A3B8',
                  boxShadow: `0 0 8px ${STEP_COLORS[i] || '#94A3B8'}30`,
                }}
              >
                {i + 1}
              </div>

              {/* Step text */}
              <div className="flex-1">
                <p className="text-xs font-medium text-text-primary leading-snug">{step}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
