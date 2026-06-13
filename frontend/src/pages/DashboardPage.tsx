import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Brain, Users, Flame, TrendingUp, Zap, Calendar,
  ArrowLeft, MessageSquare, RefreshCw, ExternalLink
} from 'lucide-react';
import { dashboardAPI, leadsAPI } from '../utils/api';
import type { LeadProfile } from '../types';
import { getCategoryColor } from '../utils/helpers';

const PIE_COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-5"
      style={{ borderColor: `${color}20` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-2xl font-black" style={{ color }}>{value}</span>
      </div>
      <div className="text-sm font-medium text-text-primary">{label}</div>
      {sub && <div className="text-xs text-text-secondary mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`badge-${category.toLowerCase()}`}>
      {category}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-sm">
        <p className="text-text-secondary">{label}</p>
        <p className="text-text-primary font-bold">{payload[0].value} leads</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
    refetchInterval: 30000,
  });

  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = useQuery({
    queryKey: ['all-leads'],
    queryFn: () => leadsAPI.getAll({ limit: 50 }),
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetchStats();
    refetchLeads();
  };

  // Transform data for charts
  const scoreDistData = stats?.score_distribution
    ? Object.entries(stats.score_distribution).map(([range, count]) => ({ range, count }))
    : [];

  const courseDistData = stats?.course_distribution
    ? Object.entries(stats.course_distribution).map(([name, value]) => ({
        name: name.length > 25 ? name.slice(0, 25) + '...' : name,
        value,
      }))
    : [];

  const leads: LeadProfile[] = leadsData?.leads ?? [];

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Admission<span className="gradient-text">IQ</span></span>
          </div>
          <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-sm text-text-secondary font-medium">Admin Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={() => navigate('/start')}
            className="btn-primary text-xs py-2 px-4"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            New Consultation
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stat Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {Array(6).fill(null).map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard icon={Users} label="Total Leads" value={stats.total_leads} color="#7C3AED" />
            <StatCard icon={Flame} label="HOT Leads" value={stats.hot} color="#EF4444" sub="Score ≥ 80" />
            <StatCard icon={TrendingUp} label="WARM Leads" value={stats.warm} color="#F59E0B" sub="Score 50–79" />
            <StatCard icon={Brain} label="COLD Leads" value={stats.cold} color="#94A3B8" sub="Score < 50" />
            <StatCard icon={Zap} label="Escalated" value={stats.escalated} color="#7C3AED" sub="HOT + intent" />
            <StatCard icon={Calendar} label="Follow-Ups Today" value={stats.follow_up_today} color="#06B6D4" />
          </div>
        ) : null}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-bold text-text-primary mb-5">Lead Score Distribution</h3>
            {scoreDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreDistData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="range" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {scoreDistData.map((_, i) => (
                      <Cell key={i} fill={`url(#barGrad${i})`} />
                    ))}
                  </Bar>
                  <defs>
                    {scoreDistData.map((_, i) => (
                      <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-52 text-text-secondary text-sm">
                No data yet — start some consultations!
              </div>
            )}
          </motion.div>

          {/* Course Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-bold text-text-primary mb-5">Course Recommendation Breakdown</h3>
            {courseDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={courseDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {courseDistData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} leads`, 'Count']} contentStyle={{ background: '#1A1A28', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
                  <Legend
                    formatter={(value) => <span style={{ color: '#94A3B8', fontSize: 11 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-52 text-text-secondary text-sm">
                No recommendations yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Lead Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-bold text-text-primary">
              All Leads
              {leadsData?.total !== undefined && (
                <span className="ml-2 text-xs text-text-secondary font-normal">({leadsData.total} total)</span>
              )}
            </h3>
          </div>

          {leadsLoading ? (
            <div className="p-6">
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded-lg mb-2 animate-pulse" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-10 h-10 text-text-secondary opacity-30 mb-3" />
              <p className="text-sm text-text-secondary">No leads yet</p>
              <p className="text-xs text-text-secondary mt-1">Start a consultation to see leads here</p>
              <button onClick={() => navigate('/start')} className="btn-primary text-xs mt-4 py-2 px-4">
                Start Consultation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Name', 'Score', 'Category', 'Course', 'Follow-Up Date', 'Escalated', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-secondary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <motion.tr
                      key={lead.lead_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b transition-colors hover:bg-white/[0.02] cursor-pointer"
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}>
                            {(lead.name ?? '?')[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{lead.name ?? 'Unknown'}</p>
                            <p className="text-xs text-text-secondary">{lead.email ?? lead.phone ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${lead.lead_score}%`,
                                background: `linear-gradient(90deg, ${getCategoryColor(lead.lead_category)}, ${getCategoryColor(lead.lead_category)}AA)`
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold" style={{ color: getCategoryColor(lead.lead_category) }}>
                            {lead.lead_score}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <CategoryBadge category={lead.lead_category} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-text-secondary">
                          {lead.recommended_course ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-text-secondary">{lead.follow_up_date ?? '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {lead.escalated ? (
                          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#EF4444' }}>
                            <Zap className="w-3 h-3" /> YES
                          </span>
                        ) : (
                          <span className="text-xs text-text-secondary">No</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <ExternalLink className="w-3.5 h-3.5 text-text-secondary hover:text-accent-purple transition-colors" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
