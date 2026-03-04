import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ── Storage helpers ──────────────────────────────────────────────────────────
const S = {
  get: (k: string) => {
    try {
      return JSON.parse(localStorage.getItem(k) || 'null');
    } catch {
      return null;
    }
  },
  set: (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v)),
};

// ── Types ────────────────────────────────────────────────────────────────────
interface Task {
  id: string;
  slot: string;
  subject: string;
  label: string;
  time: string;
  icon: string;
  color: string;
}
interface TopicEntry {
  subject: string;
  text: string;
  date: string;
}
interface StreakData {
  count: number;
  last: string;
}
interface ChartDay {
  day: string;
  done: number;
  total: number;
  pct: number;
  dsa: number;
}

// ── PHASE-BASED TASK DEFINITIONS ─────────────────────────────────────────────
const PHASE_WEEKDAY_TASKS: Record<number, Task[]> = {
  0: [
    // Phase 1 — Month 1-2: Java + DSA Basics + Aptitude
    {
      id: 'p1_morning_java',
      slot: 'morning',
      subject: 'Java',
      label: 'Java — Syntax, OOP, Collections',
      time: '6:00 – 7:30 AM',
      icon: '☕',
      color: '#3B82F6',
    },
    {
      id: 'p1_eve_aptitude',
      slot: 'evening',
      subject: 'Aptitude',
      label: 'Aptitude Practice (45 min)',
      time: '7:00 – 7:45 PM',
      icon: '🧮',
      color: '#F59E0B',
    },
    {
      id: 'p1_eve_dsa',
      slot: 'evening',
      subject: 'DSA',
      label: 'DSA Problems × 2 (Arrays / Strings)',
      time: '7:45 – 9:15 PM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p1_eve_revision',
      slot: 'evening',
      subject: 'Revision',
      label: 'Revision Notes (30 min)',
      time: '9:15 – 10:00 PM',
      icon: '📝',
      color: '#EC4899',
    },
  ],
  1: [
    // Phase 2 — Month 3: DSA Intermediate + SQL/DBMS
    {
      id: 'p2_morning_dsa',
      slot: 'morning',
      subject: 'DSA',
      label: 'DSA — Trees / Recursion / BinarySearch',
      time: '6:00 – 7:30 AM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p2_eve_sql',
      slot: 'evening',
      subject: 'DBMS',
      label: 'SQL Practice — Joins / Subqueries',
      time: '7:00 – 8:00 PM',
      icon: '🗄️',
      color: '#8B5CF6',
    },
    {
      id: 'p2_eve_dsa2',
      slot: 'evening',
      subject: 'DSA',
      label: 'DSA Problems × 2 (Medium level)',
      time: '8:00 – 9:15 PM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p2_eve_aptitude',
      slot: 'evening',
      subject: 'Aptitude',
      label: 'Aptitude Practice (30 min)',
      time: '9:15 – 9:45 PM',
      icon: '🧮',
      color: '#F59E0B',
    },
    {
      id: 'p2_eve_revision',
      slot: 'evening',
      subject: 'Revision',
      label: 'Revision Notes (15 min)',
      time: '9:45 – 10:00 PM',
      icon: '📝',
      color: '#EC4899',
    },
  ],
  2: [
    // Phase 3 — Month 4: Hard DSA + MERN Stack Start
    {
      id: 'p3_morning_dsa',
      slot: 'morning',
      subject: 'DSA',
      label: 'DSA — DP / Graphs / Greedy',
      time: '6:00 – 7:30 AM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p3_eve_mern',
      slot: 'evening',
      subject: 'MERN',
      label: 'MERN Stack — Learn + Code',
      time: '7:00 – 8:30 PM',
      icon: '⚛️',
      color: '#06B6D4',
    },
    {
      id: 'p3_eve_dsa2',
      slot: 'evening',
      subject: 'DSA',
      label: 'DSA Problems × 2 (Medium-Hard)',
      time: '8:30 – 9:30 PM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p3_eve_revision',
      slot: 'evening',
      subject: 'Revision',
      label: 'Revision Notes (30 min)',
      time: '9:30 – 10:00 PM',
      icon: '📝',
      color: '#EC4899',
    },
  ],
  3: [
    // Phase 4 — Month 5: Mock Tests + Resume + Projects
    {
      id: 'p4_morning_dsa',
      slot: 'morning',
      subject: 'DSA',
      label: 'DSA Revision — Company tagged problems',
      time: '6:00 – 7:30 AM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p4_eve_mock',
      slot: 'evening',
      subject: 'Mock',
      label: 'Mock Test Section (Aptitude/Verbal)',
      time: '7:00 – 8:00 PM',
      icon: '📋',
      color: '#EC4899',
    },
    {
      id: 'p4_eve_project',
      slot: 'evening',
      subject: 'MERN',
      label: 'MERN Project Work',
      time: '8:00 – 9:15 PM',
      icon: '🏗️',
      color: '#06B6D4',
    },
    {
      id: 'p4_eve_resume',
      slot: 'evening',
      subject: 'Revision',
      label: 'Resume / Interview Prep (30 min)',
      time: '9:15 – 10:00 PM',
      icon: '📝',
      color: '#EC4899',
    },
  ],
  4: [
    // Phase 5 — Month 6: Final Sprint + Interview Prep
    {
      id: 'p5_morning_dsa',
      slot: 'morning',
      subject: 'DSA',
      label: 'DSA — 2 Problems (timed, no hints)',
      time: '6:00 – 7:00 AM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p5_morning_java',
      slot: 'morning',
      subject: 'Java',
      label: 'Java OOP + DBMS Theory Revision',
      time: '7:00 – 7:30 AM',
      icon: '☕',
      color: '#3B82F6',
    },
    {
      id: 'p5_eve_mock',
      slot: 'evening',
      subject: 'Mock',
      label: 'Company-specific Mock Test',
      time: '7:00 – 8:30 PM',
      icon: '📋',
      color: '#EC4899',
    },
    {
      id: 'p5_eve_hr',
      slot: 'evening',
      subject: 'Revision',
      label: 'HR Questions + Interview Practice',
      time: '8:30 – 9:30 PM',
      icon: '🎤',
      color: '#F97316',
    },
    {
      id: 'p5_eve_revision',
      slot: 'evening',
      subject: 'Revision',
      label: 'Error Log + Next Day Planning',
      time: '9:30 – 10:00 PM',
      icon: '📝',
      color: '#EC4899',
    },
  ],
};

