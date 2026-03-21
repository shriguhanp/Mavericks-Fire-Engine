import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Slider } from "./ui/slider";
import { NumberInput } from "./ui/number-input";
import { formatCurrency } from "../lib/utils";
import { auth, db } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  Globe, 
  ChevronDown, 
  Clock, 
  Calendar, 
  DollarSign, 
  Star, 
  Lock, 
  Target,
  CloudUpload,
  TreePine,
  MessageCircle,
  X,
  Sun,
  Moon,
  Twitter,
  Linkedin,
  Github,
  Sparkles,
  Download,
  Copy,
  Check
} from "lucide-react";

export default function FireCalculator() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Ensure user document exists
          await setDoc(doc(db, "users", currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            createdAt: serverTimestamp()
          }, { merge: true });

          // Load saved calculation
          const calcDoc = await getDoc(doc(db, "calculations", currentUser.uid));
          if (calcDoc.exists()) {
            const data = calcDoc.data();
            setCurrentAge(data.currentAge);
            setRetirementAge(data.retirementAge);
            setMonthlyExpenses(data.monthlyExpenses);
            setCurrentSavings(data.currentSavings);
            setMonthlyInvestment(data.monthlyInvestment);
            setInflationRate(data.inflationRate);
            setIndiaReturn(data.returnRate); // Assuming returnRate maps to indiaReturn for simplicity or blended
            if (data.monthlyIncome) setMonthlyIncome(data.monthlyIncome);
            if (data.lifeGoals) setLifeGoals(data.lifeGoals);
            if (data.aiRoadmap) setAiRoadmap(data.aiRoadmap);
            // Note: we might need to store globalAllocation and globalReturn too if we want full state restoration, 
            // but we'll map what we have in the blueprint.
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `calculations/${currentUser.uid}`);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSaveCalculation = async () => {
    if (!user) {
      handleLogin();
      return;
    }
    setIsSaving(true);
    try {
      await setDoc(doc(db, "calculations", user.uid), {
        uid: user.uid,
        currentAge,
        retirementAge,
        lifeExpectancy: 90, // Default or add to state
        monthlyExpenses,
        currentSavings,
        monthlyInvestment,
        monthlyIncome,
        lifeGoals,
        aiRoadmap,
        inflationRate,
        returnRate: indiaReturn, // Storing primary return rate
        safeWithdrawalRate: 4, // Default 4% rule
        updatedAt: serverTimestamp()
      });
      alert("Calculation saved successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `calculations/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [currentAge, setCurrentAge] = useState(30);
  const [currentSavings, setCurrentSavings] = useState(1000000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(75000);
  const [monthlyIncome, setMonthlyIncome] = useState(150000);
  const [lifeGoals, setLifeGoals] = useState("Buy a house in 5 years, Child's education in 10 years");
  const [aiRoadmap, setAiRoadmap] = useState<string | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const downloadRoadmap = () => {
    if (!aiRoadmap) return;
    const blob = new Blob([aiRoadmap], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FIRE-Roadmap-Age${currentAge}-Retire${retirementAge}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyRoadmap = async () => {
    if (!aiRoadmap) return;
    await navigator.clipboard.writeText(aiRoadmap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const [retirementAge, setRetirementAge] = useState(45);
  const [monthlyExpenses, setMonthlyExpenses] = useState(100000);
  const [lifestyle, setLifestyle] = useState("standard");
  
  const [indiaReturn, setIndiaReturn] = useState(10);
  const [globalReturn, setGlobalReturn] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [globalAllocation, setGlobalAllocation] = useState(50);
  const [activeLines, setActiveLines] = useState({ global: true, india: true, target: true });
  const [chartView, setChartView] = useState<'global' | 'both' | 'india'>('both');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Chat widget state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Hi 👋 Welcome to MAVERICKS! I\'m your AI FIRE planning assistant. Ask me anything about Financial Independence or your retirement plan!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  const sendChatMessage = async () => {
    const message = chatInput.trim();
    if (!message || isChatLoading) return;
    setChatInput('');
    setShowChatBubble(false);
    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsChatLoading(true);
    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      const context = `You are a helpful FIRE (Financial Independence, Retire Early) planning assistant for MAVERICKS, an Indian personal finance app. 
The user's current financial details:
- Current Age: ${currentAge}, Target Retirement Age: ${retirementAge}
- Monthly Income: ₹${monthlyIncome.toLocaleString('en-IN')}, Monthly Expenses: ₹${monthlyExpenses.toLocaleString('en-IN')}
- Monthly Investment: ₹${monthlyInvestment.toLocaleString('en-IN')}, Current Savings: ₹${currentSavings.toLocaleString('en-IN')}
- FIRE Target Corpus: ₹${results.fireCorpus.toLocaleString('en-IN')} (needed by age ${retirementAge})
Keep responses concise, friendly, and India-specific. Use ₹ for currency. Answer in 2-4 sentences max.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${context}\n\nUser question: ${message}`,
      });
      setChatMessages(prev => [...prev, { role: 'assistant', text: response.text || 'Sorry, I could not generate a response.' }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '') || '';
      if (!apiKey) {
        throw new Error("Missing Gemini API Key");
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        I am planning for Financial Independence and Retire Early (FIRE) in India.
        Here are my details:
        - Current Age: ${currentAge}
        - Target Retirement Age: ${retirementAge}
        - Monthly Income: ₹${monthlyIncome}
        - Monthly Expenses: ₹${monthlyExpenses}
        - Monthly Investment: ₹${monthlyInvestment}
        - Current Savings/Investments: ₹${currentSavings}
        - Life Goals: ${lifeGoals}

        Please build a complete, month-by-month financial roadmap for my first year, and a general long-term roadmap.
        Include:
        1. Systematic Investment Plan (SIP) amounts per goal.
        2. Asset allocation shifts over time.
        3. Insurance gaps (Life, Health).
        4. Tax-saving moves (specific to India).
        5. Emergency fund targets.
        
        Format the response in clean Markdown.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      setAiRoadmap(response.text || "Failed to generate roadmap.");
      setIsRoadmapModalOpen(true);
    } catch (error: any) {
      console.error("Failed to generate roadmap:", error);
      alert(`Failed to generate roadmap. Error: ${error?.message || "Unknown error"}\n\nPlease check if your Gemini API key is configured properly.`);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const results = useMemo(() => {
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    
    // Future monthly expenses at retirement
    const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    
    // FIRE Corpus required (4% rule)
    const fireCorpus = futureMonthlyExpenses * 12 * 25;

    // Blended Return
    const blendedReturn = (indiaReturn * (100 - globalAllocation) + globalReturn * globalAllocation) / 100;

    const chartData = [];
    const indiaMonthlyRate = (indiaReturn / 100) / 12;
    const globalMonthlyRate = (blendedReturn / 100) / 12;

    for (let year = 0; year <= yearsToRetirement; year++) {
      const months = year * 12;
      
      // Calculate India Corpus
      let indiaCorpus = currentSavings * Math.pow(1 + indiaMonthlyRate, months);
      if (indiaMonthlyRate > 0) {
        indiaCorpus += monthlyInvestment * ((Math.pow(1 + indiaMonthlyRate, months) - 1) / indiaMonthlyRate) * (1 + indiaMonthlyRate);
      } else {
        indiaCorpus += monthlyInvestment * months;
      }

      // Calculate Global Corpus
      let globalCorpus = currentSavings * Math.pow(1 + globalMonthlyRate, months);
      if (globalMonthlyRate > 0) {
        globalCorpus += monthlyInvestment * ((Math.pow(1 + globalMonthlyRate, months) - 1) / globalMonthlyRate) * (1 + globalMonthlyRate);
      } else {
        globalCorpus += monthlyInvestment * months;
      }

      chartData.push({
        age: currentAge + year,
        indiaCorpus: Math.round(indiaCorpus),
        globalCorpus: Math.round(globalCorpus),
        targetCorpus: Math.round(fireCorpus), // the static target for plotting
      });
    }

    return {
      yearsToRetirement,
      futureMonthlyExpenses,
      fireCorpus,
      chartData,
      finalIndiaCorpus: chartData.length > 0 ? chartData[chartData.length - 1].indiaCorpus : currentSavings,
      finalGlobalCorpus: chartData.length > 0 ? chartData[chartData.length - 1].globalCorpus : currentSavings,
    };
  }, [
    currentAge,
    currentSavings,
    monthlyInvestment,
    retirementAge,
    monthlyExpenses,
    indiaReturn,
    globalReturn,
    inflationRate,
    globalAllocation,
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white font-sans selection:bg-blue-500/30 pb-20 transition-colors duration-300">
      
      {/* Navbar Mock */}
      <div className="pt-6 px-4 relative z-50 flex justify-center">
        <nav className="w-full max-w-5xl flex items-center justify-between px-6 py-3 border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md rounded-full transition-colors duration-300">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 22L12 2L22 22H16L12 12L8 22H2Z" fill="url(#paint0_linear)"/>
              <defs>
                <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60a5fa"/>
                  <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="text-xl font-bold tracking-widest text-slate-900 dark:text-white uppercase transition-colors duration-300">Mavericks</div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-white/70">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Learn</a>
            <div className="flex items-center gap-3 ml-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-white/70"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {isLoading ? (
                <div className="w-20 h-8 animate-pulse bg-slate-200 dark:bg-white/10 rounded-full"></div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <img src={user.photoURL || ""} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/20" referrerPolicy="no-referrer" />
                  <button onClick={handleLogout} className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 px-4 py-2 rounded-full transition-colors font-semibold text-sm">Logout</button>
                </div>
              ) : (
                <button onClick={handleLogin} className="bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-white/90 px-5 py-2 rounded-full transition-colors font-semibold text-sm">Login</button>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center text-center px-4">
        {/* Blue Glow */}
        <div className="absolute top-[150px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/30 blur-[120px] rounded-[100%] pointer-events-none z-0" />
        
        {/* Earth Arc */}
        <div className="absolute top-[320px] left-1/2 -translate-x-1/2 w-[200%] md:w-[150%] h-[1000px] rounded-[100%] pointer-events-none z-0 overflow-hidden border-t-2 border-blue-400/50 shadow-[0_-20px_50px_rgba(59,130,246,0.1)] dark:shadow-[0_-20px_50px_rgba(59,130,246,0.3)] bg-slate-50 dark:bg-[#0A0A0A] transition-colors duration-300">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-top opacity-20 dark:opacity-60 mix-blend-screen dark:mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50 dark:from-transparent dark:via-transparent dark:to-[#0A0A0A] transition-colors duration-300" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight transition-colors duration-300">
            Calculate your path to FIRE
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed transition-colors duration-300">
            Discover when you can achieve Financial Independence and Retire Early in India. Learn how global investing can accelerate your journey by 3-5 years.
          </p>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-sm text-slate-700 dark:text-white/80 mb-20 transition-colors duration-300">
            <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500"/> 50,000+ Users</div>
            <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-slate-500 dark:text-slate-400"/> Bank-Grade Security</div>
            <div className="flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500 dark:text-blue-400"/> Global Markets</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-12 relative z-20">
            {[
              { value: "45 yrs", label: "Avg FIRE age in India" },
              { value: "₹5-8 Cr", label: "Typical corpus needed" },
              { value: "2.3%", label: "Indians on FIRE path" },
              { value: "15-20 yrs", label: "Average time to FIRE" }
            ].map((stat, i) => (
              <div key={i} className="relative overflow-hidden rounded-[2.5rem] bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] group">
                {/* Inner shadow / highlight for liquid feel */}
                <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] pointer-events-none" />
                
                {/* Liquid reflection sweep */}
                <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out pointer-events-none rotate-45" />
                
                <div className="relative z-10 flex flex-col items-center justify-center text-center h-full">
                  <div className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight drop-shadow-sm transition-colors duration-300">{stat.value}</div>
                  <div className="text-sm md:text-base font-medium text-slate-600 dark:text-white/70 transition-colors duration-300">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#111] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
              
              <div className="space-y-10">
                {/* Current Financial Status */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Current Financial Status</h3>
                  <div className="space-y-6">
                    <Slider
                      label="Current Age"
                      min={18}
                      max={80}
                      value={currentAge}
                      onChange={(e) => setCurrentAge(Number(e.target.value))}
                      formatValue={(v) => `${v} yrs`}
                    />
                    <NumberInput
                      label="Current Savings"
                      prefix="₹"
                      value={currentSavings}
                      onChange={(e) => setCurrentSavings(Number(e.target.value))}
                    />
                    <NumberInput
                      label="Monthly Investment"
                      prefix="₹"
                      value={monthlyInvestment}
                      onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                    />
                    <NumberInput
                      label="Monthly Income"
                      prefix="₹"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-white/10 transition-colors duration-300" />

                {/* Retirement Goals */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Retirement Goals</h3>
                  <div className="space-y-6">
                    <Slider
                      label="Target Retirement Age"
                      min={currentAge + 1}
                      max={85}
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(Number(e.target.value))}
                      formatValue={(v) => `${v} yrs`}
                    />
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-white/70 transition-colors duration-300">Lifestyle Type</label>
                      <div className="relative">
                        <select 
                          className="w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2 text-base font-medium text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                          value={lifestyle}
                          onChange={(e) => {
                            setLifestyle(e.target.value);
                            if (e.target.value === 'lean') setMonthlyExpenses(40000);
                            if (e.target.value === 'standard') setMonthlyExpenses(150000);
                            if (e.target.value === 'fat') setMonthlyExpenses(350000);
                          }}
                        >
                          <option value="lean" className="bg-white dark:bg-[#111] text-slate-900 dark:text-white">Lean FIRE - Minimalist</option>
                          <option value="standard" className="bg-white dark:bg-[#111] text-slate-900 dark:text-white">Standard FIRE - Comfortable</option>
                          <option value="fat" className="bg-white dark:bg-[#111] text-slate-900 dark:text-white">Fat FIRE - Premium</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-white/40 pointer-events-none transition-colors duration-300" />
                      </div>
                    </div>
                    <NumberInput
                      label="Current Monthly Expenses"
                      prefix="₹"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                    />
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-white/70 transition-colors duration-300">Life Goals</label>
                      <textarea
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3 text-base font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 resize-none"
                        rows={3}
                        value={lifeGoals}
                        onChange={(e) => setLifeGoals(e.target.value)}
                        placeholder="e.g., Buy a house in 5 years, Child's education in 10 years..."
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-white/10 transition-colors duration-300" />

                {/* Investment Returns */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Investment Returns</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <NumberInput
                        label="India Return"
                        suffix="%"
                        value={indiaReturn}
                        onChange={(e) => setIndiaReturn(Number(e.target.value))}
                      />
                      <NumberInput
                        label="Global Return"
                        suffix="%"
                        value={globalReturn}
                        onChange={(e) => setGlobalReturn(Number(e.target.value))}
                      />
                    </div>
                    <NumberInput
                      label="Inflation Rate"
                      suffix="%"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(Number(e.target.value))}
                    />
                    <Slider
                      label="Global Markets Allocation"
                      min={0}
                      max={100}
                      value={globalAllocation}
                      onChange={(e) => setGlobalAllocation(Number(e.target.value))}
                      formatValue={(v) => `${v}%`}
                    />
                  </div>
                </div>

              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button 
                onClick={generateRoadmap}
                disabled={isGeneratingRoadmap}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Target className="w-5 h-5" /> {isGeneratingRoadmap ? "Generating Roadmap..." : "Generate AI Roadmap"}
              </button>
              <button 
                onClick={handleSaveCalculation}
                disabled={isSaving}
                className="flex-1 bg-white dark:bg-[#111] hover:bg-slate-50 dark:hover:bg-[#222] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 py-4 rounded-full font-bold text-lg shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                <CloudUpload className="w-5 h-5" /> {isSaving ? "Saving..." : user ? "Save Calculation" : "Login to Save"}
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* FIRE Number Card */}
            <div className="bg-blue-50 dark:bg-[#001A3B] rounded-3xl p-8 relative overflow-hidden border border-blue-200 dark:border-blue-500/20 shadow-sm dark:shadow-[0_0_40px_rgba(0,163,255,0.1)] transition-colors duration-300">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full border border-blue-200 dark:border-blue-400/10 transition-colors duration-300" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full border border-blue-200 dark:border-blue-400/10 transition-colors duration-300" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full border border-blue-200 dark:border-blue-400/10 transition-colors duration-300" />
              
              <div className="relative z-10 text-center py-6">
                <h3 className="text-lg font-medium text-blue-900/80 dark:text-white/80 mb-4 transition-colors duration-300">Your FIRE Number</h3>
                <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-blue-950 dark:text-white mb-4 tracking-tight transition-colors duration-300">
                  {formatCurrency(results.fireCorpus)}
                </div>
                <div className="text-blue-900/60 dark:text-white/60 font-medium transition-colors duration-300">
                  ({formatCurrency(results.futureMonthlyExpenses)}/mo in {new Date().getFullYear() + results.yearsToRetirement})
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl divide-y divide-slate-200 dark:divide-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
              <div className="p-5 flex justify-between items-center">
                <div className="flex items-center gap-3 text-slate-600 dark:text-white/70 transition-colors duration-300">
                  <Clock className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <span className="font-medium">Years to FIRE</span>
                </div>
                <span className="font-bold text-white text-lg">{results.yearsToRetirement} years</span>
              </div>
              <div className="p-5 flex justify-between items-center">
                <div className="flex items-center gap-3 text-white/70">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">FIRE Year</span>
                </div>
                <span className="font-bold text-white text-lg">{new Date().getFullYear() + results.yearsToRetirement} (Age {retirementAge})</span>
              </div>
              <div className="p-5 flex justify-between items-center">
                <div className="flex items-center gap-3 text-white/70">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Monthly Income</span>
                </div>
                <span className="font-bold text-white text-lg">{formatCurrency(results.futureMonthlyExpenses)}/mo</span>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none transition-colors duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center transition-colors duration-300">Wealth Growth Projection</h3>
              {/* Segmented Toggle */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-1 gap-1">
                  {([
                    { id: 'global', label: 'Global Portfolio', color: 'bg-blue-600 text-white shadow' },
                    { id: 'both', label: 'Compare Both', color: 'bg-slate-900 dark:bg-white text-white dark:text-black shadow' },
                    { id: 'india', label: 'India Only', color: 'bg-orange-500 text-white shadow' },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setChartView(tab.id)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        chartView === tab.id
                          ? tab.color
                          : 'text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white/80'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Legend colors */}
              <div className="flex justify-center gap-6 mb-6 text-sm">
                {(chartView === 'global' || chartView === 'both') && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-600 dark:text-white/70">Global Portfolio</span>
                  </div>
                )}
                {(chartView === 'india' || chartView === 'both') && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-slate-600 dark:text-white/70">India Only</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0 border-b-2 border-red-500 border-dashed" />
                  <span className="text-slate-600 dark:text-white/70">FIRE Target</span>
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#ffffff10" : "#00000010"} />
                    <XAxis 
                      dataKey="age" 
                      stroke={isDarkMode ? "#ffffff40" : "#00000040"} 
                      tick={{fill: isDarkMode ? '#ffffff40' : '#00000040', fontSize: 12}} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10} 
                    />
                    <YAxis 
                      stroke={isDarkMode ? "#ffffff40" : "#00000040"} 
                      tick={{fill: isDarkMode ? '#ffffff40' : '#00000040', fontSize: 12}} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={-10} 
                      tickFormatter={(val) => {
                        if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                        if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
                        return `₹${val.toLocaleString('en-IN')}`;
                      }} 
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#111' : '#fff', 
                        borderColor: isDarkMode ? '#ffffff10' : '#00000010', 
                        borderRadius: '12px', 
                        color: isDarkMode ? '#fff' : '#000', 
                        padding: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                      itemStyle={{color: isDarkMode ? '#fff' : '#000', fontWeight: 500}}
                      labelStyle={{color: isDarkMode ? '#ffffff80' : '#00000080', marginBottom: '4px'}}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'globalCorpus' ? 'Global Portfolio' : name === 'indiaCorpus' ? 'India Only' : 'FIRE Target'
                      ]}
                      labelFormatter={(label) => `Age ${label}`}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="targetCorpus" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        dot={false} 
                        strokeDasharray="5 5" 
                        activeDot={false} 
                      />
                    {(chartView === 'global' || chartView === 'both') && (
                      <Line 
                        type="monotone" 
                        dataKey="globalCorpus" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={false} 
                        activeDot={{ r: 6, fill: '#3b82f6', stroke: isDarkMode ? '#fff' : '#000', strokeWidth: 2 }}
                      />
                    )}
                    {(chartView === 'india' || chartView === 'both') && (
                      <Line 
                        type="monotone" 
                        dataKey="indiaCorpus" 
                        stroke="#f97316"
                        strokeWidth={2.5} 
                        dot={false}
                        strokeDasharray="6 3"
                        activeDot={{ r: 6, fill: '#f97316', stroke: isDarkMode ? '#fff' : '#000', strokeWidth: 2 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Roadmap Display */}
            {aiRoadmap && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setIsRoadmapModalOpen(true)}
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-in-out skew-x-12" />
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  View Your Personalized FIRE Roadmap
                </button>
              </div>
            )}

            <AnimatePresence>
              {isRoadmapModalOpen && aiRoadmap && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111] shrink-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-blue-500" /> 
                        Your Personalized FIRE Roadmap
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={copyRoadmap}
                          title="Copy to clipboard"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white/80 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                        </button>
                        <button
                          onClick={downloadRoadmap}
                          title="Download as Markdown"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                        <button 
                          onClick={() => setIsRoadmapModalOpen(false)}
                          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-white/80 text-base leading-relaxed">
                        <Markdown
                          components={{
                            h1: ({node: _n, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-slate-900 dark:text-white" {...props} />,
                            h2: ({node: _n, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2" {...props} />,
                            h3: ({node: _n, ...props}) => <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800 dark:text-white/90" {...props} />,
                            p: ({node: _n, ...props}) => <p className="mb-4" {...props} />,
                            ul: ({node: _n, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
                            li: ({node: _n, ...props}) => <li {...props} />,
                            strong: ({node: _n, ...props}) => <strong className="font-semibold text-blue-600 dark:text-blue-400" {...props} />
                          }}
                        >
                          {aiRoadmap}
                        </Markdown>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Understanding FIRE */}
      <div className="max-w-5xl mx-auto mt-32 px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-slate-900 dark:text-white transition-colors duration-300">Understanding FIRE</h2>
        <p className="text-center text-slate-600 dark:text-white/60 mb-12 max-w-3xl mx-auto text-lg transition-colors duration-300">
          Financial Independence, Retire Early (FIRE) is a movement focused on aggressive savings and investing to retire decades before traditional retirement age through financial freedom
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none transition-colors duration-300">
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white transition-colors duration-300">Lean FIRE</h3>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">₹30-50K/mo</div>
            <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed transition-colors duration-300">Minimalist lifestyle covering essential expenses. Requires smallest corpus but demands lifestyle optimisation and frugality.</p>
          </div>
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none transition-colors duration-300">
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white transition-colors duration-300">Standard FIRE</h3>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">₹1-2L/mo</div>
            <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed transition-colors duration-300">Comfortable middle-class lifestyle maintaining current living standards. Most popular FIRE target among Indian professionals.</p>
          </div>
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none transition-colors duration-300">
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white transition-colors duration-300">Fat FIRE</h3>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">₹3L+/mo</div>
            <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed transition-colors duration-300">Premium lifestyle with travel, hobbies, and luxury experiences. Requires largest corpus but maximum retirement comfort.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-10 text-center shadow-sm dark:shadow-none transition-colors duration-300">
          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white transition-colors duration-300">The 4% Withdrawal Rule</h3>
          <p className="text-slate-600 dark:text-white/60 mb-6 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Safely withdraw 4% of your total corpus annually for sustainable retirement income. Based on historical market data, this rate ensures your money lasts 30+ years.
          </p>
          <div className="inline-block bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-6 py-3 font-medium text-slate-900 dark:text-white transition-colors duration-300">
            Example: ₹5 Crore corpus x 4% = ₹20 Lakhs per year (₹1.67 Lakhs per month)
          </div>
        </div>
      </div>

      {/* Real world FIRE comparison */}
      <div className="max-w-5xl mx-auto mt-32 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <h2 className="text-3xl font-bold text-center mb-4 text-slate-900 dark:text-white transition-colors duration-300">Real world FIRE comparison</h2>
        <p className="text-center text-slate-600 dark:text-white/60 mb-8 text-lg transition-colors duration-300">See the tangible impact of global investing on your retirement timeline</p>
        
        <div className="text-center text-sm font-medium text-slate-700 dark:text-white/80 mb-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 w-full backdrop-blur-sm transition-colors duration-300">
          <div className="mb-2 text-slate-500 dark:text-white/50 uppercase tracking-wider text-xs font-bold transition-colors duration-300">Starting Scenario (Identical for both)</div>
          <span className="text-slate-900 dark:text-white transition-colors duration-300">Age:</span> 30 years <span className="mx-2 text-slate-300 dark:text-white/20">|</span> <span className="text-slate-900 dark:text-white transition-colors duration-300">Initial Savings:</span> ₹10L <span className="mx-2 text-slate-300 dark:text-white/20">|</span> <span className="text-slate-900 dark:text-white transition-colors duration-300">Monthly Investment:</span> ₹75K <span className="mx-2 text-slate-300 dark:text-white/20">|</span> <span className="text-slate-900 dark:text-white transition-colors duration-300">Target:</span> Retire by 50
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none transition-colors duration-300">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-900 dark:text-white transition-colors duration-300">
              <span className="text-2xl">🇮🇳</span> India-Only Strategy
            </h3>
            <ul className="space-y-5 text-slate-600 dark:text-white/70 transition-colors duration-300">
              <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50 shrink-0 transition-colors duration-300"/> 100% allocation to Indian equities & bonds</li>
              <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50 shrink-0 transition-colors duration-300"/> 12% average annual returns</li>
              <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50 shrink-0 transition-colors duration-300"/> Achieves FIRE at age 50</li>
              <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50 shrink-0 transition-colors duration-300"/> Final corpus: ₹8.2 Crores</li>
              <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50 shrink-0 transition-colors duration-300"/> Higher concentration in single market</li>
              <li className="flex items-center gap-4 text-red-500 dark:text-red-400 transition-colors duration-300"><div className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 shrink-0 transition-colors duration-300"/> Single market risk</li>
              <li className="flex items-center gap-4 text-red-500 dark:text-red-400 transition-colors duration-300"><div className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 shrink-0 transition-colors duration-300"/> Limited Diversification</li>
              <li className="flex items-center gap-4 text-red-500 dark:text-red-400 transition-colors duration-300"><div className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 shrink-0 transition-colors duration-300"/> No currency hedge</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-[#111] border border-blue-200 dark:border-blue-500/30 rounded-3xl p-8 relative overflow-hidden shadow-sm dark:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 blur-[50px] rounded-full pointer-events-none transition-colors duration-300" />
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-900 dark:text-white transition-colors duration-300">
              <span className="text-2xl">🌐</span> Global Strategy
            </h3>
            <ul className="space-y-5 text-slate-600 dark:text-white/70 relative z-10 transition-colors duration-300">
              <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50 shrink-0 transition-colors duration-300"/> 60% Indian + 40% Global markets</li>
              <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50 shrink-0 transition-colors duration-300"/> 14% blended annual returns</li>
              <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50 shrink-0 transition-colors duration-300"/> Achieves FIRE at age 47</li>
              <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50 shrink-0 transition-colors duration-300"/> Final corpus: ₹8.2 Crores</li>
              <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50 shrink-0 transition-colors duration-300"/> Multi-country risk distribution</li>
              <li className="flex items-center gap-4 text-emerald-600 dark:text-green-400 font-medium transition-colors duration-300"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-green-400 shrink-0 transition-colors duration-300"/> Retire 3 years earlier</li>
              <li className="flex items-center gap-4 text-emerald-600 dark:text-green-400 font-medium transition-colors duration-300"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-green-400 shrink-0 transition-colors duration-300"/> Geographic Diversification</li>
              <li className="flex items-center gap-4 text-emerald-600 dark:text-green-400 font-medium transition-colors duration-300"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-green-400 shrink-0 transition-colors duration-300"/> Currency appreciation benefits</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto mt-32 px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-slate-900 dark:text-white transition-colors duration-300">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: "What is a good FIRE number in India?",
              a: "A 'good' FIRE number heavily depends on your lifestyle. A common benchmark is 25 to 30 times your annual expenses (based on the 4% safe withdrawal rule). For a comfortable standard lifestyle, ₹3-5 Crores is often considered a great FIRE target, while a luxury (Fat FIRE) lifestyle might require ₹10 Crores or more."
            },
            {
              q: "Is FIRE practical for salaried employees in India?",
              a: "Yes, absolutely! Many salaried professionals achieve FIRE by maintaining a high savings rate (often 40-50%+), investing consistently in equities (like passive index funds or global markets) to beat inflation, and rigorously avoiding lifestyle inflation as their income grows."
            },
            {
              q: "Can I reach FIRE with kids or home loans?",
              a: "Yes, but it requires compartmentalized planning. For kids, you should build separate dedicated corpuses for their education and marriage to avoid draining your retirement funds. For home loans, it is highly recommended to either pay it off entirely before retiring, or ensure your FIRE corpus is large enough that the 4% withdrawal comfortably covers the EMI."
            },
            {
              q: "Can I still do FIRE planning if I'm already 40 or 45?",
              a: "It's never too late to take control of your finances! If you start later, you may not retire drastically 'early', but you can still work towards Financial Independence (the 'FI' in FIRE) so that maintaining employment becomes optional rather than mandatory in your 50s."
            },
            {
              q: "How often should I revisit my FIRE plan?",
              a: "It is a good practice to review your FIRE progress annually. You should also revisit your plan whenever there are major life changes (like marriage, having kids, or a career shift) or significant economic shifts to ensure you are still on track and adjust your asset allocation if necessary."
            }
          ].map((faq, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                className="w-full text-left p-6 py-5 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-300 cursor-pointer"
              >
                <span className="font-medium text-lg text-slate-900 dark:text-white transition-colors duration-300 pr-6">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 dark:text-white/40 transition-transform duration-300 shrink-0 ${openFaqIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaqIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-white/70 leading-relaxed border-t border-slate-100 dark:border-white/5 mx-6">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#111]/50 backdrop-blur-lg transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 22L12 2L22 22H16L12 12L8 22H2Z" fill="url(#paint1_linear)"/>
                  <defs>
                    <linearGradient id="paint1_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#60a5fa"/>
                      <stop offset="1" stopColor="#3b82f6"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-xl font-bold tracking-widest text-slate-900 dark:text-white uppercase transition-colors duration-300">Mavericks</span>
              </div>
              <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed max-w-sm transition-colors duration-300">
                Empowering Indians to achieve Financial Independence and Retire Early through smart, global investing strategies.
              </p>
            </div>
            
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-4 transition-colors duration-300">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-white/60">
                <li><a href="#" className="hover:text-blue-500 transition-colors">FIRE Guide</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Investment Calculator</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-4 transition-colors duration-300">Company</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-white/60">
                <li><a href="#" className="hover:text-blue-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
            <p className="text-slate-500 dark:text-white/40 text-sm transition-colors duration-300">
              © {new Date().getFullYear()} Mavericks. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-slate-400 dark:text-white/40">
              <a href="#" className="hover:text-blue-500 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-blue-500 transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-blue-500 transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        
        {/* Welcome bubble */}
        <AnimatePresence>
          {showChatBubble && !isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white p-4 rounded-2xl rounded-br-sm shadow-xl max-w-[280px] relative border border-slate-100 dark:border-white/10"
            >
              <button
                onClick={() => setShowChatBubble(false)}
                className="absolute -top-2 -right-2 bg-white dark:bg-[#1a1a1a] rounded-full p-1 shadow-md border border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-slate-500 dark:text-white/50" />
              </button>
              <p className="text-sm font-medium">Hi 👋 Welcome to MAVERICKS, how can we help?</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat popup */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-[340px] sm:w-[380px] bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden"
              style={{ maxHeight: '520px' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-blue-600 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">MAVERICKS AI</p>
                    <p className="text-blue-100 text-xs">FIRE Planning Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white/90 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-slate-400 dark:bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-slate-400 dark:bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-slate-400 dark:bg-white/50 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick suggestions */}
              {chatMessages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {['How much do I need to FIRE?', 'Best SIPs to invest?', 'What is the 4% rule?'].map(q => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
                      className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 dark:border-white/10 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask about your FIRE plan..."
                  className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          onClick={() => { setIsChatOpen(prev => !prev); setShowChatBubble(false); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-2 font-medium transition-all hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          Need Help?
        </button>
      </div>

    </div>
  );
}

