import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Target, Star, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import type { DemoScenario } from '../types';
import { useSession } from '../context/SessionContext';

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 1,
    name: 'Priya Ramesh',
    role: 'BCom Final Year',
    goal: 'Performance Marketing Job',
    budget: '₹44,999 + EMI',
    category: 'HOT',
    score: 80,
    course: 'Performance Marketing Pro',
    color: '#EF4444',
  },
  {
    id: 2,
    name: 'Arjun Mehta',
    role: 'Software Developer (3 yrs)',
    goal: 'Marketing Analytics Switch',
    budget: '₹64,999',
    category: 'WARM',
    score: 63,
    course: 'Analytics Combo',
    color: '#F59E0B',
  },
  {
    id: 3,
    name: 'Sunita Kapoor',
    role: 'Boutique Store Owner',
    goal: 'Run Own Digital Ads',
    budget: '₹29,999',
    category: 'WARM',
    score: 67,
    course: 'Business Bootcamp',
    color: '#F59E0B',
  },
];

const FEATURES = [
  { icon: Target, text: 'Understand your career goals' },
  { icon: Brain, text: 'Recommend the right course' },
  { icon: Star, text: 'Create a personalized career path' },
];

export default function ConsultationStart() {
  const navigate = useNavigate();
  const { loadDemoScenario } = useSession();

  const handleDemo = (scenario: number) => {
    loadDemoScenario(scenario);
    navigate('/workspace');
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-6 py-12">
      {/* Grid overlay */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />

      {/* Glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="mb-8 text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
        >
          ← Back to Home
        </motion.button>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-10 text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #7C3AED20, #06B6D420)', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <Brain className="w-10 h-10" style={{ color: '#7C3AED' }} />
          </motion.div>

          <h1 className="text-3xl font-black mb-2">
            Welcome to AI Admission Counseling
          </h1>
          <p className="text-text-secondary mb-1">Powered by 7 AI Agents · gemini-2.5-flash-lite</p>

          {/* Time */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Clock className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm font-medium text-accent-cyan">Estimated Time: 2 Minutes</span>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3 mb-10 text-left">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(124,58,237,0.15)' }}>
                  <f.icon className="w-4 h-4" style={{ color: '#7C3AED' }} />
                </div>
                <span className="text-sm font-medium">{f.text}</span>
                <CheckCircle className="w-4 h-4 ml-auto text-success" />
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/workspace')}
            className="btn-primary w-full justify-center text-base py-4 glow-purple mb-4"
          >
            Start Assessment
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <p className="text-xs text-text-secondary">
            No registration required · Your data is private · Completely free
          </p>
        </motion.div>

        {/* Demo Scenarios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <p className="text-center text-sm text-text-secondary mb-4 font-medium">
            Or load a pre-built demo scenario
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_SCENARIOS.map((s) => (
              <motion.button
                key={s.id}
                whileHover={{ y: -2, scale: 1.01 }}
                onClick={() => handleDemo(s.id)}
                className="glass-card p-4 text-left transition-all hover:border-opacity-50 cursor-pointer"
                style={{ borderColor: `${s.color}20` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold"
                    style={{ color: s.color }}>
                    {s.category} · {s.score}/100
                  </span>
                </div>
                <div className="font-semibold text-sm text-text-primary">{s.name}</div>
                <div className="text-xs text-text-secondary mt-0.5">{s.role}</div>
                <div className="text-xs text-text-secondary mt-2 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {s.course}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