const PHASE_WEEKEND_TASKS: Record<number, Task[]> = {
  0: [
    // Phase 1
    {
      id: 'p1_we_dsa',
      slot: 'morning',
      subject: 'DSA',
      label: 'DSA — 3 Timed Problems (Arrays/Strings)',
      time: '6:00 – 8:00 AM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p1_we_java',
      slot: 'morning',
      subject: 'Java',
      label: 'Java Deep Practice — OOP + Collections',
      time: '8:00 – 12:00 PM',
      icon: '☕',
      color: '#3B82F6',
    },
    {
      id: 'p1_we_aptitude',
      slot: 'evening',
      subject: 'Aptitude',
      label: 'Full Aptitude Mock (60 min timed)',
      time: '2:00 – 3:00 PM',
      icon: '🧮',
      color: '#F59E0B',
    },
    {
      id: 'p1_we_revision',
      slot: 'evening',
      subject: 'Revision',
      label: 'Weekly Revision + Next Week Planning',
      time: '5:00 – 7:00 PM',
      icon: '📝',
      color: '#EC4899',
    },
  ],
  1: [
    // Phase 2
    {
      id: 'p2_we_dsa',
      slot: 'morning',
      subject: 'DSA',
      label: 'DSA — 3 Problems (Trees / Recursion)',
      time: '6:00 – 8:00 AM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p2_we_sql',
      slot: 'morning',
      subject: 'DBMS',
      label: 'SQL — LeetCode SQL 50 Practice',
      time: '8:00 – 11:00 AM',
      icon: '🗄️',
      color: '#8B5CF6',
    },
    {
      id: 'p2_we_dbms',
      slot: 'morning',
      subject: 'DBMS',
      label: 'DBMS Theory — Normalization / ACID',
      time: '11:00 – 1:00 PM',
      icon: '🗄️',
      color: '#8B5CF6',
    },
    {
      id: 'p2_we_mock',
      slot: 'evening',
      subject: 'Mock',
      label: 'Full Mock Test — Aptitude + Coding',
      time: '3:00 – 5:00 PM',
      icon: '📋',
      color: '#EC4899',
    },
    {
      id: 'p2_we_revision',
      slot: 'evening',
      subject: 'Revision',
      label: 'Weekly Revision + Error Analysis',
      time: '5:00 – 7:00 PM',
      icon: '📝',
      color: '#EC4899',
    },
  ],
  2: [
    // Phase 3
    {
      id: 'p3_we_dsa',
      slot: 'morning',
      subject: 'DSA',
      label: 'DSA — 3 Problems (DP / Graphs)',
      time: '6:00 – 8:00 AM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p3_we_mern',
      slot: 'morning',
      subject: 'MERN',
      label: 'MERN — Build Feature / New Concept',
      time: '8:00 – 12:00 PM',
      icon: '⚛️',
      color: '#06B6D4',
    },
    {
      id: 'p3_we_project',
      slot: 'evening',
      subject: 'MERN',
      label: 'Project Work — MERN Portfolio App',
      time: '2:00 – 6:00 PM',
      icon: '🏗️',
      color: '#06B6D4',
    },
    {
      id: 'p3_we_revision',
      slot: 'evening',
      subject: 'Revision',
      label: 'Weekly Revision + OS/CN Basics (1hr)',
      time: '6:00 – 8:00 PM',
      icon: '📝',
      color: '#EC4899',
    },
  ],
  3: [
    // Phase 4
    {
      id: 'p4_we_mock',
      slot: 'morning',
      subject: 'Mock',
      label: 'Full TCS/Infosys Mock Test (timed)',
      time: '6:00 – 8:00 AM',
      icon: '📋',
      color: '#EC4899',
    },
    {
      id: 'p4_we_analysis',
      slot: 'morning',
      subject: 'Mock',
      label: 'Mock Analysis — Every wrong answer',
      time: '8:00 – 10:00 AM',
      icon: '🔍',
      color: '#EC4899',
    },
    {
      id: 'p4_we_project',
      slot: 'morning',
      subject: 'MERN',
      label: 'MERN Project — Polish + Deploy',
      time: '10:00 – 2:00 PM',
      icon: '🏗️',
      color: '#06B6D4',
    },
    {
      id: 'p4_we_resume',
      slot: 'evening',
      subject: 'Revision',
      label: 'Resume Building + LinkedIn Update',
      time: '3:00 – 5:00 PM',
      icon: '📄',
      color: '#F97316',
    },
    {
      id: 'p4_we_dsa',
      slot: 'evening',
      subject: 'DSA',
      label: 'DSA — Company tagged problems (LeetCode)',
      time: '5:00 – 7:00 PM',
      icon: '🧩',
      color: '#10B981',
    },
  ],
  4: [
    // Phase 5
    {
      id: 'p5_we_mock',
      slot: 'morning',
      subject: 'Mock',
      label: 'Full Company Mock Interview (timed)',
      time: '6:00 – 9:00 AM',
      icon: '📋',
      color: '#EC4899',
    },
    {
      id: 'p5_we_dsa',
      slot: 'morning',
      subject: 'DSA',
      label: 'DSA Revision — Weak topics only',
      time: '9:00 – 11:00 AM',
      icon: '🧩',
      color: '#10B981',
    },
    {
      id: 'p5_we_interview',
      slot: 'evening',
      subject: 'Mock',
      label: 'Mock Interview with friend / mirror',
      time: '2:00 – 4:00 PM',
      icon: '🎤',
      color: '#EC4899',
    },
    {
      id: 'p5_we_company',
      slot: 'evening',
      subject: 'Revision',
      label: 'Company Research + HR Prep',
      time: '4:00 – 6:00 PM',
      icon: '🏢',
      color: '#F97316',
    },
    {
      id: 'p5_we_revision',
      slot: 'evening',
      subject: 'Revision',
      label: 'Final Revision + Next Week Planning',
      time: '6:00 – 8:00 PM',
      icon: '📝',
      color: '#EC4899',
    },
  ],
};

