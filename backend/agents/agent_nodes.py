from typing import Dict, Any, List
from agents.state import GraphState
from models import UserInput, SipPlan, PhaseBreakdown, FirePlanOutput, MonthlyTarget, TaxAnalysis
from langchain_google_genai import ChatGoogleGenerativeAI
import json
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)

async def input_agent(state: GraphState) -> Dict[str, Any]:
    """Validates user input"""
    user_input = state["user_input"]
    errors = []
    if user_input.age < 18 or user_input.age > 80:
        errors.append("Invalid age")
    if user_input.monthly_income <= 0:
        errors.append("Income must be positive")
        
    return {"validation_status": "valid" if not errors else "invalid", "errors": errors}

async def tax_agent(state: GraphState) -> Dict[str, Any]:
    """Calculates Indian Income Tax (Old vs New Regime) autonomously"""
    user_input = state["user_input"]
    income = user_input.monthly_income * 12
    
    # 1. New Regime Calculation (Simplified FY 24-25 logic)
    # Rebate up to 7.75L effective (inc standard deduction 75k)
    new_taxable = max(0, income - 75000)
    new_tax = 0
    if new_taxable > 1500000:
        new_tax = (new_taxable - 1500000) * 0.30 + 150000
    elif new_taxable > 1200000:
        new_tax = (new_taxable - 1200000) * 0.20 + 90000
    elif new_taxable > 700000:
         new_tax = (new_taxable - 700000) * 0.10 + 30000
         
    # 2. Old Regime Calculation (Simplified with 80C)
    old_taxable = max(0, income - 50000 - user_input.section_80c_investments)
    old_tax = 0
    if old_taxable > 1000000:
        old_tax = (old_taxable - 1000000) * 0.30 + 112500
    elif old_taxable > 500000:
        old_tax = (old_taxable - 500000) * 0.20 + 12500
        
    recommended = "new" if new_tax <= old_tax else "old"
    # Take user choice or default to new
    actual_tax = new_tax if user_input.tax_regime == "new" else old_tax
    take_home = (income - actual_tax) / 12
    
    analysis = TaxAnalysis(
        old_regime_tax=old_tax,
        new_regime_tax=new_tax,
        recommended_regime=recommended,
        take_home_pay=take_home
    )
    return {"tax_analysis": analysis}

async def planning_agent(state: GraphState) -> Dict[str, Any]:
    """Calculates corpus and SIP with sophisticated advisor-level reasoning"""
    user_input = state["user_input"]
    tax_analysis = state.get("tax_analysis")
    
    age = user_input.age
    retirement_age = user_input.retirement_age
    years_to_fire = retirement_age - age
    inflation = user_input.inflation_rate / 100
    expected_return = 0.11
    pv = user_input.current_savings
    today_draw = user_input.desired_monthly_draw or user_input.monthly_expenses
    
    # 1. Multi-level Inflation Analysis
    future_monthly_draw = today_draw * ((1 + inflation)**years_to_fire)
    target_corpus = future_monthly_draw * 12 * 25 # 4% SWR
    
    r_monthly = expected_return / 12
    n_months = years_to_fire * 12
    
    # 2. Check for "Financial Independence" (FI) status
    future_val_current_savings = pv * (1 + r_monthly)**n_months
    is_already_fi = future_val_current_savings >= target_corpus
    
    earliest_age = retirement_age
    if is_already_fi:
        # Calculate how soon they can retire with ZERO additional SIP
        for test_age in range(age + 1, retirement_age + 1):
            test_n = (test_age - age) * 12
            test_future_draw = today_draw * ((1 + inflation)**(test_age - age))
            test_target = test_future_draw * 12 * 25
            if pv * (1 + r_monthly)**test_n >= test_target:
                earliest_age = test_age
                break
        required_sip = 0
    else:
        numerator = target_corpus - (pv * (1 + r_monthly)**n_months)
        denominator = (((1 + r_monthly)**n_months - 1) / r_monthly) * (1 + r_monthly)
        required_sip = max(0, numerator / denominator)

    # 3. Professional Advice Generation
    monthly_surplus = (tax_analysis.take_home_pay if tax_analysis else user_input.monthly_income) - user_input.monthly_expenses
    
    insight_text = f"Targeting a corpus of ₹{target_corpus:,.0f} to support a ₹{future_monthly_draw:,.0f}/mo lifestyle."
    if is_already_fi:
        insight_text = f"🎉 Phenomenal news! You are already on track for Financial Independence. Based on compounding alone, you can retire at age {earliest_age} without any further investments."
    elif required_sip > monthly_surplus:
        insight_text += f" ⚠️ Warning: Required SIP of ₹{required_sip:,.0f} exceeds your monthly surplus of ₹{monthly_surplus:,.0f}. I recommend extending your target age to {retirement_age + 5} or increasing your income."
    else:
        # Step-up SIP recommendation (10% annual increase)
        step_up_sip = required_sip * 0.7 # Start lower if stepping up
        insight_text += f" Pro Tip: Start with a ₹{step_up_sip:,.0f} SIP and increase it by 10% annually to reach your goal even faster."

    sip_plan = SipPlan(
        equity=required_sip * 0.6,
        debt=required_sip * 0.2,
        index_funds=required_sip * 0.15,
        emergency_fund=required_sip * 0.05
    )
    
    roadmap = []
    current_val = pv
    for m in range(1, 13):
        current_val = (current_val + required_sip) * (1 + r_monthly)
        roadmap.append(MonthlyTarget(month=m, sip_total=required_sip, projected_corpus=current_val))
    
    phases = [
        PhaseBreakdown(
            phase_name="Status: Already FI" if is_already_fi else "Wealth Accumulation", 
            months=f"0" if is_already_fi else f"1-{n_months}", 
            plan={
                "Primary Action": "Portfolio Rebalancing" if is_already_fi else f"Invest ₹{required_sip:,.0f}/mo",
                "Tax Strategy": f"Switch to {tax_analysis.recommended_regime} Regime" if tax_analysis else "Review Taxation"
            },
            insight=insight_text
        )
    ]
    
    return {
        "target_corpus": target_corpus, 
        "sip_plan": sip_plan, 
        "phases": phases, 
        "monthly_roadmap": roadmap,
        "earliest_retirement_age": earliest_age if is_already_fi else None
    }

