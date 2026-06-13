import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentActivity } from '../types';
import { getAgentColor } from '../utils/helpers';

interface AgentTimelineProps {
  activities: AgentActivity[];
}

const AGENT_TYPE_LABELS: Record<string, string> = {
  'rule-based': 'Rule-Based',
  'gemini': 'Gemini AI',
  'json-lookup': 'JSON Lookup',
};

function FindingsDisplay({ findings }: { findings: Record<string, unknown> }) {
  const entries = Object.entries(findings).filter(
    ([k, v]) => v !== null && v !== undefined && k !== 'skipped' && k !== 'source'
  );

  if (entries.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {entries.slice(0, 6).map(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        let displayValue = '';

        if (typeof value === 'boolean') {
          displayValue = value ? 'Yes' : 'No';
        } else if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            displayValue = (value as string[]).join(', ') || 'None';
          } else {
            // Score breakdown object
            displayValue = Object.entries(value as Record<string, number>)
              .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
              .join(' · ');
          }
        } else {
          displayValue = String(value);
        }

        return (
          <div key={key} className="flex gap-2 text-xs">
            <span className="text-success flex-shrink-0">✓</span>
            <span className="text-text-secondary">{label}:</span>
            <span className="text-text-primary font-medium truncate">{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AgentTimeline({ activities }: AgentTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities.length]);

  if (activities.length === 0) {
    return (
      <div className="glass-card p-5 flex flex-col items-center justify-center min-h-[200px] text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <span className="text-2xl">🤖</span>
        </div>
        <p className="text-sm font-medium text-text-primary">Agent Activity Timeline</p>
        <p className="text-xs text-text-secondary mt-1">Agents will appear here as they run</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-bold text-text-primary mb-4">Agent Activity Timeline</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, i) => {
            const color = getAgentColor(activity.agent_type);
            const typeLabel = AGENT_TYPE_LABELS[activity.agent_type] || activity.agent_type;
            const isSkipped = activity.status === 'skipped';
            const isError = activity.status === 'error';

            return (
              <motion.div
                key={`${activity.agent_name}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0 }}
                className="flex gap-3"
              >
                {/* Line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{
                      background: isSkipped ? 'rgba(148,163,184,0.1)' : `${color}15`,
                      border: `1px solid ${isSkipped ? 'rgba(148,163,184,0.2)' : `${color}35`}`,
                    }}
                  >
                    <span style={{ color: isSkipped ? '#94A3B8' : color, fontSize: '11px' }}>
                      {isError ? '✗' : activity.icon}
                    </span>
                  </div>
                  {i < activities.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ background: 'rgba(255,255,255,0.06)', minHeight: '8px' }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: isSkipped ? '#94A3B8' : color }}>
                      {activity.agent_name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md"
                      style={{
                        background: isSkipped ? 'rgba(148,163,184,0.08)' : `${color}10`,
                        color: isSkipped ? '#94A3B8' : color,
                        border: `1px solid ${isSkipped ? 'rgba(148,163,184,0.15)' : `${color}20`}`,
                      }}>
                      {typeLabel}
                    </span>
                    <span className="text-[10px] text-text-secondary ml-auto">{activity.timestamp}</span>
                  </div>

                  {!isSkipped && <FindingsDisplay findings={activity.findings} />}
                  {isSkipped && (
                    <p className="text-[10px] text-text-secondary mt-1 italic">
                      {(activity.findings as { reason?: string }).reason || 'Skipped'}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
