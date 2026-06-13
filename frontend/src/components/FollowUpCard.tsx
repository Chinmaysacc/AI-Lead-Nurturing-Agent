import React from 'react';
import { motion } from 'framer-motion';
import type { LeadProfile } from '../types';
import { Mail, MessageSquare, Calendar, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface FollowUpCardProps {
  leadProfile: LeadProfile | null;
}

export default function FollowUpCard({ leadProfile }: FollowUpCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!leadProfile?.follow_up_whatsapp && !leadProfile?.follow_up_email_subject) {
    return (
      <div className="glass-card p-5 flex flex-col items-center justify-center min-h-[100px] text-center">
        <Mail className="w-6 h-6 text-text-secondary opacity-40 mb-2" />
        <p className="text-xs text-text-secondary">Follow-up messages will appear here</p>
      </div>
    );
  }

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">Follow-Up Queue</h3>
        {leadProfile.follow_up_date && (
          <div className="flex items-center gap-1.5 text-xs text-accent-cyan">
            <Calendar className="w-3 h-3" />
            {leadProfile.follow_up_date}
          </div>
        )}
      </div>

      {/* WhatsApp */}
      {leadProfile.follow_up_whatsapp && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-success" />
              <span className="text-xs font-semibold text-success">WhatsApp Message</span>
            </div>
            <button
              onClick={() => copyToClipboard(leadProfile.follow_up_whatsapp!, 'whatsapp')}
              className="text-xs text-text-secondary hover:text-success transition-colors"
            >
              {copied === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{leadProfile.follow_up_whatsapp}</p>
        </motion.div>
      )}

      {/* Email */}
      {leadProfile.follow_up_email_subject && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 rounded-xl"
          style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-accent-cyan" />
              <span className="text-xs font-semibold text-accent-cyan">Email</span>
            </div>
            <button
              onClick={() => copyToClipboard(`Subject: ${leadProfile.follow_up_email_subject}\n\n${leadProfile.follow_up_email_body}`, 'email')}
              className="text-xs text-text-secondary hover:text-accent-cyan transition-colors"
            >
              {copied === 'email' ? <Check className="w-3.5 h-3.5 text-accent-cyan" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs font-medium text-text-primary mb-1">{leadProfile.follow_up_email_subject}</p>
          {leadProfile.follow_up_email_body && (
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{leadProfile.follow_up_email_body}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
