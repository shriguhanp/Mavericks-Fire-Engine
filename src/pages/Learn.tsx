import { BookOpen, TrendingUp, Shield, Target, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Learn() {
  const topics = [
    {
      title: "What is FIRE?",
      desc: "Financial Independence, Retire Early (FIRE) is a movement with the goal of gaining financial freedom and the option to retire far earlier than traditional budgets and retirement plans allow.",
      icon: Target,
      color: "text-orange-500"
    },
    {
      title: "The 4% Rule",
      desc: "A rule of thumb used to determine how much you can withdraw from your retirement savings each year. If you can live on 4% of your investment portfolio, you are financially independent.",
      icon: TrendingUp,
      color: "text-blue-500"
    },
    {
      title: "Asset Allocation",
      desc: "Balancing your investments between Equity (high return, high risk) and Debt (stable return, low risk) based on when you need the money.",
      icon: Lightbulb,
      color: "text-yellow-500"
    },
    {
      title: "Risk & Insurance",
      desc: "Protecting your wealth is just as important as growing it. Adequate Health and Life insurance ensures your FIRE journey isn't derailed by emergencies.",
      icon: Shield,
      color: "text-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white pt-36 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-hidden pb-20 transition-colors duration-300">
      
      {/* Background Deep Blue Glow */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-600/30 blur-[150px] rounded-[100%] pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">
            Master the <span className="text-blue-600 dark:text-blue-400">FIRE</span> Framework
          </h1>
          <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">Everything you need to know about achieving Financial Independence and early retirement in India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {topics.map((topic, i) => (
            <div key={i} className="bg-white dark:bg-[#111111]/60 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 hover:bg-slate-50 dark:hover:bg-[#111]/80 shadow-sm transition-all duration-300 group">
              <topic.icon className={`w-10 h-10 mb-6 ${topic.color} group-hover:scale-110 transition-transform`} />
              <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{topic.title}</h2>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed font-light">{topic.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:from-blue-900/50 dark:to-purple-900/50 border border-blue-200 dark:border-white/10 rounded-3xl p-10 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Ready to start planning?</h2>
          <p className="text-xl text-slate-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Our AI Agent will guide you step-by-step to create your personalized path to financial freedom.
          </p>
          <Link 
            to="/agent"
            className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Conversation
          </Link>
        </div>
      </div>
    </div>
  );
}
