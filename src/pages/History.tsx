import { Flame, Clock, Target, TrendingUp, Shield, Lightbulb, Loader2, Info } from 'lucide-react';
import useFireStore from '../store/useFireStore';
import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';

export default function History() {
  const { firePlan, setFirePlan, userData, updateUserData, isCalculating, setIsCalculating } = useFireStore();
  const [localRetirementAge, setLocalRetirementAge] = useState<number>(Number(userData.retirementAge) || 50);
  const [localDraw, setLocalDraw] = useState<number>(Number(userData.desiredMonthlyDraw) || Number(userData.monthlyExpenses) || 100000);

  const calculatePlan = useCallback(
    debounce(async (updatedData: any) => {
      setIsCalculating(true);
      try {
        const payload = {
          name: updatedData.name,
          age: Number(updatedData.age),
          monthly_income: Number(updatedData.monthlyIncome),
          monthly_expenses: Number(updatedData.monthlyExpenses),
          current_savings: Number(updatedData.currentSavings),
          retirement_age: Number(updatedData.retirementAge),
          desired_monthly_draw: Number(updatedData.desiredMonthlyDraw),
          inflation_rate: Number(updatedData.inflationRate || 6)
        };
        const response = await axios.post('http://localhost:8000/api/chat', payload);
        setFirePlan(response.data);
      } catch (error) {
        console.error("Re-calculation failed:", error);
      } finally {
        setIsCalculating(false);
      }
    }, 800),
    []
  );

  useEffect(() => {
    if (firePlan) {
      calculatePlan(userData);
    }
  }, [userData.retirementAge, userData.desiredMonthlyDraw, userData.inflationRate]);

  const handleRetirementAgeChange = (val: number) => {
    setLocalRetirementAge(val);
    updateUserData({ retirementAge: val });
  };

  const handleDrawChange = (val: number) => {
    setLocalDraw(val);
    updateUserData({ desiredMonthlyDraw: val });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white pt-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-hidden pb-20 transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-600/20 blur-[150px] rounded-[100%] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                <Flame className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                Dynamic FIRE Roadmap
              </h1>
              {firePlan?.earliest_retirement_age && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-green-200 dark:border-green-500/20 animate-pulse">
                  Already FI
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-gray-400 mt-2">Professional projections for <span className="text-slate-900 dark:text-white font-medium">{firePlan?.user_name || 'you'}</span></p>
          </div>
          
          {/* Quick Adjustments Panel */}
          <div className="bg-white/50 dark:bg-[#111111]/50 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-5 flex flex-wrap gap-8 items-center shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Retire at Age</span>
                <span className="text-blue-600 dark:text-blue-400">{localRetirementAge}</span>
              </div>
              <input 
                type="range" min="40" max="75" step="1"
                value={localRetirementAge}
                onChange={(e) => handleRetirementAgeChange(Number(e.target.value))}
                className="w-32 h-1.5 bg-slate-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Monthly Draw (₹)</span>
                <span className="text-blue-600 dark:text-blue-400">{localDraw.toLocaleString()}</span>
              </div>
              <input 
                type="range" min="20000" max="1000000" step="5000"
                value={localDraw}
                onChange={(e) => handleDrawChange(Number(e.target.value))}
                className="w-40 h-1.5 bg-slate-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            {isCalculating && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 animate-pulse text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </div>
            )}
          </div>
        </div>

        {firePlan ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-xl hover:border-blue-500/20 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-slate-400 dark:text-gray-400">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
                  <span className="font-medium text-xs tracking-wide uppercase">Target Corpus</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">₹{firePlan.target_corpus?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}</div>
              </div>
              <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-xl hover:border-blue-500/20 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-slate-400 dark:text-gray-400">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
                  <span className="font-medium text-xs tracking-wide uppercase">{firePlan.earliest_retirement_age ? "Earliest FIRE Age" : "Years to FIRE"}</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {firePlan.earliest_retirement_age ? firePlan.earliest_retirement_age : firePlan.estimated_years_to_fire} 
                  <span className="text-xl text-slate-400 dark:text-gray-400 font-normal ml-2">{firePlan.earliest_retirement_age ? "" : "Years"}</span>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-xl hover:border-blue-500/20 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-slate-400 dark:text-gray-400">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" /> 
                  <span className="font-medium text-xs tracking-wide uppercase">Monthly SIP Plan</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {(Object.values(firePlan.monthly_sip || {}).reduce((a: any, b: any) => a + b, 0) as number) > 0 ? (
                    `₹${(Object.values(firePlan.monthly_sip || {}).reduce((a: any, b: any) => a + b, 0) as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                  ) : (
                    <span className="text-green-600 dark:text-green-400">Fully Funded</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Monthly SIP & Glidepath */}
              <div className="lg:col-span-2 space-y-8">
                {/* Monthly SIP Breakdown */}
                <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-xl">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                    <TrendingUp className="text-blue-600 dark:text-blue-500 w-5 h-5" /> Investment Allocation
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(firePlan.monthly_sip || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl border border-black/5 dark:border-white/5">
                        <span className="text-sm text-slate-500 dark:text-gray-400 capitalize font-medium">{key.replace('_', ' ')}</span>
                        <span className="font-bold text-lg text-slate-900 dark:text-white">₹{Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 12-Month Roadmap Table */}
                <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-xl overflow-hidden">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                    <Clock className="text-blue-600 dark:text-blue-500 w-5 h-5" /> Month-by-Month Plan (Year 1)
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-black/10 dark:border-white/10">
                          <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400">Month</th>
                          <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400 text-right">SIP Total</th>
                          <th className="pb-4 font-bold text-xs uppercase tracking-wider text-slate-400 text-right">Projected Corpus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {firePlan.monthly_roadmap?.map((m: any) => (
                          <tr key={m.month} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">Month {m.month}</td>
                            <td className="py-4 text-sm text-right font-medium text-slate-600 dark:text-gray-300">₹{m.sip_total.toLocaleString()}</td>
                            <td className="py-4 text-sm text-right font-bold text-blue-600 dark:text-blue-400">₹{m.projected_corpus.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Allocation & Insurance */}
              <div className="space-y-8">
                 {/* Asset Allocation */}
                 <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-xl">
                   <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Current Allocation</h2>
                   <div className="space-y-4">
                     {Object.entries(firePlan.asset_allocation || {}).map(([asset, pct]) => (
                       <div key={asset} className="flex flex-col gap-2">
                         <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-600 dark:text-gray-300">{asset}</span>
                            <span className="text-blue-600 dark:text-blue-400">{String(pct)}</span>
                         </div>
                         <div className="w-full h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000" 
                              style={{ width: String(pct) }} 
                            />
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Glidepath Insight</h3>
                      <div className="text-xs text-slate-500 dark:text-gray-400 space-y-2">
                        {Object.entries(firePlan.yearly_glidepath || {}).slice(0, 3).map(([year, alloc]: any) => (
                          <div key={year} className="flex justify-between">
                            <span>Age {year}:</span>
                            <span className="font-mono">{alloc.Equity}% Eq / {alloc.Debt}% Dbt</span>
                          </div>
                        ))}
                        <div className="text-[10px] italic mt-2">*Full glidepath shifts 1% to debt annually.</div>
                      </div>
                   </div>
                 </div>

                 {/* Insurance Gap */}
                 <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-xl">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                     <Shield className="text-blue-600 dark:text-blue-500 w-5 h-5" /> Insurance Analysis
                   </h2>
                   <ul className="space-y-5">
                     {Object.entries(firePlan.insurance_gap || {}).map(([ins, rec]) => (
                       <li key={ins} className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl border border-black/5 dark:border-white/5">
                         <div className="font-medium text-slate-800 dark:text-gray-200 mb-1">{ins}</div>
                         <div className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">{String(rec)}</div>
                       </li>
                     ))}
                   </ul>
                 </div>
              </div>
            </div>

            {/* AI Insights & Execution Phases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/10 border border-blue-200 dark:border-blue-500/20 rounded-[2rem] p-8 shadow-xl backdrop-blur-xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Lightbulb className="text-blue-600 dark:text-blue-400 w-6 h-6" /> Strategic Agent Insights
                </h2>
                <ul className="space-y-4">
                  {firePlan.ai_insights?.map((insight: string, i: number) => (
                    <li key={i} className="flex gap-4">
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Info className="text-blue-600 dark:text-blue-500 w-5 h-5" /> Summary of Assumptions
                </h2>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Inflation</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{userData.inflationRate}%</div>
                   </div>
                   <div className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Expected Return</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">11%</div>
                   </div>
                   <div className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl col-span-2">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Desired Monthly Draw</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">₹{Number(userData.desiredMonthlyDraw).toLocaleString()} <span className="text-xs font-normal text-slate-400">(Today's value)</span></div>
                   </div>
                </div>
              </div>
            </div>

            {/* Tax Optimization Section */}
            {firePlan.tax_analysis && (
              <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-xl">
                 <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                   <Target className="text-blue-600 dark:text-blue-500 w-5 h-5" /> Tax Regime Optimization
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl">
                          <span className="text-sm font-medium text-slate-500">Old Regime Tax</span>
                          <span className="font-bold text-slate-900 dark:text-white">₹{firePlan.tax_analysis.old_regime_tax.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl border border-blue-500/20">
                          <span className="text-sm font-medium text-slate-500">New Regime Tax</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">₹{firePlan.tax_analysis.new_regime_tax.toLocaleString()}</span>
                       </div>
                    </div>
                    <div className="bg-blue-600 dark:bg-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-transform">
                       <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Agent Recommendation</div>
                       <div className="text-2xl font-black mb-2 uppercase">Switch to {firePlan.tax_analysis.recommended_regime} Regime</div>
                       <p className="text-sm opacity-90 leading-relaxed">
                          By optimizing your tax regime, you increase your monthly investable surplus to 
                          <span className="font-bold"> ₹{firePlan.tax_analysis.take_home_pay.toLocaleString()}</span>.
                       </p>
                    </div>
                 </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 text-center">
               <p className="text-[10px] text-slate-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
                  {firePlan.disclaimer || "MANDATORY DISCLAIMER: THIS AI-GENERATED PLAN IS FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE LICENSED FINANCIAL ADVICE. PLEASE CONSULT A SEBI REGISTERED INVESTMENT ADVISOR BEFORE MAKING ANY FINANCIAL DECISIONS."}
               </p>
            </div>

            <div className="mt-12 flex justify-center">
               <Link 
                 to="/agent"
                 className="bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white px-10 py-4 rounded-full font-medium transition-colors border border-black/5 dark:border-white/10 shadow-sm"
               >
                 Restart Full Assessment
               </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-white/80 dark:bg-[#111111]/80 border border-black/5 dark:border-white/10 rounded-[3rem] shadow-2xl backdrop-blur-xl transition-colors">
            <Flame className="w-20 h-20 text-slate-300 dark:text-gray-600 mx-auto mb-6 opacity-50" />
            <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">No FIRE Plans Yet</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-10 max-w-sm mx-auto">
              You haven't generated a FIRE roadmap yet. Talk to our AI Agent to get started on your path to financial freedom.
            </p>
            <Link
              to="/agent"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white transition-all bg-blue-600 rounded-full hover:bg-blue-700 dark:hover:bg-blue-500 shadow-lg hover:-translate-y-1"
            >
              Create My Plan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