async def allocation_agent(state: GraphState) -> Dict[str, Any]:
    """Generates Asset Allocation Glidepath with SEBI-aligned risk caps"""
    user_input = state["user_input"]
    years_to_fire = user_input.retirement_age - user_input.age
    
    # SEBI Norm: Ensure equity cap (e.g. 100 - age, but max 80%)
    equity_pct = max(20, min(80, 100 - user_input.age))
    debt_pct = 100 - equity_pct
    
    allocation = {
        "Equity (MFs, Stocks)": f"{equity_pct}%",
        "Debt (PPF, FDs)": f"{debt_pct}%"
    }
    
    # Generative Glidepath (Yearly)
    glidepath = {}
    for y in range(user_input.age, user_input.retirement_age + 1):
        e = max(20, min(80, 100 - y))
        glidepath[y] = {"Equity": float(e), "Debt": float(100 - e)}
        
    return {"asset_allocation": allocation, "yearly_glidepath": glidepath}

async def risk_agent(state: GraphState) -> Dict[str, Any]:
    """Calculates insurance needs for risk mitigation"""
    user_input = state["user_input"]
    today_expenses = user_input.monthly_expenses
    life_cover = today_expenses * 12 * 20
    
    insurance = {
        "Term Life Insurance": f"Recommended Cover: ₹{life_cover:,.0f} (Base value)",
        "Health Insurance": "Recommended Cover: ₹10L Base + ₹90L Super Top-up"
    }
    return {"insurance_gap": insurance}

async def output_agent(state: GraphState) -> Dict[str, Any]:
    """Formats output with mandatory disclaimers and tax optimization"""
    user_input = state["user_input"]
    tax_analysis = state.get("tax_analysis")
    earliest_age = state.get("earliest_retirement_age")
    
    final_output = FirePlanOutput(
        user_name=user_input.name,
        target_corpus=state.get("target_corpus", 0.0),
        estimated_years_to_fire=max(0, user_input.retirement_age - user_input.age),
        monthly_sip=state.get("sip_plan", SipPlan(equity=0, debt=0, index_funds=0, emergency_fund=0)),
        phases=state.get("phases", []),
        asset_allocation=state.get("asset_allocation", {}),
        insurance_gap=state.get("insurance_gap", {}),
        tax_analysis=tax_analysis,
        yearly_glidepath=state.get("yearly_glidepath", {}),
        monthly_roadmap=state.get("monthly_roadmap", []),
        earliest_retirement_age=earliest_age,
        ai_insights=[
            f"Optimized Strategy: You can reach your goal by age {earliest_age} even with ₹0 additional SIP!" if earliest_age else f"Start with a base SIP and increase by 10% annually to accelerate FIRE.",
            f"Tax Recommendation: The {tax_analysis.recommended_regime} regime is more optimal for you." if tax_analysis else "Review your tax regime.",
            "The glidepath shows a gradual shift to debt to protect your corpus as you near retirement."
        ],
        markdown_report=f"# FIRE Plan for {user_input.name}\n\nDisclaimer: This is not licensed financial advice."
    )
    return {"final_output": final_output}