const SUBJECTS = [
  'DSA',
  'Java',
  'Aptitude',
  'DBMS',
  'MERN',
  'Mock',
  'Revision',
];
const SUBJECT_COLORS: Record<string, string> = {
  DSA: '#10B981',
  Java: '#3B82F6',
  Aptitude: '#F59E0B',
  DBMS: '#8B5CF6',
  MERN: '#06B6D4',
  Mock: '#EC4899',
  Revision: '#F97316',
};

const PHASES = [
  {
    name: 'Phase 1',
    months: 'Month 1–2',
    focus: 'Java + DSA Basics + Aptitude',
    color: '#3B82F6',
    tip: 'Focus: Build the foundation. Never skip morning slot.',
  },
  {
    name: 'Phase 2',
    months: 'Month 3',
    focus: 'DSA Intermediate + SQL/DBMS',
    color: '#10B981',
    tip: 'Focus: Crack online test rounds. Solve 3 DSA daily.',
  },
  {
    name: 'Phase 3',
    months: 'Month 4',
    focus: 'Hard DSA + MERN Stack Start',
    color: '#F59E0B',
    tip: 'Focus: Technical interview ready. Build your first project.',
  },
  {
    name: 'Phase 4',
    months: 'Month 5',
    focus: 'Mock Tests + Resume + Projects',
    color: '#EC4899',
    tip: 'Focus: Simulation mode. Mock test every Sunday.',
  },
  {
    name: 'Phase 5',
    months: 'Month 6',
    focus: 'Final Sprint + Interview Prep',
    color: '#EF4444',
    tip: 'Focus: Go all in. Company research + HR prep daily.',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
function getDay(): number {
  return new Date().getDay();
}
function isWeekend(): boolean {
  const d = getDay();
  return d === 0 || d === 6;
}
function dayName(): string {
  return [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][getDay()];
}
function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<string>('today');
  const [completed, setCompleted] = useState<
    Record<string, Record<string, boolean>>
  >(() => S.get('completed') || {});
  const [dsaCount, setDsaCount] = useState<number>(
    () => S.get('dsaCount') || 0
  );
  const [dsaInput, setDsaInput] = useState<string>('');
  const [topicsLog, setTopicsLog] = useState<Record<string, TopicEntry[]>>(
    () => S.get('topicsLog') || {}
  );
  const [streak, setStreak] = useState<StreakData>(
    () => S.get('streak') || { count: 0, last: '' }
  );
  const [phase, setPhase] = useState<number>(() => S.get('currentPhase') ?? 0);
  const [weeklyDsa, setWeeklyDsa] = useState<Record<string, number>>(
    () => S.get('weeklyDsa') || {}
  );
  const [confetti, setConfetti] = useState<boolean>(false);
  const [addTopicSubject, setAddTopicSubject] = useState<string>('DSA');
  const [addTopicText, setAddTopicText] = useState<string>('');
  const [showPhaseModal, setShowPhaseModal] = useState<boolean>(false);

  const today = todayKey();
  const todayCompleted: Record<string, boolean> = completed[today] || {};

  // ── Get tasks based on active phase ────────────────────────────────────
  const tasks: Task[] = isWeekend()
    ? PHASE_WEEKEND_TASKS[phase] || PHASE_WEEKEND_TASKS[0]
    : PHASE_WEEKDAY_TASKS[phase] || PHASE_WEEKDAY_TASKS[0];

  const currentPhaseInfo = PHASES[phase];

  // ── Streak logic ────────────────────────────────────────────────────────
  useEffect(() => {
    const allDone =
      tasks.length > 0 && tasks.every((t) => todayCompleted[t.id]);
    if (allDone && streak.last !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().slice(0, 10);
      const newCount = streak.last === yKey ? streak.count + 1 : 1;
      const s: StreakData = { count: newCount, last: today };
      setStreak(s);
      S.set('streak', s);
    }
  }, [todayCompleted]);

  // ── Toggle task ─────────────────────────────────────────────────────────
  const toggleTask = useCallback(
    (id: string) => {
      setCompleted((prev) => {
        const day: Record<string, boolean> = { ...(prev[today] || {}) };
        day[id] = !day[id];
        const next = { ...prev, [today]: day };
        S.set('completed', next);
        if (tasks.every((t) => (t.id === id ? day[id] : day[t.id]))) {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 3000);
        }
        return next;
      });
    },
    [today, tasks]
  );

  // ── DSA count ───────────────────────────────────────────────────────────
  const addDsa = () => {
    const n = parseInt(dsaInput);
    if (!n || n < 0) return;
    const next = dsaCount + n;
    setDsaCount(next);
    S.set('dsaCount', next);
    const wd = { ...weeklyDsa, [today]: (weeklyDsa[today] || 0) + n };
    setWeeklyDsa(wd);
    S.set('weeklyDsa', wd);
    setDsaInput('');
  };

  // ── Topic log ───────────────────────────────────────────────────────────
  const addTopic = () => {
    if (!addTopicText.trim()) return;
    const entry: TopicEntry = {
      subject: addTopicSubject,
      text: addTopicText.trim(),
      date: today,
    };
    const next = {
      ...topicsLog,
      [today]: [...(topicsLog[today] || []), entry],
    };
    setTopicsLog(next);
    S.set('topicsLog', next);
    setAddTopicText('');
  };

  // ── Phase change ────────────────────────────────────────────────────────
  const changePhase = (i: number) => {
    setPhase(i);
    S.set('currentPhase', i);
    setShowPhaseModal(false);
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const last7 = getLast7Days();
  const chartData: ChartDay[] = last7.map((d) => {
    const dc: Record<string, boolean> = completed[d] || {};
    const dayOfWeek = new Date(d).getDay();
    const isWe = dayOfWeek === 0 || dayOfWeek === 6;
    const taskList = isWe
      ? PHASE_WEEKEND_TASKS[phase] || PHASE_WEEKEND_TASKS[0]
      : PHASE_WEEKDAY_TASKS[phase] || PHASE_WEEKDAY_TASKS[0];
    const done = taskList.filter((t) => dc[t.id]).length;
    return {
      day: d.slice(5),
      done,
      total: taskList.length,
      pct: taskList.length ? Math.round((done / taskList.length) * 100) : 0,
      dsa: weeklyDsa[d] || 0,
    };
  });

  const totalTopics = Object.values(topicsLog).flat().length;
  const doneTodayCount = tasks.filter((t) => todayCompleted[t.id]).length;
  const pctToday = tasks.length
    ? Math.round((doneTodayCount / tasks.length) * 100)
    : 0;
  const weekDsaTotal = last7.reduce((a, d) => a + (weeklyDsa[d] || 0), 0);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: '#F8F9FB',
        minHeight: '100vh',
        color: '#1A1A2E',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F8F9FB; }
        .card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04); border: 1px solid #F0F0F5; }
        .task-row { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 12px; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; margin-bottom: 8px; background: #FAFAFA; }
        .task-row:hover { background: #F0F4FF; border-color: #DBEAFE; }
        .task-done { background: #F0FDF4 !important; border-color: #BBF7D0 !important; opacity: 0.8; }
        .checkbox { width: 22px; height: 22px; border-radius: 6px; border: 2px solid #CBD5E1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
        .checkbox-done { background: #10B981; border-color: #10B981; }
        .tab-btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.15s; background: transparent; color: #64748B; font-family: inherit; }
        .tab-active { background: #1A1A2E; color: #fff; }
        .input-row { display: flex; gap: 8px; margin-top: 10px; }
        input[type=number], input[type=text], select { padding: 10px 14px; border-radius: 10px; border: 1px solid #E2E8F0; font-size: 14px; font-family: inherit; background: #F8F9FB; outline: none; color: #1A1A2E; }
        input:focus, select:focus { border-color: #3B82F6; background: #fff; }
        .btn { padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; transition: all 0.15s; }
        .btn-primary { background: #1A1A2E; color: #fff; }
        .btn-primary:hover { background: #2D2D4E; }
        .btn-sm { padding: 7px 14px; font-size: 13px; }
        .progress-bar-bg { background: #F1F5F9; border-radius: 99px; height: 8px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
        .confetti-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 9999; display: flex; align-items: center; justify-content: center; font-size: 80px; animation: fadeOut 3s forwards; }
        @keyframes fadeOut { 0%,60%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.2)} }
        .topic-tag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 99px; font-size: 13px; font-weight: 500; margin: 3px; }
        .slot-header { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #94A3B8; margin: 18px 0 8px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #fff; border-radius: 20px; padding: 28px; width: 100%; max-width: 480px; }
        .phase-select-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; cursor: pointer; border: 2px solid transparent; margin-bottom: 8px; transition: all 0.15s; }
        .phase-select-row:hover { background: #F8F9FB; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 99px; }
        @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr !important; } .stat-grid { grid-template-columns: 1fr 1fr !important; } .tab-btn { padding: 8px 10px; font-size: 13px; } }
      `}</style>

      {confetti && <div className="confetti-overlay">🎉</div>}

      {/* ── PHASE SWITCH MODAL ── */}
      {showPhaseModal && (
        <div className="modal-overlay" onClick={() => setShowPhaseModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
              Switch Phase
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
              Your daily tasks will update automatically based on the phase you
              select.
            </div>
            {PHASES.map((p, i) => (
              <div
                key={i}
                className="phase-select-row"
                style={{
                  border:
                    phase === i ? `2px solid ${p.color}` : '2px solid #F0F0F5',
                  background: phase === i ? p.color + '10' : '#fff',
                }}
                onClick={() => changePhase(i)}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: p.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {p.name} · {p.months}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    {p.focus}
                  </div>
                </div>
                {phase === i && <span style={{ fontSize: 18 }}>✅</span>}
              </div>
            ))}
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 12 }}
              onClick={() => setShowPhaseModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #F0F0F5',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 60,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: '#1A1A2E',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              🎯
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>PlacementOS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#64748B', marginRight: 4 }}>
              🔥 {streak.count}
            </span>
            {['today', 'progress', 'stats'].map((t) => (
              <button
                key={t}
                className={`tab-btn ${tab === t ? 'tab-active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'today'
                  ? 'Today'
                  : t === 'progress'
                  ? 'Progress'
                  : 'Stats'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
        {/* ══════════ TAB: TODAY ══════════ */}
        {tab === 'today' && (
          <div>
            {/* Date + greeting */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                }}
              >
                {new Date().getHours() < 12
                  ? 'Good morning'
                  : new Date().getHours() < 17
                  ? 'Good afternoon'
                  : 'Good evening'}{' '}
                👋
              </div>
              <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                {formatDate()} · {isWeekend() ? 'Weekend' : 'Weekday'}
              </div>
            </div>

            {/* Active Phase Banner */}
            <div
              onClick={() => setShowPhaseModal(true)}
              style={{
                background: `linear-gradient(135deg, ${currentPhaseInfo.color}15, ${currentPhaseInfo.color}30)`,
                border: `1.5px solid ${currentPhaseInfo.color}40`,
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: currentPhaseInfo.color,
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: currentPhaseInfo.color,
                    }}
                  >
                    {currentPhaseInfo.name} — {currentPhaseInfo.months}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      background: currentPhaseInfo.color,
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: 99,
                      fontWeight: 700,
                    }}
                  >
                    ACTIVE
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  {currentPhaseInfo.tip}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#94A3B8',
                  marginLeft: 12,
                  flexShrink: 0,
                }}
              >
                Tap to switch →
              </div>
            </div>

            {/* Today progress card */}
            <div
              className="card"
              style={{
                marginBottom: 16,
                background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D5E 100%)',
                color: '#fff',
                border: 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>
                    TODAY'S PROGRESS
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 700 }}>
                    {pctToday}%
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
                    {doneTodayCount} of {tasks.length} tasks
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>
                    DSA TOTAL
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 700 }}>
                    {dsaCount}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>/ 200 goal</div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 16,
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 99,
                  height: 8,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${pctToday}%`,
                    height: '100%',
                    background: '#10B981',
                    borderRadius: 99,
                    transition: 'width 0.4s',
                  }}
                />
              </div>
            </div>

            {/* Quick stats */}
            <div
              className="stat-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 12,
                marginBottom: 16,
              }}
            >
              {[
                {
                  val: `🔥 ${streak.count}`,
                  label: 'Day Streak',
                  color: '#F59E0B',
                },
                { val: weekDsaTotal, label: 'DSA this week', color: '#10B981' },
                { val: totalTopics, label: 'Topics logged', color: '#8B5CF6' },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    borderRadius: 14,
                    padding: 16,
                    border: '1px solid #F0F0F5',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{ fontSize: 22, fontWeight: 700, color: s.color }}
                  >
                    {s.val}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
              className="grid-2"
            >
              {/* Tasks */}
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                  📅 {dayName()}'s Tasks
                </div>
                <div
                  style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}
                >
                  {currentPhaseInfo.name} ·{' '}
                  {isWeekend() ? 'Weekend' : 'Weekday'}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: currentPhaseInfo.color,
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {currentPhaseInfo.focus}
                </div>

                {['morning', 'evening'].map((slot) => {
                  const slotTasks = tasks.filter((t) => t.slot === slot);
                  if (!slotTasks.length) return null;
                  return (
                    <div key={slot}>
                      <div className="slot-header">
                        {slot === 'morning' ? '🌅 Morning' : '🌆 Evening'}
                      </div>
                      {slotTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`task-row ${
                            todayCompleted[t.id] ? 'task-done' : ''
                          }`}
                          onClick={() => toggleTask(t.id)}
                        >
                          <div
                            className={`checkbox ${
                              todayCompleted[t.id] ? 'checkbox-done' : ''
                            }`}
                          >
                            {todayCompleted[t.id] && (
                              <svg width="12" height="12" viewBox="0 0 12 12">
                                <polyline
                                  points="1.5,6 4.5,9 10.5,3"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  fill="none"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 500,
                                textDecoration: todayCompleted[t.id]
                                  ? 'line-through'
                                  : 'none',
                                color: todayCompleted[t.id]
                                  ? '#94A3B8'
                                  : '#1A1A2E',
                              }}
                            >
                              {t.icon} {t.label}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: '#94A3B8',
                                marginTop: 2,
                              }}
                            >
                              {t.time}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: 99,
                              background: SUBJECT_COLORS[t.subject] + '20',
                              color: SUBJECT_COLORS[t.subject],
                              flexShrink: 0,
                            }}
                          >
                            {t.subject}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {pctToday === 100 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '16px 0 4px',
                      color: '#10B981',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    ✅ All done! Amazing work!
                  </div>
                )}
              </div>

              {/* Right column */}
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* DSA counter */}
                <div className="card">
                  <div
                    style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}
                  >
                    🧩 DSA Counter
                  </div>
                  <div
                    style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}
                  >
                    {dsaCount} / 200 problems solved
                  </div>
                  <div className="progress-bar-bg" style={{ marginBottom: 12 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min((dsaCount / 200) * 100, 100)}%`,
                        background: '#10B981',
                      }}
                    />
                  </div>
                  <div className="input-row">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      placeholder="Problems today"
                      value={dsaInput}
                      onChange={(e) => setDsaInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addDsa()}
                      style={{ width: '100%' }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={addDsa}>
                      +Add
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
                    {dsaCount >= 200
                      ? '🏆 Goal reached!'
                      : `${200 - dsaCount} left to reach 200`}
                  </div>
                </div>

                {/* Topic log */}
                <div className="card">
                  <div
                    style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}
                  >
                    📚 Log Today's Topic
                  </div>
                  <select
                    value={addTopicSubject}
                    onChange={(e) => setAddTopicSubject(e.target.value)}
                    style={{ width: '100%', marginBottom: 8 }}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <div className="input-row">
                    <input
                      type="text"
                      placeholder="e.g. Binary Search patterns"
                      value={addTopicText}
                      onChange={(e) => setAddTopicText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={addTopic}
                    >
                      Log
                    </button>
                  </div>
                  {topicsLog[today]?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      {topicsLog[today].map((tp, i) => (
                        <span
                          key={i}
                          className="topic-tag"
                          style={{
                            background: SUBJECT_COLORS[tp.subject] + '18',
                            color: SUBJECT_COLORS[tp.subject],
                          }}
                        >
                          <b>{tp.subject}</b>: {tp.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phase quick info */}
                <div
                  className="card"
                  style={{
                    background: `linear-gradient(135deg, ${currentPhaseInfo.color}10, ${currentPhaseInfo.color}20)`,
                    border: `1px solid ${currentPhaseInfo.color}30`,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 8,
                      color: currentPhaseInfo.color,
                    }}
                  >
                    📍 {currentPhaseInfo.name} Focus
                  </div>
                  <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>
                    {currentPhaseInfo.tip}
                  </div>
                  <button
                    onClick={() => setShowPhaseModal(true)}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 12, width: '100%' }}
                  >
                    Switch Phase
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ TAB: PROGRESS ══════════ */}
        {tab === 'progress' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                }}
              >
                Your Progress 📈
              </div>
              <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                Consistency + topics covered + DSA growth
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 20,
              }}
              className="grid-2"
            >
              <div
                className="card"
                style={{
                  background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
                  border: '1px solid #FDE68A',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#92400E',
                    marginBottom: 8,
                  }}
                >
                  🔥 STREAK
                </div>
                <div
                  style={{ fontSize: 48, fontWeight: 800, color: '#D97706' }}
                >
                  {streak.count}
                </div>
                <div style={{ fontSize: 14, color: '#92400E', marginTop: 4 }}>
                  consecutive days
                </div>
                <div style={{ fontSize: 12, color: '#A16207', marginTop: 8 }}>
                  {streak.count === 0
                    ? 'Complete all tasks to start!'
                    : streak.count < 7
                    ? 'Keep going! 7 days = 1 week 💪'
                    : streak.count < 30
                    ? "You're on fire 🔥"
                    : 'Legendary! 🏆'}
                </div>
              </div>
              <div
                className="card"
                style={{
                  background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                  border: '1px solid #BBF7D0',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#14532D',
                    marginBottom: 8,
                  }}
                >
                  🧩 DSA PROBLEMS
                </div>
                <div
                  style={{ fontSize: 48, fontWeight: 800, color: '#16A34A' }}
                >
                  {dsaCount}
                </div>
                <div style={{ fontSize: 14, color: '#14532D', marginTop: 4 }}>
                  out of 200 goal
                </div>
                <div className="progress-bar-bg" style={{ marginTop: 10 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min((dsaCount / 200) * 100, 100)}%`,
                      background: '#16A34A',
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: '#166534', marginTop: 6 }}>
                  {Math.round((dsaCount / 200) * 100)}% complete
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                📅 Last 7 Days — Task Completion
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
                Percentage of tasks completed per day
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F1F5F9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v: unknown) => [`${v}%`, 'Completion']}
                    contentStyle={{
                      border: '1px solid #F0F0F5',
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.pct === 100
                            ? '#10B981'
                            : entry.pct >= 60
                            ? '#3B82F6'
                            : entry.pct > 0
                            ? '#F59E0B'
                            : '#E2E8F0'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                📚 Topics Learned Log
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
                {totalTopics} total topics logged
              </div>
              {Object.keys(topicsLog).length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#94A3B8',
                    fontSize: 14,
                    padding: '24px 0',
                  }}
                >
                  No topics logged yet. Go to Today and start! 📝
                </div>
              ) : (
                Object.entries(topicsLog)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .slice(0, 14)
                  .map(([date, topics]) => (
                    <div key={date} style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#94A3B8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: 6,
                        }}
                      >
                        {date}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {topics.map((tp, i) => (
                          <span
                            key={i}
                            className="topic-tag"
                            style={{
                              background: SUBJECT_COLORS[tp.subject] + '18',
                              color: SUBJECT_COLORS[tp.subject],
                            }}
                          >
                            <b>{tp.subject}</b>: {tp.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                🎯 Topics by Subject
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
                What you've been studying most
              </div>
              {SUBJECTS.map((s) => {
                const count = Object.values(topicsLog)
                  .flat()
                  .filter((t) => t.subject === s).length;
                const max = Math.max(
                  ...SUBJECTS.map(
                    (sub) =>
                      Object.values(topicsLog)
                        .flat()
                        .filter((t) => t.subject === sub).length
                  ),
                  1
                );
                return (
                  <div key={s} style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{s}</span>
                      <span style={{ fontSize: 13, color: '#64748B' }}>
                        {count}
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${(count / max) * 100}%`,
                          background: SUBJECT_COLORS[s],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ TAB: STATS ══════════ */}
        {tab === 'stats' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                }}
              >
                Stats & Charts 📊
              </div>
              <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                Weekly trends and roadmap overview
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                🧩 DSA Problems — Last 7 Days
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
                Target: 2–3 problems per day
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F1F5F9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      border: '1px solid #F0F0F5',
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dsa"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }}
                    name="Problems"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 20,
              }}
              className="grid-2"
            >
              <div className="card">
                <div
                  style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}
                >
                  📈 WEEKLY AVG
                </div>
                <div
                  style={{ fontSize: 32, fontWeight: 800, color: '#1A1A2E' }}
                >
                  {chartData.length
                    ? Math.round(
                        chartData.reduce((a, d) => a + d.pct, 0) /
                          chartData.length
                      )
                    : 0}
                  %
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  task completion rate
                </div>
              </div>
              <div className="card">
                <div
                  style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}
                >
                  🧩 THIS WEEK
                </div>
                <div
                  style={{ fontSize: 32, fontWeight: 800, color: '#10B981' }}
                >
                  {weekDsaTotal}
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  DSA problems
                </div>
              </div>
            </div>

            {/* Roadmap Timeline */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                🗺️ 6-Month Roadmap
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>
                Tap a phase to switch your active tasks
              </div>
              {PHASES.map((p, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', gap: 14, cursor: 'pointer' }}
                  onClick={() => changePhase(i)}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: phase >= i ? p.color : '#E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        color: phase >= i ? '#fff' : '#94A3B8',
                        flexShrink: 0,
                      }}
                    >
                      {phase > i ? '✓' : i + 1}
                    </div>
                    {i < PHASES.length - 1 && (
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          background: phase > i ? p.color : '#E2E8F0',
                          minHeight: 28,
                          margin: '4px 0',
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      paddingBottom: i < PHASES.length - 1 ? 20 : 0,
                      paddingTop: 6,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: phase >= i ? '#1A1A2E' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {p.name} · {p.months}
                      {phase === i && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: p.color,
                            background: p.color + '20',
                            padding: '2px 8px',
                            borderRadius: 99,
                          }}
                        >
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div
                      style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}
                    >
                      {p.focus}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Snapshot */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #1A1A2E, #2D2D5E)',
                color: '#fff',
                border: 'none',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 16,
                  opacity: 0.9,
                }}
              >
                💡 Your Snapshot
              </div>
              {[
                {
                  label: 'DSA progress',
                  value: `${dsaCount}/200`,
                  pct: Math.min(dsaCount / 200, 1),
                  color: '#10B981',
                },
                {
                  label: 'Streak',
                  value: `${streak.count} days`,
                  pct: Math.min(streak.count / 30, 1),
                  color: '#F59E0B',
                },
                {
                  label: 'Topics logged',
                  value: `${totalTopics}`,
                  pct: Math.min(totalTopics / 100, 1),
                  color: '#8B5CF6',
                },
              ].map((item) => (
                <div key={item.label} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 13, opacity: 0.8 }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {item.value}
                    </span>
                  </div>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      borderRadius: 99,
                      height: 6,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${item.pct * 100}%`,
                        height: '100%',
                        background: item.color,
                        borderRadius: 99,
                        transition: 'width 0.4s',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div
                style={{
                  marginTop: 16,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  fontSize: 13,
                  lineHeight: 1.6,
                  opacity: 0.85,
                }}
              >
                {dsaCount >= 200
                  ? '🏆 DSA goal smashed! Ready for placements!'
                  : streak.count >= 7
                  ? '🔥 Week-long streak! Real habit forming.'
                  : streak.count > 0
                  ? `💪 ${streak.count}-day streak. Don't break the chain!`
                  : 'Start today. Complete tasks to begin your streak.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
