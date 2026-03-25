from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class UserInput(BaseModel):
    name: str
    age: int
    monthly_income: float
    monthly_expenses: float
    current_savings: float
    retirement_age: int
    desired_monthly_draw: Optional[float] = None
    inflation_rate: float = 6.0
    tax_regime: str = "new"  # 'old' or 'new'
    section_80c_investments: float = 150000.0 # Standard 1.5L default

class SipPlan(BaseModel):
    equity: float
    debt: float
    index_funds: float
    emergency_fund: float

class PhaseBreakdown(BaseModel):
    phase_name: str
    months: str
    plan: Dict[str, str]
    insight: str

class MonthlyTarget(BaseModel):
    month: int
    sip_total: float
    projected_corpus: float

class TaxAnalysis(BaseModel):
    old_regime_tax: float
    new_regime_tax: float
    recommended_regime: str
    take_home_pay: float

class FirePlanOutput(BaseModel):
    user_name: str
    target_corpus: float
    estimated_years_to_fire: float
    monthly_sip: SipPlan
    phases: List[PhaseBreakdown]
    asset_allocation: Dict[str, str]
    insurance_gap: Dict[str, str]
    tax_analysis: Optional[TaxAnalysis] = None
    ai_insights: List[str]
    monthly_roadmap: List[MonthlyTarget] = []
    yearly_glidepath: Dict[int, Dict[str, float]] = {}
    earliest_retirement_age: Optional[int] = None
    markdown_report: str = ""
    disclaimer: str = "This AI-generated plan is for informational purposes only and does not constitute licensed financial advice. Please consult a SEBI registered investment advisor."

class AgentState(BaseModel):
    user_input: Optional[UserInput] = None
    validation_status: str = "pending"
    target_corpus: float = 0.0
    sip_plan: Optional[SipPlan] = None
    phases: List[PhaseBreakdown] = []
    asset_allocation: Dict[str, str] = {}
    insurance_gap: Dict[str, str] = {}
    final_output: Optional[FirePlanOutput] = None

class AdvisorRequest(BaseModel):
    query: str
    mode: str = "web" # 'web' or 'rag'
    kb_content: Optional[str] = None
    session_id: Optional[str] = "default"
    user_context: Optional[Dict[str, Any]] = None

class AdvisorResponse(BaseModel):
    answer: str
    sources: List[str]
