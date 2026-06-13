import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Brain, Zap, Target, MessageSquare, BookOpen,
  Mail, TrendingUp, ArrowRight, CheckCircle, Users,
  BarChart3, Star, Shield, Clock, Award
} from 'lucide-react';

const AGENTS = [
  {
    icon: Target,
    name: 'Qualification Agent',
    type: 'Rule-Based Python',
    color: '#10B981',
    description: 'Extracts structured lead fields from conversation using pattern matching',
    badge: 'DETERMINISTIC',
  },
  {
    icon: BarChart3,
    name: 'Lead Intelligence Agent',
    type: 'Rule-Based Python',
    color: '#10B981',
    description: 'Computes a deterministic 0–100 lead score using a transparent formula',
    badge: 'DETERMINISTIC',
  },
  {
    icon: BookOpen,
    name: 'Knowledge Agent',
    type: 'JSON Lookup',
    color: '#06B6D4',
    description: 'Answers factual questions by searching knowledge_base.json — no hallucination',
    badge: 'ZERO HALLUCINATION',
  },
  {
    icon: Brain,
    name: 'Recommendation Agent',
    type: 'Gemini AI',
    color: '#7C3AED',
    description: 'Reasons over lead profile + courses to recommend the best-fit program',
    badge: 'GEMINI',
  },
  {
    icon: MessageSquare,
    name: 'Objection Handling Agent',
    type: 'Gemini AI',
    color: '#7C3AED',
    description: 'Detects concerns and generates empathetic, data-backed responses',
    badge: 'GEMINI',
  },
  {
    icon: Mail,
    name: 'Follow-Up Agent',
    type: 'Gemini AI',
    color: '#7C3AED',
    description: 'Crafts personalized WhatsApp & email follow-ups with optimal timing',
    badge: 'GEMINI',
  },
  {
    icon: Zap,
    name: 'Escalation Agent',
    type: 'Rule-Based Python',
    color: '#EF4444',
    description: 'Detects HOT leads and escalates to human counselors via threshold rules',
    badge: 'DETERMINISTIC',
  },
];

const BENEFITS = [
  { icon: TrendingUp, title: '3.4× Conversion Lift', desc: 'AI qualification reduces manual counselor time while improving lead-to-enrollment rates' },
  { icon: Clock, title: 'Zero Dead Time', desc: 'Leads get instant responses 24/7 — no waiting for business hours or counselor availability' },
  { icon: Shield, title: 'Auditable Scoring', desc: 'Every lead score is deterministic and explainable — the same input always produces the same score' },
  { icon: Star, title: 'Hyper-Personalized', desc: 'Gemini crafts unique recommendations and follow-ups for each lead\'s specific career profile' },
  { icon: Users, title: 'Human + AI Hybrid', desc: 'AI handles qualification while escalating the right leads to senior counselors at the right moment' },
  { icon: Award, title: 'Zero Hallucination', desc: 'Facts come only from knowledge_base.json — AI reasons over verified data, never invents answers' },
];

const STATS = [
  { value: '4,200+', label: 'Students Trained' },
  { value: '91%', label: 'Placement Rate' },
  { value: '200+', label: 'Hiring Partners' },
  { value: '₹4.2 LPA', label: 'Avg Salary' },
];

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-bg text-text-primary overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Admission<span className="gradient-text">IQ</span></span>
          <span className="text-xs text-text-secondary ml-1 border border-white/10 px-2 py-0.5 rounded-full">by DMI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary text-sm py-2 px-4"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/start')}
            className="btn-primary text-sm py-2 px-5"
          >
            Start Free Assessment
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        {/* Grid bg */}
        <div className="absolute inset-0 grid-pattern opacity-40" />

        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}
          >
            <Zap className="w-4 h-4" />
            Powered by Gemini 2.5 Flash · 7 AI Agents · Real-Time Lead Scoring
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="text-text-primary">AI Admissions</span>
            <br />
            <span className="gradient-text">Intelligence</span>
            <br />
            <span className="text-text-primary">Platform</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            A multi-agent AI system that qualifies leads, recommends courses, handles objections,
            scores intent, and escalates hot prospects — all in real time. Built for
            <strong className="text-text-primary"> DMI Digital Marketing Institute</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/start')}
              className="btn-primary text-base px-8 py-4 glow-purple"
            >
              Start AI Assessment
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-base px-8 py-4"
            >
              <BarChart3 className="w-4 h-4" />
              View Dashboard
            </motion.button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card p-4 text-center"
              >
                <div className="text-2xl font-black gradient-text">{stat.value}</div>
                <div className="text-xs text-text-secondary mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Agent Showcase */}
      <section className="py-24 px-6">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#06B6D4' }}>
            SYSTEM ARCHITECTURE
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            7 Specialized <span className="gradient-text">AI Agents</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Each agent has exactly one responsibility. Rule-based agents handle deterministic decisions;
            Gemini handles language — because knowing when <em>not</em> to use AI is what separates
            good engineering from great engineering.
          </p>
        </AnimatedSection>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AGENTS.map((agent, i) => (
            <AnimatedSection key={agent.name}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="glass-card p-6 h-full flex flex-col gap-4 cursor-default"
                style={{ borderColor: `${agent.color}20` }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
                    <agent.icon className="w-6 h-6" style={{ color: agent.color }} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-md"
                    style={{
                      background: `${agent.color}15`,
                      color: agent.color,
                      border: `1px solid ${agent.color}25`,
                    }}>
                    {agent.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-primary">{agent.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">{agent.type}</p>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed flex-1">{agent.description}</p>
              </motion.div>
            </AnimatedSection>
          ))}

          {/* Orchestrator card spanning remaining */}
          <AnimatedSection>
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-card p-6 flex flex-col gap-4 gradient-border"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(124,58,237,0.3)' }}>
                <Zap className="w-6 h-6" style={{ color: '#7C3AED' }} />
              </div>
              <div>
                <h3 className="font-bold text-base text-text-primary">Master Orchestrator</h3>
                <p className="text-xs text-text-secondary mt-0.5">Pipeline Controller</p>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Sequences all 7 agents in order, handles data flow between them, and composes the final reply.
                Persists everything to SQLite for session continuity.
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6" style={{ background: 'rgba(26,26,40,0.4)' }}>
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">
            Why <span className="gradient-text">AdmissionIQ</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Built with the principle that the right tool for each task produces the best outcome.
          </p>
        </AnimatedSection>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <AnimatedSection key={b.title}>
              <div className="glass-card-hover p-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <b.icon className="w-5 h-5" style={{ color: '#7C3AED' }} />
                </div>
                <h3 className="font-bold text-base mb-2">{b.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{b.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <AnimatedSection>
          <div className="max-w-2xl mx-auto glass-card p-12 gradient-border">
            <h2 className="text-4xl font-black mb-4">
              Ready to Experience <br />
              <span className="gradient-text">AI Admission Counseling?</span>
            </h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              The assessment takes under 2 minutes. Our AI will understand your career goals,
              recommend the right course, and create a personalized path — instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/start')}
                className="btn-primary text-base px-10 py-4 glow-purple"
              >
                Start Free Assessment
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8">
              {['No registration required', '2 minutes only', 'Instant recommendations'].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-success" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-text-secondary text-sm"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-4 h-4" style={{ color: '#7C3AED' }} />
          <span className="font-semibold text-text-primary">AdmissionIQ</span>
          <span>by DMI — Digital Marketing Institute</span>
        </div>
        <p>Pune, Maharashtra · Google Partner · Meta Business Partner · 4,200+ Students Trained</p>
      </footer>
    </div>
  );
}
