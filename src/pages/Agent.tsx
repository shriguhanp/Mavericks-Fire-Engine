import { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import useFireStore from '../store/useFireStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type Message = {
  id: string;
  role: 'agent' | 'user';
  content: string;
};

export default function Agent() {
  const { userData, updateUserData, setFirePlan } = useFireStore();
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const steps = [
    { key: 'name', question: "Hi! I'm your FIRE AI Agent. What's your name?", type: 'text', placeholder: "e.g. Rahul" },
    { key: 'age', question: "Great! How old are you?", type: 'number', placeholder: "e.g. 28" },
    { key: 'monthlyIncome', question: "What is your monthly income (₹)?", type: 'number', placeholder: "e.g. 150000" },
    { key: 'monthlyExpenses', question: "What are your monthly expenses (₹)?", type: 'number', placeholder: "e.g. 80000" },
    { key: 'currentSavings', question: "How much savings/investments do you have right now (₹)?", type: 'number', placeholder: "e.g. 1000000" },
    { key: 'retirementAge', question: "At what age do you want to retire?", type: 'number', placeholder: "e.g. 45" },
    { key: 'desiredMonthlyDraw', question: "How much monthly income (in today's value) do you want after retirement (₹)?", type: 'number', placeholder: "e.g. 150000" },
    { key: 'inflationRate', question: "What inflation rate should we assume (%)?", type: 'number', placeholder: "e.g. 6" },
    { key: 'taxRegime', question: "Which tax regime do you currently follow?", type: 'text', placeholder: "old or new" },
    { key: 'section80C', question: "What are your annual tax-deductible investments (Section 80C)?", type: 'number', placeholder: "e.g. 150000" },
  ];

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'agent', content: steps[0].question }
  ]);

  // Auto-scroll removed per user request
  /*
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  */

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const currentStep = steps[step];
    const userMessage = inputValue.trim();
    
    // 1. Add User message to chat
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    
    // 2. Save value to global store
    updateUserData({ [currentStep.key]: currentStep.type === 'number' ? Number(userMessage) : userMessage });
    
    // Clear input
    setInputValue('');

    // 3. Trigger Agent response or finalize
    if (step < steps.length - 1) {
      const nextStepIndex = step + 1;
      setStep(nextStepIndex);
      
      // Simulate slight typing delay for realism
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now().toString() + '1', 
          role: 'agent', 
          content: steps[nextStepIndex].question 
        }]);
      }, 600);
      
    } else {
      // Final submission
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: 'generating', 
          role: 'agent', 
          content: "Got it! I am analyzing your inputs and generating your personalized FIRE roadmap. This might take a few seconds..." 
        }]);
        setIsGenerating(true);
        generatePlan({ ...userData, [currentStep.key]: userMessage }); // pass updated data immediately
      }, 600);
    }
  };

  const generatePlan = async (finalData: any) => {
    try {
      const payload = {
        name: finalData.name,
        age: Number(finalData.age),
        monthly_income: Number(finalData.monthlyIncome),
        monthly_expenses: Number(finalData.monthlyExpenses),
        current_savings: Number(finalData.currentSavings),
        retirement_age: Number(finalData.retirementAge),
        desired_monthly_draw: Number(finalData.desiredMonthlyDraw),
        inflation_rate: Number(finalData.inflationRate),
        tax_regime: (finalData.taxRegime || 'new').toLowerCase(),
        section_80c_investments: Number(finalData.section80C || 0)
      };

      const response = await axios.post('http://localhost:8000/api/chat', payload);
      setFirePlan(response.data);
      navigate('/history');
    } catch (error) {
      console.error("Error generating plan:", error);
      setMessages(prev => [...prev, { 
        id: 'error', 
        role: 'agent', 
        content: "Uh oh! Failed to generate your FIRE plan. Make sure the backend server is running." 
      }]);
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white pt-28 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-hidden pb-10 transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-600/20 blur-[150px] rounded-[100%] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-3xl flex-1 flex flex-col h-[calc(100vh-140px)] max-h-[900px]">
        
        {/* Chat Interface Container */}
        <div className="flex-1 flex flex-col bg-white/80 dark:bg-[#111111]/80 border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-black/5 dark:border-white/10 bg-slate-50/50 dark:bg-[#1A1A1A]/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-slate-50 dark:bg-[#111] rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">FIRE Agent</h2>
              <p className="text-slate-500 dark:text-gray-400 text-xs">Always active</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Agent Avatar */}
                {msg.role === 'agent' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div 
                  className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                      : 'bg-slate-100 dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 text-slate-800 dark:text-gray-200 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Generating Indicator */}
            {isGenerating && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <div className="bg-slate-100 dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 text-slate-500 dark:text-gray-400 px-5 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-50/80 dark:bg-[#1A1A1A]/80 border-t border-black/5 dark:border-white/10">
            <div className="relative flex items-center max-w-4xl mx-auto">
              <input
                type={currentStep?.type || 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isGenerating ? "Analyzing..." : currentStep?.placeholder || "Type your answer..."}
                disabled={isGenerating}
                className="w-full bg-white dark:bg-[#222222] border border-black/10 dark:border-white/10 rounded-full pl-6 pr-14 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 transition-colors shadow-sm disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isGenerating}
                className="absolute right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-gray-700 disabled:text-slate-100 dark:disabled:text-gray-400 rounded-full flex items-center justify-center transition-all shadow-md"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            {/* Progress Bar */}
            <div className="mt-4 px-2 hidden sm:block">
              <div className="flex gap-1.5 w-full h-1">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-full flex-1 transition-colors duration-500 ${
                      i < step ? 'bg-blue-600 dark:bg-blue-500 shadow-sm' 
                      : i === step && !isGenerating ? 'bg-blue-300 dark:bg-blue-400/60' 
                      : isGenerating ? 'bg-blue-600 dark:bg-blue-500' 
                      : 'bg-black/5 dark:bg-white/10'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
