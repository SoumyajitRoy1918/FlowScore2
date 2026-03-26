import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Activity, Shield, Zap, TrendingUp, CheckCircle2, 
  XCircle, Database, Users, GraduationCap, Briefcase, 
  ArrowRight, Lock, PieChart, LineChart, Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LineWaves from '../components/LineWaves/LineWaves';

const SpillText = ({ text, delayOffset = 0 }: { text: string; delayOffset?: number }) => {
  let globalCharIndex = 0;
  return (
    <>
      {text.split(" ").map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.25em] mb-2 md:mb-0">
          {word.split("").map((char, charIdx) => {
            const delay = delayOffset + (globalCharIndex * 0.04);
            globalCharIndex++;
            return (
              <motion.span 
                key={charIdx} 
                initial={{ opacity: 0, y: -30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 15, delay }}
                className="inline-block"
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-lg">
            <img src="/favicon.png" alt="FlowScore" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">FlowScore</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <a href="#how" className="hover:text-white transition-colors">How it Works</a>
          <a href="#compare" className="hover:text-white transition-colors">Compare</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#usecases" className="hover:text-white transition-colors">Use Cases</a>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[110vh] flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-zinc-300">The Next Generation of Credit Scoring</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-zinc-500 tracking-tight leading-[1.1] mb-8">
          <div className="block">
            <SpillText text="Your Financial Life is" delayOffset={0.1} />
          </div>
          <div className="block mt-2 text-white">
            <SpillText text="More Than a Number." delayOffset={0.8} />
          </div>
        </h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed mb-12"
        >
          FlowScore analyzes your real financial behavior — not just loans — to give you a smarter, fairer credit score.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#0a192f]/30 backdrop-blur-2xl border-t border-l border-[#e6d5b8]/50 border-r border-b border-[#e6d5b8]/20 text-[#e6d5b8] font-semibold text-lg hover:bg-[#0a192f]/50 hover:shadow-[0_0_40px_rgba(230,213,184,0.2)] transition-all flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            Check Your FlowScore
            <ArrowRight size={20} />
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('how');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            See How It Works
          </button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, type: 'spring' }}
        className="w-full max-w-5xl mx-auto mt-20 relative z-10"
      >
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="rounded-xl bg-zinc-950 border border-white/5 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 pb-8 md:pb-0">
              <p className="text-zinc-500 font-medium mb-4 uppercase tracking-widest text-sm">Target FlowScore</p>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-purple-600">
                784
              </div>
              <p className="text-emerald-400 text-sm font-medium mt-4 flex items-center gap-1">
                <TrendingUp size={16} /> +24 points this month
              </p>
            </div>
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
              {[ { label: 'Spending Health', value: 'Excellent', icon: PieChart, color: 'text-blue-400' },
                 { label: 'Income Stability', value: 'High', icon: LineChart, color: 'text-purple-400' },
                 { label: 'Bills consistency', value: '98%', icon: CheckCircle2, color: 'text-emerald-400' },
                 { label: 'Savings Rate', value: '22%', icon: Database, color: 'text-amber-400' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-md rounded-lg p-4 flex flex-col justify-between border border-white/[0.05]">
                  <div className="flex items-center gap-2 text-zinc-400 mb-4">
                    <stat.icon size={16} />
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const FactorScroller = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const x = useTransform(smoothProgress, [0, 1], ["0%", "-83.33%"]);

  const factors = [
    {
      title: "Spending Patterns",
      desc: "Our AI dissects every transaction to distinguish between impulsive splurges and disciplined budgeting. We see your consistency.",
      color: "from-blue-500 to-cyan-500",
      icon: <PieChart size={120} />,
      visual: (
        <div className="w-full h-64 relative flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="relative"
          >
            <div className="w-48 h-48 rounded-full border-8 border-blue-500/20 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-cyan-500/40 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]" />
              </div>
            </div>
            {/* Floating data dots */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                   y: [0, -20, 0],
                   x: [0, Math.sin(i) * 20, 0],
                   opacity: [0.2, 1, 0.2]
                }}
                transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                className="absolute w-2 h-2 rounded-full bg-cyan-400"
                style={{ 
                   top: `${50 + Math.cos(i * 60) * 40}%`, 
                   left: `${50 + Math.sin(i * 60) * 40}%` 
                }}
              />
            ))}
          </motion.div>
        </div>
      )
    },
    {
      title: "Savings Consistency",
      desc: "It's not about how much you save, but how often. FlowScore rewards the habit of building resilience month over month.",
      color: "from-purple-500 to-indigo-500",
      icon: <TrendingUp size={120} />,
      visual: (
        <div className="w-full h-64 flex items-end justify-center gap-3 px-10">
          {[40, 65, 45, 80, 55, 95, 75].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className="w-8 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-lg shadow-[0_0_20px_rgba(129,140,248,0.3)]"
            />
          ))}
        </div>
      )
    },
    {
      title: "Income Stability",
      desc: "Whether you're a freelancer or a full-time professional, our engine recognizes the rhythm of your cash flow with deep learning.",
      color: "from-emerald-500 to-teal-500",
      icon: <Database size={120} />,
      visual: (
        <div className="w-full h-64 flex items-center justify-center">
          <svg width="300" height="150" viewBox="0 0 300 150">
            <motion.path
              d="M0,75 Q75,25 150,75 T300,75"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            {[10, 150, 290].map((x, i) => (
              <motion.circle
                key={i}
                cx={x}
                cy="75"
                r="6"
                fill="#10b981"
                animate={{ r: [6, 10, 6], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
              />
            ))}
          </svg>
        </div>
      )
    },
    {
      title: "Bill Payments",
      desc: "Rent, electricity, and subscriptions speak louder than credit card debt. We track your commitment to your essential life costs.",
      color: "from-amber-500 to-orange-500",
      icon: <CheckCircle2 size={120} />,
      visual: (
        <div className="w-full max-w-xs space-y-4">
          {[1, 2, 3].map(i => (
            <motion.div 
              key={i}
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
              <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, delay: i * 0.3 }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: "Flow Connections",
      desc: "Securely link your bank, UPI, and apps. Our AI constructs your financial galaxy in real-time, delivering a score that truly represents you.",
      color: "from-blue-600 to-purple-600",
      icon: <Zap size={120} />,
      visual: (
        <div className="relative w-48 h-48">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap size={48} className="text-blue-400 animate-pulse" />
          </div>
          {[0, 120, 240].map(angle => (
            <motion.div
              key={angle}
              className="absolute w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/40"
              animate={{ 
                rotate: -360,
                x: Math.cos(angle * Math.PI / 180) * 80,
                y: Math.sin(angle * Math.PI / 180) * 80
              }}
              style={{ top: '40%', left: '40%' }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Database size={20} />
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: "Your FlowScore",
      desc: "Deep insights. Real-time updates. Fair assessment. This is your financial freedom, quantified and qualified.",
      color: "from-white to-zinc-500",
      icon: <Activity size={120} />,
      visual: (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-600 mb-4"
          >
            784
          </motion.div>
          <div className="px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold tracking-widest uppercase text-sm">
            Elite Status
          </div>
        </div>
      )
    }
  ];

  return (
    <div id="how" ref={containerRef} className="relative h-[600vh] bg-black">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        <motion.div style={{ x, willChange: "transform" }} className="flex">
          {factors.map((factor, i) => (
            <section key={i} className="w-screen h-screen flex-shrink-0 flex items-center justify-center px-6 md:px-20 relative overflow-hidden">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br ${factor.color} opacity-[0.03] blur-[120px] rounded-full`} />
              
              <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center z-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="text-white/30 font-black text-2xl uppercase tracking-tighter"
                    >
                      Factor 0{i+1}
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="text-6xl md:text-9xl font-black leading-none tracking-tighter"
                    >
                      <span className={`text-transparent bg-clip-text bg-gradient-to-br ${factor.color}`}>
                        {factor.title.split(" ")[0]}
                      </span>
                      <br/>
                      <span className="text-white">{factor.title.split(" ")[1] || ""}</span>
                    </motion.h2>
                  </div>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-xl md:text-2xl text-zinc-400 max-w-xl leading-relaxed font-light"
                  >
                    {factor.desc}
                  </motion.p>
                </div>

                <div className="flex items-center justify-center p-10 bg-transparent border border-white/5 rounded-[4rem] min-h-[500px] relative">
                  {factor.visual}
                </div>
              </div>
            </section>
          ))}
        </motion.div>
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex gap-3">
        {factors.map((_, i) => {
          const start = i / factors.length;
          const end = (i + 1) / factors.length;
          const scaleX = useTransform(smoothProgress, [start, end], [0, 1], { clamp: true });
          
          return (
            <div key={i} className="w-12 h-1 bg-white/10 rounded-full relative overflow-hidden">
              <motion.div style={{ scaleX }} className="absolute inset-0 bg-blue-500 origin-left" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Comparison = () => (
  <section id="compare" className="py-32 px-6 bg-zinc-950 border-y border-white/5">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-black mb-6">Why FlowScore is Different</h2>
        <p className="text-xl text-zinc-400">Traditional scores look backwards. FlowScore looks at reality.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 rounded-3xl bg-zinc-900 border border-red-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px]" />
          <h3 className="text-2xl font-bold text-zinc-400 mb-8 flex items-center gap-3">
            <XCircle className="text-red-400" /> Traditional (e.g. CIBIL)
          </h3>
          <ul className="space-y-6">
            {[
              "Based only on loans & credit cards",
              "Ignores daily financial behavior",
              "Excludes young users / no-credit users",
              "Static and slow to update"
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4 text-zinc-400">
                <XCircle size={20} className="shrink-0 mt-1 opacity-50" />
                <span className="text-lg">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-10 rounded-3xl bg-gradient-to-b from-blue-900/20 to-purple-900/10 border border-blue-500/30 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <CheckCircle2 className="text-blue-400" /> FlowScore
          </h3>
          <ul className="space-y-6">
            {[
              "Uses real-time financial activity",
              "Includes everyone (students, freelancers, etc.)",
              "Provides AI-driven actionable insights",
              "Dynamic and constantly updated"
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4 text-white">
                <CheckCircle2 size={20} className="text-blue-400 shrink-0 mt-1" />
                <span className="text-lg font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const FeaturesAndUseCases = () => (
  <section id="features" className="py-32 px-6 relative">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">Powerful Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
        {[
          { icon: Activity, title: "Real-time Tracking", desc: "Monitor your score dynamically as your financial behavior happens." },
          { icon: Zap, title: "Personalized Insights", desc: "Understand exactly what moves your score up or down." },
          { icon: TrendingUp, title: "Smart Recommendations", desc: "Actionable steps to quickly improve your credit profile." },
          { icon: Shield, title: "Risk Analysis", desc: "AI-powered risk detection protecting your financial health." }
        ].map((feature, i) => (
          <div key={i} className="p-8 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-blue-500/30 transition-colors group">
            <feature.icon size={28} className="text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold mb-2 text-white">{feature.title}</h4>
            <p className="text-base text-zinc-300 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      <h2 id="usecases" className="text-4xl md:text-5xl font-black mb-16 text-center">Built for Everyone</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: GraduationCap, title: "Students", desc: "Start building your first financial identity without risking debt traps." },
          { icon: Briefcase, title: "Freelancers", desc: "Get credit for your irregular income and solid saving habits." },
          { icon: Users, title: "Young Professionals", desc: "Unlock premium loans and cards without 5 years of credit history." },
          { icon: Building2, title: "Modern Lenders", desc: "Assess risk with 10x more accuracy and expand your approved user base." }
        ].map((uc, i) => (
          <div key={i} className="flex gap-6 p-8 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.05] items-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <uc.icon size={28} className="text-blue-400" />
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2 text-white">{uc.title}</h4>
              <p className="text-white text-lg font-semibold leading-snug">{uc.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const SecurityAndCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="relative px-6 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-black border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] pointer-events-none" />
          
          <Lock className="w-16 h-16 text-blue-400 mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white leading-tight">
            Privacy-First Architecture. <br/>
            Bank-Grade Security.
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-16">
            Your flow, your data. FlowScore operates on strict user consent with end-to-end encryption.
          </p>
          
          <div className="border-t border-white/10 pt-16 mt-8">
            <h2 className="text-4xl md:text-6xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Start Building Your Real Credit Score Today
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-colors shadow-xl"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 border-t border-white/5 bg-black/50 backdrop-blur-md">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
          <img src="/favicon.png" alt="FlowScore" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">FlowScore</span>
      </div>
      <p className="text-sm text-zinc-500">© 2026 FlowScore Inc. All rights reserved.</p>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="bg-transparent text-white relative font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0">
        <LineWaves
          speed={0.15}
          innerLineCount={25}
          outerLineCount={35}
          warpIntensity={1.2}
          rotation={-20}
          edgeFadeWidth={0.2}
          colorCycleSpeed={0.5}
          brightness={0.5}
          color1="#3b82f6"
          color2="#8b5cf6"
          color3="#ffffff"
          enableMouseInteraction={true}
          mouseInfluence={2.5}
        />
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <FactorScroller />
          <Comparison />
          <FeaturesAndUseCases />
          <SecurityAndCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
