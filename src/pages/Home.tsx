import { Link } from 'react-router-dom';
import { Star, Lock, Globe, Cloud } from 'lucide-react';

export default function Home() {
  const stats = [
    { value: "45 yrs", label: "Avg FIRE age in India", icon: Cloud },
    { value: "₹5-8 Cr", label: "Typical corpus needed", icon: Cloud },
    { value: "2.3%", label: "Indians on FIRE path", icon: Cloud },
    { value: "15-20 yrs", label: "Average time to FIRE", icon: Cloud }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white font-sans selection:bg-blue-500/30 overflow-hidden relative flex flex-col items-center transition-colors duration-300">
      
      {/* Background Glows */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-400/20 dark:bg-blue-600/40 blur-[150px] rounded-[100%] pointer-events-none z-0" />

      {/* Earth Arc - Adjusted for theme */}
      <div className="absolute top-[28%] sm:top-[32%] left-1/2 -translate-x-1/2 w-[180%] md:w-[150%] xl:w-[120%] h-[1000px] rounded-[100%] pointer-events-none z-0 border-t border-blue-200/50 dark:border-blue-400/30 shadow-[0_-20px_60px_rgba(59,130,246,0.05)] dark:shadow-[0_-20px_60px_rgba(59,130,246,0.15)] bg-slate-50 dark:bg-[#070707]">
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto pt-40 px-4 flex flex-col items-center text-center">
        
        {/* Main Heading & Subtitle */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
          Calculate your path to FIRE
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          Discover when you can achieve Financial Independence and Retire Early in India. 
          Learn how global investing can <span className="text-blue-600 dark:text-blue-400 font-medium">accelerate your journey</span> by 3-5 years.
        </p>

        {/* Small Badges / Trust Markers */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-sm text-slate-500 dark:text-gray-300 mb-12">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> 
            <span>50,000+ Users</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" /> 
            <span>Bank-Grade Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" /> 
            <span>Global Markets</span>
          </div>
        </div>

        {/* Get Started Button */}
        <div className="mb-16 mt-8 z-20">
          <Link
            to="/agent"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white transition-all bg-blue-600 rounded-full hover:bg-blue-700 dark:hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)] dark:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] dark:hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1"
          >
            Get Started
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl px-4 z-20 pb-32">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i} 
                className="relative overflow-hidden rounded-[2rem] bg-white/70 dark:bg-[#111111]/40 backdrop-blur-xl border border-black/5 dark:border-white/10 p-10 hover:border-blue-500/30 dark:hover:border-white/20 hover:bg-white/90 dark:hover:bg-[#111111]/60 transition-all duration-300 flex flex-col items-center text-center group shadow-sm dark:shadow-none"
              >
                {/* Subtle top glare inside the card */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 dark:via-white/20 to-transparent" />
                
                <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                
                <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight drop-shadow-sm">
                  {stat.value}
                </div>
                <div className="text-base text-slate-500 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
