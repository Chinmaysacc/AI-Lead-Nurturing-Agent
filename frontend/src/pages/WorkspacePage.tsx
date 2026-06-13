import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, BarChart3, ArrowLeft, RefreshCw, User } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import ChatPanel from '../components/ChatPanel';
import AgentTimeline from '../components/AgentTimeline';
import LeadScoreGauge from '../components/LeadScoreGauge';
import CareerPathTimeline from '../components/CareerPathTimeline';
import FollowUpCard from '../components/FollowUpCard';

type RightTab = 'agents' | 'score' | 'career' | 'followup';

const RIGHT_TABS: { id: RightTab; label: string }[] = [
  { id: 'agents', label: 'Agents' },
  { id: 'score', label: 'Lead Score' },
  { id: 'career', label: 'Career Path' },
  { id: 'followup', label: 'Follow-Up' },
];

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { leadProfile, agentActivity, resetSession } = useSession();
  const [activeTab, setActiveTab] = useState<RightTab>('agents');

  const handleReset = () => {
    resetSession();
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">Admission<span className="gradient-text">IQ</span></span>
          </div>
          <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-xs text-text-secondary">AI Counseling Session</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Lead info pill */}
          {leadProfile?.name && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{ background: 'rgba(26,26,40,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <User className="w-3 h-3 text-text-secondary" />
              <span className="text-text-primary font-medium">{leadProfile.name}</span>
              <span className={`badge-${leadProfile.lead_category?.toLowerCase() ?? 'cold'}`}>
                {leadProfile.lead_category ?? 'COLD'}
              </span>
              <span className="text-accent-purple font-bold">{leadProfile.lead_score}</span>
            </motion.div>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Session
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs btn-secondary py-2 px-3"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dashboard
          </button>
        </div>
      </header>

      {/* Split screen */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Chat */}
        <div className="flex flex-col w-1/2 min-w-0 border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="px-5 py-3 flex-shrink-0 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-text-secondary">Conversation Workspace</span>
            </div>
            <span className="text-xs text-text-secondary">
              {leadProfile?.message_count ?? 0} messages
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel />
          </div>
        </div>

        {/* RIGHT — Intelligence Panel */}
        <div className="flex flex-col w-1/2 min-w-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {RIGHT_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                style={{
                  background: activeTab === tab.id ? 'rgba(124,58,237,0.2)' : 'transparent',
                  color: activeTab === tab.id ? '#A78BFA' : '#94A3B8',
                  border: activeTab === tab.id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                }}
              >
                {tab.label}
                {tab.id === 'agents' && agentActivity.length > 0 && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-accent-purple text-white font-bold">
                    {agentActivity.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'agents' && <AgentTimeline activities={agentActivity} />}
              {activeTab === 'score' && <LeadScoreGauge leadProfile={leadProfile} />}
              {activeTab === 'career' && <CareerPathTimeline leadProfile={leadProfile} />}
              {activeTab === 'followup' && <FollowUpCard leadProfile={leadProfile} />}
            </motion.div>

            {/* Always show score summary at bottom of agents tab */}
            {activeTab === 'agents' && leadProfile && leadProfile.lead_score > 0 && (
              <LeadScoreGauge leadProfile={leadProfile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
